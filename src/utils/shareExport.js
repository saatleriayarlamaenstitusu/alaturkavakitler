import { snapdom } from '@zumer/snapdom'

const OPTIONS = { embedFonts: true }

// Chrome'un foreignObject rasterizasyonunda sert bir sınır var: çıktı
// rasterinde yaklaşık 325px'ten büyük bir harf render edilirse TÜM katman
// düşüyor ve görsel bomboş çıkıyor. Sınır CSS'teki font-size değerine değil,
// katman ölçeğiyle çarpılmış nihai boyuta bağlı (ölçülerek doğrulandı:
// 320px sorunsuz, 330px sıfır; 200px'lik yazı scale:2 ile de bozuluyor).
// Bu yüzden büyük yazı varsa küçük ölçekte render edip hedef boyuta
// büyütüyoruz — çıktı biraz yumuşuyor ama boş kalmıyor.
const MAX_GLYPH_PX = 300

// Bir elemanın gerçekte kaç piksellik harfle çizildiği: CSS font-size ×
// üzerindeki dönüşümler. Önizleme ölçeği (viewScale) hesaptan düşülür,
// çünkü export önizlemeden bağımsızdır.
function maxRenderedGlyph(root, viewScale = 1) {
  let max = 0
  for (const el of root.querySelectorAll('*')) {
    if (!el.textContent?.trim()) continue
    const fs = parseFloat(getComputedStyle(el).fontSize) || 0
    if (!fs || !el.offsetWidth) continue
    const applied = el.getBoundingClientRect().width / el.offsetWidth
    max = Math.max(max, (fs * applied) / (viewScale || 1))
  }
  return max
}

function upscale(source, width, height) {
  if (source.width === width && source.height === height) return source
  const out = document.createElement('canvas')
  out.width = width
  out.height = height
  const ctx = out.getContext('2d')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(source, 0, 0, width, height)
  return out
}

function opaqueRatio(canvas) {
  const { width, height } = canvas
  const d = canvas.getContext('2d').getImageData(0, 0, width, height).data
  let opaque = 0
  let total = 0
  for (let y = 0; y < height; y += 8) {
    for (let x = 0; x < width; x += 8) {
      total++
      if (d[(y * width + x) * 4 + 3] > 10) opaque++
    }
  }
  return total ? opaque / total : 0
}

// İlk yakalama font/görsel önbelleği dolmadan çalıştığı için eksik çıkabiliyor.
// Sayfa açılışında bir kez sessizce ısıtıyoruz ki kullanıcının ilk denemesi doğru olsun.
export async function warmupExport(el) {
  if (!el) return
  try {
    await document.fonts.ready
    await snapdom.toCanvas(el, { ...OPTIONS, scale: 1 })
  } catch {
    // ısınma başarısız olursa sorun değil, asıl export yine denenecek
  }
}

export async function renderCanvasToBlob(el, viewScale = 1) {
  await document.fonts.ready

  const width = el.offsetWidth
  const height = el.offsetHeight
  const glyph = maxRenderedGlyph(el, viewScale)
  const scale = glyph > MAX_GLYPH_PX ? MAX_GLYPH_PX / glyph : 1

  let canvas = upscale(await snapdom.toCanvas(el, { ...OPTIONS, scale }), width, height)

  // Emniyet ağı: bilinmeyen bir sebeple katmanlar düşerse boş PNG indirmek
  // yerine daha küçük rasterle bir kez daha dene.
  if (opaqueRatio(canvas) < 0.05) {
    canvas = upscale(await snapdom.toCanvas(el, { ...OPTIONS, scale: scale * 0.5 }), width, height)
    if (opaqueRatio(canvas) < 0.05) {
      throw new Error('Görsel oluşturulamadı — bir widget aşırı büyük olabilir, küçültüp tekrar deneyin')
    }
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Görsel oluşturulamadı'))),
      'image/png',
    )
  })
}

export function buildFileName(snapshot) {
  const date = snapshot.miladi.short.replace(/\./g, '-')
  return `alaturka-${date}-${snapshot.alaturka.replace(':', '')}.png`
}

export function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Tarayıcının indirmeyi başlatmasına zaman tanı
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}

export function canShareFiles(blob, fileName) {
  if (!navigator.canShare || !navigator.share) return false
  try {
    return navigator.canShare({ files: [new File([blob], fileName, { type: 'image/png' })] })
  } catch {
    return false
  }
}

export async function shareBlob(blob, fileName) {
  const file = new File([blob], fileName, { type: 'image/png' })
  await navigator.share({ files: [file], title: 'Alaturka Vakitler' })
}
