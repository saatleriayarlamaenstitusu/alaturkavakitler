/**
 * Serbest okumada hızlı erişim.
 *
 * Mushafta en çok dönülen yerler bellidir ve hepsine sure listesinden
 * gitmek gereksiz bir adım: yaygın adıyla anılanlar (Tebâreke, Amme)
 * resmî adlarıyla aranmıyor bile. Liste bilinçli kısa — hızlı erişim
 * uzadıkça hızlı olmaktan çıkar.
 *
 * `surah` surenin başına, `verse` o ayete (vurgulanır), `juz` cüzün
 * başına gider.
 */
export const QURAN_SHORTCUTS = [
  { label: 'Yasin', surah: 36 },
  { label: 'Tebâreke', surah: 67, note: 'Mülk' },
  { label: 'Amme', surah: 78, note: 'Nebe' },
  { label: 'Vâkıa', surah: 56 },
  { label: 'Rahmân', surah: 55 },
  { label: 'Kehf', surah: 18 },
  { label: 'Ayetel Kürsi', surah: 2, verse: 255 },
  { label: 'Âmenerrasûlü', surah: 2, verse: 285 },
  { label: '30. cüz', juz: 30 },
  { label: 'Kısa sureler', surah: 93, note: 'Duhâ’dan sonu' },
  { label: 'Fâtiha', surah: 1 },
]
