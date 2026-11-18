// Widget ön tanımları — tek dokunuşla tutarlı bir görünüm.
//
// NE TAŞIR: yalnızca BİÇİM. Yazı tipi, kalınlık, harf aralığı, ölçü,
// hizalama, düzen, renk. İçerik alanlarına (metin, tarih, saat, şehir)
// ASLA dokunma — ön tanım bir görünüm seçimidir, kullanıcının girdiği
// değerleri silmemeli.
//
// YENİ ÖN TANIM EKLEMEK
//   1. Aşağıda widget'ın id'sini bul (yoksa yeni bir anahtar aç).
//   2. Listeye bir satır ekle:
//        preset('<id>', '<Görünen ad>', { ...biçim alanları })
//      `id` o widget içinde benzersiz olmalı, `label` şeritte görünür.
//   3. Hangi alanları yazabileceğini `registry.js`teki o widget'ın
//      `defaultProps` çıktısından gör — oradaki anahtarların biçimle
//      ilgili olanları.
//
// DİKKAT
//   • Yazı tipi değiştiriyorsan kalınlığı da ver; panel `nearestWeight`
//     ile o fontta gerçekten bulunan değere çeker ama uyumlu bir çift
//     vermek daha iyi sonuç verir.
//   • Font kimlikleri `src/data/shareFonts.js` içinde (sans / serif /
//     display / script / arabic grupları).
//   • Takvimde tek bir font yoktur: başlık, gün adı ve gün sayısı ayrı
//     `*Font` + `*Weight` + `*Size` taşır, üçünü birlikte ver.
//   • Arapça/Osmanlıca widget'larında harf aralığı YOKTUR (harfler bitişik
//     yazılır), `letterSpacing` verme.
//
// ARAYÜZDEN ÜRETMEK (en kolay yol)
//   Geliştirme sunucusunda (`npm run dev`) katman ayarlarının başlığında
//   "Preset" düğmesi çıkar — kısayolu Ctrl/Cmd + Shift + C. Görünümü
//   arayüzde kurup basınca o katmanın biçim alanları hazır bir `preset(...)`
//   satırı olarak panoya yazılır; buraya yapıştırıp `id` ve adını değiştir.
//   İçerik alanları (metin, tarih, saat, ay/yıl) kopyaya girmez.
//   Düğme üretim derlemesinde hiç yoktur.
//
// Şeritte sıralama buradaki sıradır; en sık kullanılanı başa koy.

const preset = (id, label, props) => ({ id, label, props })

