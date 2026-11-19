/**
 * Sure listesi ve sunulan meal listesini Açık Kuran API'sinden çekip
 * `src/data/kuranMeta.js` dosyasına yazar.
 *
 * Neden derleme anında: bu iki liste hiç değişmiyor (114 sure, ayet
 * sayıları, mütercim adları) ve arayüzün açılışta ihtiyaç duyduğu ilk şey
 * onlar. Çalışma anında çekilseydi sure seçici boş açılır, üstüne her
 * ziyaretçi rate limit bütçesinden yerdi. Ayet metinleri bunun tersi:
 * 6236 tane var, hepsi gerekmiyor, onlar istendiğinde vekil üzerinden
 * gelir (bkz. functions/api/kuran/[[path]].js).
 *
 * Anahtar `.env`'deki ACIKKURAN_KEY'den okunur ve bu betikten dışarı
 * çıkmaz — üretilen dosyada anahtar yoktur.
 *
 *   node scripts/export-kuran-meta.js
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const API = 'https://api.acikkuran.com/v1'

// Sunulacak mealler. Listeyi daraltmak bilinçli: API 52 mütercim veriyor,
// hepsini arayüze dökmek seçimi kolaylaştırmıyor. Sıra arayüzde göründüğü
// sıradır — Diyanet önce, çünkü vakitler de oradan geliyor.
const AUTHORS = [11, 14, 15, 19, 21, 22, 2, 16, 109]

// Katman eklenirken gösterilecek ayet. Kısa olması şart: parça tuvale
// düştüğü anda bir şey göstermeli ve gösterdiği şey kompozisyonu
// ezmemeli. Önce Ayetel Kürsi (2:255) vardı — tek başına tuvalin yarısını
// kaplıyor ve kullanıcı daha neyi eklediğini görmeden yer değiştirmeye
// başlıyordu. İhlas 1 dört kelime.
const DEFAULT = { surah: 112, verse: 1, author: 11 }

function apiKey() {
  const env = readFileSync(resolve(ROOT, '.env'), 'utf8')
  const key = env.match(/^ACIKKURAN_KEY=(.*)$/m)?.[1]?.trim().replace(/^['"]|['"]$/g, '')
  if (!key) throw new Error('.env içinde ACIKKURAN_KEY yok')
  return key
}

async function get(path, key) {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${key}` },
  })
  if (!res.ok) throw new Error(`${path} → HTTP ${res.status} ${await res.text()}`)
  const body = await res.json()
  if (body.error) throw new Error(`${path} → ${body.error.code}: ${body.error.message}`)
  return body.data
}

const key = apiKey()
const [surahs, authors, defaultVerse] = await Promise.all([
  get('/surahs', key),
  get('/authors', key),
  get(`/surahs/${DEFAULT.surah}/verses/${DEFAULT.verse}?author=${DEFAULT.author}`, key),
])

// Yalnızca kullanılan alanlar. Ham yanıt her sure için okuma kayıtlarını da
// taşıyor (mp3 adresleri), paket onlarca KB şişiyordu.
const surahRows = surahs
  .sort((a, b) => a.id - b.id)
  .map((s) => ({
    id: s.id,
    name: s.name,
    nameEn: s.name_en,
    nameOriginal: s.name_original,
    slug: s.slug,
    verses: s.verse_count,
  }))

const byId = new Map(authors.map((a) => [a.id, a]))
const authorRows = AUTHORS.map((id) => {
  const a = byId.get(id)
  if (!a) throw new Error(`Mütercim ${id} API listesinde yok`)
  return { id: a.id, name: a.name, lang: a.language }
})

const total = surahRows.reduce((sum, s) => sum + s.verses, 0)
if (surahRows.length !== 114 || total !== 6236)
  throw new Error(`Beklenmeyen veri: ${surahRows.length} sure, ${total} ayet`)

const out = `// ÜRETİLMİŞ DOSYA — elle düzenleme.
// Kaynak: Açık Kuran API (${API}), scripts/export-kuran-meta.js
// Üretim: ${new Date().toISOString().slice(0, 10)}
//
// Sure listesi ve sunulan meal listesi. Ayet METİNLERİ burada değil; onlar
// istendiğinde /api/kuran vekili üzerinden gelir ve orada kalıcı olarak
// önbelleğe alınır.

/** 114 sure: ad, Arapça ad ve ayet sayısı. */
export const SURAHS = ${JSON.stringify(surahRows, null, 0).replace(/},/g, '},\n  ').replace(/^\[/, '[\n  ').replace(/\]$/, ',\n]')}

/** Arayüzde sunulan mealler, görünme sırasıyla. */
export const AUTHORS = ${JSON.stringify(authorRows, null, 0).replace(/},/g, '},\n  ').replace(/^\[/, '[\n  ').replace(/\]$/, ',\n]')}

/** Varsayılan meal: vakitlerle aynı kurumdan. */
export const DEFAULT_AUTHOR = 11

export const surahById = (id) => SURAHS.find((s) => s.id === Number(id)) ?? null
export const authorById = (id) => AUTHORS.find((a) => a.id === Number(id)) ?? null

/** Toplam ayet sayısı — veri bütünlüğü için betikte de doğrulanıyor. */
export const TOTAL_VERSES = ${total}
`

// DEFAULT_VERSE da BURADA üretiliyor. Daha önce dosyaya elle eklenmişti
// ve betiğin ikinci çalıştırılması onu sessizce siliyordu.
const defaultAuthorName = byId.get(DEFAULT.author).name
const defaultSurahName = surahRows.find((s) => s.id === DEFAULT.surah).name
const defaultBlock = `
/**
 * Katman eklenirken gösterilen ayet.
 *
 * Gömülü duruyor çünkü bir parça tuvale eklendiği anda bir şey GÖSTERMELİ.
 * Ağdan çekilseydi katman boş doğar, istek dönene kadar kullanıcı neyi
 * eklediğini göremez ve ilk saniyede yapılan bir dışa aktarım boş çıkardı.
 * Başka bir ayete geçildiğinde metin vekilden gelir.
 *
 * Kısa bir ayet seçilmesi bilinçli: uzun bir ayet eklendiği anda tuvalin
 * yarısını kaplıyor ve kompozisyonu ezerek başlıyor.
 */
export const DEFAULT_VERSE = {
  surah: ${DEFAULT.surah},
  verse: ${DEFAULT.verse},
  ref: ${JSON.stringify(`${defaultSurahName} ${DEFAULT.surah}:${DEFAULT.verse}`)},
  ar: ${JSON.stringify(defaultVerse.verse)},
  tx: ${JSON.stringify(defaultVerse.transcription ?? '')},
  meals: [{ id: ${DEFAULT.author}, name: ${JSON.stringify(defaultAuthorName)}, text: ${JSON.stringify(defaultVerse.translation?.text ?? '')} }],
}
`

mkdirSync(resolve(ROOT, 'src/data'), { recursive: true })
writeFileSync(resolve(ROOT, 'src/data/kuranMeta.js'), out + defaultBlock)
console.log(`src/data/kuranMeta.js yazıldı — ${surahRows.length} sure, ${total} ayet, ${authorRows.length} meal`)
console.log(`varsayılan ayet: ${defaultSurahName} ${DEFAULT.surah}:${DEFAULT.verse} (${defaultAuthorName})`)
