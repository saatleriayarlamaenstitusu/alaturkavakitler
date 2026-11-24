import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

// Dev'de service worker'ı etkisizleştirir.
// test tünelinde daha önce kurulmuş bir production SW, eski app shell'i
// önbellekten sunup geliştirmeyi kilitliyor. Tarayıcı gezinmede /sw.js'i
// yeniden istediği için bu script devralıp kendini siliyor.
// `apply: 'serve'` → production build'e hiç girmiyor.
function devServiceWorkerKiller() {
  const script = `self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', async () => {
  const keys = await caches.keys()
  await Promise.all(keys.map((k) => caches.delete(k)))
  await self.registration.unregister()
  const clients = await self.clients.matchAll({ type: 'window' })
  clients.forEach((c) => c.navigate(c.url))
})`

  return {
    name: 'dev-service-worker-killer',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/sw.js', (_req, res) => {
        res.setHeader('Content-Type', 'application/javascript')
        res.setHeader('Cache-Control', 'no-store')
        res.end(script)
      })
    },
  }
}


// Geliştirmede /api/kuran'ı ayağa kaldırır.
//
// Vekil bir Cloudflare Pages Function; `vite dev` onu çalıştırmaz ve ayet
// seçici geliştirme sunucusunda sessizce 404 alırdı. Burada FONKSİYONUN
// KENDİSİ içe aktarılıp çağrılır — mantığı ikinci kez yazmak, dev ile
// üretimin sessizce ayrışması demekti.
//
// Cloudflare'in verdiği iki şey taklit edilir: `caches.default` bir Map,
// KV ise hiç verilmez (fonksiyon zaten KV'siz çalışacak şekilde yazıldı,
// yalnızca kalıcı önbelleği olmaz). Anahtar .env'den okunur ve tarayıcıya
// ulaşmaz — adı VITE_ ile başlamadığı için Vite onu pakete de koymaz.
// `apply: 'serve'` → üretim derlemesine hiç girmez.
function devKuranProxy(env) {
  return {
    name: 'dev-kuran-proxy',
    apply: 'serve',
    configureServer(server) {
      const store = new Map()
      globalThis.caches = {
        default: {
          // Cache API her eşleşmede okunabilir yeni bir Response verir.
          match: async (req) => store.get(typeof req === 'string' ? req : req.url)?.clone(),
          put: async (req, res) => store.set(typeof req === 'string' ? req : req.url, res.clone()),
        },
      }

      server.middlewares.use('/api/kuran', async (req, res) => {
        try {
          const { onRequestGet } = await server.ssrLoadModule(
            '/functions/api/kuran/[[path]].js')
          const url = new URL(req.originalUrl ?? req.url, 'http://localhost')
          const path = url.pathname.replace(/^\/api\/kuran\/?/, '').split('/').filter(Boolean)
          const out = await onRequestGet({
            request: new Request(`http://localhost${url.pathname}${url.search}`),
            env: { ACIKKURAN_KEY: env.ACIKKURAN_KEY },
            params: { path },
            waitUntil: (p) => { Promise.resolve(p).catch(() => {}) },
          })
          res.statusCode = out.status
          out.headers.forEach((v, k) => res.setHeader(k, v))
          res.end(await out.text())
        } catch (e) {
          res.statusCode = 500
          res.setHeader('content-type', 'application/json')
          res.end(JSON.stringify({ error: { code: 'dev_proxy', message: String(e) } }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // ACIKKURAN_KEY VITE_ öneki taşımıyor; üçüncü argüman olmadan
  // loadEnv onu okumaz ve dev vekili anahtarsız kalır.
  const env = loadEnv(mode, process.cwd(), '')
  return {
 server: {
    host: true,
    allowedHosts: ['test.alaturkavakitler.com'],
    hmr: {
      clientPort: 443,
      protocol: 'wss',
    },
  },
  plugins: [
    devServiceWorkerKiller(),
    devKuranProxy(env),
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'Icons/**/*', 'img/**/*'],
      manifest: false, // public/manifest.json kullan
      workbox: {
        importScripts: ['/vakit-push-sw.js'],
        navigateFallbackDenylist: [/^\/api\//],
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            // Vakitler JSON verisi — network first, 7 gün cache
            urlPattern: /^https:\/\/raw\.githubusercontent\.com\/.*\.json$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'vakitler-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 },
              networkTimeoutSeconds: 5,
            },
          },
          {
            // Google Fonts
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
