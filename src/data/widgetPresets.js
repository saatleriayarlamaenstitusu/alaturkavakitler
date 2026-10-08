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
