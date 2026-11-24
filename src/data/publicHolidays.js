// Türkiye'nin sabit miladi genel tatilleri (2429 sayılı Kanun, madde 1–2).
// Hicri gün akşam ezanıyla değişse de bu tarihler miladi güne bağlıdır.
const holidays = {
  '01-01': 'Yılbaşı',
  '04-23': 'Ulusal Egemenlik ve Çocuk Bayramı',
  '05-01': 'Emek ve Dayanışma Günü',
  '05-19': "Atatürk'ü Anma, Gençlik ve Spor Bayramı",
  '07-15': 'Demokrasi ve Millî Birlik Günü',
  '08-30': 'Zafer Bayramı',
  '10-28': 'Cumhuriyet Bayramı (saat 13.00’ten sonra)',
  '10-29': 'Cumhuriyet Bayramı',
}

export function publicHolidayOn(month, day) {
  const key = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  return holidays[key] ?? null
}
