// Build öncesi public/sitemap.xml üretir.
// Statik rotalar + src/content/*.json içindeki blog detay sayfaları dahil edilir.
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SITE = 'https://alaturkavakitler.com'

// Statik rotalar (öncelik + değişim sıklığı). Ayarlar gibi özel sayfalar hariç.
const STATIC_ROUTES = [
  { path: '/', changefreq: 'hourly', priority: '1.0' },
  { path: '/saat', changefreq: 'daily', priority: '0.8' },
  { path: '/vakitler', changefreq: 'daily', priority: '0.8' },
  { path: '/takvim', changefreq: 'daily', priority: '0.7' },
  { path: '/hakkinda', changefreq: 'monthly', priority: '0.5' },
  { path: '/saatuzerine', changefreq: 'weekly', priority: '0.6' },
  { path: '/yenilikler', changefreq: 'weekly', priority: '0.6' },
  { path: '/amentu', changefreq: 'monthly', priority: '0.5' },
]

// İçerik koleksiyonları → /detay/<page>/<id>
const CONTENT_PAGES = ['saatuzerine', 'yenilikler']

function loadContentUrls() {
  const urls = []
  for (const page of CONTENT_PAGES) {
    try {
      const raw = readFileSync(join(ROOT, 'src/content', `${page}.json`), 'utf-8')
      const items = JSON.parse(raw)
      for (const item of items) {
        if (item?.id) {
          urls.push({
            path: `/detay/${page}/${item.id}`,
            changefreq: 'yearly',
            priority: '0.4',
            lastmod: item.date || undefined,
          })
        }
      }
    } catch {
      // koleksiyon dosyası yoksa atla
    }
  }
  return urls
}

const today = new Date().toISOString().slice(0, 10)
const routes = [...STATIC_ROUTES, ...loadContentUrls()]

const body = routes
  .map((r) => {
    const lastmod = r.lastmod || today
    return `  <url>
    <loc>${SITE}${r.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
  })
  .join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`

writeFileSync(join(ROOT, 'public/sitemap.xml'), xml)
console.log(`sitemap.xml üretildi — ${routes.length} URL`)
