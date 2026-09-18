import { SHARE_FONTS } from '@/data/shareFonts'

// Tüm paylaşım fontlarını tek bir Google Fonts stylesheet'iyle yükler.
// Yalnızca CSS indirilir; font dosyaları tarayıcı tarafından ancak o aile
// gerçekten bir metne uygulandığında çekilir.
let injected = false

export function ensureShareFonts() {
  if (injected) return
  injected = true

  const families = SHARE_FONTS.map(f => `family=${f.google}`).join('&')
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`
  document.head.appendChild(link)
}
