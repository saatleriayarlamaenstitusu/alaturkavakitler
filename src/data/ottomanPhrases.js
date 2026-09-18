// Osmanlıca (eski yazı) hazır ifadeler.
//
// Arapça listesinden farkı: buradakiler TÜRKÇE cümlelerin Arap harfleriyle
// yazımıdır. Dinî kalıpların çoğu (besmele, hamdele, tevhid…) Arapça olduğu
// için eski yazıda da aynen yazılır; onlar için Arapça widget'ını kullan.
//
// YAZIM TERCİHLERİ (tek yerden değiştirilebilsin diye burada toplandı)
//   • ye: ی (U+06CC, Farsî ye) — Osmanlı matbaa geleneğinde yaygın biçim
//   • nazal n (ñ): ڭ  → bayramıñız = بایرامڭز
//   • g: گ            → geldiñiz = گلدڭز
//   • Hareke kullanılmaz; Osmanlıca metin harekesiz yazılır.
//
// ⚠ DİKKAT: Osmanlıca imlâda ek yazımı, ye/kef varyantları ve bitişik/ayrı
// yazım konusunda birden fazla gelenek vardır. Bu liste yaygın biçimlere göre
// hazırlandı ama yayına almadan önce eski yazı bilen birine kontrol ettir.

export const OTTOMAN_PHRASES = [
  { id: 'mubarek',      ar: 'مبارک اولسون',            tr: 'Mübarek olsun',            meal: 'Mübarek olsun' },
  { id: 'hayirli-cuma', ar: 'خیرلی جمعه لر',            tr: 'Hayırlı cumalar',          meal: 'Hayırlı cumalar' },
  { id: 'bayram',       ar: 'بایرامڭز مبارک اولسون',    tr: 'Bayramınız mübarek olsun', meal: 'Bayramınız mübarek olsun' },
  { id: 'ramazan',      ar: 'رمضانڭز مبارک اولسون',     tr: 'Ramazanınız mübarek olsun', meal: 'Ramazanınız mübarek olsun' },
  { id: 'kandil',       ar: 'قندیلڭز مبارک اولسون',     tr: 'Kandiliniz mübarek olsun', meal: 'Kandiliniz mübarek olsun' },
  { id: 'vakit',        ar: 'وقت خیرلی اولسون',         tr: 'Vakit hayırlı olsun',      meal: 'Vakit hayırlı olsun' },
  { id: 'sabah',        ar: 'خیرلی صباحلر',             tr: 'Hayırlı sabahlar',         meal: 'Hayırlı sabahlar' },
  { id: 'aksam',        ar: 'خیرلی آقشاملر',            tr: 'Hayırlı akşamlar',         meal: 'Hayırlı akşamlar' },
  { id: 'kabul',        ar: 'الله قبول ایتسون',         tr: 'Allah kabul etsin',        meal: 'Allah kabul etsin' },
  { id: 'rahmet',       ar: 'الله رحمت ایله سون',       tr: 'Allah rahmet eylesin',     meal: 'Allah rahmet eylesin' },
  { id: 'yardimci',     ar: 'الله یاردیمجیڭز اولسون',   tr: 'Allah yardımcınız olsun',  meal: 'Allah yardımcınız olsun' },
  { id: 'selamdua',     ar: 'سلام و دعا',               tr: 'Selâm ü duâ',              meal: 'Selam ve dua ile' },
  { id: 'hosgeldiniz',  ar: 'خوش گلدڭز',                tr: 'Hoş geldiniz',             meal: 'Hoş geldiniz' },
  { id: 'niceyillara',  ar: 'نیجه ییللره',              tr: 'Nice yıllara',             meal: 'Nice yıllara' },
]

export const DEFAULT_OTTOMAN_PHRASE = 'mubarek'
