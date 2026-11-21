/**
 * Meal yazı tipleri.
 *
 * Arapça metnin hattı seçilebiliyordu (`quranFonts.js`) ama karşılığının
 * yazısı sabitti. Oysa uzun uzun okunan şey meal: kimi serifli bir
 * kitap yazısında, kimi geniş aralıklı bir daktilo yazısında daha rahat
 * okuyor.
 *
 * Liste bilinçli üç öğe — on tane yazı tipi sunmak seçimi bir ayara
 * değil bir göreve çevirir:
 *
 *  - `sans`  — uygulamanın kendi yazısı (ek indirme YOK, varsayılan)
 *  - `serif` — Baskervville: Baskerville'in açık kaynaklı dirilişi
 *  - `mono`  — Courier Prime
 *
 * `font` alanı `data/shareFonts.js`'teki kimliktir; `ensureFont(id)` ile
 * YALNIZCA o aile indirilir. `sans`'ta boş: zaten yüklü.
 */
export const MEAL_FONTS = [
  { id: 'sans', label: 'Sans', note: 'uygulamanın yazısı', font: '', family: 'var(--font1)' },
  { id: 'serif', label: 'Serif', note: 'Baskervville', font: 'baskervville', family: "'Baskervville', Georgia, serif" },
  { id: 'mono', label: 'Mono', note: 'Courier Prime', font: 'courier-prime', family: "'Courier Prime', ui-monospace, monospace" },
]

export const mealFontById = (id) =>
  MEAL_FONTS.find((f) => f.id === id) ?? MEAL_FONTS[0]
