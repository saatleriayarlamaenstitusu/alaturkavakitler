/**
 * Kıraat zaman damgaları.
 *
 * Ses SURE başına tek dosyadır; "şu an hangi ayetteyiz" sorusunun
 * cevabı dosyanın içinde yazmaz, damga verisinde durur. Veri QUL'dan
 * indirilip `scripts/import-qul-recitation.js` ile çevriliyor
 * (`src/data/recitation/<kari>/ayah.json`).
 *
 * Biçim: `{ "112": [[başMs, bitişMs], …] }` — dizideki sıra ayet
 * numarasıdır (0 → 1. ayet). Zamanlar SURENİN dosyasına görelidir.
 *
 * Damgası olmayan kârîde ses yine çalar, vurgu yapılmaz: eksik veriyi
 * tahminle doldurmak (ayet süresini eşit bölmek gibi) okuyanı yanlış
 * yere baktırır, hiç vurgulamamaktan kötüdür.
 */

const files = import.meta.glob('../data/recitation/*/ayah.json')
const cache = new Map()

const keyOf = (id) => `../data/recitation/${id}/ayah.json`

/** O kârînin damgası var mı (ağa çıkmadan). */
export const hasTimings = (id) => Boolean(files[keyOf(id)])

/** Damga tablosu; yoksa `null`. */
export async function loadTimings(id) {
  const loader = files[keyOf(id)]
  if (!loader) return null
  if (!cache.has(id)) cache.set(id, loader().then((m) => m.default ?? m).catch(() => null))
  return cache.get(id)
}

/**
 * Verilen ana denk gelen ayet.
 *
 * İkili arama: bir surede 286 ayete kadar çıkılıyor ve bu her
 * `timeupdate` olayında (saniyede ~4 kez) çağrılıyor.
 *
 * Ayetler arasındaki boşluğa (nefes payı) düşen an ÖNCEKİ ayete
 * sayılır: vurgunun bir an sönüp yanması, okunan yerin kaybolması
 * demek.
 */
export function verseAt(table, surah, ms) {
  const list = table?.[surah]
  if (!list?.length) return null
  if (ms < list[0][0]) return 1
  let lo = 0
  let hi = list.length - 1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    if (ms < list[mid][0]) hi = mid - 1
    else lo = mid + 1
  }
  // `hi` artık başlangıcı `ms`den küçük olan son ayet.
  return Math.min(Math.max(hi + 1, 1), list.length)
}

/** Ayetin başlangıcı (saniye) — oraya atlamak için. */
export function startOf(table, surah, verse) {
  const row = table?.[surah]?.[verse - 1]
  return row ? row[0] / 1000 : null
}

/** Surede kaç ayetin damgası var (tutarlılık denetimi için). */
export const countOf = (table, surah) => table?.[surah]?.length ?? 0
