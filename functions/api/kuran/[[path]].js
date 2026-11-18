/**
 * Açık Kuran API vekili — Cloudflare Pages Function.
 *
 * İki işi var ve ikisi de tarayıcıda yapılamaz.
 *
 * 1. ANAHTARI SAKLAMAK. API Bearer token istiyor ve belgeleri "anahtarı
 *    sunucunda tut, tarayıcıya gömme" diyor. Anahtar burada Cloudflare
 *    ortam değişkeninden okunur; istemciye giden hiçbir yanıtta görünmez.
 *    Değişkenin adı VITE_ ile BAŞLAMAMALI — öyle olsaydı Vite onu derleme
 *    anında paketin içine yazardı.
 *
 * 2. RATE LİMİTİ ÖLDÜRMEK. API dakikada 60, günde 10.000 istek veriyor ve
 *    bu bütçe sitenin TÜM ziyaretçileri arasında paylaşılıyor. Çözüm veriyi
 *    kalıcı saklamak: metin değişmiyor, bir kez çekilen bir daha çekilmez.
 *
 * ── Üç katman, en ucuzdan pahalıya ──
 *
 *   edge cache  Hızlı ama GÜVENİLMEZ: Cloudflare'in Cache API'si veri
 *               merkezi başına çalışır, dışarı kopyalanmaz ve az istenen
 *               içerik LRU ile düşer. Tek başına kalkan değildir.
 *   KV          Kalıcı katman ve asıl kalkan. Küresel, süresiz, ücretsiz
 *               planda 1 GB. Bağlanmamışsa kod çalışmaya devam eder,
 *               yalnızca korumasız kalır — bu yüzden her erişim korumalı.
 *   API         Yalnızca ikisi de ıskalarsa.
 *
 * Çağrı birimi SURE'dir, ayet değil. Bir sure tek istekle geliyor; ayet ayet
 * çekilseydi Bakara için 286 istek gerekirdi ve dakikalık sınır beşinci
 * ayette dolardı. Böylece üst sınır (sure × meal) = 114 × 9 = 1026 isteğe
 * iner; sitenin ömrü boyunca, günlük bütçenin onda biri.
 *
 * İstemciye yine de tek ayet döner: sure yükü Bakara'da 71 KB (gzip), onu
 * her ayet değişiminde indirtmenin anlamı yok. Sure yükü burada kalır.
 *
 * Yollar:
 *   /api/kuran/verse/{sure}/{ayet}?authors=11,32        tek ayet
 *   /api/kuran/range/{sure}/{ilk}/{son}?authors=11,32   ayet aralığı
 *   /api/kuran/surah/{sure}?author=11                   tüm sure (ısıtma)
 */

const API = 'https://api.acikkuran.com/v1'

// Arayüzün sunduğu mealler. Beyaz liste, çünkü `author` doğrudan yukarı
// aktarılıyor: süzülmeseydi bu uç nokta herkesin kendi sorgusunu
// geçirebildiği açık bir vekil olurdu.
const AUTHORS = new Set([11, 14, 15, 19, 21, 22, 2, 16, 109])

// Metin değişmiyor; tarayıcıya da uzun ömür veriyoruz.
const BROWSER_TTL = 60 * 60 * 24 * 30      // 30 gün
const EDGE_TTL = 60 * 60 * 24 * 365        // 1 yıl
/** Bir istekte alınabilecek en fazla ayet. */
const MAX_RANGE = 20
// KV'de süre sınırı yok. `expirationTtl` verilmiyor: metin değişmediği için
// kaydın kendiliğinden düşmesi yalnızca gereksiz bir API isteği demek olurdu.
// Tüm Kuran dokuz mealle 16.6 MB tutuyor — ücretsiz plandaki 1 GB'ın %2'si.

const json = (data, { status = 200, cache = false } = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': cache
        ? `public, max-age=${BROWSER_TTL}, s-maxage=${EDGE_TTL}, immutable`
        : 'no-store',
    },
  })

const fail = (code, message, status = 400, extra = {}) =>
  json({ error: { code, message, ...extra } }, { status })

/**
 * Bir surenin Arapça metnini ve bir mealini getirir.
 *
 * ── Neden iki ayrı kayıt ──
 * Arapça metin ve okunuş mealden BAĞIMSIZ: hangi mütercim seçilirse
 * seçilsin aynı. İlk tasarım ikisini mealin yanına paketliyordu ve dokuz
 * meal için dokuz kez saklıyordu — ölçüldü: tüm Kuran 50.8 MB. Ayrılınca
 * 16.6 MB. Yukarı akışa giden istek sayısı değişmiyor, çünkü API zaten
 * ikisini tek yanıtta veriyor; yalnızca depolama üçte bire iniyor.
 *
 * `transcription_en` (İngilizce okunuş) hiç saklanmıyor: arayüzde onu
 * gösteren bir alan yok ve Bakara'da tek başına 47 KB tutuyordu.
 */
async function kvGet(env, key) {
  if (!env.KURAN_KV) return null
  try {
    return await env.KURAN_KV.get(key, 'json')
  } catch {
    // KV okunamadı; API'ye düşmek yeterli, hataya çevirmenin anlamı yok.
    return null
  }
}

