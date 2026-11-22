// Sosyal medya tanıtım kartlarını PNG ve MP4 olarak basar.
//
// Kartın içindeki telefonda GERÇEK UYGULAMA çalışır (bkz. index.html). Burada
// yapılan iş, o uygulamayı belirlenebilir hâle getirmek:
//
//   1. `dist/` derlenir ve küçük bir sunucuyla yayınlanır (iframe ile aynı
//      köken olmalı, yoksa karttan uygulamaya erişilemez).
//   2. Her belgeye, kendi betikleri çalışmadan ÖNCE sahte bir saat enjekte
//      edilir: `Date`, `setTimeout` ve `setInterval` sanal zamana bağlanır.
//      Böylece uygulamanın sayaçları, basılı tutma zamanlayıcıları ve dakika
//      tikleri bizim ilerlettiğimiz zamanla işler.
//   3. Kare başına zaman ilerletilir, sahnenin o anki dokunuşları yapılır ve
//      ekran görüntüsü alınır; sonunda ffmpeg birleştirir.
//
// Gerçek zamanlı ekran kaydı değil: kare atlamıyor, süre tam oturuyor ve aynı
// komut her çalıştığında birebir aynı kareleri üretiyor.
//
// Kullanım:
//   node render.mjs                              → 7 özellik × 2 boyut
//   node render.mjs --feature kaza --only png    → tek kart, hızlı bakış
//   node render.mjs --youtube                    → tek parça 16:9 tanıtım filmi
//   node render.mjs --no-build                   → dist'i yeniden derleme
//   node render.mjs --help
import { spawn, spawnSync } from 'node:child_process'
import { mkdir, writeFile, rm, readdir, readFile } from 'node:fs/promises'
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { setTimeout as sleep } from 'node:timers/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, extname, join, normalize } from 'node:path'
import { tmpdir } from 'node:os'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..', '..')
const DIST = join(ROOT, 'dist')

// Poster PNG'nin alındığı an — kompozisyonun en dolu olduğu kare.
const FEATURES = [
  { id: 'saat',       no: '01', poster: 6200 },
  { id: 'sayac',      no: '02', poster: 7600 },
  { id: 'hatirlatma', no: '03', poster: 7200 },
  { id: 'takvim',     no: '04', poster: 7000 },
  { id: 'kaza',       no: '05', poster: 5200 },
  { id: 'kuran',      no: '06', poster: 4200 },
  { id: 'dinle',      no: '07', poster: 3400 },
  { id: 'kurangenel', no: '08', poster: 6400, still: true },
  // `still`: duran kare ayrı bir geçişte, elle çekilmiş ekran
  // görüntüsüyle basılır; video yine canlı sahnedir. Hangi dosyanın
  // kullanılacağı `index.html`deki özellik tanımında yazıyor.
  { id: 'gorsel',     no: '09', poster: 7000, still: true },
  { id: 'kible',      no: '10', poster: 8000 },
  { id: 'palet',      no: '11', poster: 5600 },
]
const SIZES = { story: [1080, 1920], post: [1080, 1350], yt: [1920, 1080] }

// Yatay film: giriş + yedi özellik + çıkış. Özellik bölümleri 10 saniye
// kalır çünkü sahnelerin dokunuş zamanlamaları (index.html) o bütçeye göre
// yazıldı — kısaltılırsa son dokunuşlar hiç gerçekleşmez.
const YT_CHAPTERS = [
  { id: 'intro', no: '00', dur: 6, poster: 4200 },
  ...FEATURES.map(f => ({ ...f, dur: 10 })),
  { id: 'outro', no: '12', dur: 6, poster: 3000 },
]
const YT_OUT = 'alaturka-vakitler-tanitim'

const args = process.argv.slice(2)
const flag = (n, d) => { const i = args.indexOf(`--${n}`); return i !== -1 && args[i + 1] ? args[i + 1] : d }
const has = (n) => args.includes(`--${n}`)

