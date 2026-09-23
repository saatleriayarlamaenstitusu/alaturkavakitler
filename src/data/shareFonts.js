// Paylaşım görselinde kullanılabilen yazı tipleri.
//
// YENİ FONT EKLEMEK
// ─────────────────
// 1) fonts.google.com'da fontu seç, "Get embed code" bölümünden CSS2 URL'ini al.
//    `family=` parametresinin DEĞERİNİ aşağıdaki `google` alanına yaz.
// 2) `family`: CSS'te kullanılacak ad — "'Lora', serif"
// 3) `weights`: o fontta GERÇEKTEN bulunan kalınlıklar. Olmayan bir kalınlık
//    istenirse Google Fonts tüm isteği reddeder (400) ve o gruptaki hiçbir font
//    yüklenmez. Emin değilsen tek tek dene:
//    fonts.googleapis.com/css2?family=Lora:wght@600
//    Kalınlık ARALIĞI (`400..700`) yalnızca variable fontlarda çalışır; statik
//    fontlarda tek tek yaz (`400;500;600;700`).
// 4) `italic: false` ise ayarda italik anahtarı görünmez.
// 5) `group`: seçicideki sekme (bkz. FONT_GROUPS).
// 6) `colorFont: true` yalnızca COLRv1 fontlarda (harfler kendi renklerini
//    taşır, CSS color yok sayılır) — metin rengi ayarı gizlenir.
//
// Buradaki kalınlık/italik bilgileri Google Fonts CSS2 API'sine tek tek
// sorularak doğrulanmıştır.
//
// YÜKLEME: fontlar grup grup, o sekme ilk açıldığında indirilir
// (bkz. composables/useShareFonts.js). Kullanımdaki fontlar her zaman
// baştan yüklenir. Bu yüzden liste uzadıkça sayfa açılışı ağırlaşmaz.

export const FONT_GROUPS = [
  { id: 'sans', label: 'Sans' },
  { id: 'serif', label: 'Serif' },
  { id: 'display', label: 'Display' },
  { id: 'script', label: 'El yazısı' },
  { id: 'arabic', label: 'Arapça' },
]

