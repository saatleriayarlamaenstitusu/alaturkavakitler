import { JUZ_PAGES } from '@/data/mushafPages'
import { SURAHS } from '@/data/kuranMeta'

const surahOfId = (id) => SURAHS.find((x) => x.id === id)?.name ?? ''

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
/*
 * Etiketler baskı YILIDIR, "Mushaf/Klasik" değil. İlk hâlinde V2'nin
 * adı "Mushaf"tı ve görünüm düğmesindeki "Mushaf" ile yan yana düşüp
 * ikisi karışıyordu (kullanıcı bildirdi). İkisi de Medine (KFGQPC)
 * nesihi; aralarındaki tek gerçek fark baskı yılı.
 */
export const MUSHAF_SCRIPTS = [
  { id: 'v2', label: '1421H', note: 'Medine mushafı, 1421H baskısı', dir: 'hafs/v2', code: 'code_v2' },
  { id: 'v1', label: '1405H', note: 'Medine mushafı, 1405H baskısı', dir: 'hafs/v1', code: 'code_v1' },
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
  // Sayfa fontlarıyla aynı kural: önce ayna, sonra yayıncının CDN'i.
  namesLoading = loadFace(NAME_FAMILY, mirrorFirst('surah-names/v1/sura_names.woff2'))
  namesLoading.catch(() => { namesLoading = null })
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

/**
 * Sayfa fontunun kaynağı: önce BİZİM aynamız, sonra yayıncının CDN'i.
 *
 * Ölçüldü: 604 sayfa V2'de ~75 MB, V1'de ~38 MB eder (ilk sayfalar
 * küçük olduğu için önce 25 MB sanılmıştı). Bu git deposuna konmaz;
 * ayna Cloudflare R2'de durur ve kökü `VITE_MUSHAF_FONT_BASE` ile
 * verilir. Tanımlı değilse doğrudan CDN kullanılır — yani ayna
 * kurulmadan da çalışır.
 *
 * Sıra "ayna önce"dir, seste olduğunun TERSİ: ses dosyası büyüktür ve
 * bant genişliğini yayıncıya bırakmak doğru; font küçüktür, her sayfada
 * gerekir ve kendi kaynağımızdan gelmesi okuma hızını bize bağlar.
 */
const FONT_MIRROR = (import.meta.env?.VITE_MUSHAF_FONT_BASE ?? '').replace(/\/$/, '')

/** Aynadaki ve yayıncıdaki yol AYNIDIR; tek fark kök. */
function mirrorFirst(tail) {
  const urls = []
  if (FONT_MIRROR) urls.push(`${FONT_MIRROR}/${tail}`)
  urls.push(`${CDN}/${tail}`)
  return urls
}

function fontUrls(scriptId, page) {
  return mirrorFirst(`${scriptById(scriptId).dir}/woff2/p${page}.woff2`)
}

async function loadFace(family, urls) {
  let last
  for (const url of urls) {
    try {
      const face = await new FontFace(family, `url(${url})`).load()
      document.fonts.add(face)
      return family
    } catch (e) { last = e }
  }
  throw last ?? new Error('Sayfa yazı tipi yüklenemedi')
}

export function ensurePageFont(scriptId, page) {
  const family = pageFamily(scriptId, page)
  const hit = pageFonts.get(family)
  if (hit) return hit
  const task = loadFace(family, fontUrls(scriptId, page))
  // Başarısız bir deneme önbellekte kalmasın: sayfa yeniden açıldığında
  // bir daha denenebilmeli.
  task.catch(() => pageFonts.delete(family))
  pageFonts.set(family, task)
  return task
}

/**
 * Dizim verisi DEPODA durur, ağdan değil.
 *
 * Önce her sayfa açılışında quran.com'dan çekiliyordu: değişmeyen bir
 * tablo için her seferinde ağa çıkmak, tek bir sağlayıcıya bağlı kalmak
 * ve çevrimdışı okumayı imkânsız kılmak demekti. Veri bir kez indirilip
 * cüz cüz depoya yazıldı (`scripts/export-mushaf-lines.js`,
 * `src/data/mushaf/juz-NN.json`).
 *
 * Cüz başına ~110 kB ham, ~13 kB sıkıştırılmış; yalnızca okunan cüzün
 * dosyası yüklenir ve bir daha istenmez.
 *
 * Her kelime İKİ glif kodunu birden taşır (`a` = V1, `b` = V2): hat
 * okurken değişiyor, ikinci bir indirme gerektirmemeli.
 *
 * API yalnızca YEDEK: depoda olmayan bir cüz (veri güncellenmeden yeni
 * bir sayfa biçimi eklenirse) ya da bir yükleme hatası durumunda.
 */
const juzFiles = import.meta.glob('../data/mushaf/juz-*.json')
const juzCache = new Map()

function juzOf(page) {
  let juz = 1
  for (let i = 0; i < JUZ_PAGES.length; i++) if (page >= JUZ_PAGES[i]) juz = i + 1
  return juz
}

async function localLines(page) {
  const name = `../data/mushaf/juz-${String(juzOf(page)).padStart(2, '0')}.json`
  const loader = juzFiles[name]
  if (!loader) return null
  if (!juzCache.has(name)) juzCache.set(name, loader().then((m) => m.default ?? m))
  const map = await juzCache.get(name)
  return map?.[page] ?? null
}

/**
 * Kullanılmayan satırları başlıklara dağıtır.
 *
 * Bir sure sayfanın ortasında başlıyorsa ilk kelimesinin HEMEN
 * ÜSTÜNDEKİ boş satırlar ona aittir: iki boş satır varsa üsttekine ad,
 * alttakine besmele; bir boş satır varsa yalnızca ad. Tevbe suresi
 * besmelesizdir ve veride de tek boş satır bırakıyor — ayrıca kural
 * yazmak gerekmiyor, sayım kendiliğinden doğru çıkıyor (293 ve 187 ile
 * doğrulandı).
 */
function headerLines(starts, firstLineOf, usedLines) {
  const marks = {}
  for (const surah of starts) {
    const first = firstLineOf.get(surah)
    if (!first) continue
    const free = []
    for (let n = first - 1; n >= 1 && !marks[n]; n--) {
      if (usedLines.has(n)) break
      free.unshift(n)
    }
    if (!free.length) continue
    marks[free[0]] = { kind: 'name', surah, name: surahOfId(surah) }
    if (free.length > 1) marks[free[1]] = { kind: 'basmala', surah }
  }
  return marks
}

/** Yedek yol: aynı biçimi API'den kurar. */
async function remoteLines(page) {
  const url = `${API}/verses/by_page/${page}?words=true&per_page=50`
    + '&word_fields=line_number,code_v1,code_v2'
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Mushaf dizimi alınamadı (HTTP ${res.status})`)
  const data = await res.json()

  const rows = new Map()
  const firstLineOf = new Map()
  const usedLines = new Set()
  const starts = []
  for (const v of data.verses ?? []) {
    const [surah, verse] = v.verse_key.split(':').map(Number)
    if (verse === 1) starts.push(surah)
    for (const w of v.words ?? []) {
      const n = w.line_number
      if (!n) continue
      usedLines.add(n)
      if (!firstLineOf.has(surah) || n < firstLineOf.get(surah)) firstLineOf.set(surah, n)
      if (!rows.has(n)) rows.set(n, [])
      rows.get(n).push({
        a: w.code_v1 ?? '', b: w.code_v2 ?? '',
        e: w.char_type_name === 'end' ? 1 : 0, s: surah, v: verse,
      })
    }
  }

  const marks = headerLines(starts, firstLineOf, usedLines)
  const lines = []
  for (let n = 1; n <= LINES_PER_PAGE; n++) {
    if (marks[n]) lines.push({ n, ...marks[n] })
    else if (rows.has(n)) lines.push({ n, kind: 'text', words: rows.get(n) })
  }
  return lines
}

/**
 * Sayfanın satırları, seçili hattın glifleriyle.
 *
 * Depodaki kayıt hattan bağımsız (iki kod birden); seçim burada yapılır,
 * böylece hat değiştirmek yeni bir yükleme değil yalnızca yeniden çizim.
 */
export async function pageLines(page, scriptId) {
  const key = scriptById(scriptId).code === 'code_v1' ? 'a' : 'b'
  let raw = null
  try {
    raw = await localLines(page)
  } catch { /* yedek yola düş */ }
  if (!raw) raw = await remoteLines(page)
  return raw.map((l) => (l.kind === 'text'
    ? { ...l, words: l.words.map((w) => ({ g: w[key] ?? '', e: w.e, s: w.s, v: w.v })) }
    : l))
}

/**
 * Tecvitli metin (esnek görünüm).
 *
 * Mushaf görünümünde tecvit YOK: oradaki metin glif kodlarından geliyor
 * ve quran.com kelime seviyesinde tecvit etiketi vermiyor (ölçüldü —
 * `text_uthmani_tajweed` kelimede düz metin dönüyor). Ayet seviyesinde
 * ise renk etiketli veriyor, akan metinde kullanılabiliyor.
 */
const TAJWEED_KEY = 'qpcTajweed'
/** Tek ayet tecviti (oynatıcı popup'ı) — ayfa göre ayrı tutulur. */
const TAJWEED_VERSE_KEY = 'qpcTajweedVerse'

/**
 * Tanınan tecvit sınıfları. Listede olmayan sınıf renklenmez.
 *
 * İsimler API'nin GÖNDERDİĞİ yazımla yazıldı: ölçüldü (by_page 255 ve
 * by_key 2:255) `qalaqah` ve `idgham_ghunnah` geliyor. Önce liste
 * `qalqalah` ve `idgham_with_ghunnah` yazıyordu — bu iki kural API'den
 * GELMEDİĞİ için hiç renklenmiyordu (metin çıktı, renksiz). Eski
 * yazımlar da listede bırakıldı: API yazımı değişirse yine tutulsun.
 */
export const TAJWEED_RULES = [
  'ham_wasl', 'madda_normal', 'madda_permissible', 'madda_necessary',
  'madda_obligatory', 'qalaqah', 'ikhafa', 'ikhafa_shafawi',
  'idgham_shafawi', 'idgham_ghunnah', 'idgham_wo_ghunnah',
  'idgham_mimi', 'iqlab', 'ghunnah', 'slnt', 'laam_shamsiyah',
  'qalqalah', 'idgham_with_ghunnah',
]

/**
 * Gelen işaretlemeyi GÜVENLİ hâle getirir.
 *
 * Uzaktan gelen HTML'i olduğu gibi `v-html`e vermek olmaz. Belge
 * ayrıştırılıp yeniden kuruluyor: yalnızca tanınan sınıfa sahip
 * `<tajweed>` öğeleri `<span class="tj tj-…">` olarak geçiyor, geri
 * kalan her şey DÜZ METNE indirgeniyor. Öznitelik taşınmıyor.
 */
export function safeTajweed(html) {
  if (typeof DOMParser === 'undefined') return ''
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html')
  const walk = (node) => {
    let out = ''
    for (const child of node.childNodes) {
      if (child.nodeType === 3) {
        out += child.textContent.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))
        continue
      }
      if (child.nodeType !== 1) continue
      const rule = child.getAttribute?.('class')
      if (child.tagName.toLowerCase() === 'tajweed' && TAJWEED_RULES.includes(rule))
        out += `<span class="tj tj-${rule}">${walk(child)}</span>`
      else if (child.tagName.toLowerCase() === 'span' && rule === 'end')
        continue          // ayet numarasını kendimiz basıyoruz
      else
        out += walk(child)
    }
    return out
  }
  return walk(doc.body.firstChild)
}

/**
 * Tek ayetin tecvitli metni.
 *
 * Sayfa yolu (`verses/by_page`) bütün sayfayı getiriyordu; oynatıcı
 * popup'ında TEK ayet gerekiyor ve o ayet hangi sayfada olduğu belli
 * değil (kıraat sure bazında ilerliyor, sayfa değil). Aynı alanı
 * `verses/by_key` tek ayet için veriyor — ölçüldü: aynı işaretleme
 * biçimi (`<tajweed class=…>`).
 */
export async function verseTajweed(surah, verse) {
  const key = `${surah}:${verse}`
  const cache = (() => {
    try { return JSON.parse(localStorage.getItem(TAJWEED_VERSE_KEY) || '{}') } catch { return {} }
  })()
  if (cache[key]) return cache[key]

  const res = await fetch(`${API}/verses/by_key/${key}?fields=text_uthmani_tajweed`)
  if (!res.ok) throw new Error(`Tecvitli metin alınamadı (HTTP ${res.status})`)
  const data = await res.json()
  const html = safeTajweed(data?.verse?.text_uthmani_tajweed ?? '')

  cache[key] = html
  const keys = Object.keys(cache)
  if (keys.length > 120) for (const k of keys.slice(0, keys.length - 120)) delete cache[k]
  try { localStorage.setItem(TAJWEED_VERSE_KEY, JSON.stringify(cache)) } catch { /* kota */ }
  return html
}

/** Sayfadaki ayetlerin tecvitli metni: `{ '2:255': '<span …>' }`. */
export async function pageTajweed(page) {
  const cache = (() => {
    try { return JSON.parse(localStorage.getItem(TAJWEED_KEY) || '{}') } catch { return {} }
  })()
  if (cache[page]) return cache[page]

  const res = await fetch(
    `${API}/verses/by_page/${page}?fields=text_uthmani_tajweed&per_page=50`)
  if (!res.ok) throw new Error(`Tecvitli metin alınamadı (HTTP ${res.status})`)
  const data = await res.json()
  const map = {}
  for (const v of data.verses ?? []) map[v.verse_key] = safeTajweed(v.text_uthmani_tajweed ?? '')

  cache[page] = map
  const keys = Object.keys(cache)
  if (keys.length > 40) for (const k of keys.slice(0, keys.length - 40)) delete cache[k]
  try { localStorage.setItem(TAJWEED_KEY, JSON.stringify(cache)) } catch { /* kota */ }
  return map
}
