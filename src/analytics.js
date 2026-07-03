// Google Analytics 4 — VITE_GA_ID tanımlıysa ve production build'de yüklenir.
// SPA olduğu için sayfa görüntülemeleri router değişiminde manuel gönderilir.
const GA_ID = import.meta.env.VITE_GA_ID

let enabled = false

export function initAnalytics() {
  if (!GA_ID || !import.meta.env.PROD) return

  // gtag.js script'ini yükle
  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(s)

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    window.dataLayer.push(arguments)
  }
  window.gtag('js', new Date())
  // İlk sayfa görüntülemeyi router afterEach'te göndereceğimiz için burada kapatıyoruz
  window.gtag('config', GA_ID, { send_page_view: false })

  enabled = true
}

export function trackPageView(path, title) {
  if (!enabled) return
  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title || document.title,
    page_location: window.location.origin + path,
  })
}
