import { rangesOfPage } from '@/utils/mushaf'

/**
 * Satır satır mushaf dizimi (QPC).
 *
 * Esnek görünüm ayetleri akıtır; mushaf görünümü BASILI sayfanın
 * kendisini kurar: 604 sayfanın her biri 15 satır, satırdaki kelimeler
 * basılı nüshadaki sırayla ve o sayfaya ait fontla.
 *
 * İki parça gerekiyor ve ikisi de dışarıdan geliyor, repoda veri
 * taşımıyoruz (telif açısından en temizi):
 *
 *  1. Dizim — quran.com v4, `words=true` ile her kelimenin `line_number`
 *     ve glif kodu (`code_v1` / `code_v2`). Satır numarası 1–15.
 *  2. Font — sayfa başına bir dosya (`p{sayfa}.woff2`). Glif kodları
 *     YALNIZCA o sayfanın fontunda anlamlıdır; 42. sayfanın kodunu 43'ün
 *     fontuyla çizmek başka harfler verir. Bu yüzden font sayfa sayfa,
 *     `FontFace` ile ve istendiği anda yüklenir.
 *
 * Başlık satırları veride YOKTUR: bir sayfada kullanılmayan satır
 * numarası, sure adı ya da besmele süslemesidir (bkz. `headerLines`).
 */

const API = 'https://api.quran.com/api/v4'
const CDN = 'https://static.qurancdn.com/fonts/quran'

/**
 * Hatlar. `code` hangi glif alanının okunacağını söyler.
 *
 * **Tecvitli (V4) burada YOK ve bu bir eksiklik değil, ölçülmüş bir
 * sınır.** V4 sayfa fontları CDN'de duruyor (`hafs/v4/woff2/p{n}.woff2`)
 * ama kendi glif kodlarını istiyor; V1 kodlarıyla çizdirildiğinde harfler
 * birleşmiyor, sayfa anlamsız bir harf dizisine dönüyor (denendi, 293.
 * sayfada görüldü). quran.com API'si `code_v4` alanını vermiyor — yalnızca
 * `code_v1` ve `code_v2`. Tecvit için QUL'un V4 dizim verisi gerekiyor;
 * bkz. ROADMAP.
 */
export const MUSHAF_SCRIPTS = [
  { id: 'v2', label: 'Mushaf', note: '1421H baskısı', dir: 'hafs/v2', code: 'code_v2' },
  { id: 'v1', label: 'Klasik', note: '1405H baskısı', dir: 'hafs/v1', code: 'code_v1' },
]

export const scriptById = (id) =>
  MUSHAF_SCRIPTS.find((s) => s.id === id) ?? MUSHAF_SCRIPTS[0]

export const LINES_PER_PAGE = 15

/** Sure adı süslemesinin fontu: tek dosya, her sure bir glif. */
const NAME_FAMILY = 'QPCSuraNames'
let namesLoading = null

/**
 * Sure numarasından ad glifine.
 *
 * Kodlama sanıldığı gibi `0xE000 + sıra` DEĞİL: sure numarası ONDALIK
 * haliyle onaltılık basamaklara yazılıyor — 12. sure `U+E012`, 72.
 * `U+E072`, 114. `U+E114`. Sıralı sayıldığında 18. sure Yusuf çıkıyordu
 * (ölçüldü). Fontun cmap'i de bunu doğruluyor: 116 glif var ve
 * E009→E010 ile E099→E100 arasında tam olarak bu yüzden boşluk duruyor
 * (E000 genel "sûre" kelimesi, E115 fazladan bir süsleme).
 */
export const suraNameGlyph = (surah) =>
  String.fromCharCode(parseInt(`E${String(surah).padStart(3, '0')}`, 16))

export function ensureNameFont() {
  if (namesLoading) return namesLoading
  const face = new FontFace(NAME_FAMILY, `url(${CDN}/surah-names/v1/sura_names.woff2)`)
  namesLoading = face.load().then((f) => { document.fonts.add(f); return NAME_FAMILY })
  return namesLoading
}

export const nameFamily = () => NAME_FAMILY

/**
 * Sayfa fontu. Aile adı hatta VE sayfaya bağlıdır; aynı sayfa ikinci kez
 * istendiğinde ağa gidilmez.
 */