export const SHARE_FONTS = [
  // ══ SANS ══
  { id: 'inter-tight', label: 'Inter Tight', group: 'sans',
    family: "'Inter Tight', sans-serif",
    google: 'Inter+Tight:ital,wght@0,100..900;1,100..900',
    weights: [300, 400, 500, 600, 700, 800, 900], italic: true },
  { id: 'google-sans', label: 'Google Sans', group: 'sans',
    family: "'Google Sans', sans-serif",
    google: 'Google+Sans:ital,wght@0,400..700;1,400..700',
    weights: [400, 500, 600, 700], italic: true },
  { id: 'dm-sans', label: 'DM Sans', group: 'sans',
    family: "'DM Sans', sans-serif",
    google: 'DM+Sans:ital,wght@0,100..1000;1,100..1000',
    weights: [300, 400, 500, 700, 900], italic: true },
  { id: 'outfit', label: 'Outfit', group: 'sans',
    family: "'Outfit', sans-serif",
    google: 'Outfit:wght@100..900',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], italic: false },
  { id: 'manrope', label: 'Manrope', group: 'sans',
    family: "'Manrope', sans-serif",
    google: 'Manrope:wght@200..800',
    weights: [200, 300, 400, 500, 600, 700, 800], italic: false },
  { id: 'urbanist', label: 'Urbanist', group: 'sans',
    family: "'Urbanist', sans-serif",
    google: 'Urbanist:ital,wght@0,100..900;1,100..900',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], italic: true },
  { id: 'jost', label: 'Jost', group: 'sans',
    family: "'Jost', sans-serif",
    google: 'Jost:ital,wght@0,100..900;1,100..900',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], italic: true },
  { id: 'space-grotesk', label: 'Space Grotesk', group: 'sans',
    family: "'Space Grotesk', sans-serif",
    google: 'Space+Grotesk:wght@300..700',
    weights: [300, 400, 500, 600, 700], italic: false },
  { id: 'syne', label: 'Syne', group: 'sans',
    family: "'Syne', sans-serif",
    google: 'Syne:wght@400..800',
    weights: [400, 500, 600, 700, 800], italic: false },
  { id: 'nunito', label: 'Nunito', group: 'sans',
    family: "'Nunito', sans-serif",
    google: 'Nunito:ital,wght@0,200..1000;1,200..1000',
    weights: [300, 400, 600, 700, 800, 900], italic: true },
  { id: 'quicksand', label: 'Quicksand', group: 'sans',
    family: "'Quicksand', sans-serif",
    google: 'Quicksand:wght@300..700',
    weights: [300, 400, 500, 600, 700], italic: false },
  { id: 'dosis', label: 'Dosis', group: 'sans',
    family: "'Dosis', sans-serif",
    google: 'Dosis:wght@200..800',
    weights: [200, 300, 400, 500, 600, 700, 800], italic: false },
  { id: 'darker-grotesque', label: 'Darker Grotesque', group: 'sans',
    family: "'Darker Grotesque', sans-serif",
    google: 'Darker+Grotesque:wght@300..900',
    weights: [300, 400, 500, 600, 700, 800, 900], italic: false },
  { id: 'alumni-sans', label: 'Alumni Sans', group: 'sans',
    family: "'Alumni Sans', sans-serif",
    google: 'Alumni+Sans:ital,wght@0,100..900;1,100..900',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], italic: true },
  { id: 'zalando-expanded', label: 'Zalando Sans Expanded', group: 'sans',
    family: "'Zalando Sans Expanded', sans-serif",
    google: 'Zalando+Sans+Expanded:ital,wght@0,200..900;1,200..900',
    weights: [200, 300, 400, 500, 600, 700, 800, 900], italic: true },
  { id: 'alegreya-sans-sc', label: 'Alegreya Sans SC', group: 'sans',
    family: "'Alegreya Sans SC', sans-serif",
    google: 'Alegreya+Sans+SC:ital,wght@0,100;0,300;0,400;0,500;0,700;0,800;0,900;1,100;1,300;1,400;1,500;1,700;1,800;1,900',
    weights: [100, 300, 400, 500, 700, 800, 900], italic: true },
  { id: 'didact-gothic', label: 'Didact Gothic', group: 'sans',
    family: "'Didact Gothic', sans-serif",
    google: 'Didact+Gothic',
    weights: [400], italic: false },
  { id: 'geo', label: 'Geo', group: 'sans',
    family: "'Geo', sans-serif",
    google: 'Geo:ital@0;1',
    weights: [400], italic: true },

  // ══ SERIF ══
  { id: 'playfair', label: 'Playfair Display', group: 'serif',
    family: "'Playfair Display', serif",
    google: 'Playfair+Display:ital,wght@0,400..900;1,400..900',
    weights: [400, 500, 600, 700, 800, 900], italic: true },
  { id: 'instrument-serif', label: 'Instrument Serif', group: 'serif',
    family: "'Instrument Serif', serif",
    google: 'Instrument+Serif:ital@0;1',
    weights: [400], italic: true },
  { id: 'lora', label: 'Lora', group: 'serif',
    family: "'Lora', serif",
    google: 'Lora:ital,wght@0,400..700;1,400..700',
    weights: [400, 500, 600, 700], italic: true },
  { id: 'cormorant-garamond', label: 'Cormorant Garamond', group: 'serif',
    family: "'Cormorant Garamond', serif",
    google: 'Cormorant+Garamond:ital,wght@0,300..700;1,300..700',
    weights: [300, 400, 500, 600, 700], italic: true },
  { id: 'eb-garamond', label: 'EB Garamond', group: 'serif',
    family: "'EB Garamond', serif",
    google: 'EB+Garamond:ital,wght@0,400..800;1,400..800',
    weights: [400, 500, 600, 700, 800], italic: true },
  { id: 'baskervville', label: 'Baskervville', group: 'serif',
    family: "'Baskervville', serif",
    google: 'Baskervville:ital,wght@0,400..700;1,400..700',
    weights: [400, 500, 600, 700], italic: true },
  { id: 'crimson-text', label: 'Crimson Text', group: 'serif',
    family: "'Crimson Text', serif",
    google: 'Crimson+Text:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700',
    weights: [400, 600, 700], italic: true },
  { id: 'newsreader', label: 'Newsreader', group: 'serif',
    family: "'Newsreader', serif",
    google: 'Newsreader:ital,wght@0,200..800;1,200..800',
    weights: [200, 300, 400, 500, 600, 700, 800], italic: true },
  { id: 'vollkorn', label: 'Vollkorn', group: 'serif',
    family: "'Vollkorn', serif",
    google: 'Vollkorn:ital,wght@0,400..900;1,400..900',
    weights: [400, 500, 600, 700, 800, 900], italic: true },
  { id: 'spectral-sc', label: 'Spectral SC', group: 'serif',
    family: "'Spectral SC', serif",
    google: 'Spectral+SC:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,200;1,300;1,400;1,500;1,600;1,700;1,800',
    weights: [200, 300, 400, 500, 600, 700, 800], italic: true },
  { id: 'fraunces', label: 'Fraunces', group: 'serif',
    family: "'Fraunces', serif",
    google: 'Fraunces:ital,wght@0,100..900;1,100..900',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], italic: true },
  { id: 'bodoni-moda', label: 'Bodoni Moda', group: 'serif',
    family: "'Bodoni Moda', serif",
    google: 'Bodoni+Moda:ital,wght@0,400..900;1,400..900',
    weights: [400, 500, 600, 700, 800, 900], italic: true },
  { id: 'dm-serif-display', label: 'DM Serif Display', group: 'serif',
    family: "'DM Serif Display', serif",
    google: 'DM+Serif+Display:ital@0;1',
    weights: [400], italic: true },
  { id: 'cinzel', label: 'Cinzel', group: 'serif',
    family: "'Cinzel', serif",
    google: 'Cinzel:wght@400..900',
    weights: [400, 500, 600, 700, 800, 900], italic: false },
  { id: 'marcellus', label: 'Marcellus', group: 'serif',
    family: "'Marcellus', serif",
    google: 'Marcellus',
    weights: [400], italic: false },
  { id: 'averia-serif-libre', label: 'Averia Serif Libre', group: 'serif',
    family: "'Averia Serif Libre', serif",
    google: 'Averia+Serif+Libre:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700',
    weights: [300, 400, 700], italic: true },
  { id: 'im-fell-english-sc', label: 'IM Fell English SC', group: 'serif',
    family: "'IM Fell English SC', serif",
    google: 'IM+Fell+English+SC',
    weights: [400], italic: false },
  { id: 'im-fell-dw-pica-sc', label: 'IM Fell DW Pica SC', group: 'serif',
    family: "'IM Fell DW Pica SC', serif",
    google: 'IM+Fell+DW+Pica+SC',
    weights: [400], italic: false },

  // ══ DISPLAY ══
  { id: 'oswald', label: 'Oswald', group: 'display',
    family: "'Oswald', sans-serif",
    google: 'Oswald:wght@200..700',
    weights: [200, 300, 400, 500, 600, 700], italic: false },
  { id: 'bebas-neue', label: 'Bebas Neue', group: 'display',
    family: "'Bebas Neue', sans-serif",
    google: 'Bebas+Neue',
    weights: [400], italic: false },
  { id: 'six-caps', label: 'Six Caps', group: 'display',
    family: "'Six Caps', sans-serif",
    google: 'Six+Caps',
    weights: [400], italic: false },
  { id: 'alfa-slab-one', label: 'Alfa Slab One', group: 'display',
    family: "'Alfa Slab One', serif",
    google: 'Alfa+Slab+One',
    weights: [400], italic: false },
  { id: 'caprasimo', label: 'Caprasimo', group: 'display',
    family: "'Caprasimo', serif",
    google: 'Caprasimo',
    weights: [400], italic: false },
  { id: 'special-gothic-exp', label: 'Special Gothic Expanded One', group: 'display',
    family: "'Special Gothic Expanded One', sans-serif",
    google: 'Special+Gothic+Expanded+One',
    weights: [400], italic: false },
  { id: 'montenegrin-gothic', label: 'Montenegrin Gothic One', group: 'display',
    family: "'Montenegrin Gothic One', sans-serif",
    google: 'Montenegrin+Gothic+One',
    weights: [400], italic: false },
  { id: 'unifraktur', label: 'UnifrakturMaguntia', group: 'display',
    family: "'UnifrakturMaguntia', cursive",
    google: 'UnifrakturMaguntia',
    weights: [400], italic: false },
  { id: 'asset', label: 'Asset', group: 'display',
    family: "'Asset', cursive",
    google: 'Asset',
    weights: [400], italic: false },
  { id: 'major-mono', label: 'Major Mono Display', group: 'display',
    family: "'Major Mono Display', monospace",
    google: 'Major+Mono+Display',
    weights: [400], italic: false },
  { id: 'courier-prime', label: 'Courier Prime', group: 'display',
    family: "'Courier Prime', monospace",
    google: 'Courier+Prime:ital,wght@0,400;0,700;1,400;1,700',
    weights: [400, 700], italic: true },

  // ══ EL YAZISI ══
  { id: 'caveat', label: 'Caveat', group: 'script',
    family: "'Caveat', cursive",
    google: 'Caveat:wght@400..700',
    weights: [400, 500, 600, 700], italic: false },
  { id: 'shadows-into-light', label: 'Shadows Into Light', group: 'script',
    family: "'Shadows Into Light', cursive",
    google: 'Shadows+Into+Light',
    weights: [400], italic: false },
  { id: 'homemade-apple', label: 'Homemade Apple', group: 'script',
    family: "'Homemade Apple', cursive",
    google: 'Homemade+Apple',
    weights: [400], italic: false },
  { id: 'gochi-hand', label: 'Gochi Hand', group: 'script',
    family: "'Gochi Hand', cursive",
    google: 'Gochi+Hand',
    weights: [400], italic: false },
  { id: 'rock-salt', label: 'Rock Salt', group: 'script',
    family: "'Rock Salt', cursive",
    google: 'Rock+Salt',
    weights: [400], italic: false },
  { id: 'pinyon-script', label: 'Pinyon Script', group: 'script',
    family: "'Pinyon Script', cursive",
    google: 'Pinyon+Script',
    weights: [400], italic: false },
  { id: 'zeyada', label: 'Zeyada', group: 'script',
    family: "'Zeyada', cursive",
    google: 'Zeyada',
    weights: [400], italic: false },

  // ══ ARAPÇA ══
  // Hat üslubu parantez içinde.
  { id: 'amiri', label: 'Amiri', group: 'arabic',          // klasik nesih
    family: "'Amiri', serif",
    google: 'Amiri:ital,wght@0,400;0,700;1,400;1,700',
    weights: [400, 700], italic: true },
  { id: 'aref-ruqaa', label: 'Aref Ruqaa', group: 'arabic', // rika
    family: "'Aref Ruqaa', serif",
    google: 'Aref+Ruqaa:wght@400;700',
    weights: [400, 700], italic: false },
  { id: 'aref-ruqaa-ink', label: 'Aref Ruqaa Ink', group: 'arabic', // rika, çift renkli mürekkep
    family: "'Aref Ruqaa Ink', serif",
    google: 'Aref+Ruqaa+Ink:wght@400;700',
    weights: [400, 700], italic: false, colorFont: true },
  { id: 'scheherazade', label: 'Scheherazade New', group: 'arabic', // nesih
    family: "'Scheherazade New', serif",
    google: 'Scheherazade+New:wght@400;500;600;700',
    weights: [400, 500, 600, 700], italic: false },
  { id: 'noto-naskh', label: 'Noto Naskh Arabic', group: 'arabic', // nesih
    family: "'Noto Naskh Arabic', serif",
    google: 'Noto+Naskh+Arabic:wght@400..700',
    weights: [400, 500, 600, 700], italic: false },
  { id: 'lateef', label: 'Lateef', group: 'arabic',         // nesih
    family: "'Lateef', serif",
    google: 'Lateef:wght@200;300;400;500;600;700;800',
    weights: [200, 300, 400, 500, 600, 700, 800], italic: false },
  { id: 'noto-nastaliq', label: 'Noto Nastaliq Urdu', group: 'arabic', // talik
    family: "'Noto Nastaliq Urdu', serif",
    google: 'Noto+Nastaliq+Urdu:wght@400..700',
    weights: [400, 500, 600, 700], italic: false },
  { id: 'mirza', label: 'Mirza', group: 'arabic',           // talik esinli
    family: "'Mirza', serif",
    google: 'Mirza:wght@400;500;600;700',
    weights: [400, 500, 600, 700], italic: false },
  { id: 'gulzar', label: 'Gulzar', group: 'arabic',         // talik
    family: "'Gulzar', serif",
    google: 'Gulzar',
    weights: [400], italic: false },
  { id: 'reem-kufi', label: 'Reem Kufi', group: 'arabic',   // kufi
    family: "'Reem Kufi', sans-serif",
    google: 'Reem+Kufi:wght@400..700',
    weights: [400, 500, 600, 700], italic: false },
  { id: 'cairo', label: 'Cairo', group: 'arabic',           // modern
    family: "'Cairo', sans-serif",
    google: 'Cairo:wght@200..900',
    weights: [200, 300, 400, 500, 600, 700, 800, 900], italic: false },
  { id: 'tajawal', label: 'Tajawal', group: 'arabic',       // modern
    family: "'Tajawal', sans-serif",
    google: 'Tajawal:wght@200;300;400;500;700;800;900',
    weights: [200, 300, 400, 500, 700, 800, 900], italic: false },
  { id: 'rakkas', label: 'Rakkas', group: 'arabic',         // dekoratif display
    family: "'Rakkas', serif",
    google: 'Rakkas',
    weights: [400], italic: false },
  { id: 'badeen', label: 'Badeen Display', group: 'arabic', // ağır display
    family: "'Badeen Display', sans-serif",
    google: 'Badeen+Display',
    weights: [400], italic: false },
  { id: 'oi', label: 'Oi', group: 'arabic',                 // çok ağır display
    family: "'Oi', sans-serif",
    google: 'Oi',
    weights: [400], italic: false },
  { id: 'handjet', label: 'Handjet', group: 'arabic',       // piksel/geometrik
    family: "'Handjet', sans-serif",
    google: 'Handjet:wght@100..900',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], italic: false },
]

export const DEFAULT_FONT = 'inter-tight'

const WEIGHT_LABELS = {
  100: 'Çok ince', 200: 'İnce', 300: 'Hafif', 400: 'Normal', 500: 'Orta',
  600: 'Yarı kalın', 700: 'Kalın', 800: 'Çok kalın', 900: 'Siyah',
}

export function getFont(id) {
  return SHARE_FONTS.find(f => f.id === id) || SHARE_FONTS[0]
}

// COLRv1 fontlarda harfler kendi renkleriyle çizilir; CSS color yok sayılır.
export function isColorFont(id) {
  return Boolean(getFont(id).colorFont)
}

export function fontsByGroup(group) {
  return SHARE_FONTS.filter(f => f.group === group)
}

export function weightOptions(fontId) {
  return getFont(fontId).weights.map(w => ({ value: w, label: WEIGHT_LABELS[w] ?? String(w) }))
}

// Seçili font o kalınlığı desteklemiyorsa en yakınına düşülür.
export function nearestWeight(fontId, weight) {
  const { weights } = getFont(fontId)
  if (weights.includes(weight)) return weight
  return weights.reduce((best, w) => (Math.abs(w - weight) < Math.abs(best - weight) ? w : best), weights[0])
}