async function fetchUpstream(env, surahId, authorId) {
  const res = await fetch(`${API}/surahs/${surahId}?author=${authorId}`, {
    headers: { Authorization: `Bearer ${env.ACIKKURAN_KEY}` },
    cf: { cacheTtl: EDGE_TTL, cacheEverything: true },
  })

  if (res.status === 429) {
    const retry = res.headers.get('retry-after') ?? '60'
    throw Object.assign(new Error('rate_limited'), { status: 429, retry })
  }
  if (!res.ok) throw Object.assign(new Error(`upstream_${res.status}`), { status: 502 })

  const body = await res.json()
  if (body.error) throw Object.assign(new Error(body.error.code), { status: 404 })
  return body.data
}

/**
 * @returns {Promise<{base:{surah:object, ar:string[], tx:string[]}, tr:string[]}>}
 */
async function loadParts(env, surahId, authorId, waitUntil) {
  const arKey = `ar:${surahId}:v2`
  const trKey = `tr:${surahId}:${authorId}:v2`

  let base = await kvGet(env, arKey)
  let tr = await kvGet(env, trKey)
  if (base && tr) return { base, tr }

  // Tek yukarı istek ikisini birden dolduruyor; biri elimizdeyse bile
  // ayrıca bir istek atmaya gerek yok.
  const d = await fetchUpstream(env, surahId, authorId)

  if (!base) {
    base = {
      surah: {
        id: d.id,
        name: d.name,
        nameEn: d.name_en,
        nameOriginal: d.name_original,
        verses: d.verse_count,
      },
      ar: d.verses.map((v) => v.verse),
      tx: d.verses.map((v) => v.transcription ?? ''),
    }
    if (env.KURAN_KV)
      waitUntil(env.KURAN_KV.put(arKey, JSON.stringify(base)).catch(() => {}))
  }

  if (!tr) {
    tr = d.verses.map((v) => v.translation?.text ?? '')
    if (env.KURAN_KV)
      waitUntil(env.KURAN_KV.put(trKey, JSON.stringify(tr)).catch(() => {}))
  }

  return { base, tr }
}

export async function onRequestGet(context) {
  const { request, env, params, waitUntil } = context

  if (!env.ACIKKURAN_KEY)
    return fail('not_configured', 'ACIKKURAN_KEY tanımlı değil', 500)

  const url = new URL(request.url)
  const segments = Array.isArray(params.path) ? params.path : [params.path].filter(Boolean)

  // Edge cache önce: KV'ye kadar gitmeye bile gerek kalmasın.
  const cache = caches.default
  const cached = await cache.match(request)
  if (cached) return cached

  const authorList = (url.searchParams.get('authors') ?? url.searchParams.get('author') ?? '11')
    .split(',')
    .map((n) => Number(n.trim()))
    .filter((n) => AUTHORS.has(n))
  if (!authorList.length) return fail('invalid_author', 'Geçersiz meal seçimi')

  const surahId = Number(segments[1])
  if (!Number.isInteger(surahId) || surahId < 1 || surahId > 114)
    return fail('surah_not_found', 'Sure 1–114 aralığında olmalı', 404)

  let response
  try {
    if (segments[0] === 'verse') {
      const verseNo = Number(segments[2])
      if (!Number.isInteger(verseNo) || verseNo < 1)
        return fail('verse_not_found', 'Geçersiz ayet numarası', 404)

      const loaded = await Promise.all(
        authorList.map((a) => loadParts(env, surahId, a, waitUntil)))
      const { base } = loaded[0]
      if (verseNo > base.surah.verses)
        return fail('verse_not_found', `Bu surede ${base.surah.verses} ayet var`, 404)

      const i = verseNo - 1
      response = json({
        surah: base.surah,
        verse: verseNo,
        ar: base.ar[i],
        tx: base.tx[i],
        translations: Object.fromEntries(
          loaded.map(({ tr }, n) => [authorList[n], tr[i]])),
      }, { cache: true })
    } else if (segments[0] === 'range') {
      const from = Number(segments[2])
      const to = Number(segments[3])
      if (!Number.isInteger(from) || !Number.isInteger(to) || from < 1 || to < from)
        return fail('invalid_range', 'Geçersiz ayet aralığı', 400)
      // Üst sınır paylaşım görseli için: bir tuvale sığmayacak uzunlukta
      // bir aralık, boşuna taşınan yüz kilobayt demek.
      if (to - from + 1 > MAX_RANGE)
        return fail('range_too_long', `En çok ${MAX_RANGE} ayet alınabilir`, 400)

      const loaded = await Promise.all(
        authorList.map((a) => loadParts(env, surahId, a, waitUntil)))
      const { base } = loaded[0]
      if (to > base.surah.verses)
        return fail('verse_not_found', `Bu surede ${base.surah.verses} ayet var`, 404)

      const slice = (arr) => arr.slice(from - 1, to)
      response = json({
        surah: base.surah,
        from,
        to,
        ar: slice(base.ar),
        tx: slice(base.tx),
        translations: Object.fromEntries(
          loaded.map(({ tr }, n) => [authorList[n], slice(tr)])),
      }, { cache: true })
    } else if (segments[0] === 'surah') {
      const { base, tr } = await loadParts(env, surahId, authorList[0], waitUntil)
      response = json({ ...base, author: authorList[0], tr }, { cache: true })
    } else {
      return fail('not_found', 'Bilinmeyen uç nokta', 404)
    }
  } catch (e) {
    if (e.status === 429)
      return fail('rate_limited',
        'Açık Kuran API sınırı doldu, biraz sonra tekrar deneyin',
        429, { retryAfter: Number(e.retry) })
    return fail(e.message ?? 'upstream_error', 'Ayet verisi alınamadı', e.status ?? 502)
  }

  waitUntil(cache.put(request, response.clone()))
  return response
}
