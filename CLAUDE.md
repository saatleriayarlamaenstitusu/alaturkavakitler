# Alaturka Vakitler — v2

## Proje Özeti
Türkiye'ye özel alaturka saat, namaz vakitleri, hicri/rumi takvim PWA uygulaması.
Alaturka saat: son akşam (güneş batımı) ezanından geçen süre.

## Tech Stack

### Core
- **Vue 3** (Composition API, `<script setup>`)
- **Vite** (build tool)
- **Vue Router 4** (SPA routing, history mode)
- **Pinia** (state management, AppContext yerine)
- **Luxon** (tarih/saat hesaplamaları)
- **hijri-date** (hicri takvim — doğruluk kontrolü yapılacak, değişebilir)

### Stil
- **Custom CSS** — Tailwind yok. Sınıf tabanlı CSS, component başına `<style scoped>`.
- CSS custom properties (`--primary`, `--font1` vb.) korunur.
- Vakit bazlı renk teması `data-vakit` attribute + CSS custom property ile çalışır.
- BEM benzeri class isimlendirme.

### CMS / İçerik
- **Karar:** Local Directus (Docker, port 8055) → `scripts/export-content.js` → `src/content/*.json` → git push → Cloudflare otomatik deploy
- Sunucu maliyeti sıfır. Directus sadece içerik girerken açık olur.
- Koleksiyonlar: blog yazıları, yenilikler, dini günler, makaleler

### PWA
- `vite-plugin-pwa` kurulu — `registerType: 'autoUpdate'`, `manifest: false` (public/manifest.json kullanılır)
- Workbox runtime cache: vakitler JSON → `NetworkFirst` 7 gün 5sn timeout; Google Fonts → `CacheFirst` 1 yıl
- LocalStorage: vakitler, ayarlar

### Deployment
- **Cloudflare Pages** — production branch: `v2`, build: `npm install && npm run build`, output: `dist`
- Her `git push origin v2`'de otomatik deploy. `VITE_VAKIT_BASE_URL` Cloudflare dashboard'da env var olarak tanımlı.
- `yarn.lock` repo'da olmamalı — Cloudflare yarn.lock varsa Yarn kullanır, build bozulur.

### Analytics & SEO
- Google Analytics 4 (VITE_GA_ID ile) — henüz eklenmedi
- `@unhead/vue` (head/SEO yönetimi) — henüz eklenmedi
- JSON-LD: WebSite, BreadcrumbList yapısal verisi — henüz eklenmedi
- Sitemap, robots.txt — robots.txt public'te var, sitemap üretimi bekleniyor

---

## Proje Yapısı

```
src/
  main.js
  App.vue
  router/index.js
  stores/
    app.js          — city, vakitler, vakit, currentVakit
    settings.js     — kullanıcı ayarları (localStorage)
  utils/
    vakit.js        — createVakitObj, findVakit, isKerahat
    clock.js        — calculateAlaturka
    hijri.js        — nowHijri, hicri takvim yardımcıları
    rumi.js         — rumi takvim yardımcıları (araştırılacak)
  components/
    nav/
      TopNav.vue
      BottomNav.vue
      DropdownMenu.vue
    clock/
      AlaturkaClock.vue
      AnalogClock.vue     — analog saat (5 tasarım)
    vakit/
      VakitCounter.vue
      VakitList.vue
      VakitRangeView.vue  — timeline görünümü
    calendar/
      CalendarWidget.vue
      HijriCalendar.vue
      GridCalendar.vue
    share/
      ShareButton.vue
      ShareCanvas.vue     — görsel paylaşım (canvas tabanlı)
    ui/
      LoadingPlaceholder.vue
      SeoHead.vue
  pages/
    HomePage.vue
    ClockPage.vue
    PrayerTimesPage.vue
    CalendarPage.vue
    SettingsPage.vue
    AboutPage.vue
    BlogPage.vue
    BlogDetailPage.vue
    AmentuPage.vue
    NotFoundPage.vue
  assets/
    css/
      base.css        — reset, custom props, :root vakit renkleri
      typography.css
    icons/            — SVG'ler (mevcut /public/Icons yapısı korunur)
```

---

## Rotalar

| Path | Sayfa | Durum |
|------|-------|-------|
| `/` | HomePage | ✅ |
| `/saat` | ClockPage | tasarım bekleniyor |
| `/vakitler` | PrayerTimesPage | ✅ |
| `/takvim` | CalendarPage | tasarım bekleniyor |
| `/ayarlar` | SettingsPage | yeni |
| `/hakkinda` | AboutPage | ✅ |
| `/saatuzerine` | BlogPage | ✅ |
| `/yenilikler` | BlogPage | ✅ |
| `/detay/:page/:id` | BlogDetailPage | ✅ |
| `/amentu` | AmentuPage | ✅ |
| `/takvim-olustur` | CalendarCreatorPage | yeni |

---

## Pinia Store Yapısı

### `app.js`
```js
city           // { plate, name } — localStorage
vakitler       // ham JSON (tarih → vakit objeleri) — localStorage
vakit          // createVakitObj(vakitler) çıktısı
currentVakit   // 'imsak' | 'gunes' | 'ogle' | 'ikindi' | 'aksam' | 'yatsi'
loading / error
```

### `settings.js`
```js
primaryClock      // 'alaturka' | 'normal'
secondaryClock    // 'alaturka' | 'normal' | null
clockStyle        // 'digital' | 'analog'
analogDesign      // 1-5
hijriOffset       // hicri takvimi akşam ezanıyla kaydır: boolean
vakitSource       // 'diyanet' | 'turkiye_takvimi'
firstPage         // route path
themePerVakit     // boolean — vakite göre renk değişimi
notificationsEnabled // boolean
darkMode          // 'auto' | 'dark' | 'light'
```

