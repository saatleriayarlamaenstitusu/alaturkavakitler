// Paylaşım görselinde kullanılabilen hazır Arapça metinler.
//
// YENİ METİN EKLEMEK
// ──────────────────
// Listeye bir obje ekle:
//   id    → benzersiz kısa anahtar
//   ar    → Arapça metin, HAREKELİ yaz (harekesiz gösterim buradan türetilir)
//   tr    → widget'ın alt satırında görünecek Latin satırı: kalıp ibarelerde
//           okunuşu, tebrik ifadelerinde yaygın Türkçe karşılığı
//   meal  → Türkçe anlamı (kullanıcı alt satırı bununla değiştirebilir)
// Başka hiçbir yere dokunmak gerekmez; seçici bu listeden beslenir.
//
// YAZIM TERCİHLERİ
// Belirlilik takısı, basılı mushaf ve yaygın dijital kaynaklardaki gibi
// başta fethasız yazılır (الْحَمْدُ, السَّلَامُ). Lafza-i celâl şedde +
// küçük elif ile (اللّٰه) yazılır; harekesiz moda geçince bunlar düşüp
// standart yazıma (الله) dönüşür.

export const ARABIC_PHRASES = [
  { id: 'besmele',      ar: 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ', tr: 'Bismillâhirrahmânirrahîm', meal: 'Rahmân ve Rahîm olan Allah\'ın adıyla' },
  { id: 'hamdele',      ar: 'الْحَمْدُ لِلّٰهِ',                      tr: 'Elhamdülillâh',            meal: 'Hamd Allah\'a mahsustur' },
  { id: 'subhanallah',  ar: 'سُبْحَانَ اللّٰهِ',                      tr: 'Sübhânallâh',              meal: 'Allah her türlü eksiklikten uzaktır' },
  { id: 'tekbir',       ar: 'اللّٰهُ أَكْبَرُ',                       tr: 'Allâhu ekber',             meal: 'Allah en büyüktür' },
  { id: 'tevhid',       ar: 'لَا إِلٰهَ إِلَّا اللّٰهُ',              tr: 'Lâ ilâhe illallâh',        meal: 'Allah\'tan başka ilah yoktur' },
  { id: 'rahman',       ar: 'الرَّحْمٰنُ الرَّحِيمُ',                 tr: 'Er-Rahmânü\'r-Rahîm',      meal: 'Rahmân ve Rahîm' },
  { id: 'masallah',     ar: 'مَا شَاءَ اللّٰهُ',                      tr: 'Mâşâallâh',                meal: 'Allah ne güzel dilemiş' },
  { id: 'insallah',     ar: 'إِنْ شَاءَ اللّٰهُ',                     tr: 'İnşâallâh',                meal: 'Allah dilerse' },
  { id: 'selam',        ar: 'السَّلَامُ عَلَيْكُمْ',                  tr: 'Selâmün aleyküm',          meal: 'Selam üzerinize olsun' },
  { id: 'hasbunallah',  ar: 'حَسْبُنَا اللّٰهُ وَنِعْمَ الْوَكِيلُ',  tr: 'Hasbünallâhü ve ni\'mel vekîl', meal: 'Allah bize yeter, O ne güzel vekildir' },
  { id: 'lahavle',      ar: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّٰهِ', tr: 'Lâ havle velâ kuvvete illâ billâh', meal: 'Güç ve kuvvet ancak Allah\'tandır' },
  { id: 'salavat',      ar: 'اللّٰهُمَّ صَلِّ عَلَى مُحَمَّدٍ',        tr: 'Allâhümme salli alâ Muhammed', meal: 'Allah\'ım, Muhammed\'e salât et' },
  { id: 'istigfar',     ar: 'أَسْتَغْفِرُ اللّٰهَ',                   tr: 'Estağfirullâh',            meal: 'Allah\'tan bağışlanma dilerim' },
  { id: 'barekallah',   ar: 'بَارَكَ اللّٰهُ',                        tr: 'Bârekallâh',               meal: 'Allah bereket versin' },
  { id: 'rahimehullah', ar: 'رَحِمَهُ اللّٰهُ',                       tr: 'Rahimehullâh',             meal: 'Allah rahmet eylesin' },
  { id: 'yaallah',      ar: 'يَا اللّٰهُ',                            tr: 'Yâ Allah',                 meal: 'Ey Allah\'ım' },
  { id: 'cuma',         ar: 'جُمُعَةٌ مُبَارَكَةٌ',                   tr: 'Hayırlı Cumalar',          meal: 'Cumanız mübarek olsun' },
  { id: 'ramazan',      ar: 'رَمَضَانُ مُبَارَكٌ',                    tr: 'Hayırlı Ramazanlar',       meal: 'Ramazanınız mübarek olsun' },
  { id: 'bayram',       ar: 'عِيدٌ مُبَارَكٌ',                        tr: 'Bayramınız Mübarek',       meal: 'Bayramınız mübarek olsun' },
]

export const DEFAULT_PHRASE = 'besmele'

export function getPhrase(id) {
  return ARABIC_PHRASES.find(p => p.id === id) || ARABIC_PHRASES[0]
}

// Harekeler ve Kur'an işaretleri. Küçük elif (U+0670) de düşürülür:
// اللّٰه → الله, الرَّحْمٰن → الرحمن — ikisi de standart harekesiz yazımdır.
// Tatvil (U+0640) korunur, harf uzatmasıdır.
const HARAKAT = /[ً-ْٓ-ٕٖ-ٰٟۖ-ۭ࣓-ࣿﹰ-ﹿ]/g

export function stripHarakat(text) {
  return String(text ?? '').replace(HARAKAT, '')
}