if (has('help')) {
  console.log(`Seçenekler:
  --feature <id>    ${FEATURES.map(f => f.id).join(' ')}   (varsayılan: hepsi)
  --size <ad>       story | post                            (varsayılan: ikisi)
  --only png|mp4    yalnızca bir çıktı türü
  --youtube         tek parça 16:9 film (bölümler siyaha düşerek birleşir)
  --fps <n>         kare hızı (varsayılan 30)
  --dur <sn>        kart süresi (varsayılan 10)
  --no-build        dist/ zaten güncelse derlemeyi atla
  --probe <js>      sahneyi kurup verilen ifadeyi değerlendirir ve çıkar
                    (iframe penceresi w, belgesi d olarak hazırdır)
  --out <dizin>     çıktı dizini (varsayılan ./out)`)
  process.exit(0)
}

const fps = Number(flag('fps', 30))
const durSec = Number(flag('dur', 10))
const only = flag('only', null)
const probe = flag('probe', null)
const outDir = flag('out', join(HERE, 'out'))
const YT = has('youtube')
const wantFeatures = YT
  ? (flag('feature', null) ? YT_CHAPTERS.filter(f => f.id === flag('feature')) : YT_CHAPTERS)
  : (flag('feature', null) ? FEATURES.filter(f => f.id === flag('feature')) : FEATURES)
const wantSizes = YT
  ? ['yt']
  : (flag('size', null) ? [flag('size')] : Object.keys(SIZES).filter(s => s !== 'yt'))

if (!wantFeatures.length) { console.error('Bilinmeyen özellik.'); process.exit(1) }
for (const s of wantSizes) if (!SIZES[s]) { console.error(`Bilinmeyen boyut: ${s}`); process.exit(1) }

// ── 1. Uygulamayı derle ──
if (!has('no-build')) {
  process.stdout.write('dist/ derleniyor… ')
  const b = spawnSync('npm', ['run', 'build'], { cwd: ROOT, stdio: ['ignore', 'ignore', 'pipe'] })
  if (b.status !== 0) {
    console.error('\nBuild hatası:\n' + String(b.stderr).split('\n').slice(-15).join('\n'))
    process.exit(1)
  }
  console.log('bitti')
}
if (!existsSync(join(DIST, 'index.html'))) {
  console.error('dist/ yok. --no-build vermeden bir kez çalıştır.')
  process.exit(1)
}

// ── 2. Sunucu ──
// Kart ile uygulama AYNI KÖKENDE olmalı; iframe'e erişemezsek sahneyi
// süremeyiz. Bu yüzden ikisi de buradan yayınlanır.
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.ico': 'image/x-icon',
}
const PORT = 8731

/* Ayet vekili — `vite.config.js`teki `devKuranProxy`nin kardeşi.
   Anahtar `.env`den okunur; VITE_ öneki taşımıyor, yani pakete hiç
   girmiyor ve buraya elle okunması gerekiyor. */
const ENV = Object.fromEntries(
  (existsSync(join(ROOT, '.env')) ? readFileSync(join(ROOT, '.env'), 'utf8') : '')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '')]))

if (!globalThis.caches) {
  const store = new Map()
  globalThis.caches = {
    default: {
      // KOPYASI döner: saklanan `Response` bir kez okununca gövdesi
      // tükeniyor ve ikinci istek "Body has already been read" diye
      // patlıyordu (kart ekranında ham TypeError olarak görünüyordu).
      match: async (r) => store.get(typeof r === 'string' ? r : r.url)?.clone(),
      put: async (r, res) => { store.set(typeof r === 'string' ? r : r.url, res.clone()) },
    },
  }
}

let kuranFn = null
async function kuranProxy(req, res, url) {
  try {
    kuranFn ??= (await import(
      pathToFileURL(join(ROOT, 'functions', 'api', 'kuran', '[[path]].js')).href)).onRequestGet
    const path = url.pathname.replace(/^\/api\/kuran\/?/, '').split('/').filter(Boolean)
    const out = await kuranFn({
      request: new Request(`http://localhost${url.pathname}${url.search}`),
      env: { ACIKKURAN_KEY: ENV.ACIKKURAN_KEY },
      params: { path },
      waitUntil: (pr) => { Promise.resolve(pr).catch(() => {}) },
    })
    // Gövde başlıklardan ÖNCE okunur: `out.text()` sonradan patlarsa
    // catch dalı ikinci bir `writeHead` deniyor ve Node
    // ERR_HTTP_HEADERS_SENT atıyor (ölçüldü).
    const body = await out.text()
    res.writeHead(out.status, { 'Content-Type': out.headers.get('content-type') ?? 'application/json' })
    res.end(body)
  } catch (e) {
    if (res.headersSent) return res.end()
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: { code: 'kart_vekili', message: String(e) } }))
  }
}

