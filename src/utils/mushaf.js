import { MUSHAF_PAGES, JUZ_PAGES, PAGE_COUNT } from '@/data/mushafPages'
import { SURAHS } from '@/data/kuranMeta'

/**
 * Mushaf sayfası ↔ ayet dönüşümleri.
 *
 * Sayfa numaraları BASILI numaradır (1–604). Açık Kuran'ın `page` alanı
 * sıfırdan başlıyor; çeviri `scripts/export-mushaf-pages.js` içinde bir
 * kez yapılıp dizine öyle yazılıyor, burada bir daha kaydırma yoktur.
 */

const SURAH_BY_ID = new Map(SURAHS.map((s) => [s.id, s]))

export { PAGE_COUNT }

export const clampPage = (n) => Math.min(PAGE_COUNT, Math.max(1, Math.round(Number(n) || 1)))

/**
 * Bir sayfadaki ayetler.
 *
 * Dizin her sayfayı üç sayı ile tutuyor: ilk ayetin suresi, ilk ayetin
 * numarası ve kaç ayet olduğu. Sayfadaki ayetler ardışık olduğu için
 * gerisi sayılabiliyor — sure bitince bir sonrakinin 1. ayetinden devam
 * eder (son sayfalarda bir sayfaya üç sure birden düşebiliyor).
 *
 * @returns {Array<{surah:number, surahName:string, verse:number, first:boolean}>}
 *   `first`: surenin ilk ayeti mi (sayfada sure başlığı buna göre çizilir)
 */
export function versesOfPage(page) {
  const row = MUSHAF_PAGES[clampPage(page) - 1]
  if (!row) return []
  let [surah, verse] = row
  const count = row[2]
  const out = []
  for (let i = 0; i < count; i++) {
    const meta = SURAH_BY_ID.get(surah)
    if (!meta) break
    out.push({ surah, surahName: meta.name, verse, first: verse === 1 })
    verse++
    if (verse > meta.verses) { surah++; verse = 1 }
  }
  return out
}

/** Sayfadaki ayetleri sure sure gruplar — istekler sure başına yapılıyor. */
export function rangesOfPage(page) {
  const groups = []
  for (const v of versesOfPage(page)) {
    const last = groups[groups.length - 1]
    if (last && last.surah === v.surah) last.to = v.verse
    else groups.push({ surah: v.surah, surahName: v.surahName, from: v.verse, to: v.verse })
  }
  return groups
}

/** Sayfanın hangi cüzde olduğu (1–30). */
export function juzOfPage(page) {
  const p = clampPage(page)
  let juz = 1
  for (let i = 0; i < JUZ_PAGES.length; i++) if (p >= JUZ_PAGES[i]) juz = i + 1
  return juz
}

export const pageOfJuz = (juz) => JUZ_PAGES[Math.min(30, Math.max(1, juz)) - 1] ?? 1

/** Sayfanın başladığı sure (başlıkta gösterilir). */
export function surahOfPage(page) {
  const first = versesOfPage(page)[0]
  return first ? { id: first.surah, name: first.surahName } : null
}

/**
 * Bir ayetin bulunduğu sayfa.
 *
 * Dizin sayfa → ilk ayet olduğu için arama sayfa sırasında ikili yapılır:
 * aradığımız ayetten önce başlayan SON sayfa, o ayetin sayfasıdır.
 * Ayetler mushaf boyunca artan sırada olduğu için bu güvenli.
 */
export function pageOfVerse(surah, verse) {
  const key = (s, v) => s * 1000 + v
  const target = key(Number(surah), Number(verse) || 1)
  let lo = 0
  let hi = MUSHAF_PAGES.length - 1
  let found = 0
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    const [s, v] = MUSHAF_PAGES[mid]
    if (key(s, v) <= target) { found = mid; lo = mid + 1 }
    else hi = mid - 1
  }
  return found + 1
}

/** Bir surenin başladığı sayfa. */
export function pageOfSurah(surahId) {
  const i = MUSHAF_PAGES.findIndex(([s, v]) => s === surahId && v === 1)
  if (i >= 0) return i + 1
  // Sure bir sayfanın ortasında başlıyorsa dizinde ilk satır olarak
  // görünmez; o sayfayı ayet ayet arayarak bul.
  for (let p = 1; p <= PAGE_COUNT; p++)
    if (versesOfPage(p).some((v) => v.surah === surahId && v.verse === 1)) return p
  return 1
}
