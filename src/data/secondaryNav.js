// Üst çubuktaki üç nokta menüsü ile masaüstü rayının ikincil bölümü aynı
// listeden beslenir — biri eklenip diğeri unutulmasın diye tek kaynak.
// `action: true` olan satır bir eylemdir (üretme), gezinme değil: her iki
// yerde de kalın yazılır ve listenin başında durur.
// `icon` yalnızca rayda kullanılır (bkz. nav/NavIcon.vue).
export const SECONDARY_NAV = [
  { path: '/gorsel-olustur', label: 'Görsel Oluştur', icon: 'gorsel', action: true },
  { path: '/ayarlar', label: 'Ayarlar', icon: 'ayarlar' },
  { path: '/saatuzerine', label: 'Saat Üzerine', icon: 'yazi' },
  { path: '/yenilikler', label: 'Yenilikler', icon: 'yeni' },
  { path: '/hakkinda', label: 'Hakkında', icon: 'bilgi' },
]
