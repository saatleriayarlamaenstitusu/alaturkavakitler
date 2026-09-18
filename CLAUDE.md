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
- **@zumer/snapdom** (DOM → PNG; paylaşım görseli dışa aktarımı, sadece `/gorsel-olustur` chunk'ında)

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
| `/gorsel-olustur` | ShareCreatorPage | ✅ |
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
colorStyle        // 'klasik' | 'pastel' | 'canli' | 'mesh' | 'mono' — renk stili (src/data/colorStyles.js)
homeClock         // 'led' | 'normal' — ana sayfa saat görünümü (LedClock / AlaturkaClock)
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
- `html`'e üç eksen attribute eklenir: `data-theme="dark|light"` × `data-palette="klasik|pastel|canli|mesh|mono"` × `data-vakit`.
- `data-theme` **her zaman explicit** set edilir — `App.vue` `auto` modda `matchMedia` ile sistem tercihini çözüp `light`/`dark` yazar. Bu yüzden CSS'te `@media (prefers-color-scheme)` **kullanılmaz**; sadece default(dark) + `[data-theme="light"]` blokları var.
- `data-palette` `App.vue` içinde `settings.colorStyle` izlenerek set edilir (default `klasik`).
- Açık mod gradient: `color-mix(in srgb, var(--primary) 18%, var(--bg))` — subtle tint.
- `html` arka planı `--gradient-end` değişkeniyle parametrik: klasik 38%, pastel 52%, canlı 65% (vakit rengi ne kadar alan kaplıyor).

### Arayüz aksanı — `--accent-ui`
- Düğme, aktif durum ve odak vurguları `--primary` değil **`--accent-ui`** kullanır. Sebebi: bazı paletlerde `--primary` zeminle çakışıyor — `canli`'de `--bg: var(--primary)` (aksan tamamen kaybolur), `mono` açık modda `--primary` ≈ `--surface`. `--accent-ui` normalde `--primary`'ye eşittir, bu iki durumda okunur bir renge düşer.
- Tuvalin içindeki vakit rengi bundan bağımsızdır (JS'ten `snapshot.primary` olarak gelir).
- **`--surface` her palette mat değildir** (`canli`: `color-mix(... transparent)`). Tuvalin/başka bir şeyin üstüne binen bir yüzey `background: var(--surface)` ile bırakılırsa altındaki görünür. Mat gerekiyorsa `background-color: var(--bg)` + `background-image: linear-gradient(var(--surface), var(--surface))`.

### Renk stilleri (genişletilebilir)
- Stil tanımları `src/data/colorStyles.js` içinde (`COLOR_STYLES` listesi: `id`, `label`, `bg`/`fg` (ayarlardaki önizleme karesinin zemin+yazı rengi), 3 renklik `swatch`). SettingsPage ve App.vue bu listeyi kullanır.
- Ayarlarda stil seçici **yatay kaydırılabilir** kare önizlemeler: kare zemini `bg`, içindeki ad `fg` renginde, alt köşede `swatch` aksan noktaları; aktif stil `--text` ring ile.
- Her stil 6 vakti yeniden renklendirir + kendi yüzeyini (bg/surface/text/gradient) tanımlar; light+dark varyantı var.
- **Yeni stil eklemek:** (1) `colorStyles.js`'e bir obje ekle (`id`, `label`, `bg`, `fg`, `swatch`), (2) `base.css`'e `[data-palette="<id>"]` bloklarını kopyala — koyu base + 6 vakit, açık base + 6 vakit. Başka kod gerekmez (önizleme karesi `bg`/`fg`'den otomatik).
- CSS seçici zinciri (specificity sırası): `[data-palette]` < `[data-palette][data-vakit]` < `[data-palette][data-theme=light]` < `[data-palette][data-theme=light][data-vakit]`.

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
| `ShareCreatorPage.vue` | `pages/` | Görsel oluşturucu (tam ekran editör) |
| `ShareCanvas.vue` | `components/share/` | Gerçek boyutlu tuval + ölçekli önizleme |
| `CanvasLayer.vue` | `components/share/` | Katman sarmalayıcı: sürükle/pinch/döndür |
| `EditorPanel.vue` | `components/share/` | Ekle / arka plan / oran + katman ayarları |
| `widgets/registry.js` | `components/share/` | Widget kayıt tablosu (tek kaynak) |
| `VakitNowWidget.vue` | `components/share/widgets/` | Şu anki + sonraki vakit (liste değil) |
| `LogoWidget.vue` | `components/share/widgets/` | Logo / sembol, inline path, fill:currentColor |
| `DateWidget.vue` | `components/share/widgets/` | Hicri+miladi+etkinlik; kart / sade / dikey minimal |
| `PhraseWidget.vue` | `components/share/widgets/` | Arap harfli hazır ibare (Arapça + Osmanlıca) + Latin alt satır |
| `GridOverlay.vue` | `components/share/` | Swiss ızgara, katmanların altında |
| `GrainOverlay.vue` | `components/share/` | Film grain, arka planın üstünde |

---

## Görsel Oluşturucu (Faz 8)

- Route `/gorsel-olustur`, kebab menüden girilir. `App.vue` bu rotada TopNav/BottomNav'ı gizler.
- **Tuval gerçek çıktı pikselinde yaşar** (genişlik 1080, yükseklik orana göre). Önizleme, tuvali saran katmana `transform: scale()` uygulanarak küçültülür; export her zaman `scale: 1`.
  Sebebi ölçülmüştür: snapdom/html-to-image ile 2x+ raster istendiğinde foreignObject rasterizasyonu katman düşürüyor.
- **Paylaşım widget'ları uygulama bileşenlerinden ayrıdır** (`components/share/widgets/`). Store'a dokunmazlar; tek veri kaynağı kendi `settings` objeleridir.
- **Her değer elle değiştirilebilir.** `defaultProps(snapshot)` sadece katman eklenirken bir kez çalışıp alanları o anki tarih/saatten doldurur; sonrası tamamen kullanıcının. Katman başlığındaki "Sıfırla" değerleri anlık görüntüden yeniden çeker.
- **Boş bırakılan metin alanı render edilmez** — ayrı "göster/gizle" anahtarı yok, metni silmek yeterli.
- **Büyük yazı sınırı (ölçüldü):** çıktı rasterinde ~325px'ten büyük bir harf render edilirse Chrome'un foreignObject rasterizasyonu TÜM katmanı düşürüyor, görsel bomboş çıkıyor. Sınır CSS `font-size` değerine değil, **katman ölçeğiyle çarpılmış nihai boyuta** bağlı (320px sorunsuz, 330px sıfır; 200px'lik yazı `scale: 2` ile de bozuluyor). Düz bir `<div>` ile de tekrarlanıyor, widget'lara özgü değil.
  `shareExport.js` bunu kendi hallediyor: export öncesi en büyük render edilen harf ölçülür, sınırı aşıyorsa küçük rasterle render edilip hedef boyuta büyütülür (çıktı biraz yumuşar ama boş kalmaz). Ayrıca sonuç %5'ten az doluysa bir kez daha küçülterek denenir, o da olmazsa anlaşılır bir hata verilir — sessizce boş PNG indirilmez.
- **SVG kuralı:** paylaşım widget'larında stroke'lu `<line>` / `<path>` KULLANMA — tek bir tanesi bile export'ta tüm katmanı düşürüyor. Dolgulu `<rect>` / `<circle>` sorunsuz (stroke'lu `<rect>`/`<circle>` de sorunsuz).
- Yeni widget eklemek: compact bileşeni yaz + `widgets/registry.js`'e bir satır ekle. Seçici, ayar paneli ve tuval aynı tablodan beslenir.
- Yeni oran eklemek: `src/data/shareRatios.js`'e bir satır.
- Hazır ibareler iki kümede: `src/data/arabicPhrases.js` (Arapça) ve `src/data/ottomanPhrases.js` (Osmanlıca/eski yazı). `src/data/phraseSets.js` ikisini `PHRASE_SETS` altında toplar; widget ayarındaki `source` alanı hangi kümeden besleneceğini söyler. Tek bir `PhraseWidget.vue` her ikisini de render eder.
- Arapça kümesinde `ar` **her zaman harekeli** yazılır; harekesiz gösterim `stripHarakat()` ile türetilir (anahtar geri alınabilir, elle girilen metinde de çalışır). Osmanlıca küme harekesizdir, o widget'ta hareke anahtarı yoktur.
- **Harf aralığı** mutlak değil, tasarımdaki değere eklenen bir kaymadır (`--ls`): `letter-spacing: calc(0.42em + var(--ls, 0em))`. Böylece widget içindeki tracking hiyerarşisi korunur. Arap harfleri bitişik yazıldığı ve letter-spacing bağlantıları kopardığı için Arapça/Osmanlıca widget'larında bu alan sunulmaz (`typographyFieldsNoTracking`).
- **Opaklık katman seviyesindedir** (`layer.opacity`), widget tipinden bağımsız. Yalnızca içerik sarmalayıcısına uygulanır — katmanın tamamına verilseydi yığın bağlamı oluşup seçim tutamakları da soluklaşırdı. Seçim, widget'ın iki satırını da doldurur, sonrası serbest düzenlenebilir (`EditorPanel.updateProp`'taki `preset` dalı).
- **Düzen localStorage'da saklanır** (`shareEditor`): oran, katmanlar, arka plan, grid, marka satırı. Seçim/sürükleme gibi anlık durumlar saklanmaz. Yazma 400ms geciktirilir; fotoğraf data URI'si kotayı aşarsa düzen fotoğrafsız kaydedilir (katmanlar kaybolmaz). Üst çubuktaki **Sıfırla** iki dokunuşla onaylanır ve varsayılan kompozisyonu kurar.
- **Ayar paneli tuvali itmez**, üstüne binen bir alt sayfadır (`position: absolute`). Tuval alanı her zaman panelin KATLANMIŞ yüksekliğine göre ölçülür (`.stage` padding-bottom), böylece panel açılıp kapandıkça tuval ölçeği hiç değişmez. Tutamağa basınca gövde katlanır; katman sürüklenirken (`state.dragging`) kendiliğinden katlanır, bırakınca açılır.
- Katmanların görünmez bir dokunma payı vardır (`.layer::before`, `--k` ile ekran birimine sabitlenmiş ±22px); küçültülmüş widget'lar da parmakla tutulabilir.
- **Gren doku** (`state.grain`) arka planın hemen üstünde, grid ve widget'ların altındadır: fotoğrafa/gradyana doku verir ama metni kumlamaz. Doku kaynağı `base.css`'teki uygulama grain'iyle aynı (`feTurbulence` data URI) — tuval ve uygulama aynı karakterde. `mix-blend-mode` ve SVG filtresi export'ta ölçülerek doğrulandı (komşu piksel farkı 0.25 → 2.73).
- **Grid** katman değil, arka plan gibi tuval durumudur (`state.grid`): kenar boşluğu çerçevesi + sütun/satır ayraçları, tuvalin tamamına yayılır ve widget katmanlarının ALTINDA (z-index 0) durur.
- **Yazı tipleri** `src/data/shareFonts.js`'te tanımlıdır (Google Fonts CSS2 uyumlu); dosyanın başındaki 5 adımlı yorum yeni font eklemeyi anlatır. Latin + Arapça olarak `script` alanıyla gruplanır. Hepsi tek bir `<link>` ile yüklenir (`composables/useShareFonts.js` — 15 aile, ~26kB CSS); font dosyaları yalnızca kullanılan ailelerde iner.
- Font eklerken **kalınlık aralığı (`400..700`) yalnızca variable fontlarda çalışır**; statik fontlarda (örn. Scheherazade New) tek tek yazmak gerekir (`400;500;600;700`), aksi halde Google Fonts tüm isteği 400 ile reddeder ve o `<link>`'teki hiçbir font yüklenmez. Eklemeden önce specleri `fonts.googleapis.com/css2?family=...` ile tek tek doğrula.
- Widget'larda kalınlık tek bir sayı değil: kök `--w` (ana) ve `--w-soft` (ikincil) değişkenlerini verir, alt elemanlar bunlardan okur. Böylece kullanıcı kalınlığı değiştirince tasarımın ağırlık hiyerarşisi birlikte kayar.
- Ayar alanının `options` ve `hidden` değerleri fonksiyon olabilir (`(props) => ...`); EditorPanel bunları o anki props ile çözer. Kalınlık listesi ve italik anahtarının görünürlüğü böyle çalışır.
- **Arka plan** katman değil, tuvalin kendi durumudur: `{ kind: 'palette'|'photo', photo, zoom, x, y, blur, dim }`. Fotoğrafta kadraj (pinch/sürükle) tuvalin üstüne binen `.bg-catcher` yüzeyiyle yapılır; bu yüzey yalnızca Arka plan sekmesi açıkken ve katman seçili değilken vardır (`state.bgEditing`).
- Bulanıklık kenarları saydamlaştırdığı için fotoğraf, blur değeri kadar taşırılıp (`inset: -2×blur`) çerçeve dolu tutulur.

---

## Geliştirme Notları

- `git commit` GPG imzası gerektirir — Claude doğrudan commit atamaz, kullanıcı atar.
- `npm ci` yerine `npm install` kullan (package-lock.json değişiyor).
- Cloudflare Pages'te `yarn.lock` varsa Yarn kullanır — repo'da olmamalı.
- `vite-plugin-pwa` ile `manifest: false` → `public/manifest.json` olduğu gibi kullanılır.
- Ay fazı SVGleri: `/public/Icons/moon/1.svg` → `29.svg` (hicri gün numarasıyla).
- `nowPercent` VakitRangeView'da: `(now - imsak_bugün) / (imsak_yarın - imsak_bugün) * 100`.
- v1 React kodu `_v1/` klasöründe arşivlendi — referans için okunabilir.
