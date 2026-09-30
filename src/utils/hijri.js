// Hicri ↔ miladi dönüşüm. Aritmetik bir kütüphane yerine Diyanet'in ay
// başlangıçları tablosuna dayanır — sebebi `src/data/hijriMonths.js`
// başındaki notta.
import { FIRST_MONTH, MONTH_STARTS, HIJRI_MONTHS } from '@/data/hijriMonths'

export { HIJRI_MONTHS }

const MS_DAY = 86400000
// Tablo dışına çıkıldığında kullanılan ortalama kameri ay (sinodik ay).
const MEAN_MONTH = 29.530588

// Yerel gün başlangıcı: saat dilimi kaymalarının dönüşümü bir gün
// oynatmaması için karşılaştırmalar gün tabanında yapılır.
const dayStart = (d) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())
const isoToUTC = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

const STARTS = MONTH_STARTS.map(isoToUTC)

// Tablodaki satır sırası → hicri yıl/ay
const indexToYM = (i) => {
  const n = FIRST_MONTH.month - 1 + i
  return { year: FIRST_MONTH.year + Math.floor(n / 12), month: (n % 12) + 1 }
}
const ymToIndex = (year, month) =>
  (year - FIRST_MONTH.year) * 12 + (month - FIRST_MONTH.month)

/** Tarih tablonun kapsadığı aralıkta mı? Dışındaysa sonuç tahminidir. */
export function inTable(date = new Date()) {
  const t = dayStart(date)
  return t >= STARTS[0] && t < STARTS[STARTS.length - 1]
}

/**
 * Miladi → hicri.
 * @returns {{ year, month, day, monthName, exact }} exact=false ise değer
 *   tablo dışı kaldığı için ortalama ay uzunluğundan tahmin edilmiştir.
 */
export function toHijri(date = new Date()) {
  const t = dayStart(date)

  if (t < STARTS[0] || t >= STARTS[STARTS.length - 1]) {
    // Tablo dışı: en yakın uca tutunup ortalama ay uzunluğuyla yürü.
    const edge = t < STARTS[0] ? 0 : STARTS.length - 1
    const months = Math.floor((t - STARTS[edge]) / MS_DAY / MEAN_MONTH)
    const { year, month } = indexToYM(edge + months)
    const approxStart = STARTS[edge] + Math.round(months * MEAN_MONTH) * MS_DAY
    const day = Math.floor((t - approxStart) / MS_DAY) + 1
    return { year, month, day, monthName: HIJRI_MONTHS[month - 1], exact: false }
  }

  // İkili arama: t'yi içine alan ay.
  let lo = 0
  let hi = STARTS.length - 1
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1
    if (STARTS[mid] <= t) lo = mid
    else hi = mid
  }
  const { year, month } = indexToYM(lo)
  return {
    year,
    month,
    day: Math.round((t - STARTS[lo]) / MS_DAY) + 1,
    monthName: HIJRI_MONTHS[month - 1],
    exact: true,
  }
}

/** Hicri → miladi (o hicri günün başladığı miladi gün). */
export function fromHijri(year, month, day = 1) {
  const i = ymToIndex(year, month)
  const base = i >= 0 && i < STARTS.length
    ? STARTS[i]
    : STARTS[0] + Math.round(i * MEAN_MONTH) * MS_DAY
  const utc = base + (day - 1) * MS_DAY
  const d = new Date(utc)
  // UTC gün → yerel aynı takvim günü
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
}

/** Hicri ayın kaç gün çektiği (29 ya da 30). */
export function hijriMonthLength(year, month) {
  const i = ymToIndex(year, month)
  if (i < 0 || i + 1 >= STARTS.length) return 30
  return Math.round((STARTS[i + 1] - STARTS[i]) / MS_DAY)
}

/**
 * Hicri gün akşam ezanıyla başlar. `aksam` verilir ve o saat geçilmişse
 * tarih bir gün ileri alınır — ayarlardaki "akşamla kaydır" bunu kullanır.
 * @param {Date} now
 * @param {Date|null} aksam bugünün akşam ezanı vakti
 */
export function hijriNow(now = new Date(), aksam = null) {
  const shifted = aksam && now >= aksam
    ? new Date(now.getTime() + MS_DAY)
    : now
  return toHijri(shifted)
}

export function nowHijri(format = 'string', now = new Date(), aksam = null) {
  const h = hijriNow(now, aksam)
  const obj = { date: h.day, month: h.month, monthName: h.monthName, year: h.year }
  if (format === 'object') return obj
  return `${obj.date} ${obj.monthName} ${obj.year}`
}

/**
 * Bir günün içinde bulunduğu hicri ayın ızgara bilgisi.
 * startOffset: ayın 1'inin haftadaki konumu (Pazartesi = 0).
 */
export function hijriMonth(baseDate = new Date(), aksam = null) {
  const h = hijriNow(baseDate, aksam)
  const firstGreg = fromHijri(h.year, h.month, 1)
  return {
    year: h.year,
    month: h.month,
    monthName: h.monthName,
    todayDate: h.day,
    daysInMonth: hijriMonthLength(h.year, h.month),
    startOffset: (firstGreg.getDay() + 6) % 7,
    firstGregorian: firstGreg,
  }
}

// Tablo bütünlüğü: ardışık ay başlangıçları 29 ya da 30 gün aralıklı olmalı.
// Elle satır düzenlerken bir kayma olursa geliştirmede hemen belli olsun.
if (import.meta.env?.DEV) {
  for (let i = 1; i < STARTS.length; i++) {
    const n = Math.round((STARTS[i] - STARTS[i - 1]) / MS_DAY)
    if (n !== 29 && n !== 30) {
      console.error(`hijriMonths: ${MONTH_STARTS[i - 1]} → ${MONTH_STARTS[i]} ${n} gün`)
    }
  }
}
