import 'hijri-date'

const HIJRI_MONTHS = [
  'Muharrem', 'Safer', 'Rebiülevvel', 'Rebiülahir',
  'Cemaziyelevvel', 'Cemaziyelahir', 'Recep', 'Şaban',
  'Ramazan', 'Şevval', 'Zilkade', 'Zilhicce',
]

export function nowHijri(format = 'string') {
  const hDate = new Date().toHijri()
  const obj = {
    date: hDate._date,
    month: hDate._month,
    monthName: HIJRI_MONTHS[hDate._month - 1],
    year: hDate._year,
  }

  if (format === 'object') return obj
  return `${obj.date} ${obj.monthName} ${obj.year}`
}

// Bugünün içinde bulunduğu hicri ayın grid bilgisini döndürür.
// startOffset: ayın 1'inin haftadaki konumu (Pazartesi = 0).
export function hijriMonth(baseDate = new Date()) {
  const today = baseDate.toHijri()
  const todayDate = today._date
  const month = today._month
  const year = today._year

  // Ayın 1'ine denk gelen miladi gün
  const firstGreg = new Date(baseDate)
  firstGreg.setDate(firstGreg.getDate() - (todayDate - 1))

  // Pazartesi = 0 olacak şekilde haftanın günü
  const startOffset = (firstGreg.getDay() + 6) % 7

  // Ay 29 mu 30 mu: 30. güne denk gelen miladi tarih hâlâ bu ayda mı?
  const probe = new Date(firstGreg)
  probe.setDate(probe.getDate() + 29)
  const probeHijri = probe.toHijri()
  const daysInMonth = probeHijri._month === month && probeHijri._date === 30 ? 30 : 29

  return {
    year,
    month,
    monthName: HIJRI_MONTHS[month - 1],
    todayDate,
    daysInMonth,
    startOffset,
    firstGregorian: firstGreg, // ayın 1'ine denk gelen miladi tarih
  }
}
