/**
 * Esnek görünümün Arapça yazı tipleri.
 *
 * Liste bilinçli dar: hepsi NESİH. Mushaf nesihle basılır; talik, kufi
 * ve divani güzel yazılardır ama Kur'an sayfası için değildir.
 *
 * Tek kaynak: hem ayarlar sayfası hem Kur'an sayfasındaki yazı seçici
 * buradan beslenir — biri eklenip öbüründe unutulmasın.
 *
 * Mushaf görünümünde bu liste KULLANILMAZ: orada yazı tipi sayfanın
 * kendisine aittir (QPC, sayfa başına ayrı dosya), seçilemez.
 */
export const QURAN_FONTS = [
  { id: 'lateef', label: 'Lateef', note: "Diyanet'in dağıttığı hat" },
  { id: 'scheherazade', label: 'Scheherazade', note: 'geniş nesih' },
  { id: 'amiri', label: 'Amiri', note: 'klasik nesih' },
  { id: 'noto-naskh', label: 'Noto Naskh', note: 'sade nesih' },
]

export const quranFontById = (id) =>
  QURAN_FONTS.find((f) => f.id === id) ?? QURAN_FONTS[0]