const pageFonts = new Map()

export function pageFamily(scriptId, page) {
  return `QPC-${scriptId}-${page}`
}

export function ensurePageFont(scriptId, page) {
  const family = pageFamily(scriptId, page)
  const hit = pageFonts.get(family)
  if (hit) return hit
  const { dir } = scriptById(scriptId)
  const face = new FontFace(family, `url(${CDN}/${dir}/woff2/p${page}.woff2)`)
  const task = face.load().then((f) => { document.fonts.add(f); return family })
  pageFonts.set(family, task)
  return task
}

/**
 * Dizim önbelleği.
 *
 * Sayfa ~1,5 kB; hepsini tutmak localStorage kotasını yiyeceği için son
 * okunanlar saklanır. Sıra anahtarların sırasıyla taşınır: en eski baştan
 * atılır.
 */
const CACHE_KEY = 'qpcLines'
const CACHE_MAX = 90

function readCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') } catch { return {} }
}

function writeCache(map) {
  const keys = Object.keys(map)
  if (keys.length > CACHE_MAX) for (const k of keys.slice(0, keys.length - CACHE_MAX)) delete map[k]
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(map)) } catch { /* kota: önbelleksiz devam */ }
}

/**
 * Kullanılmayan satırları başlıklara dağıtır.
 *
 * Bir sure sayfanın ortasında başlıyorsa, ilk kelimesinin HEMEN ÜSTÜNDEKİ
 * boş satırlar ona aittir: iki boş satır varsa üsttekine ad, alttakine
 * besmele; bir boş satır varsa yalnızca ad. Tevbe suresi besmelesizdir ve
 * veride de tek boş satır bırakıyor — ayrıca kural yazmak gerekmiyor,
 * sayım kendiliğinden doğru çıkıyor.
 */
function headerLines(page, used) {
  const marks = {}
  const starts = rangesOfPage(page).filter((g) => g.from === 1)
  for (const g of starts) {
    const first = used.get(g.surah)
    if (!first) continue
    let free = []
    for (let n = first - 1; n >= 1 && !marks[n]; n--) {
      if (used.lines.has(n)) break
      free.unshift(n)
    }
    if (!free.length) continue
    marks[free[0]] = { kind: 'name', surah: g.surah, name: g.surahName }
    if (free.length > 1) marks[free[1]] = { kind: 'basmala', surah: g.surah }
  }
  return marks
}

async function fetchLines(page, codeField) {
  const url = `${API}/verses/by_page/${page}?words=true&per_page=50`
    + `&word_fields=line_number,${codeField}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Mushaf dizimi alınamadı (HTTP ${res.status})`)
  const data = await res.json()

  const rows = new Map()
  const used = new Map()          // sure → o surenin sayfadaki ilk satırı
  used.lines = new Set()
  for (const v of data.verses ?? []) {
    const [surah, verse] = v.verse_key.split(':').map(Number)
    for (const w of v.words ?? []) {
      const n = w.line_number
      if (!n) continue
      used.lines.add(n)
      if (!used.has(surah) || n < used.get(surah)) used.set(surah, n)
      if (!rows.has(n)) rows.set(n, [])
      rows.get(n).push({ g: w[codeField] ?? '', e: w.char_type_name === 'end' ? 1 : 0, s: surah, v: verse })
    }
  }

  const marks = headerLines(page, used)
  const lines = []
  for (let n = 1; n <= LINES_PER_PAGE; n++) {
    if (marks[n]) lines.push({ n, ...marks[n] })
    else if (rows.has(n)) lines.push({ n, kind: 'text', words: rows.get(n) })
    // Ne kelime ne başlık: sayfa 15 satırdan kısa (son sayfalar). Satır
    // hiç basılmaz, boş bir kutu bırakmak sayfayı yanlış gösterirdi.
  }
  return lines
}

/** Sayfanın satırları — önbellekten ya da ağdan. */
export async function pageLines(page, scriptId) {
  const { code } = scriptById(scriptId)
  const key = `${code}-${page}`
  const cache = readCache()
  if (cache[key]) return cache[key]
  const lines = await fetchLines(page, code)
  cache[key] = lines
  writeCache(cache)
  return lines
}
