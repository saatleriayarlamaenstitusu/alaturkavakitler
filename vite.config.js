import { defineConfig } from 'vite'
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

export default defineConfig({
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
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'Icons/**/*', 'img/**/*'],
      manifest: false, // public/manifest.json kullan
      workbox: {
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
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
