// Paylaşım görselinde kullanılabilen yazı tipleri.
//
// YENİ FONT EKLEMEK
// ─────────────────
// 1) fonts.google.com'da fontu seç, "Get embed code" bölümünden CSS2 URL'ini al.
//    Örn: https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400..700;1,400..700
//    Buradaki `family=` parametresinin DEĞERİNİ (Lora:ital,wght@0,400..700;1,400..700)
//    aşağıdaki `google` alanına yaz.
// 2) `family` alanına CSS'te kullanılacak adı yaz: "'Lora', serif"
// 3) `weights` listesine o fontta GERÇEKTEN bulunan kalınlıkları koy. Olmayan bir
//    kalınlık istenirse Google Fonts tüm isteği reddeder (400) ve font hiç yüklenmez.
//    Emin değilsen tek tek dene: fonts.googleapis.com/css2?family=Lora:wght@600
// 4) Fontun italik varyantı yoksa `italic: false` yaz (o zaman ayarda italik
//    anahtarı görünmez).
// 5) `script`: 'latin' veya 'arabic' — seçicide hangi grupta görüneceğini belirler.
//
// Hepsi tek bir <link> ile yüklenir (bkz. composables/useShareFonts.js).
// Stylesheet birkaç kB'dir; font DOSYALARI yalnızca gerçekten kullanılan
// ailelerde indirilir, o yüzden listeyi uzatmak sayfayı ağırlaştırmaz.
//
// Buradaki tüm kalınlık/italik bilgileri Google Fonts CSS2 API'sine tek tek
// sorularak doğrulanmıştır.

export const SHARE_FONTS = [
  // ── Latin ──
  {
    id: 'inter-tight',
    label: 'Inter Tight',
    script: 'latin',
    family: "'Inter Tight', sans-serif",
    google: 'Inter+Tight:ital,wght@0,100..900;1,100..900',
    weights: [300, 400, 500, 600, 700, 800, 900],
    italic: true,
  },
  {
    id: 'google-sans',
    label: 'Google Sans',
    script: 'latin',
    family: "'Google Sans', sans-serif",
    google: 'Google+Sans:ital,wght@0,400..700;1,400..700',
    weights: [400, 500, 600, 700],
    italic: true,
  },
  {
    id: 'instrument-serif',
    label: 'Instrument Serif',
    script: 'latin',
    family: "'Instrument Serif', serif",
    google: 'Instrument+Serif:ital@0;1',
    weights: [400],
    italic: true,
  },
  {
    id: 'playfair',
    label: 'Playfair Display',
    script: 'latin',
    family: "'Playfair Display', serif",
    google: 'Playfair+Display:ital,wght@0,400..900;1,400..900',
    weights: [400, 500, 600, 700, 800, 900],
    italic: true,
  },
  {
    id: 'oswald',
    label: 'Oswald',
    script: 'latin',
    family: "'Oswald', sans-serif",
    google: 'Oswald:wght@200..700',
    weights: [200, 300, 400, 500, 600, 700],
    italic: false,
  },
  {
    id: 'dm-sans',
    label: 'DM Sans',
    script: 'latin',
    family: "'DM Sans', sans-serif",
    google: 'DM+Sans:ital,wght@0,100..1000;1,100..1000',
    weights: [300, 400, 500, 700, 900],
    italic: true,
  },
  {
    id: 'nunito',
    label: 'Nunito',
    script: 'latin',
    family: "'Nunito', sans-serif",
    google: 'Nunito:ital,wght@0,200..1000;1,200..1000',
    weights: [300, 400, 600, 700, 800, 900],
    italic: true,
  },

  // ── Arapça ──
  // Ayet ve hazır dini metinler için. Hat üslubu parantez içinde.
  {
    id: 'amiri',
    label: 'Amiri',              // klasik nesih — Bulak matbaası geleneği
    script: 'arabic',
    family: "'Amiri', serif",
    google: 'Amiri:ital,wght@0,400;0,700;1,400;1,700',
    weights: [400, 700],
    italic: true,
  },
  {
    id: 'aref-ruqaa',
    label: 'Aref Ruqaa',         // rika
    script: 'arabic',
    family: "'Aref Ruqaa', serif",
    google: 'Aref+Ruqaa:wght@400;700',
    weights: [400, 700],
    italic: false,
  },
  {
    id: 'scheherazade',
    label: 'Scheherazade New',   // nesih
    script: 'arabic',
    family: "'Scheherazade New', serif",
    google: 'Scheherazade+New:wght@400;500;600;700',
    weights: [400, 500, 600, 700],
    italic: false,
  },
  {
    id: 'noto-naskh',
    label: 'Noto Naskh Arabic',  // nesih
    script: 'arabic',
    family: "'Noto Naskh Arabic', serif",
    google: 'Noto+Naskh+Arabic:wght@400..700',
    weights: [400, 500, 600, 700],
    italic: false,
  },
  {
    id: 'noto-nastaliq',
    label: 'Noto Nastaliq Urdu', // talik / nestalik
    script: 'arabic',
    family: "'Noto Nastaliq Urdu', serif",
    google: 'Noto+Nastaliq+Urdu:wght@400..700',
    weights: [400, 500, 600, 700],
    italic: false,
  },
  {
    id: 'reem-kufi',
    label: 'Reem Kufi',          // kufi
    script: 'arabic',
    family: "'Reem Kufi', sans-serif",
    google: 'Reem+Kufi:wght@400..700',
    weights: [400, 500, 600, 700],
    italic: false,
  },
  {
    id: 'cairo',
    label: 'Cairo',              // modern
    script: 'arabic',
    family: "'Cairo', sans-serif",
    google: 'Cairo:wght@200..900',
    weights: [200, 300, 400, 500, 600, 700, 800, 900],
    italic: false,
  },
  {
    id: 'tajawal',
    label: 'Tajawal',            // modern
    script: 'arabic',
    family: "'Tajawal', sans-serif",
    google: 'Tajawal:wght@200;300;400;500;700;800;900',
    weights: [200, 300, 400, 500, 700, 800, 900],
    italic: false,
  },
]

export const DEFAULT_FONT = 'inter-tight'

export const FONT_GROUPS = [
  { id: 'latin', label: 'Latin' },
  { id: 'arabic', label: 'Arapça' },
]

const WEIGHT_LABELS = {
  100: 'Çok ince', 200: 'İnce', 300: 'Hafif', 400: 'Normal', 500: 'Orta',
  600: 'Yarı kalın', 700: 'Kalın', 800: 'Çok kalın', 900: 'Siyah',
}

export function getFont(id) {
  return SHARE_FONTS.find(f => f.id === id) || SHARE_FONTS[0]
}

export function fontsByScript(script) {
  return SHARE_FONTS.filter(f => f.script === script)
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
