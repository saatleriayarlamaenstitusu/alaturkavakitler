/**
 * Mushaf sayfa dizini: hangi sayfada hangi ayetler var.
 *
 * Kuran sayfası ve hatim takibi SAYFA birimiyle çalışıyor, ama hiçbir
 * API "şu sayfadaki ayetler" diye bir uç nokta vermiyor — sayfa numarası
 * ayetin içinde geliyor. Dizin bir kez burada üretilip
 * `src/data/mushafPages.js`'e yazılır: 604 satır, sayılardan ibaret.
 *
 * ── Kaynak neden Açık Kuran DEĞİL ──
 * Açık Kuran da her ayette `page` veriyor ama numaralandırması tutarsız
 * (ölçüldü): Fatiha 0, Bakara 1–5 → 1, Kehf 292, Yasin 439, Mülk 561
 * (hepsi basılı mushaftan bir eksik), buna karşılık Adiyat 599, Tebbet
 * 603, İhlas/Felak/Nas 604 (birebir aynı). Yani kayma yolun ortasında
 * kapanıyor ve toplam 605 ayrı sayfa değeri çıkıyor; 604 sayfalık bir
 * mushafta bu, bir sayfanın ikiye bölündüğü anlamına gelir. Sayfa
 * numarası kullanıcının elindeki mushafla karşılaştırılacağı için
 * (hatim "şu sayfadayım" demek) bu veri kullanılamaz.
 *
 * Bu yüzden sayfa/cüz dizini quran.com (Quran Foundation) v4 ucundan
 * üretiliyor: Medine mushafı, 604 sayfa, 6236 ayet — doğrulandı.
 *
 * ── Açık uç: kullanım şartları ──
 * QF'nin geliştirici şartları "QF içeriğini public repoya koymak"
 * yeniden dağıtım sayıyor. Üretilen dosya ayet METNİ taşımıyor, yalnızca
 * sayfa sınırlarını anlatan sayılar; bu olgusal bir dizin sayılabilir ama
 * karar verilmiş değil (bkz. ROADMAP → Kuran verisi). Alternatif,
 * Diyanet'in kendi PDF'inden çıkarmak.
 *
 *   node scripts/export-mushaf-pages.js
 */
import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const API = 'https://api.quran.com/api/v4'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function chapter(id) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(
      `${API}/verses/by_chapter/${id}?per_page=300&fields=page_number,juz_number`)
    if (res.status === 429) { await sleep(5000); continue }
    if (!res.ok) throw new Error(`sure ${id} → HTTP ${res.status}`)
    const body = await res.json()
    if (body.pagination?.total_pages > 1)
      throw new Error(`sure ${id} tek sayfada gelmedi (${body.pagination.total_records} ayet)`)
    return body.verses
  }
  throw new Error(`sure ${id} alınamadı`)
}

/** page → [[surah, verse], …] ve juz → ilk sayfa */
const pages = new Map()
const juzStart = new Map()
let verseCount = 0

for (let id = 1; id <= 114; id++) {
  for (const v of await chapter(id)) {
    verseCount++
    const [s, n] = v.verse_key.split(':').map(Number)
    if (!pages.has(v.page_number)) pages.set(v.page_number, [])
    pages.get(v.page_number).push([s, n])
    const j = v.juz_number
    if (!juzStart.has(j) || v.page_number < juzStart.get(j)) juzStart.set(j, v.page_number)
  }
  process.stderr.write(`\r${id}/114 sure — ${verseCount} ayet`)
}
process.stderr.write('\n')

if (verseCount !== 6236) throw new Error(`${verseCount} ayet, 6236 bekleniyordu`)
if (pages.size !== 604 || Math.min(...pages.keys()) !== 1 || Math.max(...pages.keys()) !== 604)
  throw new Error(`${pages.size} sayfa, 1–604 bekleniyordu`)
if (juzStart.size !== 30) throw new Error(`${juzStart.size} cüz, 30 bekleniyordu`)

// Sure ayet sayıları: satırdan ayet listesini geri kurarken sure sınırını
// bilmek gerekiyor. Dizinin kendisinden türetilir, ikinci bir kaynak yok.
const verseTotals = new Map()
for (const list of pages.values())
  for (const [s, n] of list) verseTotals.set(s, Math.max(verseTotals.get(s) ?? 0, n))

// Her sayfa üç sayı: ilk ayetin suresi, numarası ve sayfadaki ayet sayısı.
// Ayetler ardışık olduğu için bu yeter — ama DOĞRULANIR, varsayılmaz.
const rows = []
for (let p = 1; p <= 604; p++) {
  const list = pages.get(p)
  const [s0, v0] = list[0]
  // Geri kurma: üç sayıdan ayet listesini üret ve ham listeyle karşılaştır.
  let s = s0, v = v0
  const rebuilt = []
  for (let i = 0; i < list.length; i++) {
    rebuilt.push([s, v])
    v++
    if (v > (verseTotals.get(s) ?? 0)) { s++; v = 1 }
  }
  if (JSON.stringify(rebuilt) !== JSON.stringify(list))
    throw new Error(`sayfa ${p}: ayetler ardışık değil — ${JSON.stringify(list)}`)
  rows.push(`  [${s0}, ${v0}, ${list.length}],`)
}

const juzRows = [...juzStart.entries()].sort((a, b) => a[0] - b[0]).map(([, page]) => `  ${page},`)

writeFileSync(resolve(ROOT, 'src/data/mushafPages.js'), `// ÜRETİLMİŞ DOSYA — elle düzenleme.
// Kaynak: quran.com v4 (Medine mushafı), scripts/export-mushaf-pages.js
// Üretim: ${new Date().toISOString().slice(0, 10)}
//
// Mushaf sayfa dizini. Her satır bir sayfa: [sure, ilk ayet, ayet sayısı].
// Sayfadaki ayetler ardışıktır, sure sınırını geçince sonraki surenin 1.
// ayetinden devam eder — üretim sırasında 604 sayfanın hepsinde doğrulandı.
//
// Burada ayet METNİ yok, yalnızca sayfa sınırları. Metin /api/kuran
// vekilinden (Açık Kuran) gelir.

/** @type {Array<[number, number, number]>} */
export const MUSHAF_PAGES = [
${rows.join('\n')}
]

/** Her cüzün başladığı mushaf sayfası (1'den 30'a). */
export const JUZ_PAGES = [
${juzRows.join('\n')}
]

export const PAGE_COUNT = MUSHAF_PAGES.length
`)
console.log(`src/data/mushafPages.js — 604 sayfa, ${verseCount} ayet, 30 cüz (doğrulandı)`)