/**
 * Kart metinleri `metinler.txt`ten gelir, koddan değil.
 *
 * Başlıkları `index.html`in içinde tutmak her düzeltmede kodu
 * açtırıyordu; metin yazan kişiyle kodu yazan kişi aynı olmayabilir ve
 * bir virgül için sahne tanımının içine girmek gerekmemeli. Dosya
 * basit: köşeli parantez içinde kimlik, altında `anahtar = değer`.
 * Tanınmayan satırlar (başlıksız notlar, yorumlar) sessizce atlanır —
 * dosya aynı zamanda insanın okuduğu bir belge.
 */
function readMetin(file) {
  const out = {}
  let key = null
  for (const raw of readFileSync(file, 'utf8').split('\n')) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const head = line.match(/^\[([^\]]+)\]$/)
    // Yalnızca "bölüm/kimlik" biçimindeki başlıklar bir kayıt açar;
    // dosyada serbest notlar da köşeli parantezle yazılmış olabiliyor.
    if (head) { key = head[1].includes('/') ? head[1] : null; if (key) out[key] = {}; continue }
    const eq = line.indexOf('=')
    if (eq === -1 || !key) continue
    out[key][line.slice(0, eq).trim()] = line.slice(eq + 1).trim()
  }
  return out
}

const METIN_FILE = join(HERE, 'metinler.txt')
const METIN = existsSync(METIN_FILE) ? readMetin(METIN_FILE) : {}
if (!Object.keys(METIN).length) console.warn('! metinler.txt okunamadı; index.html\'deki yazılar kullanılacak')
const server = createServer((req, res) => {
  const url = new URL(req.url, 'http://x')
  let p = decodeURIComponent(url.pathname)
  const send = (file) => {
    res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' })
    createReadStream(file).pipe(res)
  }
  if (p === '/_card.html') return send(join(HERE, 'index.html'))
  // Kart, yazılarını buradan çeker (dosyayı tarayıcıdan okuyamaz).
  // Durağan ekran görüntüleri: bazı kartlarda uygulamayı canlı
  // sürmek yerine elle çekilmiş bir kare kullanılıyor (iki telefonlu
  // kompozisyon, ya da uygulamanın kart düzeneğinde kurulması zor bir
  // hâli). Dosyalar `screenshots/` altında; adlarında boşluk ve
  // Türkçe harf olabildiği için yol çözülerek okunuyor.
  if (p.startsWith('/_shot/')) {
    const f = join(HERE, 'screenshots', p.slice('/_shot/'.length))
    if (f.startsWith(join(HERE, 'screenshots')) && existsSync(f)) return send(f)
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    return res.end('yok')
  }
  if (p === '/_metin.json') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
    return res.end(JSON.stringify(METIN))
  }
  // Servis çalışanı hiç yayımlanmaz: kayıtlı bir SW gezinme isteklerine
  // app shell'i döndürüp /_card.html'i de uygulamayla değiştiriyordu.
  // Ayet vekili: kart sunucusu yalnızca `dist/` yayınlıyor ve
  // `/api/kuran` orada yok — istek SPA geri düşüşüyle index.html'e
  // iniyor, uygulama da ekranda "Ayetler alınamadı" gösteriyordu
  // (esnek ve ayet ayet görünümleri ile meal tamamen boş kalıyor).
  // Cloudflare fonksiyonunun KENDİSİ çağrılıyor, mantık ikinci kez
  // yazılmıyor — `vite.config.js`teki geliştirme vekilinin aynısı.
  if (p.startsWith('/api/kuran')) return kuranProxy(req, res, url)
  if (p === '/sw.js' || p === '/registerSW.js' || /^\/workbox-[\w-]+\.js$/.test(p)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    return res.end('yok')
  }
  const file = join(DIST, normalize(p).replace(/^(\.\.[/\\])+/, ''))
  if (file.startsWith(DIST) && existsSync(file) && statSync(file).isFile()) return send(file)
  return send(join(DIST, 'index.html'))   // SPA geri düşüşü
})
await new Promise(r => server.listen(PORT, '127.0.0.1', r))

