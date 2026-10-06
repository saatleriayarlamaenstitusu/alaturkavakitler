// Kıble yönü: bulunduğun noktadan Kâbe'ye bakan büyük daire yönü.
//
// Düz haritadaki "Mekke'ye doğru çiz" sezgisi yanıltıcıdır — yeryüzü küre
// olduğu için en kısa yol büyük daire yayıdır. Türkiye'den kıble bu yüzden
// güneydoğuya değil, güney-güneydoğuya düşer (İstanbul'dan ~151°).
const KAABA = { lat: 21.4224779, lon: 39.8251832 }

const toRad = (d) => (d * Math.PI) / 180
const toDeg = (r) => (r * 180) / Math.PI

/**
 * Gerçek kuzeyden saat yönünde kıble açısı (0–360).
 * @param {number} lat enlem
 * @param {number} lon boylam
 */
export function qiblaBearing(lat, lon) {
  const φ1 = toRad(lat)
  const φ2 = toRad(KAABA.lat)
  const Δλ = toRad(KAABA.lon - lon)

  const y = Math.sin(Δλ)
  const x = Math.cos(φ1) * Math.tan(φ2) - Math.sin(φ1) * Math.cos(Δλ)
  return (toDeg(Math.atan2(y, x)) + 360) % 360
}

/** 151.3 → "151°" */
export const formatBearing = (deg) => `${Math.round(deg)}°`

// Pusula yönünü sekiz ana yöne indirger — sayı tek başına soyut kalıyor.
const DIRS = ['K', 'KD', 'D', 'GD', 'G', 'GB', 'B', 'KB']
export const compassName = (deg) => DIRS[Math.round(((deg % 360) / 45)) % 8]
