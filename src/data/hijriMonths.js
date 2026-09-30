// Hicri ay başlangıçları — her satır, o hicri ayın 1'ine denk gelen miladi gün.
//
// NEDEN TABLO: `hijri-date` gibi aritmetik (tabular) kütüphaneler sabit bir
// kural uygular; Diyanet ise hesabî takvim kullanır. İkisi birbirinden kayar —
// ölçüldü: 2026'nın on iki ay başlangıcından dokuzu tutmuyordu, Ramazan'da
// sapma iki güne çıkıyordu. Sabit bir düzeltme katsayısı bu yüzden çözmez.
//
// KAYNAK: 'Diyanet' işaretli satırlar doğrudan Diyanet'in yayımladığı dinî
// günler listesinden alındı (vakithesaplama.diyanet.gov.tr). Diyanet ileri
// yılları yayımlamadığı için gerisi Umm al-Qura takviminden üretildi; Diyanet'in
// yayımladığı 49 başlangıcın 44'ü Umm al-Qura ile birebir aynı çıktı, farklı
// olan 5'i Diyanet değeriyle değiştirildi. Yani ileri yıllar bir gün şaşabilir.
//
// GÜNCELLEME: Diyanet yeni yılı yayımlayınca o yılın satırlarını buradan
// doğrula ve farklıysa değiştir, sonuna 'Diyanet' notu bırak. Satırlar
// ARDIŞIK olmalı ve iki satır arası 29 ya da 30 gün etmeli — `hijri.js`
// bunu geliştirme modunda kontrol ediyor.
//
// KAPSAM: 2022-07-30 (1444/1) – 2036-05-27 (1458/4).
// Dışına çıkılırsa ortalama ay uzunluğuyla tahmin yürütülür (bkz. hijri.js).

// Listenin ilk satırının hangi hicri aya karşılık geldiği.
export const FIRST_MONTH = { year: 1444, month: 1 }

export const MONTH_STARTS = [
  // 1444
  '2022-07-30',
  '2022-08-28',
  '2022-09-27',
  '2022-10-26',
  '2022-11-25',
  '2022-12-25',
  '2023-01-23', // Diyanet
  '2023-02-21', // Diyanet
  '2023-03-23', // Diyanet
  '2023-04-21', // Diyanet
  '2023-05-21', // Diyanet
  '2023-06-19', // Diyanet

  // 1445
  '2023-07-19', // Diyanet
  '2023-08-17', // Diyanet
  '2023-09-16', // Diyanet
  '2023-10-16', // Diyanet
  '2023-11-14', // Diyanet
  '2023-12-14', // Diyanet
  '2024-01-12', // Diyanet
  '2024-02-11', // Diyanet
  '2024-03-11', // Diyanet
  '2024-04-10', // Diyanet
  '2024-05-09', // Diyanet
  '2024-06-07', // Diyanet

  // 1446
  '2024-07-07', // Diyanet
  '2024-08-05', // Diyanet
  '2024-09-04', // Diyanet
  '2024-10-04', // Diyanet
  '2024-11-03', // Diyanet
  '2024-12-02', // Diyanet
  '2025-01-01', // Diyanet
  '2025-01-31', // Diyanet
  '2025-03-01', // Diyanet
  '2025-03-30', // Diyanet
  '2025-04-29', // Diyanet
  '2025-05-28', // Diyanet

  // 1447
  '2025-06-26', // Diyanet
  '2025-07-26', // Diyanet
  '2025-08-24', // Diyanet
  '2025-09-23', // Diyanet
  '2025-10-23', // Diyanet
  '2025-11-21', // Diyanet
  '2025-12-21', // Diyanet
  '2026-01-20', // Diyanet
  '2026-02-19', // Diyanet
  '2026-03-20', // Diyanet
  '2026-04-18', // Diyanet
  '2026-05-18', // Diyanet

  // 1448
  '2026-06-16', // Diyanet
  '2026-07-15', // Diyanet
  '2026-08-14', // Diyanet
  '2026-09-12', // Diyanet
  '2026-10-12', // Diyanet
  '2026-11-10', // Diyanet
  '2026-12-10', // Diyanet
  '2027-01-09',
  '2027-02-08',
  '2027-03-09',
  '2027-04-08',
  '2027-05-07',

  // 1449
  '2027-06-06',
  '2027-07-05',
  '2027-08-03',
  '2027-09-02',
  '2027-10-01',
  '2027-10-31',
  '2027-11-29',
  '2027-12-29',
  '2028-01-28',
  '2028-02-26',
  '2028-03-27',
  '2028-04-26',

  // 1450
  '2028-05-25',
  '2028-06-24',
  '2028-07-23',
  '2028-08-22',
  '2028-09-20',
  '2028-10-19',
  '2028-11-18',
  '2028-12-17',
  '2029-01-16',
  '2029-02-14',
  '2029-03-16',
  '2029-04-15',

  // 1451
  '2029-05-14',
  '2029-06-13',
  '2029-07-13',
  '2029-08-11',
  '2029-09-10',
  '2029-10-09',
  '2029-11-07',
  '2029-12-07',
  '2030-01-05',
  '2030-02-04',
  '2030-03-05',
  '2030-04-04',

  // 1452
  '2030-05-03',
  '2030-06-02',
  '2030-07-02',
  '2030-08-01',
  '2030-08-30',
  '2030-09-29',
  '2030-10-28',
  '2030-11-26',
  '2030-12-26',
  '2031-01-24',
  '2031-02-23',
  '2031-03-24',

  // 1453
  '2031-04-23',
  '2031-05-22',
  '2031-06-21',
  '2031-07-21',
  '2031-08-20',
  '2031-09-18',
  '2031-10-17',
  '2031-11-16',
  '2031-12-15',
  '2032-01-14',
  '2032-02-12',
  '2032-03-13',

  // 1454
  '2032-04-11',
  '2032-05-10',
  '2032-06-09',
  '2032-07-09',
  '2032-08-08',
  '2032-09-06',
  '2032-10-06',
  '2032-11-04',
  '2032-12-04',
  '2033-01-02',
  '2033-02-01',
  '2033-03-02',

  // 1455
  '2033-04-01',
  '2033-04-30',
  '2033-05-29',
  '2033-06-28',
  '2033-07-28',
  '2033-08-26',
  '2033-09-25',
  '2033-10-24',
  '2033-11-23',
  '2033-12-23',
  '2034-01-21',
  '2034-02-20',

  // 1456
  '2034-03-21',
  '2034-04-20',
  '2034-05-19',
  '2034-06-17',
  '2034-07-17',
  '2034-08-15',
  '2034-09-14',
  '2034-10-13',
  '2034-11-12',
  '2034-12-12',
  '2035-01-11',
  '2035-02-09',

  // 1457
  '2035-03-11',
  '2035-04-09',
  '2035-05-09',
  '2035-06-07',
  '2035-07-06',
  '2035-08-05',
  '2035-09-03',
  '2035-10-02',
  '2035-11-01',
  '2035-12-01',
  '2035-12-30',
  '2036-01-29',

  // 1458
  '2036-02-28',
  '2036-03-29',
  '2036-04-27',
  '2036-05-27',
]

export const HIJRI_MONTHS = [
  'Muharrem', 'Safer', 'Rebiülevvel', 'Rebiülahir',
  'Cemaziyelevvel', 'Cemaziyelahir', 'Recep', 'Şaban',
  'Ramazan', 'Şevval', 'Zilkade', 'Zilhicce',
]
