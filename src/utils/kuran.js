// Ayet metnini getiren istemci katmanı.
//
// Zincirin son halkası: tarayıcı → /api/kuran vekili → KV → Açık Kuran API.
// Buradaki iş yalnızca ÜSTTEKİ iki önbellek: aynı ayet ikinci kez
// istendiğinde ağa hiç çıkılmaz.
//
//   bellek içi    sekme açıkken; düzen kurcalanırken aynı ayet onlarca kez
//                 istenebiliyor
//   localStorage  sekmeler ve ziyaretler arası; metin değişmediği için
//                 eskimesi diye bir şey yok
//
// Ayet metni ÇEKİLDİĞİ anda katmanın ayarlarına yazılır, her çizimde
// yeniden istenmez. Sebebi dışa aktarım: tuval DOM'dan rasterize ediliyor
// ve o anda "yükleniyor" yazan bir katman görsele aynen öyle geçer.

const CACHE_KEY = 'kuranVerses'
/** Saklanan ayet sayısı üst sınırı. Bir ayet ~1 KB; düzen de aynı kotayı
 *  paylaşıyor, sınırsız büyümesine izin verilmiyor. */
const MAX_CACHED = 150

const memory = new Map()

function readStore() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function writeStore(store) {
  try {
    const keys = Object.keys(store)
    if (keys.length > MAX_CACHED) {
      // En eskiler düşer. Sıra ekleme sırasıdır; erişim sırasını tutmak
      // için ayrıca zaman damgası yazmak kotadan yiyordu.
      for (const k of keys.slice(0, keys.length - MAX_CACHED)) delete store[k]
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(store))
  } catch {
    // Kota dolu ya da depolama kapalı. Önbellek bir hızlandırma; yokluğu
    // çalışmayı engellemez.
  }
}

const cacheKey = (surah, verse) => `${surah}:${verse}`

/** Bu ayet için istenen meallerin hepsi elimizde mi? */
const complete = (entry, authors) =>
  entry && authors.every((a) => typeof entry.trs?.[a] === 'string')

export class KuranError extends Error {
  constructor(code, message, retryAfter) {
    super(message)
    this.code = code
    this.retryAfter = retryAfter
  }
}

/**
 * Bir ayeti, istenen meallerle birlikte getirir.
 * @param {number} surah 1–114
 * @param {number} verse 1–n
 * @param {number[]} authors mütercim kimlikleri
 * @returns {Promise<{surah:object, verse:number, ar:string, tx:string, trs:Record<number,string>}>}
 */
export async function fetchVerse(surah, verse, authors) {
  const key = cacheKey(surah, verse)
  const wanted = [...new Set(authors)].filter(Boolean)

  const hit = memory.get(key)
  if (complete(hit, wanted)) return hit

  const store = readStore()
  const stored = store[key]
  if (complete(stored, wanted)) {
    memory.set(key, stored)
    return stored
  }

  // Elimizde olmayan mealleri iste. Hepsini yeniden istemek vekile fazladan
  // iş çıkarmaz (sure zaten KV'de) ama taşınan baytı boşuna büyütür.
  const known = { ...(stored?.trs ?? {}), ...(hit?.trs ?? {}) }
  const missing = wanted.filter((a) => typeof known[a] !== 'string')
  const query = (missing.length ? missing : wanted).join(',')

  const res = await fetch(`/api/kuran/verse/${surah}/${verse}?authors=${query}`)
  const body = await res.json().catch(() => ({}))

  if (!res.ok || body.error) {
    const e = body.error ?? {}
    throw new KuranError(
      e.code ?? `http_${res.status}`,
      e.message ?? 'Ayet alınamadı',
      e.retryAfter,
    )
  }

  const entry = {
    surah: body.surah,
    verse: body.verse,
    ar: body.ar,
    tx: body.tx,
    trs: { ...known, ...body.translations },
  }

  memory.set(key, entry)
  store[key] = entry
  writeStore(store)
  return entry
}

/** Kaynak satırı: "Bakara 2:255" ya da "Bakara 2:255-257". */
export const verseRef = (surahName, surah, from, to) =>
  `${surahName} ${surah}:${from}${to && to !== from ? `-${to}` : ''}`

/** Doğu Arap rakamları — ayet numarası Arapça metinde onlarla yazılır. */
const EASTERN = '٠١٢٣٤٥٦٧٨٩'
export const eastern = (n) => String(n).replace(/\d/g, (d) => EASTERN[Number(d)])

/**
 * Bir ayet aralığını DİZİ olarak getirir.
 *
 * Birleştirme burada yapılmaz. Üç yerleşim var — birleşik, her ayet bir
 * satır, her ayet kendi bloğunda — ve üçüncüsü metni birleştirmiyor,
 * yapıyı değiştiriyor: önce birinci ayetin Arapçası ve mealleri, sonra
 * ikincininki. Bu karar seçicide veriliyor, bu yüzden ham diziler oraya
 * olduğu gibi gidiyor.
 */
export async function fetchRange(surah, from, to, authors) {
  const wanted = [...new Set(authors)].filter(Boolean)
  const res = await fetch(
    `/api/kuran/range/${surah}/${from}/${to}?authors=${wanted.join(',')}`)
  const body = await res.json().catch(() => ({}))

  if (!res.ok || body.error) {
    const e = body.error ?? {}
    throw new KuranError(e.code ?? `http_${res.status}`, e.message ?? 'Ayetler alınamadı', e.retryAfter)
  }

  // 200 dönen ama beklenen gövdeyi taşımayan yanıt: vekil yoksa (statik
  // bir sunucuda, tanıtım kartlarını basarken olduğu gibi) `/api/...`
  // isteği index.html'e düşüyor, `res.json()` patlıyor ve gövde boş bir
  // nesneye iniyor. Korumasız bırakılınca çağıran `body.ar.map` diyip
  // TypeError atıyor ve ham JavaScript hatası ekranda görünüyordu
  // ("Cannot read properties of undefined (reading 'map')").
  if (!Array.isArray(body.ar)) {
    throw new KuranError('bozuk_yanit', 'Ayetler alınamadı')
  }

  return {
    surah: body.surah,
    from: body.from,
    to: body.to,
    ar: body.ar,
    tx: body.tx,
    trs: body.translations,
  }
}