---

## CSS Mimarisi

### CSS Custom Properties (`:root`)
```css
--primary: #ae002e;
--bg: #000;
--gradient-start: var(--primary);   /* açık modda color-mix ile override edilir */
--text: #fff;
--text-muted: rgba(255,255,255,0.5);
--surface: rgb(26 26 26);           /* VakitList, kart arka planları */
--font1: 'Inter', sans-serif;
--font2: 'Overpass', sans-serif;
--radius: 12px;
```

### Tema sistemi
- `html` elementine `data-theme="dark"|"light"` eklenir — `App.vue` içinde `settings.darkMode` izlenerek set edilir.
- Açık mod gradient: `color-mix(in srgb, var(--primary) 18%, var(--bg))` — subtle tint.
- Açık mod vakit renkleri ayrı set (daha koyu/mat tonlar).
- Sistem tercihi: `@media (prefers-color-scheme: light)` + `data-theme` yoksa devreye girer.

### Vakit renkleri — koyu mod (default)
```css
:root[data-vakit="imsak"]  { --primary: #00b7ff; }
:root[data-vakit="gunes"]  { --primary: #ffbd33; }
:root[data-vakit="ogle"]   { --primary: #ffd733; }
:root[data-vakit="ikindi"] { --primary: #ff8c33; }
:root[data-vakit="aksam"]  { --primary: #0491fb; }
:root[data-vakit="yatsi"]  { --primary: #2e3b83; }
```

### SVG / İkon kuralları
- `<img>` ile yüklenen beyaz SVG: `filter: brightness(0) invert(1)` (koyu), `brightness(0)` (açık mod).
- **Renk değiştirilebilir SVG için `<img>` yetersiz** — inline Vue bileşeni gerekir (bkz. `src/components/ui/LogoWide.vue`).
- Inline SVG'de `fill:currentColor` kullan, parent'a `color: var(--primary)` ver.

### Kural
- Her component `<style scoped>` kullanır.
- Global stiller `src/assets/css/` altında; açık mod override'ları `base.css`'te.
- Utility class yok — anlamlı class isimleri.

---

## Kodlama Kuralları

- Vue 3 Composition API, her zaman `<script setup>`.
- `defineProps`, `defineEmits` kullan.
- Composable'lar `src/composables/` altında `use` prefix ile (örn. `useVakitTimer.js`).
- `async/await`, no promise chains.
- Türkçe değişken/comment yok — İngilizce kod, Türkçe kullanıcı metinleri.
- Console.log'lar production'da kaldırılır.
- Her Vue component tek sorumluluk taşır.

---

## Veri Kaynağı

Namaz vakitleri: `VITE_VAKIT_BASE_URL + city.plate + ".json"`

Veri formatı (ham JSON):
```json
{
  "2024-01-15": {
    "imsak": "06:21",
    "gunes": "07:52",
    "ogle": "12:57",
    "ikindi": "15:38",
    "aksam": "17:51",
    "yatsi": "19:15"
  }
}
```

**Scraper notu:** Gün geçişinde dünün verisi kaybolmamalı. Önbellek stratejisi: son 2 gün + önümüzdeki 30 gün lokalda tutulur.

---

## Bilinen Sorunlar

- ~~`100vh` chrome mobil scroll sorunu~~ → `100dvh` ile düzeltildi ✅
- Dropdown dışına tıklayınca kapanmıyor → `clickOutside` directive eklenecek (Faz 2)
- Gece yarısından sonra dünün vakitlerini gösteriyor (Faz 2)
- Akşam ezanı geçince günü güncellemesi gerekiyor (Faz 2)
- Hicri takvim doğruluğu — `hijri-date` lib değişimi araştırılacak

---

## Ortam Değişkenleri

```
VITE_VAKIT_BASE_URL=https://raw.githubusercontent.com/saatleriayarlamaenstitusu/data-diyanet-namaz-vakitleri/main/data/namaz/
VITE_DIRECTUS_URL=          # Directus geçişi sonrası (Faz 7)
VITE_GA_ID=                 # GA4 measurement ID (Faz 2)
```

---

## Mevcut Bileşenler (v2'de tamamlanan)

| Bileşen | Konum | Not |
|---|---|---|
| `LogoWide.vue` | `components/ui/` | Inline SVG, fill:currentColor |
| `AnalogClock.vue` | `components/clock/` | SVG, alaturka vakti, currentColor |
| `AlaturkaClock.vue` | `components/clock/` | Dijital alaturka + normal saat |
| `CalendarWidget.vue` | `components/calendar/` | Hicri+miladi+ay fazı (/Icons/moon/N.svg) |
| `VakitCounter.vue` | `components/vakit/` | Countdown, kerahat badge |
| `VakitList.vue` | `components/vakit/` | 6 vakit yatay liste |
| `VakitRangeView.vue` | `components/vakit/` | Timeline + kırmızı now-line |
| `SettingsPage.vue` | `pages/` | Tema seçici (sistem/açık/koyu) |

## Geliştirme Notları

- `git commit` GPG imzası gerektirir — Claude doğrudan commit atamaz, kullanıcı atar.
- `npm ci` yerine `npm install` kullan (package-lock.json değişiyor).
- Cloudflare Pages'te `yarn.lock` varsa Yarn kullanır — repo'da olmamalı.
- `vite-plugin-pwa` ile `manifest: false` → `public/manifest.json` olduğu gibi kullanılır.
- Ay fazı SVGleri: `/public/Icons/moon/1.svg` → `29.svg` (hicri gün numarasıyla).
- `nowPercent` VakitRangeView'da: `(now - imsak_bugün) / (imsak_yarın - imsak_bugün) * 100`.
- v1 React kodu `_v1/` klasöründe arşivlendi — referans için okunabilir.
