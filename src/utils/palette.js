// Bir görselden baskın renkleri çıkarır. 64×64'e indirgenip her kanal 4 bite
// kuantalanır, kovalar frekansa göre sıralanır ve birbirine çok yakın olanlar
// elenir — amaç doğru bir kuantalama değil, kullanılabilir bir palet.
const SAMPLE = 64
const MIN_DISTANCE = 64

const toHex = ({ r, g, b }) =>
  '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')

const distance = (a, b) =>
  Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2)

// decode() belgeye eklenmemiş Image + data URI bileşiminde takılabiliyor
// (Chrome'da ölçüldü, hiç çözülmüyor); onload güvenilir yol.
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('görsel yüklenemedi'))
    img.src = src
  })
}

export async function extractPalette(src, count = 5) {
  if (!src) return []
  try {
    const img = await loadImage(src)

    const canvas = document.createElement('canvas')
    canvas.width = SAMPLE
    canvas.height = SAMPLE
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    ctx.drawImage(img, 0, 0, SAMPLE, SAMPLE)
    const data = ctx.getImageData(0, 0, SAMPLE, SAMPLE).data

    const buckets = new Map()
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 128) continue
      const key = ((data[i] >> 4) << 8) | ((data[i + 1] >> 4) << 4) | (data[i + 2] >> 4)
      const bucket = buckets.get(key) || { r: 0, g: 0, b: 0, n: 0 }
      bucket.r += data[i]
      bucket.g += data[i + 1]
      bucket.b += data[i + 2]
      bucket.n++
      buckets.set(key, bucket)
    }

    const ranked = [...buckets.values()]
      .sort((a, b) => b.n - a.n)
      .map((b) => ({ r: Math.round(b.r / b.n), g: Math.round(b.g / b.n), b: Math.round(b.b / b.n) }))

    const picked = []
    for (const color of ranked) {
      if (picked.length >= count) break
      if (picked.some((p) => distance(p, color) < MIN_DISTANCE)) continue
      picked.push(color)
    }
    return picked.map(toHex)
  } catch {
    return []
  }
}
