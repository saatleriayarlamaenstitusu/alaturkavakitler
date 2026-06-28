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
- Mevcut: Prismic (`@prismicio/client`)
- Hedef: **Directus** (self-hosted, API-first) — geçiş v2'nin orta fazında
- Blog, yenilikler, dini günler, makale içerikleri buradan gelecek

### PWA
- `vite-plugin-pwa` (Workbox tabanlı)
- Service worker: offline desteği, önbellek stratejileri
- LocalStorage: vakitler, ayarlar, şablonlar

### Deployment
- **Vercel** (GitHub Pages'ten geçiş)
- CI: GitHub Actions veya Vercel otomatik deploy

### Analytics & SEO
- Google Analytics 4 (mevcut UA-111583366-3 GA4'e geçirilecek)
- `vue-meta` veya `@unhead/vue` (head/SEO yönetimi)
- JSON-LD: breadcrumb, article, structured data
- Sitemap, robots.txt

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
--font1: 'Inter', sans-serif;
--font2: 'Overpass', sans-serif;
--radius: 12px;
--spacing-unit: 8px;
```

### Vakit renkleri (korunur)
```css
:root[data-vakit="imsak"]  { --primary: #00b7ff; }
:root[data-vakit="gunes"]  { --primary: #ffbd33; }
:root[data-vakit="ogle"]   { --primary: #ffd733; }
:root[data-vakit="ikindi"] { --primary: #ff8c33; }
:root[data-vakit="aksam"]  { --primary: #0491fb; }
:root[data-vakit="yatsi"]  { --primary: #2e3b83; }
```

### Kural
- Her component `<style scoped>` kullanır.
- Global stiller `src/assets/css/` altında.
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

## Bilinen Sorunlar (Mevcut v1'den)

- `100vh` chrome mobil scroll sorunu → `100dvh` ile çözülür
- Dropdown dışına tıklayınca kapanmıyor → `clickOutside` directive eklenecek
- Gece yarısından sonra dünün vakitlerini gösteriyor
- Akşam ezanı geçince günü güncellemesi gerekiyor (saat değişimi)
- Paylaş link sorunu (canonical URL) — düzeltildi ancak test edilecek
- Hicri takvim doğruluğu — lib değişimi araştırılacak
- Şule Gürbüz yazısı render hatası (Prismic RichText)

---

## Ortam Değişkenleri

```
VITE_VAKIT_BASE_URL=
VITE_PRISMIC_REPO=alaturkavakitler
VITE_DIRECTUS_URL=          # Directus geçişi sonrası
VITE_GA_ID=                 # GA4 measurement ID
```

---

## Notlar

- `routes.jsx` (sitemapbuilder için) artık gerekli değil — Vite + Vue Router sitemap plugin ile yönetilir.
- `react-inlinesvg` yerine Vue'da SVG'ler `<component :is>` veya `vite-plugin-svg` ile import edilir.
- `react-select` yerine `vue-select` veya custom component.
- `use-http` yerine `fetch` + composable veya `@tanstack/vue-query`.
- Prismic → Directus geçişi blog içeriklerini migrate etmeyi gerektirir.