// ── 3. Chromium ──
const CDP_PORT = 9414
// Her çalıştırma taze profille: önceki koşudan kalmış bir servis çalışanı
// ya da önbellek, kartı sessizce eski bir sürümle değiştirebiliyor.
const PROFILE = join(tmpdir(), `social-render-${process.pid}`)
await rm(PROFILE, { recursive: true, force: true })

const chrome = spawn('/usr/bin/chromium', [
  '--headless=new',
  `--remote-debugging-port=${CDP_PORT}`,
  '--hide-scrollbars', '--no-first-run',
  '--window-size=1080,1920',
  `--user-data-dir=${PROFILE}`,
  '--force-color-profile=srgb', '--disable-lcd-text',
  'about:blank',
], { stdio: 'ignore' })

async function firstPage() {
  for (let i = 0; i < 60; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)).json()
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

let msgId = 0
const pending = new Map()
ws.onmessage = (e) => {
  const m = JSON.parse(e.data)
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id) }
}
const send = (method, params = {}) => new Promise(res => {
  const id = ++msgId
  pending.set(id, res)
  ws.send(JSON.stringify({ id, method, params }))
})
const evaluate = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (r.result?.exceptionDetails) {
    throw new Error(r.result.exceptionDetails.exception?.description || 'sayfa hatası')
  }
  return r.result?.result?.value
}

await send('Page.enable')
await send('Runtime.enable')
await mkdir(outDir, { recursive: true })

const VAKITLER = await readFile(join(HERE, 'data', 'vakitler-34.json'), 'utf8')

/* Her belgeye, kendi betikleri çalışmadan önce enjekte edilir. */
const clockScript = (at, seed) => `(() => {
  try {
    // ÖNCE TEMİZLE. Bütün kartlar tek bir tarayıcı profilini paylaşıyor
    // ve bazı sahneler ayar değiştiriyor: palet kartı beş renk stiline
    // sırayla basıyor ve sonuncusunda bırakıyor, o da kendisinden
    // SONRA basılan her kartın paletini belirliyordu (ölçüldü — vakte
    // kalan süre kartı mono paletle basılıyor, vakit değiştiği hâlde
    // renk hiç değişmiyordu). Tohum üstüne yazmak yetmez: yazılmayan
    // anahtar olduğu gibi kalır.
    localStorage.clear()
    const S = ${JSON.stringify(seed)}
    for (const k in S) localStorage.setItem(k, S[k])
  } catch {}
  // Servis çalışanı eski bir app shell'i önbellekten sunabiliyor.
  try { if (navigator.serviceWorker) navigator.serviceWorker.register = () => new Promise(() => {}) } catch {}

  const RealDate = Date
  window.__vnow = ${at}
  class FakeDate extends RealDate {
    constructor(...a) { if (a.length === 0) super(window.__vnow); else super(...a) }
    static now() { return window.__vnow }
  }
  FakeDate.parse = RealDate.parse
  FakeDate.UTC = RealDate.UTC
  window.Date = FakeDate

  let q = [], id = 1
  window.setTimeout = (fn, t) => { q.push({ id, fn, due: window.__vnow + (+t || 0) }); return id++ }
  window.setInterval = (fn, t) => { const e = Math.max(1, +t || 1); q.push({ id, fn, due: window.__vnow + e, every: e }); return id++ }
  window.clearTimeout = window.clearInterval = (x) => { q = q.filter(e => e.id !== x) }
  window.__advance = (t) => {
    window.__vnow = t
    for (let g = 0; g < 4000; g++) {
      let next = null
      for (const e of q) if (e.due <= t && (!next || e.due < next.due)) next = e
      if (!next) break
      // Zaman hızlandırılmışsa geride kalan tekrarları biriktirme, atla.
      if (next.every) { do { next.due += next.every } while (next.due <= t) }
      else q = q.filter(e => e !== next)
      try { next.fn() } catch {}
    }
  }
})()`

const shot = async () => {
  const { result } = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
  if (!result?.data) throw new Error('Ekran görüntüsü alınamadı')
  return Buffer.from(result.data, 'base64')
}

const framesDir = join(HERE, '.frames')
// Yatay filmde her bölüm kendi mp4'üne basılır, sonra kopyalanarak
// birleştirilir: 80 saniyelik 1920×1080 PNG dizisi diskte ~4 GB tutuyor.
const segDir = join(HERE, '.segments')
if (YT) { await rm(segDir, { recursive: true, force: true }); await mkdir(segDir, { recursive: true }) }
const segments = []
let made = 0, failed = []

