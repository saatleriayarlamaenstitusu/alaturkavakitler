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