export const WIDGET_PRESETS = {
  'clock-digital': [
    preset('swiss', 'Swiss', { font: 'inter-tight', weight: 800, letterSpacing: -0.02,
      timeSize: 260, labelSize: 28, footSize: 32, align: 'left' }),
    preset('editoryel', 'Editöryel', { font: 'instrument-serif', weight: 400, letterSpacing: 0,
      timeSize: 300, labelSize: 26, footSize: 30, align: 'center' }),
    preset('genis', 'Geniş', { font: 'zalando-expanded', weight: 400, letterSpacing: 0.06,
      timeSize: 190, labelSize: 24, footSize: 28, align: 'center' }),
    preset('mono', 'Mono', { font: 'major-mono', weight: 400, letterSpacing: 0.02,
      timeSize: 170, labelSize: 22, footSize: 26, align: 'center' }),
  ],
  'vakit-now': [
    preset('sade', 'Sade', { font: 'inter-tight', weight: 700, letterSpacing: 0.02, layout: 'stacked' }),
    preset('serif', 'Serif', { font: 'playfair', weight: 500, letterSpacing: 0, layout: 'stacked' }),
    preset('yanyana', 'Yan yana', { font: 'oswald', weight: 500, letterSpacing: 0.08, layout: 'inline' }),
  ],
  'date': [
    preset('kart', 'Kart', { variant: 'card', font: 'inter-tight', weight: 700, letterSpacing: 0 }),
    preset('sade', 'Sade', { variant: 'plain', font: 'lora', weight: 500, letterSpacing: 0.01 }),
    preset('dikey', 'Dikey', { variant: 'vertical', font: 'bebas-neue', weight: 400, letterSpacing: 0.12 }),
  ],
  // Ayet: Arapça ve Latin iki ayrı yazı tipi taşır, ön tanım ikisini
  // birlikte verir — tek başına değiştirilen bir Arapça font, yanındaki
  // meal eski ailesinde kalınca uyumsuz duruyor.
  'ayet': [
    preset('klasik', 'Klasik', {
      font: 'amiri', weight: 400, latinFont: 'lora',
      size: 54, latinScale: 0.34, mealNameScale: 0.6, refScale: 0.6, gap: 18, width: 880,
      align: 'center', latinAlign: 'center', mealNamePos: 'ust',
    }),
    preset('celi', 'Celî', {
      font: 'aref-ruqaa', weight: 700, latinFont: 'cormorant-garamond',
      size: 68, latinScale: 0.28, mealNameScale: 0.65, refScale: 0.65, gap: 24, width: 860,
      align: 'center', latinAlign: 'center', mealNamePos: 'ust',
    }),
    preset('nastalik', 'Nastalik', {
      font: 'noto-nastaliq', weight: 400, latinFont: 'lora',
      // Nastalik eğik ve derin iner; aynı punto diğer yazılardan büyük
      // görünür ve satır arası daha çok yer ister.
      size: 44, latinScale: 0.38, mealNameScale: 0.6, refScale: 0.55, gap: 28, width: 900,
      align: 'center', latinAlign: 'center', mealNamePos: 'ust',
    }),
    preset('kufi', 'Kûfî', {
      font: 'reem-kufi', weight: 500, latinFont: 'inter-tight',
      size: 56, latinScale: 0.3, mealNameScale: 0.55, refScale: 0.6, gap: 20, width: 880,
      align: 'center', latinAlign: 'center', mealNamePos: 'ust',
    }),
    // Arapça sağda, meal solda: iki yazı yönünün kendi doğal kenarına
    // yaslandığı editöryel düzen.
    preset('editoryel', 'Editöryel', {
      font: 'amiri', weight: 400, latinFont: 'lora',
      size: 52, latinScale: 0.36, mealNameScale: 0.5, refScale: 0.5, gap: 22, width: 900,
      align: 'right', latinAlign: 'left', mealNamePos: 'alt',
    }),
    preset('modern', 'Modern', {
      font: 'cairo', weight: 500, latinFont: 'inter-tight',
      size: 46, latinScale: 0.42, mealNameScale: 0.55, refScale: 0.55, gap: 14, width: 840,
      align: 'left', latinAlign: 'left', mealNamePos: 'ust',
    }),
  ],
  'text': [
    preset('manset', 'Manşet', { font: 'bebas-neue', weight: 400, size: 96, uppercase: true,
      letterSpacing: 0.02, align: 'center' }),
    preset('alinti', 'Alıntı', { font: 'cormorant-garamond', weight: 500, size: 74, uppercase: false,
      letterSpacing: 0, align: 'center' }),
    preset('not', 'Not', { font: 'inter-tight', weight: 500, size: 44, uppercase: false,
      letterSpacing: 0.01, align: 'left' }),
    preset('elyazisi', 'El yazısı', { font: 'caveat', weight: 500, size: 80, uppercase: false,
      letterSpacing: 0, align: 'center' }),
  ],
  'arabic': [
    preset('nesih', 'Nesih', { font: 'noto-naskh', weight: 500 }),
    preset('ruka', 'Rukâ', { font: 'aref-ruqaa', weight: 400 }),
    preset('nastaliq', 'Nastaliq', { font: 'noto-nastaliq', weight: 400 }),
    preset('kufi', 'Kûfî', { font: 'reem-kufi', weight: 500 }),
  ],
  'ottoman': [
    preset('nesih', 'Nesih', { font: 'noto-naskh', weight: 500 }),
    preset('ruka', 'Rukâ', { font: 'aref-ruqaa', weight: 400 }),
    preset('nastaliq', 'Nastaliq', { font: 'noto-nastaliq', weight: 400 }),
    preset('kufi', 'Kûfî', { font: 'reem-kufi', weight: 500 }),
  ],
  'month-calendar': [
    preset('swiss', 'Swiss', {
      titleFont: 'inter-tight', titleWeight: 800, titleSize: 44, titleAlign: 'left',
      weekdayFont: 'inter-tight', weekdayWeight: 600, weekdaySize: 20,
      dayFont: 'inter-tight', dayWeight: 500, daySize: 34,
      dayBg: false, rowGap: 0, rowHeight: 2.4,
    }),
    preset('yuvarlak', 'Yuvarlak', {
      titleFont: 'inter-tight', titleWeight: 700, titleSize: 44, titleAlign: 'center',
      weekdayFont: 'inter-tight', weekdayWeight: 600, weekdaySize: 20,
      dayFont: 'inter-tight', dayWeight: 600, daySize: 32,
      dayBg: true, dayRadius: 50, rowGap: 12, rowHeight: 2.6,
    }),
    preset('serif', 'Serif', {
      titleFont: 'playfair', titleWeight: 600, titleSize: 48, titleAlign: 'center',
      weekdayFont: 'lora', weekdayWeight: 500, weekdaySize: 20,
      dayFont: 'lora', dayWeight: 500, daySize: 32,
      dayBg: false, rowGap: 4, rowHeight: 2.5,
    }),
    preset('minimal', 'Minimal', {
      titleFont: 'inter-tight', titleWeight: 600, titleSize: 34, titleAlign: 'left',
      weekdayFont: 'inter-tight', weekdayWeight: 500, weekdaySize: 16,
      dayFont: 'inter-tight', dayWeight: 400, daySize: 26,
      dayBg: false, rowGap: 0, rowHeight: 2.2,
    }),
  ],
}

export const presetsFor = (widgetId) => WIDGET_PRESETS[widgetId] ?? []