for (const size of wantSizes) {
  const [W, H] = SIZES[size]
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false })

  for (const f of wantFeatures) {
    const dur = f.dur || durSec
    const frameCount = Math.round(dur * fps)
    const base = YT ? `${f.no}-${f.id}` : `${f.no}-${f.id}-${size}`
    const url = `http://127.0.0.1:${PORT}/_card.html?feature=${f.id}&size=${size}&dur=${dur}&chrome=0`
    let installed = null

    try {
      // Önce kartı sade yükleyip sahnenin ayarlarını (an, tohum) okuruz —
      // tek kaynak index.html olsun diye burada tekrarlanmıyor.
      await send('Page.navigate', { url })
      let cfg = null
      for (let i = 0; i < 60 && !cfg; i++) {
        await sleep(120)
        cfg = await evaluate('window.CARD ? { at: CARD.at, seed: CARD.seed } : null').catch(() => null)
      }
      if (!cfg) throw new Error('kart yüklenmedi')

      const seed = {
        city: JSON.stringify({ plate: '34', name: 'İSTANBUL' }),
        vakitler: VAKITLER,
        settings_darkMode: '"dark"',
        settings_themePerVakit: 'true',
        // Palet varsayılana bırakılmaz, SÖYLENİR: kartların rengi
        // uygulamanın varsayılanı değişince sessizce değişmesin.
        settings_colorStyle: '"mesh"',
        ...cfg.seed,
      }
      installed = (await send('Page.addScriptToEvaluateOnNewDocument', { source: clockScript(cfg.at, seed) })).result.identifier
      await send('Page.navigate', { url })

      let ok = false
      for (let i = 0; i < 80; i++) {
        await sleep(150)
        if (await evaluate('!!(window.CARD && CARD.ready())').catch(() => false)) { ok = true; break }
      }
      if (!ok) throw new Error('uygulama iframe içinde ayağa kalkmadı')
      await evaluate('(async () => { await document.fonts.ready; CARD.prepare() })()')
      await sleep(400)

      if (probe) {
        const r = await evaluate(`(async () => {
          const fr = document.querySelector('iframe')
          const w = fr.contentWindow, d = fr.contentDocument
          const tick = () => new Promise(res => requestAnimationFrame(() => requestAnimationFrame(res)))
          return JSON.stringify(await (${probe}))
        })()`)
        console.log(`${base} → ${r}`)
        await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: installed })
        continue
      }

      const step = 1000 / fps
      const at = (t) => evaluate(`CARD.step(${t})`)

      /* Kartı baştan yükler ve hazır olmasını bekler — duran kare ile
         videoyu ayrı geçişlerde basmak gerektiğinde kullanılıyor. */
      const reload = async (u) => {
        await send('Page.navigate', { url: u })
        for (let i = 0; i < 80; i++) {
          await sleep(150)
          if (await evaluate('!!(window.CARD && CARD.ready())').catch(() => false)) break
        }
        await evaluate('(async () => { await document.fonts.ready; CARD.prepare() })()')
        await sleep(400)
      }

      /* ── Duran kare ayrı basılır ──
         Bir kartın duran karesiyle videosu aynı kaynaktan gelmek
         zorunda değil. Görsel oluşturucuda en iyi duran kare elle
         çekilmiş bir kompozisyon (tuval kullanıcının kendi işi, kart
         düzeneğinin kurduğu değil); hareket ise ancak uygulamanın
         kendisi sürülerek anlatılıyor. İki çıktı, iki yükleme. */
      if (f.still && !YT && only !== 'mp4') {
        await reload(`${url}&still=1`)
        await at(1500)   // açılış hareketi yerine otursun
        await writeFile(join(outDir, `${base}.png`), await shot())
        made++
        console.log(`${base}  (png · durağan)`)
        if (only === 'png') {
          await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: installed })
          continue
        }
        await reload(url)
      }

      // ── Poster PNG ──
      // Sahne zamana bağlı: poster anına kadar kareler sırayla işlenmeli,
      // doğrudan atlamak zamanlanmış dokunuşları atlar (bant hiç açılmaz).
      // Video da zaten baştan sona ilerlediği için poster O geçişin içinden
      // alınır; yalnızca --only png verildiğinde ayrı bir geçiş yapılır.
      if (only === 'png') {
        for (let t = 0; t <= f.poster; t += step) await at(t)
        await writeFile(join(outDir, `${base}${YT ? '-yt' : ''}.png`), await shot())
        made++
        console.log(`${base}  (png)`)
        continue
      }

      // ── MP4 (+ poster) ──
      await rm(framesDir, { recursive: true, force: true })
      await mkdir(framesDir, { recursive: true })
      process.stdout.write(`${base}  ${frameCount} kare `)
      // Yatay filmin tek PNG'si kapak görseli: giriş bölümünden alınır.
      let posterTaken = only === 'mp4' || (f.still && !YT) || (YT && only !== 'png' && f.id !== 'intro')
      for (let i = 0; i < frameCount; i++) {
        const t = i * step
        await at(t)
        const png = await shot()
        await writeFile(join(framesDir, `f${String(i).padStart(5, '0')}.png`), png)
        if (!posterTaken && t >= f.poster) {
          await writeFile(join(outDir, YT ? `${YT_OUT}-kapak.png` : `${base}.png`), png)
          posterTaken = true
          made++
        }
        if (i % 30 === 0) process.stdout.write('.')
      }
      const written = (await readdir(framesDir)).length
      const out = YT ? join(segDir, `${base}.mp4`) : join(outDir, `${base}.mp4`)
      // yuv420p + faststart: Instagram ve WhatsApp aynı dosyayı sorunsuz okur.
      const ff = spawnSync('ffmpeg', [
        '-y', '-framerate', String(fps), '-i', join(framesDir, 'f%05d.png'),
        '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'slow',
        '-movflags', '+faststart', out,
      ], { stdio: ['ignore', 'ignore', 'pipe'] })
      await rm(framesDir, { recursive: true, force: true })
      if (ff.status !== 0) {
        console.log('')
        console.error('ffmpeg hatası:\n' + String(ff.stderr).split('\n').slice(-12).join('\n'))
        failed.push(base)
      } else {
        console.log(` → ${written} kare, ${(written / fps).toFixed(1)} sn`)
        if (YT) segments.push({ file: out, id: f.id, seconds: written / fps })
        else made++
      }
    } catch (e) {
      console.error(`${base}: ${e.message}`)
      failed.push(base)
    } finally {
      if (installed) await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: installed })
    }
  }
}

