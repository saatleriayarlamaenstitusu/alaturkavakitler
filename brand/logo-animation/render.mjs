// Logo animasyonunu videoya çevirir.
//
// Headless Chromium'da animasyonu kare kare ilerletip her kareyi PNG olarak
// alır, sonra ffmpeg ile birleştirir. Gerçek zamanlı ekran kaydı yerine bu yol
// seçildi: kare atlamıyor, süre tam oturuyor ve saydam zemin korunuyor.
//
// Kullanım:
//   node render.mjs                        → koyu zemin, 1080x1080, mp4
//   node render.mjs --bg 6 --format webm   → saydam zemin, alfa kanallı webm
//   node render.mjs --mode outro           → çıkış animasyonu
//   node render.mjs --help                 → tüm seçenekler
import { spawn, spawnSync } from 'node:child_process'
import { mkdir, writeFile, rm, readdir } from 'node:fs/promises'
import { setTimeout as sleep } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))

const BG_NAMES = ['koyu', 'kagit', 'imsak', 'ogle', 'ikindi', 'yatsi', 'saydam']

const args = process.argv.slice(2)
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback
}

if (args.includes('--help')) {
  console.log(`Seçenekler:
  --bg <0-6>        zemin: ${BG_NAMES.map((n, i) => `${i}=${n}`).join(' ')}   (varsayılan 0)
  --size <px>       logonun genişliği (varsayılan 720)
  --canvas <WxH>    video ölçüsü (varsayılan 1080x1080)
  --fps <n>         kare hızı (varsayılan 60)
  --dur <çarpan>    hız çarpanı, 1 = ~2.1 sn (varsayılan 1)
  --mode intro|outro
  --format mp4|webm|mov|png
                    webm ve mov saydam zemini korur (--bg 6 ile kullan)
  --out <dosya>     çıktı yolu`)
  process.exit(0)
}

const bg = Number(flag('bg', 0))
const size = Number(flag('size', 720))
const [W, H] = String(flag('canvas', '1080x1080')).split('x').map(Number)
const fps = Number(flag('fps', 60))
const dur = Number(flag('dur', 1))
const mode = flag('mode', 'intro')
const format = flag('format', 'mp4')
const transparent = bg === 6

// Animasyonun toplam süresi (ms) — index.html'deki zincirin sonu + nefes payı.
const TOTAL = (mode === 'outro' ? 900 : 2300) * dur
const frameCount = Math.round((TOTAL / 1000) * fps)

const outName = flag('out', join(HERE, 'out', `logo-${mode}-${BG_NAMES[bg]}.${format === 'png' ? '' : format}`))
const framesDir = join(HERE, '.frames')

const PORT = 9411
const chromeArgs = [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  '--hide-scrollbars',
  '--no-first-run',
  `--window-size=${W},${H}`,
  '--user-data-dir=/tmp/logo-render-profile',
  '--force-color-profile=srgb',
  '--disable-lcd-text',
  'about:blank',
]
// Saydamlık komut satırı bayrağıyla (--default-background-color=00000000)
// denendi; o kurulumda ekran görüntüsü hiç dönmüyordu. CDP'nin kendi
// yöntemi sorunsuz çalışıyor, aşağıda sayfa açıldıktan sonra kuruluyor.

const chrome = spawn('/usr/bin/chromium', chromeArgs, { stdio: 'ignore' })

async function firstPage() {
  for (let i = 0; i < 60; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
      const p = list.find(t => t.type === 'page')
      if (p) return p
    } catch {}
    await sleep(250)
  }
  throw new Error('Chromium DevTools bağlantısı kurulamadı')
}

const page = await firstPage()
const ws = new WebSocket(page.webSocketDebuggerUrl)
await new Promise(r => { ws.onopen = r })

let id = 0
const pending = new Map()
ws.onmessage = (e) => {
  const m = JSON.parse(e.data)
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id) }
}
const send = (method, params = {}) => new Promise(res => {
  const mid = ++id
  pending.set(mid, res)
  ws.send(JSON.stringify({ id: mid, method, params }))
})

await send('Page.enable')
await send('Runtime.enable')
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false })
if (transparent) {
  await send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } })
}

// Zamanı Web Animations API ile süreriz: sayfadaki tüm animasyonlar
// duraklatılıp her kare için `currentTime` elle kurulur. Kare atlamaz,
// süre tam oturur.
//
// Önce CDP'nin sanal saati denendi, iki yönden de çıkmaz sokak: saat tamamen
// duruyorken `Page.captureScreenshot` kare üretemediği için hiç dönmüyor;
// yüklenme payı olarak bütçe verilince de o süre animasyonun başından yeniyor
// ve işaret çizgilerinin yükselişi kayda girmiyor.
const url = `file://${join(HERE, 'index.html')}?chrome=0&bg=${bg}&size=${size}&dur=${dur}&mode=${mode}`
await send('Page.navigate', { url })
await sleep(800)

const evaluate = (expression) => send('Runtime.evaluate', { expression, returnByValue: true })

const got = await evaluate(`(() => {
  window.__anims = document.getAnimations();
  window.__anims.forEach(a => a.pause());
  return window.__anims.length;
})()`)
const animCount = got.result?.result?.value ?? 0
if (!animCount) {
  console.error('Sayfada animasyon bulunamadı — index.html bozulmuş olabilir.')
  chrome.kill()
  process.exit(1)
}

await rm(framesDir, { recursive: true, force: true })
await mkdir(framesDir, { recursive: true })
await mkdir(dirname(outName), { recursive: true })

const step = 1000 / fps
process.stdout.write(`${frameCount} kare, ${animCount} animasyon `)
for (let i = 0; i < frameCount; i++) {
  await evaluate(`window.__anims.forEach(a => { a.currentTime = ${i * step} })`)
  const { result } = await send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false,
    ...(transparent ? { fromSurface: true } : {}),
  })
  if (result?.data) {
    await writeFile(join(framesDir, `f${String(i).padStart(5, '0')}.png`), Buffer.from(result.data, 'base64'))
  }
  if (i % 20 === 0) process.stdout.write('.')
}
console.log(' bitti')

ws.close()
chrome.kill()

const written = (await readdir(framesDir)).length
if (!written) {
  console.error('Hiç kare alınamadı.')
  process.exit(1)
}

if (format === 'png') {
  console.log(`PNG dizisi: ${framesDir}/f%05d.png (${written} kare)`)
  process.exit(0)
}

// Kodek seçimi: saydamlık gerekiyorsa alfa taşıyan biçimler.
const common = ['-y', '-framerate', String(fps), '-i', join(framesDir, 'f%05d.png')]
const encoders = {
  mp4:  ['-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '17', '-preset', 'slow'],
  webm: ['-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-b:v', '0', '-crf', '24', '-auto-alt-ref', '0'],
  mov:  ['-c:v', 'qtrle', '-pix_fmt', 'argb'],
}
if (!encoders[format]) {
  console.error(`Bilinmeyen biçim: ${format}`)
  process.exit(1)
}

const ff = spawnSync('ffmpeg', [...common, ...encoders[format], outName], { stdio: ['ignore', 'ignore', 'pipe'] })
if (ff.status !== 0) {
  console.error('ffmpeg hatası:\n' + String(ff.stderr).split('\n').slice(-12).join('\n'))
  process.exit(1)
}

await rm(framesDir, { recursive: true, force: true })
console.log(`✓ ${outName}  (${written} kare, ${fps}fps, ${(written / fps).toFixed(2)} sn)`)
