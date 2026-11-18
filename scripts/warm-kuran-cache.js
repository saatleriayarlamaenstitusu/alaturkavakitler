/**
 * KV önbelleğini önden doldurur: her sureyi her meal için bir kez çeker.
 *
 * ── Neden API'ye değil, KENDİ vekilimize vuruyor ──
 * Isıtmanın amacı KV'yi doldurmak. Doğrudan API'den çekip KV'ye yazmak için
 * ayrıca hesap kimliği, namespace kimliği ve wrangler gerekirdi; üstelik
 * yazma biçimi vekildeki kodla ikiye ayrılır, bir gün sessizce ayrışırdı.
 * Vekile vurmak aynı yolu kullanır: kayıtları Function'ın kendisi yazar.
 *
 * ── Tekrar çalıştırmak ucuz ──
 * Önceden ısıtılmış bir (sure, meal) çifti KV'den dönüyor ve yukarı akışa
 * hiç istek gitmiyor. Yani betik yarıda kesilirse baştan başlatmak sorun
 * değil; kalan yerden devam etmiş gibi davranır.
 *
 *   node scripts/warm-kuran-cache.js
 *   node scripts/warm-kuran-cache.js --base=http://localhost:5173
 *   node scripts/warm-kuran-cache.js --authors=11,22
 */
import { SURAHS, AUTHORS } from '../src/data/kuranMeta.js'

const arg = (name, fallback) =>
  process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=') ?? fallback

const BASE = arg('base', 'https://alaturkavakitler.com').replace(/\/$/, '')
const authors = arg('authors', '')
  ? arg('authors', '').split(',').map(Number)
  : AUTHORS.map((a) => a.id)

// Sınır dakikada 60. 1.1 saniye aralık ~55/dk yapar; tam 60'a dayanmak
// saat kayması yüzünden ara sıra 429 yiyor ve kazanılan 2 dakikaya değmez.
const GAP_MS = 1100

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const jobs = SURAHS.flatMap((s) => authors.map((a) => ({ surah: s.id, name: s.name, author: a })))

console.log(`${BASE} üzerinden ısıtılıyor`)
console.log(`${SURAHS.length} sure × ${authors.length} meal = ${jobs.length} istek`)
console.log(`tahmini süre: ~${Math.ceil((jobs.length * GAP_MS) / 60000)} dk\n`)

let done = 0
let failed = 0
const started = Date.now()

for (const job of jobs) {
  let attempt = 0
  while (attempt < 3) {
    attempt += 1
    try {
      const res = await fetch(`${BASE}/api/kuran/surah/${job.surah}?author=${job.author}`)
      if (res.status === 429) {
        const body = await res.json().catch(() => ({}))
        const wait = (body.error?.retryAfter ?? 60) * 1000
        console.log(`  sınır doldu, ${Math.round(wait / 1000)} sn bekleniyor…`)
        await sleep(wait)
        continue
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await res.arrayBuffer()   // gövdeyi tüket, bağlantı kapanabilsin
      break
    } catch (e) {
      if (attempt === 3) {
        failed += 1
        console.error(`  ✗ ${job.name} (${job.surah}) meal ${job.author}: ${e.message}`)
      } else {
        await sleep(2000)
      }
    }
  }

  done += 1
  if (done % 25 === 0 || done === jobs.length) {
    const mins = (Date.now() - started) / 60000
    const left = (jobs.length - done) * (mins / done)
    process.stdout.write(
      `\r  ${done}/${jobs.length}  (${(done / jobs.length * 100).toFixed(0)}%)  ` +
      `geçen ${mins.toFixed(1)} dk, kalan ~${left.toFixed(1)} dk   `)
  }
  await sleep(GAP_MS)
}

console.log(`\n\nbitti — ${done - failed} başarılı, ${failed} başarısız`)
if (failed) {
  console.log('Betiği yeniden çalıştırmak güvenli: ısıtılmış olanlar KV\'den döner, API\'ye gitmez.')
  process.exitCode = 1
}