// ── 5. Yatay filmi birleştir ──
// Bütün bölümler aynı kodek ve ölçüyle basıldığı için akış kopyalanabilir;
// yeniden kodlamak kaliteyi bir kez daha düşürürdü.
if (YT && segments.length) {
  const listFile = join(segDir, 'list.txt')
  await writeFile(listFile, segments.map(s => `file '${s.file}'`).join('\n') + '\n')
  const out = join(outDir, `${YT_OUT}.mp4`)
  const ff = spawnSync('ffmpeg', [
    '-y', '-f', 'concat', '-safe', '0', '-i', listFile,
    '-c', 'copy', '-movflags', '+faststart', out,
  ], { stdio: ['ignore', 'ignore', 'pipe'] })
  if (ff.status !== 0) {
    console.error('ffmpeg birleştirme hatası:\n' + String(ff.stderr).split('\n').slice(-12).join('\n'))
    failed.push(YT_OUT)
  } else {
    made++
    const total = segments.reduce((a, s) => a + s.seconds, 0)
    console.log(`\n✓ ${out}  (${segments.length} bölüm, ${total.toFixed(1)} sn)`)
    // YouTube açıklamasına yapıştırılacak bölüm listesi.
    let acc = 0
    console.log('\nBölümler:')
    for (const s of segments) {
      const mm = String(Math.floor(acc / 60)).padStart(2, '0')
      const ss = String(Math.round(acc % 60)).padStart(2, '0')
      console.log(`  ${mm}:${ss}  ${s.id}`)
      acc += s.seconds
    }
    await rm(segDir, { recursive: true, force: true })
  }
}

ws.close()
chrome.kill()
server.close()
// Chromium profili bırakana kadar bekle; hemen silmek ENOTEMPTY veriyor.
await sleep(600)
await rm(PROFILE, { recursive: true, force: true }).catch(() => {})
console.log(`\n✓ ${made} dosya → ${outDir}`)
if (failed.length) console.log(`✗ ${failed.length} kart basılamadı: ${failed.join(', ')}`)
