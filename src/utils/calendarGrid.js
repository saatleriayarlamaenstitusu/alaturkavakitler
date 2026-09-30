import { DateTime } from 'luxon'
import { toHijri, fromHijri, hijriMonthLength, HIJRI_MONTHS } from './hijri'

export { HIJRI_MONTHS }

export const GREGORIAN_MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
]

// Pazartesi ilk gün (TR alışkanlığı).
export const WEEKDAYS_SHORT = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']
export const WEEKDAYS_NARROW = ['P', 'S', 'Ç', 'P', 'C', 'C', 'P']

const mondayIndex = (jsDate) => (jsDate.getDay() + 6) % 7

// ── Hicri ──────────────────────────────────────────────────────
// Dönüşüm `utils/hijri.js`teki Diyanet tablosundan gelir.
const hijriMonthStart = (year, month) => fromHijri(year, month, 1)
const hijriDaysInMonth = (year, month) => hijriMonthLength(year, month)

/**
 * Bir ayın ızgarası. `system` birincil takvimi belirler: hücrelerdeki asıl
 * gün numarası ondan gelir, `alt` ise diğer takvimdeki karşılığıdır.
 * @returns {{ title, monthName, year, cells, todayKey }}
 *   cells: [{ day, alt, iso, weekday, today }] — ay öncesi boşluklar null
 */
export function monthGrid(system, year, month) {
  const hijri = system === 'hicri'
  const start = hijri
    ? hijriMonthStart(year, month)
    : DateTime.fromObject({ year, month, day: 1 }).toJSDate()

  const days = hijri
    ? hijriDaysInMonth(year, month)
    : DateTime.fromObject({ year, month }).daysInMonth

  const offset = mondayIndex(start)
  const todayISO = DateTime.now().toISODate()
  const startDT = DateTime.fromJSDate(start)

  const cells = Array.from({ length: offset }, () => null)
  for (let i = 0; i < days; i++) {
    const dt = startDT.plus({ days: i })
    const js = dt.toJSDate()
    const h = toHijri(js)
    cells.push({
      day: hijri ? i + 1 : dt.day,
      alt: hijri ? dt.day : h.day,
      iso: dt.toISODate(),
      today: dt.toISODate() === todayISO,
    })
  }

  const monthName = hijri ? HIJRI_MONTHS[month - 1] : GREGORIAN_MONTHS[month - 1]
  return { title: `${monthName} ${year}`, monthName, year, cells }
}

// Ay ileri/geri — yıl sınırını kendisi çevirir.
export function shiftMonth(year, month, delta) {
  let m = month + delta
  let y = year
  while (m > 12) { m -= 12; y += 1 }
  while (m < 1) { m += 12; y -= 1 }
  return { year: y, month: m }
}

export function currentMonthOf(system) {
  if (system === 'hicri') {
    const h = toHijri(new Date())
    return { year: h.year, month: h.month }
  }
  const now = DateTime.now()
  return { year: now.year, month: now.month }
}

// Görüntülenen ayı diğer takvime çevirir: ayın 1'ine karşılık gelen günün
// hedef takvimdeki ay/yılı. Takvim türü değiştirilince kullanılır.
export function convertMonth(fromSystem, toSystem, year, month) {
  if (fromSystem === toSystem) return { year, month }
  const start = fromSystem === 'hicri'
    ? hijriMonthStart(year, month)
    : DateTime.fromObject({ year, month, day: 1 }).toJSDate()

  if (toSystem === 'hicri') {
    const h = toHijri(start)
    return { year: h.year, month: h.month }
  }
  const dt = DateTime.fromJSDate(start)
  return { year: dt.year, month: dt.month }
}

export function monthOptions(system) {
  const names = system === 'hicri' ? HIJRI_MONTHS : GREGORIAN_MONTHS
  return names.map((label, i) => ({ value: i + 1, label }))
}
