# Alaturka Vakitler — v2

> **Çalışma kuralları `AGENTS.md`dedir** — commit, derleme, yasaklar,
> bir işin ne zaman bittiği ve her iş sonunda doldurulacak günlük.
> Bu dosya kuralları değil **mimariyi ve ölçülmüş kararları** tutar:
> bir şeyin neden böyle olduğu, nelerin denenip bırakıldığı. Kural
> değişecekse `AGENTS.md`ye yazılır, buraya değil.


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
- **@alaturkavakitler/core** — hicri takvim, dinî günler, namaz vakti tablosu,
  alaturka saat, kıble ve şehir listesi. Site ve masaüstü (GTK4/GJS)
  uygulaması AYNI paketi kullanır; kural katmanı burada tek kopyadır.
- **@zumer/snapdom** (DOM → PNG; paylaşım görseli dışa aktarımı, sadece `/gorsel-olustur` chunk'ında)

### Stil
- **Custom CSS** — Tailwind yok. Sınıf tabanlı CSS, component başına `<style scoped>`.
- CSS custom properties (`--primary`, `--font1` vb.) korunur.
- Vakit bazlı renk teması `data-vakit` attribute + CSS custom property ile çalışır.
- BEM benzeri class isimlendirme.

### CMS / İçerik
- **Karar:** Directus yok. İçerik repoda JSON (`src/content/*.json`); düzenleme
  için geliştirmede çalışan bir `/admin` sayfası yazılacak — Vite geliştirme
  sunucusuna eklenen bir uç nokta dosyayı doğrudan diske yazar, commit elle
  atılır. Üretim derlemesinde ne sayfa ne uç nokta bulunur.
- Sunucu, veritabanı, token yok. `git diff` içerik incelemesi yerine geçer.
- Yönetilecekler: yenilikler, saat üzerine yazıları, widget ön tanımları,
  ileride kıraat kesitlerinin künyesi.

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
- JSON-LD yapısal veri — eklendi (aşağıdaki "Yapısal Veri" bölümü)
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
darkMode          // 'auto' | 'dark' | 'light' — varsayılan 'light'
colorStyle        // 'klasik' | 'pastel' | 'canli' | 'mesh' | 'mono' — renk stili (src/data/colorStyles.js); varsayılan 'mesh'
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
- **Arayüzde `--primary`'yi zemin/kenarlık/vurgu olarak KULLANMA.** `canli`'de
  sayfa zeminiyle aynı renge düşüp kayboluyor. Bu hata birden çok yerde
  tekrarlandı ve tek tek temizlendi: bugünün takvim hücresi, vakit rozeti,
  liste noktası, alt gezinme vurgusu, menüde aktif satır, hakkında bağlantıları,
  şehir seçicinin odak kenarlığı, kıble kadranı. Yeni vurgu eklerken
  `--accent-ui` kullan ve `canli` paletinde gözle doğrula.
- İstisna: bir rengin kendisi *içerik* ise `--primary` doğrudur — örn.
  `VakitRangeView`'daki zaman şeridi bantları vakit rengini temsil eder ve
  koyu bir panelin üstünde durduğu için `canli`'de de okunur.
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

### Masaüstü düzeni
- Uygulama mobil için tasarlandı; masaüstü kuralları `src/assets/css/desktop.css`
  ve ilgili bileşenlerin scoped bloklarındadır. **Mobil düzene dokunulmaz** —
  her masaüstü kuralı bir `@media (min-width: …)` içinde durur.
- **İki eşik var.** `900px`: masaüstü — gezinme sola bir raya geçer,
  içerik ortalanır, üst çubuk aynı kolona hizalanır ve bileşenler
  masaüstü ölçülerine büyür. `1240px`: iki kolon — ana sayfa, saat,
  vakitler ve takvim yatay düzene geçer.
- Eşik neden 1024 değil 1240: sol ray ~216px yiyor. 1024'te içeriğe
  ~790px kalıyor ve orada iki kolona bölününce vakit listesinin saatleri
  birbirine giriyordu (ölçüldü). Görsel oluşturucunun rayı yok (kendi tam
  ekran kabuğu), onun eşiği 1024'te kaldı.
- **Alt gezinme masaüstünde sol raydır** (`BottomNav.vue`in 900px bloğu):
  ikonların yanında adları yazar. Alt çubuk parmağın ulaştığı yerdir;
  farede ekranın dibi en uzak nokta ve 1400px boyunca dört ikon
  kayboluyordu. Aktif satırın işareti de değişir: alt çubuktaki parıltı
  ve nokta ekranın DİBİNE göre konumlanmış üç pseudo-elemandır, dikey
  rayda hepsi yanlış yerde durur; yerine solda aksan çubuğu + hafif zemin.
- **Masaüstünde üst çubuk tamamen kalkar**, üç parçası da raya taşınır:
  logo rayın tepesinde, üç nokta menüsünün satırları ortadaki ikincil
  bölümde, şehir seçici dibinde. İçerik o 5.5rem'i kazanır; tepeye
  yapışmasın diye `.app-content`e masaüstünde bir pay verilir.
- İkincil satırlar birincillerle AYNI kalıbı kullanır (ikon + etiket,
  aynı yükseklik, aynı vurgu). Önce yalnızca metindiler ve ray iki ayrı
  listeden toplanmış gibi duruyordu; ayrımı ince bir çizgi ile etiket
  ağırlığı taşır, yapı değil.
- İkonları `nav/NavIcon.vue`te, dört ana ikonun diliyle: 24'lük ızgara,
  DOLGU (kontur yok), arkada %35 opak gövde + önünde tam opak ayrıntı.
  Kontur tabanlı bir set (bkz. `share/SectionIcon.vue`) yan yana gelince
  iki ayrı uygulamadan toplanmış gibi duruyor. Ana dördü dosyadan gelen
  `<img>` olarak kalır (beyaz SVG + filtre), yenileri satır içi SVG —
  renklerini `currentColor`dan alıyorlar.
- Liste tek kaynaktan gelir: `src/data/secondaryNav.js` (yol, etiket,
  ikon, `action`) — hem mobildeki menü hem ray onu okur, yeni satır bir
  yere eklenip diğerinde unutulmasın. Şehir seçici de tek bileşendir
  (`nav/CitySelect.vue`), iki yerde ayrı `select` yazılmaz.
- DOM sırası değişmez (gezinme en sonda, mobildeki gibi); ray yalnızca
  `order: -1` ile görsel olarak öne alınır. `.app`in satıra dönmesi ve
  `.app-content`in tepe payı App.vue'nun KENDİ scoped bloğundadır —
  `desktop.css`ten yazılan `.app` kuralı, bileşenin `.app[data-v-…]`
  kuralını özgüllükte yenemiyor (dosyanın başındaki uyarının ta kendisi).
- O blok App.vue'nun stil bloğunun SONUNDA durur: `.app-content`in
  `padding` KISALTMASI yukarıda ve aynı özgüllükte; medya sorgusu önce
  gelseydi kaynak sırası kısaltmayı kazandırır, `padding-top` sessizce
  sıfırlanırdı (ölçüldü: hesaplanan değer 0px).
- Rayın tepesindeki logo mobildekinden büyüktür (140px → 168px). Ölçü
  CSS'ten değil `LogoMotion`un `width` prop'undan gelir: bileşen
  genişliği `--size` olarak satır içi stilde yazıyor, stil sayfası onu
  `!important` olmadan ezemez. Mobildeki ve raydaki logo iki AYRI
  örnektir (biri üst çubukta, biri rayda; karşı eşikte gizli).
- Ölçü tek bir değişkenden sürülür: `--shell` (880px, okunan sayfalar) ve
  `--shell-wide` (1200px, iki kolona bölünenler). Kabuk `--shell-now`'u
  okur; `App.vue` geniş rotalarda `.app`'e `wide` sınıfı verir ve
  `--shell-now` değişir. Rota bilgisi CSS'e böyle taşınır — içerik, üst
  çubuk ve alt gezinme birlikte genişlesin diye (biri 880, diğeri 1200
  olunca logo içerikten 160px kayıyordu).
- **Sayfa düzenleri bileşenin kendi scoped bloğunda** yazılır, global
  dosyada değil: scoped seçiciler (`[data-v-…]`) özgüllük yarışı
  çıkarıyor. Global dosya yalnızca kabuğu kurar.
- Gerilen mobil düzenin iki ölçülmüş yan etkisi vardı: takvim hücreleri
  kareliğini sütun genişliğinden aldığı için (`aspect-ratio: 1`) 880px
  yediye bölününce 127px'lik daireler çıkıyordu; zaman şeridi 75px sabit
  yükseklikte olduğundan sayfanın alt yarısı boş kalıyordu. İkisi de
  masaüstüne özel sınırlarla çözüldü (`VakitRangeView` boyunu `--range-h`
  değişkeninden alır).
- **Ölçüler masaüstünde büyür.** Bileşenlerin mobil ölçüleri (9px etiket,
  14px saat, 3rem sayaç) 1200px'lik kabukta okunmaz kalıyordu; her bileşen
  kendi scoped bloğunda bir masaüstü ölçeği taşır (`VakitList`,
  `VakitCounter`, `CalendarWidget`, `LedClock`, `VakitRangeView` ve
  `HijriMonthCalendar`in seçili gün bloğu — sol kolonun tamamı onundur,
  yanındaki ızgara kadar ağırlık taşır). Kaza
  bandı listeyle aynı flex yapısını paylaştığı için ölçek büyüdüğünde
  hizası kendiliğinden korunur.
- Dar masaüstünde (1024px) sabit büyük ölçüler taşıyor: sayaç ve uzun ay
  adları `clamp()` ile akışkan. Sayaç sabit 5.25rem iken pusula alt satıra
  düşüyordu.
- **Sayfa dikeyde de dolar.** Ana sayfada ızgara `align-content: center`
  (başlık yok, kompozisyon ortalanır). Vakitlerde satırlar
  `auto 1fr auto`: başlık üstte, sayaç ve liste yan yana ortada, zaman
  şeridi sayfanın dibinde. Yukarı yaslandığında 1080p'de sayfanın alt
  yarısı boş kalıyordu.
- Zaman şeridi masaüstünde **yatay** durur, iki kolonu birden kaplar.
  Sağ kolonda tek başına dikine uzatmak denendi: kolonun boyunu
  dolduruyor ama bir gün çizelgesinden çok dolu bir sütuna benziyor.
  Bandın üstündeki etiket payı ayrı bir değişkendir (`--range-gap`),
  yoksa bant uzadıkça boşluk da aynı oranda uzuyordu. Vakit ayraçları da
  öyle: çizgi bandın boyuna ORANLA uzuyor (`height: 130%`), mobilde 22px
  olan pay 180px'lik bantta 60px'e çıkıp döndürülmüş vakit adlarının
  ortasından geçiyordu — masaüstünde sabit bir paya çekildi ve etiket
  çizginin sağına kaydırıldı (`rotate(270deg)` + `transform-origin: 0 0`
  metin kutusunu satır yüksekliği kadar SAĞA taşırır).
- Yazı listeleri (`saat üzerine`, `yenilikler`) 900px'ten sonra kart
  ızgarasına geçer. Kart zemini mat kurulur (`--bg` + `--surface`
  gradyanı); doğrudan `--surface` verilseydi `canli` paletinde altındaki
  sayfa gradyanı kartın içinden görünürdü.
- Bir ızgara öğesi iki satırı birden kaplıyor ve her ikisinden uzunsa,
  artan yükseklik diğer kolonun satırlarına dağılır: blokların alt
  çizgileri içeriklerinden yüzlerce piksel aşağıda kalıyordu. Kolon
  içeriklerine açık `align-self` ver.
- Saat sayfası da geniş rotalardandır (`WIDE_ROUTES`): kadran solda,
  okunan saat sağda, tarihler altta tam genişlikte.
- Boşluk doldurulmaz: zemin gradyanı ve hat filigranı zaten oradadır.

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
- ~~Hicri takvim doğruluğu — `hijri-date` lib değişimi araştırılacak~~ → `hijri-date` kaldırıldı, Diyanet ay başlangıçları tablosuna geçildi ✅

---

## Ortam Değişkenleri

```
VITE_VAKIT_BASE_URL=https://raw.githubusercontent.com/saatleriayarlamaenstitusu/data-diyanet-namaz-vakitleri/main/data/namaz/
VITE_GA_ID=                 # GA4 measurement ID (Faz 2)
VITE_MUSHAF_FONT_BASE=https://cdn.alaturkavakitler.com/mushaf   # boşsa static.qurancdn.com
VITE_AUDIO_MIRROR_BASE=https://cdn.alaturkavakitler.com/ses     # boşsa yedek yol yok
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
| `MonthCalendarWidget.vue` | `components/share/widgets/` | Aylık takvim; hicri/miladi, çift takvim, 3 ayrı font |
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
- **Ön tanımlar `src/data/widgetPresets.js`'te**, widget kimliğine göre
  anahtarlanır; `registry.js` onları `presetsFor(id)` ile bağlar. Ayırmanın
  sebebi: ön tanımlar sık düzenlenir, widget tanımı seyrek değişir. Dosyanın
  başındaki yorum ekleme yordamını ve tuzakları anlatıyor.
- Geliştirmede katman başlığında **"Preset"** düğmesi (Ctrl/Cmd + Shift + C)
  o katmanın biçim alanlarını hazır bir `preset(...)` satırı olarak panoya
  yazar. Biçim süzgeci iki ölçüte bakar: alan 'icerik' grubunda olmamalı VE
  tipi içerik taşıyan tiplerden (text/textarea/date/phrase/stepper) olmamalı —
  takvimin ay başlığı metni 'baslik' grubunda duruyor ama yine de içeriktir.
- **Ön tanımlar (preset)**: her widget `presets` listesi taşıyabilir. Bir ön
  tanım YALNIZCA biçim taşır (yazı tipi, kalınlık, ölçü, hizalama, düzen);
  içerik alanlarına dokunmaz — girdiğin metni/tarihi silmemeli. Uygulanınca
  `__preset` yazılır ve şeritte işaretlenir; elle bir ayara dokunulduğunda
  işaret düşer (görünüm artık o ön tanım değildir). Preset bir font
  değiştiriyorsa kalınlık `nearestWeight` ile o fontta bulunan değere çekilir.
- **Renk alanı kapalı başlar**: tek kutu + okunur ad (`Vakit rengi`,
  `Soluk ton`, `#RRGGBB`); dokununca palet açılır, seçince kapanır. Önceden
  her renk alanı 14 kutucuk basıyordu ve panel yatayda taşıyordu.
- Sürgü birimi `'%'` 0..1 KESİRLER içindir (opaklık, karartma) ve 100 ile
  çarpar; zaten yüzde olan değerlerde `'pct'` kullan. Köşe yuvarlaklığı
  `'%'` ile `1400%` okunuyordu.
- **Ayar alanları gruplu**: her alanın bir `group` değeri vardır (`FIELD_GROUPS`: içerik / tipografi / boyut / görünüm). Widget kendi `groups` listesini verebilir — takvimde ayarlar metin katmanına göre ayrılır (Takvim / Ay başlığı / Gün adları / Gün sayıları / Görünüm). EditorPanel boş grubu çizmez; yeni alan eklerken `group` vermeyi unutma (yoksa 'görünüm'e düşer).
- Grup başlıkları **katlanabilir** (uzun listelerde gerekiyor); kapalıyken kaç ayar olduğu sağda görünür. Kapalı gruplar widget tipi bazında hatırlanır.
- **Hizalama (snap)**: katman taşınırken `src/utils/snap.js` tuval kenar/merkezi, grid kenar boşluğu ve diğer katmanların kenar/merkezlerine yapıştırır. Eşik ekran pikselinde tanımlıdır (7px), tuval birimine çevrilirken `viewScale`'e bölünür — yakınlaştırmadan bağımsız aynı his. Kılavuz çizgiler `state.guides`'ta tutulur, yalnızca sürükleme sırasında çizilir. Katman başlığındaki **Hizala** düğmesiyle kapatılabilir (`state.snap`, kalıcı) — kapalıyken hedefler hiç toplanmaz.
- **Renk seçici** üç kümeden oluşur: alanın sabit renkleri, arka plan fotoğrafından çıkarılan palet (`src/utils/palette.js`, 64×64'e indirgeyip 4-bit kuantalama) ve kullanıcının eklediği renkler (`state.customColors`, kalıcı; sağ tık ile silinir). "+" karesi sistem renk seçicisini açar ve şerit taşsa da sağa yapışık kalır.
- `palette.js`'te `img.decode()` KULLANMA — belgeye eklenmemiş `Image` + data URI bileşiminde hiç çözülmüyor (ölçüldü). `onload` ile yükle.
- Editör arayüzü Swiss düzendedir: etiketler tek kolonda hizalı (`--label-col`), dolgu yerine ince çizgi, dik açı, küçük-büyük harf + geniş harf aralığıyla mikro tipografi. Sürgülerin yanında sayısal okuma vardır (`field.unit`: `px` | `em` | `%` | `×`).
- Hazır ibareler iki kümede: `src/data/arabicPhrases.js` (Arapça) ve `src/data/ottomanPhrases.js` (Osmanlıca/eski yazı). `src/data/phraseSets.js` ikisini `PHRASE_SETS` altında toplar; widget ayarındaki `source` alanı hangi kümeden besleneceğini söyler. Tek bir `PhraseWidget.vue` her ikisini de render eder.
- Arapça kümesinde `ar` **her zaman harekeli** yazılır; harekesiz gösterim `stripHarakat()` ile türetilir (anahtar geri alınabilir, elle girilen metinde de çalışır). Osmanlıca küme harekesizdir, o widget'ta hareke anahtarı yoktur.
- **Harf aralığı** mutlak değil, tasarımdaki değere eklenen bir kaymadır (`--ls`): `letter-spacing: calc(0.42em + var(--ls, 0em))`. Böylece widget içindeki tracking hiyerarşisi korunur. Arap harfleri bitişik yazıldığı ve letter-spacing bağlantıları kopardığı için Arapça/Osmanlıca widget'larında bu alan sunulmaz (`typographyFieldsNoTracking`).
- **Opaklık katman seviyesindedir** (`layer.opacity`), widget tipinden bağımsız. Yalnızca içerik sarmalayıcısına uygulanır — katmanın tamamına verilseydi yığın bağlamı oluşup seçim tutamakları da soluklaşırdı. Seçim, widget'ın iki satırını da doldurur, sonrası serbest düzenlenebilir (`EditorPanel.updateProp`'taki `preset` dalı).
- **Düzen localStorage'da saklanır** (`shareEditor`): oran, katmanlar, arka plan, grid, marka satırı. Seçim/sürükleme gibi anlık durumlar saklanmaz. Yazma 400ms geciktirilir; fotoğraf data URI'si kotayı aşarsa düzen fotoğrafsız kaydedilir (katmanlar kaybolmaz). Üst çubuktaki **Sıfırla** iki dokunuşla onaylanır ve varsayılan kompozisyonu kurar.
- **Bölüm başlıkları panelin omurgasıdır.** 9px'lik soluk satırlar ayarların
  arasında kaybolup bölümün nerede başladığını belirsizleştiriyordu: başlık
  13px, tam kontrast, yanında çizgi ikon ve sağa uzanan hairline. İkonlar
  `SectionIcon.vue`'da grup kimliğine göre haritalanır (tek kontur, dolgu
  yok); yeni bir grup eklenince ikon haritasına da bir satır ekle —
  eklenmezse genel bir kare çizilir, panel ikonsuz kalmaz.
- **Masaüstünde yatay kaydırma YOK.** Yazı tipi (70 aile), hazır ibare ve
  renk şeritleri parmakla kaydırmak için tasarlandı; farede tekerlek dikey
  kaydırır ve şeridin sonundaki öğelerin varlığı fark edilmiyordu. İnce bir
  yatay çubuk denendi ve bırakıldı (6px'lik hedef). Yan sütunda genişlik dar
  ama boy serbest: şeritler sarılır, kutu gerekirse kendi içinde DİKEY kayar
  ve çerçevelenir — çerçeve olmadan alttaki yarım satır kırpılmış gibi
  duruyor, kaydırılacak alan olduğu okunmuyor.
- `scrollIntoView` KULLANMA: seçili yazı tipini göstermek için çağrıldığında
  üstteki bütün kaydırma kutularını da kaydırıyor, ayar listesi tipografi
  grubunun ortasından açılıyordu. Yalnızca şeridin kendi `scrollTop`/
  `scrollLeft` değeri kurulur.
- Segment (`select`) seçenekleri sarar: dört seçenekli zemin dolgusunda
  sonuncusu `overflow: hidden` ile kırpılıyor, var olduğu belli olmuyordu.
- **Masaüstünde (≥1024px) panel alt sayfa değil yan sütundur**: akışa girer,
  tam boy olur ve kendi içinde kayar. Tutamak ve katlanma gizlenir — ikisi de
  panelin tuvali örtmesinden doğan davranışlar, yan sütunda örtmüyor. İç
  kaydırma kutuları (`.fields`, `.bg-tab`) serbest bırakılır, yoksa tek
  sayfada üç ayrı kaydırma alanı oluyor.
- **Önizleme ölçeği orana da bağlıdır.** `ShareCanvas.measure()` hem çerçeveyi
  hem oranı okur ama yalnızca `ResizeObserver` tetikliyordu; oran değişince
  çerçevenin boyu değişmediği için eski ölçek olduğu gibi kalıyordu. Kare →
  story geçişinde tuval çerçeveyi taşıp kırpılıyor (ölçüldü: 803px'lik
  çerçevede 1427px'lik tuval), ters yönde gereğinden küçük kalıyordu.
  `watch(ratio, measure)` ile çözüldü — yeni bir oran alanı eklerken bu
  bağımlılığı unutma.
- **Tuvalin nefes payı dolguyla değil kenar boşluğuyla verilir.** Ölçek
  `.canvas-frame`in DIŞ ölçüsünden hesaplanıyor (`getBoundingClientRect`),
  dolgu eklenince tuval o kadar taşıp kırpılıyor (ölçüldü: 1.5rem dolgu
  tuvalin altını kesti).
- Tam ekran editör kabuğun ortalama kuralının dışındadır
  (`.app-content > .creator { max-width: none }`): `position: fixed` olmasına
  rağmen `max-width` uygulanıyor ve editör 880px'lik bir kutuya hapsoluyordu.
- **Ayar paneli tuvali itmez**, üstüne binen bir alt sayfadır (`position: absolute`). Tuval alanı her zaman panelin KATLANMIŞ yüksekliğine göre ölçülür (`.stage` padding-bottom), böylece panel açılıp kapandıkça tuval ölçeği hiç değişmez. Tutamağa basınca gövde katlanır; katman sürüklenirken (`state.dragging`) kendiliğinden katlanır, bırakınca açılır.
- Katmanların görünmez bir dokunma payı vardır (`.layer::before`, `--k` ile ekran birimine sabitlenmiş ±22px); küçültülmüş widget'lar da parmakla tutulabilir.
- **Gren doku** (`state.grain`) arka planın hemen üstünde, grid ve widget'ların altındadır: fotoğrafa/gradyana doku verir ama metni kumlamaz. Doku kaynağı `base.css`'teki uygulama grain'iyle aynı (`feTurbulence` data URI) — tuval ve uygulama aynı karakterde. `mix-blend-mode` ve SVG filtresi export'ta ölçülerek doğrulandı (komşu piksel farkı 0.25 → 2.73).
- **Aylık takvim** ızgarası `src/utils/calendarGrid.js`'te: `monthGrid(system, year, month)` birincil takvimin günlerini, `alt` alanında diğer takvimin karşılığını verir. Hicri ay uzunluğu (29/30) 30. günün taşıp taşmadığına bakılarak bulunur; `new globalThis.HijriDate(y, m, 1).toGregorian()` ayın ilk gününü verir. Takvim türü değişince `convertMonth()` görüntülenen ayı diğer takvime çevirir (2026 hicri yıl değil).
- Takvim widget'ında tek bir `font` yok: başlık / gün adı / gün sayısı ayrı `*Font` + `*Weight` + `*Size` alanları taşır. Hücre yüksekliği sayı boyutuna bağlıdır (`rowHeight` çarpanı) — sabit kare hücre, sayı küçülünce ölü boşluk bırakıyordu.
- Takvimde **gün zemini** hücrenin tamamını değil ortasındaki kare kutuyu boyar; hücre genişliği sütuna göre değiştiğinden tamamı boyansa daire elips olurdu. `dayRadius` 0 = kare, 50 = daire.
- **Tek satır düzeni** (`layout: 'row'`) öndeki boşlukları atar ve gün adını her hücrenin kendi üstüne koyar. 31 gün yan yana sığsın diye düzen değişiminde ölçüler sütun genişliğine göre yeniden hesaplanır; ızgaradaki değerler `gridSizes`'ta saklanıp geri dönüldüğünde aynen verilir.
- Hafta sonu günün **kendi tarihinden** bulunur (`cell.iso`), dizi sırasından değil — tek satırda öndeki boşluklar atıldığı için sıra sütuna karşılık gelmiyor.
- Bugün hafta sonuna denk gelebilir: gün zemini açıkken vurguyu zemin taşır, yazı varsayılan renginde kalır (ikisi de aksan rengi olunca sayı görünmez oluyordu).
- **Grid** katman değil, arka plan gibi tuval durumudur (`state.grid`): kenar boşluğu çerçevesi + sütun/satır ayraçları, tuvalin tamamına yayılır ve widget katmanlarının ALTINDA (z-index 0) durur.
- **Yazı tipleri** `src/data/shareFonts.js`'te tanımlıdır (Google Fonts CSS2 uyumlu); dosyanın başındaki 6 adımlı yorum yeni font eklemeyi anlatır. 70 aile, `group` alanıyla 5 sekmeye ayrılır: sans / serif / display / script / arabic (`FONT_GROUPS`).
- **Fontlar grup grup, tembel yüklenir** (`composables/useShareFonts.js`). Hepsi birden ~96kB CSS eder, o yüzden açılışta yalnızca *kullanımdaki* fontların grubu (`ensureFontsFor`), sonra seçicide açılan sekmenin grubu (`ensureFontGroup`) indirilir. Font dosyaları zaten yalnızca gerçekten uygulanan ailelerde iner. Liste uzadıkça sayfa açılışı ağırlaşmaz.
- **COLRv1 (renkli) fontlar**: harfler fontun kendi renkleriyle çizilir, CSS `color` yok sayılır (Aref Ruqaa Ink böyle — çift renkli mürekkep; export'ta da korunuyor, ölçüldü). Font tanımında `colorFont: true` işaretlenir; `isColorFont()` ile o widget'ın metin rengi ayarı gizlenir (`textColorField`), çünkü çalışmayan bir ayarı göstermek yanıltıcı.
- Font eklerken **kalınlık aralığı (`400..700`) yalnızca variable fontlarda çalışır**; statik fontlarda (örn. Scheherazade New) tek tek yazmak gerekir (`400;500;600;700`), aksi halde Google Fonts tüm isteği 400 ile reddeder ve o `<link>`'teki hiçbir font yüklenmez. Eklemeden önce specleri `fonts.googleapis.com/css2?family=...` ile tek tek doğrula.
- Widget'larda kalınlık tek bir sayı değil: kök `--w` (ana) ve `--w-soft` (ikincil) değişkenlerini verir, alt elemanlar bunlardan okur. Böylece kullanıcı kalınlığı değiştirince tasarımın ağırlık hiyerarşisi birlikte kayar.
- Ayar alanının `options` ve `hidden` değerleri fonksiyon olabilir (`(props) => ...`); EditorPanel bunları o anki props ile çözer. Kalınlık listesi ve italik anahtarının görünürlüğü böyle çalışır.
- **Zemin dolgusu** (`background.fill`) fotoğraf yokken tuvali boyar:
  `vakit` (tabandan yükselen vakit rengi — açılış görünümü), `duz`, `gradyan`,
  `mesh`. Renkler `'auto'` ise o anki vakit rengine (`snapshot.primary`) çözülür;
  böylece varsayılan görünüm vakitle değişmeye devam eder. CSS `.bg-palette`
  kuralı değil, `ShareCanvas`'taki `fillStyle` computed'ı çizer — ayarlar
  JS'ten geldiği için sabit bir CSS gradyanı yetmiyordu. Satır içi stil olduğu
  için snapdom klonuna aynen taşınıyor (dışa aktarımda ölçüldü).
- **Karıştırma (`blend`) her katmanda var**: widget tipine değil, katmanın
  tuvale nasıl oturduğuna ait bir ayar. Bu yüzden widget tanımlarına tek tek
  yazılmaz, `registry.js`'te `SHARE_WIDGETS` kurulurken hepsine eklenir
  (`blendField` + `defaultProps`'a `blend: 'normal'`) — yeni bir widget
  kendiliğinden kazanır. Mod listesi `BLEND_MODES`.
- Karıştırma widget'ın İÇİNDE değil `CanvasLayer`'da `.layer` elemanına
  uygulanır: `.layer` dönüşüm taşıdığı için yığın bağlamı açar ve içeride
  verilen bir `mix-blend-mode` yalnızca o katmanın içinde karışır, tuvale hiç
  ulaşmaz. Dışa aktarımda korunuyor (difference/multiply ile indirilen PNG'den
  piksel örneklenerek ölçüldü).
- **Seçim arayüzü katmanın İÇİNDE duramaz**: karıştırma katmanın tamamına
  uygulandığı için çerçeve ve tutamaklar da karışır, 'fark' modunda renk
  değiştirip okunmaz hâle gelirlerdi. Bu yüzden `.chrome` kardeş bir kutudur;
  katmanın kutusu `ResizeObserver` ile ölçülüp aynı dönüşümle taklit edilir.
  Kardeş kutuda `.layer` sınıfı YOK — `measureOthers()` hizalama hedeflerini
  `.layer` seçicisiyle topluyor, olsaydı katman kendi çerçevesine yapışırdı.
- **Görsel widget'ı** (`ImageWidget.vue`) kullanıcının kendi görselini katman
  olarak koyar; karıştırmanın asıl müşterisi odur (doku/desen bindirmeleri).
- Görsel data URI olarak saklanır; harici URL'e güvenilemez (düzen
  localStorage'da duruyor, export aynı belgeden rasterize ediliyor). İki yan
  etkisi var ve ikisi de ele alındı: kayıt kotası aşılırsa önce arka plan
  fotoğrafı, sonra katman görselleri düşürülerek saklanır (düzenin kendisi
  korunur); geri al yığınında ise JSON kopyası her adımda yeni bir dize
  üretmesin diye `src` aynı dizeye işaret ettirilir.
- **Arka plan** katman değil, tuvalin kendi durumudur: `{ kind: 'palette'|'photo', photo, zoom, x, y, blur, dim }`. Fotoğrafta kadraj (pinch/sürükle) tuvalin üstüne binen `.bg-catcher` yüzeyiyle yapılır; bu yüzey yalnızca Arka plan sekmesi açıkken ve katman seçili değilken vardır (`state.bgEditing`).
- Bulanıklık kenarları saydamlaştırdığı için fotoğraf, blur değeri kadar taşırılıp (`inset: -2×blur`) çerçeve dolu tutulur.

---

## Derin Bağlantılar (SPA yönlendirmesi)

- Uygulama history modunda çalışıyor; `/kuran`, `/vakitler` gibi
  yollar sunucuda DOSYA DEĞİL. Cloudflare Pages'te bunu
  `public/_redirects` çözüyor: `/*  /index.html  200`.
- **`public/404.html` SİLİNDİ ve geri eklenmemeli.** v1'den kalan
  GitHub Pages hilesiydi (`spa-github-pages`): yolu sorgu dizesine
  çevirip `/?/kuran&a=4:58` adresine yönlendiriyor, ama onu geri
  çözecek betik `index.html`de yok. Ölçüldü: canlıda `/kuran`,
  `/vakitler`, `/takvim`, `/hakkinda` — hepsi **404** dönüyor ve
  ana sayfaya düşüyordu, yani paylaşılan her derin bağlantı
  kırıktı. Pages, çıktıda bir `404.html` varsa onu `_redirects`
  kuralından önce servis ediyor.
- Yeni bir derin bağlantı eklerken kontrol: `curl -o /dev/null -w
  "%{http_code}" https://alaturkavakitler.com/<yol>` → 200 olmalı.

## Yapısal Veri (JSON-LD)

- **Site geneli graf `index.html`de STATİKTİR**: Organization + WebSite +
  WebApplication, tek bir `@graph` içinde. Uygulama tek sayfa ve SSR yok;
  betiği çalıştırmayan tarayıcılar yalnızca burayı görür.
- `sameAs` resmî hesapların listesidir (Twitter, Instagram, YouTube,
  GitHub) — arama motorları markayı hesaplarla bu alandan eşleştirir.
  Hakkında sayfasındaki bağlantılarla aynı kalmalı; biri değişirse ikisi
  birden değişir.
- **Sayfa bazlı veri kurumu/siteyi yeniden TARİF ETMEZ**, `@id` ile ona
  bağlanır (`SEO_SITE.orgId`, `SEO_SITE.siteId`). Aynı varlık iki kez
  tarif edilirse ayrı varlıklar sayılabilir.
- Sayfa bazlı bloklar `useSeo({ jsonLd })` ile çalışma anında eklenir ve
  `data-seo-jsonld` işaretini taşır; rota değişince yalnızca o işaretli
  olanlar silinir, statik graf yerinde kalır.
- Kırıntı yolu tek yerden üretilir: `seoBreadcrumb([{ name, path }])` —
  ana sayfa basamağını kendisi ekler. Hangi sayfada ne var: ana sayfa
  WebPage; saat/vakitler/takvim/hakkında/amentü BreadcrumbList; yazı
  listeleri BreadcrumbList + ItemList; yazı detayı Article +
  BreadcrumbList.
- Kontrol: sayfayı açıp `document.querySelectorAll('script[type="application/ld+json"]')`
  çıktısına bak — bir statik graf + sayfanın kendi blokları olmalı,
  tekrar eden `@type` olmamalı.

## Kıble Pusulası

- `qiblaBearing` (core) büyük daire yönünü hesaplar (Kâbe 21.4225°N, 39.8252°E).
  Düz haritadaki "Mekke'ye doğru" sezgisi yanlıştır; Türkiye'den kıble
  güneydoğu değil güney-güneydoğudur (İstanbul ~152°, Diyarbakır ~181°).
  Formül iki bağımsız türevle (genel başlangıç yönü ↔ özelleşmiş hâli)
  karşılaştırılıp doğrulandı.
- Konum iki kaynaktan gelir: core'un `CITIES` tablosu (81 il merkezi, plaka
  anahtarlı) ya da kullanıcı isterse cihaz GPS'i. GPS varsa o kullanılır.
- Cihaz pusulası isteğe bağlı: `deviceorientationabsolute` varsa kadran döner
  ve iğne gerçek kıbleyi gösterir. iOS 13+ `DeviceOrientationEvent.requestPermission()`
  ister ve bu yalnızca kullanıcı hareketiyle çağrılabilir — tek düğme hem
  pusula iznini hem konumu ister. Pusula yoksa kadran kuzey yukarıda sabit
  kalır ve açı değeri okunur bilgi olarak durur.
- `alpha` saat yönünün TERSİNE artar, iOS'un `webkitCompassHeading`'i ise
  doğrudan pusula yönüdür — ikisi aynı şekilde ele alınırsa iğne ters döner.
- Dinleyiciler **açılışta** bağlanır (izin gerekmiyorsa yön çoktan gelmiş olur).
  "requestPermission varsa iOS'tur" ayrımı yapma — o alan bazı ortamlarda iOS
  dışında da tanımlı, erken dinleme hiç devreye girmiyordu.
- Pusula ve konum izni AYNI ANDA istenmez: izin kutusu açıkken sayfa askıya
  alınabiliyor ve yön zaman aşımı yanlışlıkla "pusula yok" diye hüküm veriyordu.
  Önce pusula (jest gerektirir), konum kısa bir gecikmeyle.
- Kadran renkleri `--primary` değil **`--accent-ui`** kullanır; halka/çentik
  `--text` üzerinden gelir. `canli` paletinde `--bg: var(--primary)` olduğu
  için iğne zeminle aynı renge düşüp kayboluyordu (on palet × tema
  kombinasyonu ekran görüntüsüyle tek tek kontrol edildi).
- Kıbleye dönüldüğünde kadran yeşile döner (`--qibla-ok`, sabit `#2fbf71` —
  "hizalandı" palete bağlı olmayan bir onay rengi). Eşikte histerezis var:
  girişte 4°, çıkışta 8°; tek eşik olsaydı pusula gürültüsünde titrerdi.
- **Brave'in parmak izi koruması yön sensörünü sessizce kapatır** — olay hiç
  gelmez, hata da vermez. Aynı cihazda Chrome'da çalışıp Brave'de çalışmadığı
  ölçüldü. `navigator.brave.isBrave()` ile tespit edilip kullanıcıya Kalkanlar
  uyarısı gösterilir.

## Dinî Günler

- `holyDaysOn` / `holyDayLabel` (core) — kandiller, bayramlar, arefe ve Aşure hicri takvimden
  **kural olarak** türetilir; sabit tarih listesi tutulmaz.
- **Gecelerdeki incelik:** hicri gün güneş batımıyla başlar. "Recep ayının 27.
  gecesi" 26'sının akşamında başlayıp 27'sine ait olan gecedir — bu yüzden
  kandiller adı geçen günün BİR ÖNCEKİ hicri gününe işaretlenir. Diyanet'in
  yayımladığı miladi tarihler de böyle.
- Diyanet'in 2026 listesindeki 15 tarihin **15'i birebir** tutuyor (ölçüldü).
  Kadir Gecesi 26 Ramazan'a (27. gece) konur — Ramazan'ın son on gününde gizli
  olduğu bilinir, 27. gece yaygın olarak idrak edilir.
- Regaip hafta gününe bağlıdır: Recep'teki ilk perşembe akşamı.
- Kullanıldığı yerler: takvim sayfasında seçili günün altında rozet + ızgarada
  nokta; görsel oluşturucuda tarih parçasının etkinlik satırı (anlık görüntüden
  ön-doldurulur, alan serbest kalır) ve aylık takvim parçasında "Dinî günler"
  anahtarı.

## Çekirdek: `@alaturkavakitler/core`

- Hicri takvim, dinî günler, namaz vakti tablosu, alaturka saat, kıble ve
  şehir listesi **sitede değil pakette** durur. Sebebi ölçüldü: aynı kurallar
  iki yerde yaşarken ayrıştılar — gece yarısı ile imsak arası sayaç hatası
  core'da düzeltildi, sitedeki kopyada aylarca kaldı.
- Siteden silinen dosyalar: `utils/{vakit,clock,hijri,qibla}.js`,
  `data/{hijriMonths,holyDays,cities,cityCoords}.js`. Yenisini eklemeden önce
  "bu kural core'a mı ait" diye sor: ekrana ait olan sitede, takvim/vakit
  kuralı olan pakette.
- **Alan adları farklı, dikkat:** core Luxon kullanmaz, saatler düz `Date`'tir.
  `valueDateObj` → `time`, `value2` → `valueTomorrow`, `valueDateObj2` →
  `timeTomorrow`. `createVakitObj` → `createVakitTable`.
- Site Luxon'u BIRAKMADI; biçimlendirme (yerelleştirilmiş tarih, süre) hâlâ
  Luxon ile yapılıyor. Core'a `Date` verilir: `calculateAlaturka(now.toJSDate(), …)`.
- Sayaç artık `nextVakit(table, now)` ile besleniyor: "şimdiki vaktin ardılı"
  diye adım atmak yerine ileride kalan en yakın vakte bakar. Gece yarısından
  sonra bugünün altı vakti de ileride olduğu için adım atan yol yarının
  imsakına ulaşıp 27 saatlik sayaç gösterebiliyordu.
- Geçiş körlemesine yapılmadı: 2022–2037 arasındaki 5844 günün tamamında
  eski ve yeni `toHijri` ile `holyDaysOn` çıktıları karşılaştırıldı (fark: 0),
  81 ilin kıble açısı da birebir aynı çıktı.
- Paket npm'de, yayın GitHub Actions'tan trusted publishing ile
  (`alaturka-core` deposu, `v*` etiketi). Kuralları değiştirmek gerekirse
  orada değiştir, sürüm çıkar, burada `npm i` ile güncelle.

## Kuran Sayfası ve Hatim

- Rota `/kuran`, alt gezinmenin BEŞİNCİ birincil girişi (ikon
  `public/Icons/Nav/quran.svg`, diğer dördüyle aynı dil: beyaz dolgu,
  kontur yok, CSS filtresiyle boyanıyor). Üstte **Serbest okuma**,
  **Hatimlerim** ve **Kaydedilen Ayetler** sekmeleri bulunur.
- **Ayet ayet** görünümünde üç nokta imleç ayetin üzerine geldiğinde,
  dokunmatik ekranda ayete dokunulduğunda veya düğme klavyeyle odaklandığında
  görünür. İkonlu işlem paneli düğmenin yanında açılır ve ekranın altında
  yer kalmazsa üste geçer. Kaydedilen ayetler yer imiyle işaretlenir; kayıt
  listesindeki aynı menü kopyalama, paylaşma ve kaydı kaldırmayı sunar.
  Kopyalama yalnızca seçilen ayetin Arapça metnini panoya yazar. Paylaşım
  ayetin Arapça metnini, açık meallerini, künyesini ve serbest okumadaki
  `?a=sure:ayet` bağlantısını içerir. Tarayıcı paylaşımı kullanılamadığında metin ve bağlantı
  panoya kopyalanır. **Kaydedilen Ayetler** (`?b=kaydedilenler`), ayet ve
  meal metinlerini tarayıcıdaki kayıttan okur. Böylece çevrimdışıyken
  erişilebilir ve meal seçimi değiştiğinde kayıtlı metin korunur.
- **Sayfa birimi mushaf sayfasıdır** (1–604). Dizin `src/data/mushafPages.js`:
  her satır `[sure, ilk ayet, ayet sayısı]`. `scripts/export-mushaf-pages.js`
  üretir ve üretirken 604 sayfanın hepsinde "ayetler gerçekten ardışık mı"
  diye doğrular — üç sayıdan listeyi geri kurup ham veriyle karşılaştırır.
- **Dizin quran.com'dan (Medine mushafı) üretiliyor, Açık Kuran'dan DEĞİL.**
  Sebebi ölçüldü: Açık Kuran'ın `page` alanı tutarsız — Fatiha 0, Bakara 1–5
  → 1, Kehf 292, Yasin 439, Mülk 561 (hepsi bir eksik), ama Adiyat 599,
  Tebbet 603, İhlas/Felak/Nas 604 (birebir). Kayma yolun ortasında kapanıyor
  ve toplam 605 ayrı sayfa değeri çıkıyor. Sayfa numarası kullanıcının
  elindeki mushafla karşılaştırılacağı için bu veri kullanılamaz.
  Ayet METNİ yine Açık Kuran'dan (vekil üzerinden) geliyor; dizin yalnızca
  sayıdan ibaret. QF'nin şartları açısından bu açık bir mesele, bkz. ROADMAP.
- Bir sayfa birden çok sure taşıyabilir (604. sayfada üç tane). İstekler
  SURE başına yapılır (`rangesOfPage`), çünkü vekil sure sure önbellekliyor.
- Vekildeki `MAX_RANGE` 20'den **60**'a çıkarıldı: son cüzde bir sayfaya
  kırktan fazla kısa ayet düşüyor. Maliyeti yok, vekil zaten surenin
  tamamını okuyup dilimliyor.
- **Meal satırları birleşir**: bazı mealler ayetleri gruplayarak çeviriyor
  (Diyanet'te Fatiha 2-4 ve 6-7) ve API grubun metnini gruptaki HER ayet
  için döndürüyor — ekranda aynı cümle üç kez çıkıyordu. Ardışık ve aynı
  metinli ayetler tek satırda toplanıp "2–4" diye etiketleniyor, metnin
  başındaki "(2-4)" işareti atılıyor.
  Baştaki numara işareti satırın kendisinde olduğu için atılır ve
  deseni meale göre değişiyor: kimi "(2-4)" yazıyor, kimi
  "(1-2-3-4)" diye tek tek sayıyor — ikisi de yalnızca rakam,
  tire ve boşluktan oluştuğu için tek desenle yakalanıyor.
- **Gitme kutusu tek alandır** (`GoTo.vue`): sure adı, `2:255`, `3 15`, `bakara 255`,
  `s42`, `c5` — ne yazıldığını kendisi anlar ve seçenekleri listeler. Önce
  dört ayrı açılır liste vardı (sure/cüz/sayfa/meal) ve bir AYETE gitmenin
  yolu yoktu. Ön ekli yazım (`s42`) ad aramasından ÖNCE bakılır, yoksa
  "s42" bütün S'li surelerin 42. ayetini listeliyor; ad araması da iki
  harften başlar.
- **Araç şeridinde iki düğme de YALNIZCA ikon** (meal + tam ekran): ikisi de
  `select icon-btn` — 2rem kare, şeridin sağ ucunda yan yana. Meal düğmesinde
  mütercim adı ve TR/EN rozeti ARTIK YOK; hangi mealin açık olduğu düğmenin
  `title`/`aria-label` metninde (`mealTitle`) ve alttaki listede duruyor.
  Seçili meal varsa düğme vurgulanıyor (`aria-pressed`).
  İkonlar yazı glifi değil, SVG: tam ekran `⤢`/`⤡` idi, fonta göre ~1px
  çizgiydi (ölçüldü: ink 17.9 css-px²), yerine sabit 1.6px konturlu çift
  köşe ok (ink 53.3 css-px², 3×). Meal ikonu çeviri yazısı (文/A) DEĞİL,
  KÜRE: Material "language" (16px) — ink 47.3 → 106.0 css-px², medyan
  çizgi değişmedi (1.67px) ama silüet tek parça oldu; 17px'de halka
  kalınlıkları birbirine giriyor.
  Gir/çık için AYRI ikon yok: dört aday render edildi (içe oklar, köşe
  kancaları, materyal ikonu) — 16px'te ya aynı ya bulanık; durumu çerçeve
  anlatıyor (vurgu + `aria-pressed`), ikon hep aynı.
- Aranan ayet bulunduğu sayfada vurgulanır. Vurgu SAYFAYA bağlı tutulur
  (`focus.page === page`), böylece sayfa başka bir yolla değişince
  kendiliğinden düşer — ayrı bir temizleme izleyicisi yok.
- **Hızlı erişim kısayolları SEÇİCİNİN içindedir** (`PickerSheet`in
  `shortcuts` prop'u), sekmelerin hemen altında. Görünüm ayarlarının
  (⋯) yanındayken alakasız duruyorlardı: "Yasin'e git" bir hat ya da
  yazı boyu ayarı değil, "42. sayfaya git" ile aynı iştir.
- Serbest okumada **hızlı erişim şeridi** (`data/quranShortcuts.js`):
  Yasin, Tebâreke, Amme, Vâkıa, Rahmân, Kehf, Ayetel Kürsi, Âmenerrasûlü,
  30. cüz, kısa sureler, Fâtiha. Yaygın adıyla anılanlar resmî adlarıyla
  aranmıyor; liste bilinçli kısa. Hatim okuyucusunda GÖSTERİLMEZ: orada
  sıralı okunuyor, sıçramak akışı bozar.
- **İlk açılışta "Ümmet için" hatmi hazır gelir** ve hemen yazılır. Yalnızca
  HİÇ kayıt yokken (`localStorage.getItem` → `null`) kurulur: kullanıcı
  hatmini sildiyse kayıt artık boş bir liste olarak vardır ve bir daha
  tohumlanmaz — "sildim ama geri geldi" olmaz.
- **Üç görünüm var, tepeden tek dokunuşla değişir** (`settings.quranView`):
  - **Mushaf** (varsayılan) — basılı sayfanın satır satır kendisi:
    15 satır, sayfaya ait QPC fontu (`MushafSheet.vue`, `utils/qpc.js`).
    Satır sonları bizim kırdığımız yerler değil, mushafın kırdığı yerler.
  - **Esnek** — ayetler akar, yazı boyu %70–180 arası ayarlanır; meal
    altta ayrı bir listedir. Küçük ekranda okumak için.
  - **Ayet ayet** — ayet, hemen altında meali, sonra sonraki ayet.
    Karşılaştırarak okuyan için: akan metinde "bu cümlenin karşılığı
    hangisiydi" diye aşağıdaki listeye göz kaydırmak gerekmiyor.
    Satırlar MEAL gruplarından çıkar — gruplanmış çeviride (Diyanet'te
    Fâtiha 2-4) o grubun ayetleri tek blokta toplanır ve karşılık bir
    kez yazılır; ayrı ayrı basılsa aynı cümle art arda çıkardı. Meal
    kapalıyken her ayet kendi bloğudur. Blok içindeki Arapça iki yana
    YASLANMAZ (tek ayette kelime araları uçuyor), sağa yaslanır.
  Bilinmeyen bir `quranView` değeri mushafa düşer.
  Değişen yalnızca dizim: sayfa birimi, hatim işaretlemesi, kaydırma ve
  adres çubuğu üç görünümde de aynı.
- **Esnek ve Ayet ayet görünümlerinde** meal menüsünden Arapça metin
  gizlenebilir. Açık meal yoksa bu seçim Diyanet İşleri’ni açar. Son
  meal kapatıldığında Arapça yeniden gösterilir. Tercih, etkin okuyucu
  profilinde tutulur. Ayet ve aralık uçlarında açıkça boş `authors=`
  Arapça ve okunuş isteğidir. Bilinmeyen mütercim kimliği hatası sürer.
- **Dizim verisi DEPODADIR, ağdan gelmez** (`src/data/mushaf/juz-NN.json`,
  `scripts/export-mushaf-lines.js`). Değişmeyen bir tablo için her sayfa
  açılışında ağa çıkmak tek bir sağlayıcıya bağlı kalmak ve çevrimdışı
  okumayı imkânsız kılmak demekti. Cüz başına ~110 kB ham / ~13 kB
  sıkıştırılmış; yalnızca okunan cüzün dosyası yüklenir
  (`import.meta.glob` ile 30 ayrı parça). Ölçüldü: 293. sayfa açılırken
  **sıfır API isteği**.
  - Her kelime İKİ glif kodunu birden taşır (`a` = V1, `b` = V2); hat
    değiştirmek yeni bir indirme değil, yalnızca yeniden çizim.
  - quran.com yalnızca YEDEK yoldur (`remoteLines`) ve aynı biçimi kurar.
- **Sayfa fontları 113 MB eder, repoya girmez.** Ölçüldü: V2 ~75 MB,
  V1 ~38 MB (ilk sayfalar küçük olduğu için başta 25 MB sanıldı — tek
  tek örnekle tahmin yürütme). Ayna Cloudflare R2'de durur, kökü
  `VITE_MUSHAF_FONT_BASE`; tanımlı değilse doğrudan
  `static.qurancdn.com` kullanılır, yani ayna kurulmadan da çalışır.
  Sıra **ayna önce**: font küçüktür ve her sayfada gerekir, okuma hızı
  bize bağlı olmalı.
- **Glif kodu YALNIZCA kendi sayfasının fontunda anlamlıdır**: 42. sayfanın
  kodunu 43'ün fontuyla çizmek başka harfler verir. Bu yüzden font sayfa
  başına ayrıdır ve dizimle birlikte beklenir — font gelmeden satırları
  basmak bir an kutu kutu glif gösteriyor.
- **Başlık satırları veride yok, sayımla bulunur**: bir sayfada kullanılmayan
  satır numarası sure adı ya da besmeledir. Sure sayfanın ortasında
  başlıyorsa ilk kelimesinin üstündeki boş satırlar ona aittir — iki boşsa
  ad + besmele, bir boşsa yalnız ad. Tevbe besmelesizdir ve veride de tek
  boş satır bırakır, ayrıca kural yazmak gerekmedi (293 ve 187 ile
  doğrulandı). Sure adı ayrı bir fontta tek gliftir (`sura_names`,
  PUA'da `U+E000 + sure - 1`).
- **Sayfa çevrilirken eski sayfa YERİNDE kalır.** Yükleme sırasında
  satırlar boşaltılıyordu: kutu bir anlığına "Yükleniyor…" kadar
  kısalıyor, tarayıcı kaydırmayı o boya kırpıyor ve sonraki sayfaya
  geçince ekran en başa fırlıyordu (ölçüldü: `.app-content` scrollTop
  600 → 0). Artık eski sayfa soluklaşarak duruyor, yenisi gelince
  değişiyor; kaydırma yerinde kalıyor (600 → 601). Aynı kural mealde de
  geçerli. Eski sayfa kendi fontuyla durduğu için doğru görünmeye de
  devam eder.
- **Hat etiketleri baskı YILIDIR** (`1421H`, `1405H`), "Mushaf/Klasik"
  değil: ilk hâlinde V2'nin adı "Mushaf"tı ve görünüm düğmesindeki
  "Mushaf" ile yan yana düşüp ikisi karışıyordu. Yanlarındaki küçük
  "HAT" başlığı da bu yüzden var — tek başına "1421H" bilmece gibi
  duruyor.
- **Sayfa numarası iki mushafta farklıdır ve ikisi de yazılır.** Türk
  (Diyanet) mushafında Fâtiha ile Bakara'nın başı tezhipli AÇILIŞ
  sayfasıdır ve numara taşımaz; numaralandırma Bakara 6'dan 2 ile
  başlar. Bu yüzden kitabın büyük kısmında **Diyanet = Medine − 1**.
  Diyanet'in kendi PDF'inden basılı numaralar okunarak doğrulandı:
  Diyanet 2 = Medine 3 (Bakara 6–16), 293 = 294 (Kehf 5–15),
  582 = 583 (Nebe 31 – Nâziât 15), ama 603 = 603. Son cüzde iki mushaf
  sayfa SINIRLARINDA da ayrışıyor (Diyanet 594 = Beled sonu + Şems'in
  tamamı; Medine'de öyle bir sayfa yok) ve numaralar 603'te örtüşüyor.
  Ayrışmanın tam yeri ölçülmedi, bu yüzden `diyanetPage()` 583'ten
  sonrası için `null` döner — bilinmeyen bir numara uydurmaktansa
  göstermemek doğru.
- **Tecvit YALNIZCA esnek görünümdedir.** quran.com tecvit etiketini
  AYET seviyesinde veriyor (`text_uthmani_tajweed`, `<tajweed class=…>`);
  kelime seviyesinde düz metin dönüyor (ölçüldü), dolayısıyla glif
  tabanlı mushaf görünümünde kullanılamıyor. Gelen işaretleme olduğu
  gibi `v-html`e VERİLMEZ: `safeTajweed()` belgeyi ayrıştırıp yalnızca
  tanınan sınıfa sahip `<tajweed>` öğelerini `<span class="tj tj-…">`
  olarak geçirir, kalan her şeyi düz metne indirger, öznitelik taşımaz.
- **Tecvit renkleri palete bağlı DEĞİL, sabittir**: kuralın rengi okurun
  öğrendiği bir koddur, temaya göre değişirse anlamını kaybeder. Yalnızca
  açık modda okunurluk için bir tık koyulaşırlar.
- **Tam ekran okuma** (`immersive`): sayfa kabuğun dışına çıkıp ekranı
  kaplar — rota özelliği değil, sayfanın geçici bir kipi.
  - Gezinme çubukları `z-index` ile ÖRTÜLEMEZ: `.app-content` kendi
    yığın bağlamını açıyor (`position: relative; z-index: 1`), içerideki
    50 o bağlamın içinde kalıyor ve üst çubuk mushafın başlığının üstüne
    biniyordu (mobilde logo ve şehir seçici görünüyordu). Çözüm
    `<html>`e yazılan `data-immersive` imi ve `base.css`'teki iki satır.
    İm sayfadan çıkarken `onUnmounted` ile silinir, yoksa gezinme bir
    daha hiç görünmez.
  - **Güvenli alan DÖRT kenarda** verilir. Yalnızca alt kenara verilmişti
    ve ana ekrana eklenmiş uygulamada `inset: 0` durum çubuğunun altına
    girip denetim şeridini örtüyordu.
  - Mushaf sayfası ekrana ÖLÇÜLEREK sığdırılır (`fitPage`), CSS
    tahminiyle değil. Önce `min(7.2cqw, (100svh − 6rem)/27)` denendi ve
    tutmadı: denetim şeridinin boyu cihaza göre değişiyor, sure başlığı
    olan sayfalar daha uzun. Ölçülen: 393×852 ekranda 656 piksellik
    alana 697 piksellik sayfa düşüyordu. Bir mushaf sayfası kaydırılarak
    okunmaz. Meal açıksa sayfanın altında kalır ve orası kaydırılır.
- **Doğal olarak kısa satır iki yana YASLANMAZ** (`MushafSheet`,
  `LOOSE = 0.82`): `space-between` satırı doldurmak için kelime
  aralarını geriyor ve dolu bir mushaf satırında bu doğru — basılı
  sayfada da satır sayfanın enini doldurur. Ama tezhipli açılış
  sayfalarında (Fâtiha) ve son cüzün kısa surelerinde satır kısadır;
  gerildiğinde iki kelime sayfanın iki ucuna yapışıyordu, masaüstünde
  kutu geniş olduğu için daha da belirgin. Doğal en `scrollWidth` ile
  ÖLÇÜLEMİYOR (`space-between` taşmayan satırda da kutuya eşit çıkıyor):
  kelimelerin kendi genişlikleri toplanıyor ve bunun için `.qpc-word`
  küçülmeye kapalı (`flex: none`).
- **Satır oturtma yalnızca GENİŞLİK değişince çalışır** (`MushafSheet`):
  `fitLines` satırların puntosunu değiştiriyor, bu da kutunun boyunu
  değiştiriyor — yükseklik de dinlenseydi `ResizeObserver` kendi
  sonucunu tetikleyip döngüye girerdi.
- **Okunan ayet adreste durur** (`?a=2:255`): önce yalnızca sayfa
  yazılıyordu ve yenileyince vurgu kayboluyordu, "ayete gitmek" sayfaya
  gitmeye düşüyordu. Yalnızca `a` verilen bir bağlantı sayfayı ayetten
  hesaplar.
- **Seçicide sure adının kendi görseli vardır**: ad glifi sabit genişlikte
  bir kolonda (değişken olsaydı adlar satırdan satıra kayıp listeyi
  taranamaz hâle getirirdi). Font gelmezse satır sade kalır, liste
  çalışmaya devam eder.
- **Yazı tipi seçici okurken de açılır** (`FontSheet.vue`) ve her satır
  KENDİ yazı tipiyle örnek gösterir: adı değil görüntüsü seçtirir.
  Liste `data/quranFonts.js`'te, ayarlar sayfasıyla ortak — biri eklenip
  öbüründe unutulmasın.
- **Tecvitli V4 YOK ve bu ölçülmüş bir sınır**: V4 sayfa fontları CDN'de
  duruyor ama kendi glif kodlarını istiyor, V1 kodlarıyla harfler
  birleşmiyor; API `code_v4` vermiyor. Yeniden denemeden önce ROADMAP'teki
  iki yola bak.
- **Alt sayfa kabuğu tektir** (`components/ui/BottomSheet.vue`): örtü,
  panel, başlık şeridi ve kayan gövde. Üç müşterisi var (sure/sayfa/cüz
  seçici, meal seçici, sure künyesi); dördüncüsü de oradan gelmeli — iki
  ayrı kopya iki ayrı davranışa ayrışıyor. Mobilde dipten, masaüstünde
  ortadan açılır.
- **Meal seçimi de alt sayfadır, `select` değil**: dokuz meal arasında dil
  karışık ve açılır kutuda hangisinin Türkçe olduğu ancak addan tahmin
  ediliyordu. Satırda **TR/EN rozeti** var, liste dile göre bölünmüş,
  "Meal kapalı" en üstte (yalnızca Arapça okumak sık yapılan bir iş).
- **Meal ÇOKLU seçilir** (`settings.quranMeals`, dizi; boş = kapalı).
  Satıra dokunmak açar/kapatır ve sayfa açık kalır — karşılaştırmalı
  okuma için meal seçmek bir değil birkaç dokunuştur. Sıra her zaman
  `AUTHORS` sırasıdır, seçim sırası değil: yoksa aynı iki meal farklı
  sırada seçildiğinde sayfa başka türlü diziliyor. Eski tek değer
  (`quranMeal`) ilk açılışta diziye taşınır.
- **Satır dizimini BİRİNCİ meal belirler** (`rowsOf`): hangi ayetlerin
  tek satırda toplandığı onun gruplamasından çıkar, öbür mealler o
  aralığa düşen metinlerini verir (aralıkta farklı metinler varsa
  birleştirilir, aynıysa bir kez yazılır). Her mütercimin kendi
  gruplamasına göre dizilseydi satırlar hiç hizalanmaz ve
  karşılaştırma imkânsızlaşırdı. Mütercim adı YALNIZCA birden fazla
  meal seçiliyken yazar; tekse zaten düğmede duruyor.
- **Meal yazı tipi seçilebilir** (`src/data/mealFonts.js`,
  `settings.quranMealFont`): sans (uygulamanın yazısı, ek indirme yok),
  serif (Newsreader) ve mono (Courier Prime). Serif için önce
  Baskervville denendi ve bırakıldı: tek ağırlıklı, ince konturlu bir
  SERGİ yazısı — başlıkta güzel, meal uzunluğunda metinde soluk. Arapça metnin hattı
  seçilebiliyordu ama uzun uzun okunan şey karşılığıdır. Aile
  `--meal-font` değişkeniyle iniyor; `ensureFont` ile yalnızca
  seçilen indirilir. Seçici MEAL alt sayfasının başında — karar aynı
  yerde verilsin diye.
- **Sure başlarında zeminli künye bloğu** (`SurahHeader.vue`): mushafta
  sayfanın kendi süslemesi (tek glif) + altında Türkçe ad, anlamı,
  iniş yeri ve ayet sayısı; esnek görünümde süsleme olmadan aynısı.
  Süsleme Arapçadır, künye onu herkes için açar. Sondaki `i` künyeyi
  alt sayfada genişletir (`SurahInfoSheet.vue`).
- **Künye verisi üretilmiştir** (`src/data/surahInfo.js`,
  `scripts/export-surah-info.js`): iniş yeri/ayet sayısı/iniş sırası
  quran.com'dan, ad anlamları betiğin içindeki elle yazılmış listeden
  (quran.com anlamı Türkçe vermiyor; `--check` ile İngilizce adın yanına
  basılıp gözden geçirilir). **TDV bağlantıları üretimde tek tek HTTP ile
  doğrulanır**, 200 dönmeyen surede bağlantı yazılmaz — uydurma bağlantı
  bağlantısızlıktan kötüdür.
- **Sure tanıtım metni YOK ve uydurulmadı**: quran.com'un metni yalnızca
  İngilizce, 114 sure için Türkçe metin yazmak doğruluğu denetlenemeyen
  bir yığın olurdu. Künye + TDV maddesi bağlantısı veriliyor.
- **Sure adı glifinin kodlaması sıralı DEĞİL**: sure numarası ondalık
  haliyle onaltılık basamaklara yazılır (12 → `U+E012`, 114 → `U+E114`).
  Sıralı sayıldığında 18. surenin yerine Yusuf çıkıyordu (ölçüldü).
  Fontun 116 glifi ve E009→E010, E099→E100 boşlukları bunu doğruluyor.
- **Sayfanın başlığı seçicinin KENDİSİDİR**: üstte ayrı bir "Seç ▾"
  düğmesi vardı, neyi seçtiği de nerede olduğun da yazmıyordu, üstelik
  sure adı bir satır yukarıda zaten duruyordu — aynı bilgi iki yerde,
  biri tıklanabilir biri değil. Şimdi büyük sure adı + "cüz · sayfa"
  satırı bir düğmedir ve `PickerSheet`i açar (`MushafView` `@pick`).
- **Tam ekran düğmesi SAYFA satırındadır**, araç şeridinde değil:
  okunan sayfaya ait bir kip ve şeritte ⋯ ile kulaklığın arasında
  üçüncü bir kare olarak hangisinin ne yaptığı seçilmiyordu. Oklarla
  aynı satırda ama kenarlıksız — bir sayfa düğmesi değil, kip düğmesi.
- **Görünüm düğmelerinde ikon var**: üç ad yan yana ("Mushaf Esnek Ayet
  ayet") bir şerit metni gibi okunuyordu. İkonlar bir nesneyi değil
  DİZİMİ tarif ediyor: eşit satırlar (mushaf), farklı uzunlukta akan
  satırlar (esnek), kalın satır + altında ince iki satır (ayet ayet).
  Arama kutusunda büyüteç, meal düğmesinde çeviri ikonu var —
  ikisi de ne olduklarını yer tutucu metinle söylüyordu ve o metin
  daraldıkça kırpılıyordu.
- **Üst taraf katlanır**: hat, yazı boyu, tecvit ve hızlı erişim
  kısayolları ⋯ düğmesinin arkasındadır (`tools`). Bir kez kurulup
  bırakılan ayarlar her sayfada yer kaplıyordu — üst taraf altı satır
  ediyor ve mushaf ekranın yarısından sonra başlıyordu. Dışarıda kalan
  tek şey görünüm seçimi (mushaf/esnek/ayet): en sık dokunulan o.
  Gitme kutusu ve meal düğmesi de araç şeridinin İÇİNDE, `MushafView`in
  `jump` yuvasından geliyor. Hayalet başlık (`.page-title`) bu sayfada
  küçültüldü; global ölçü değişmez, öbür sayfalarda o ölçü
  kompozisyonun kendisi.
- **Sekmeler ne YAPTIĞINI söyler**: "Oku"/"Hatim" değil "Serbest okuma"
  (açık kitap) ve "Hatimlerim" (halka). İkisinde de Kur'an okunuyor,
  fark okumanın bir hatme YAZILIP yazılmaması; eski adlar bunu
  söylemiyordu. Okuyucudaki geri düğmesi de "Hatimlerime dön".
- **Seçici yerel `select` değildir** (`PickerSheet.vue`): 114 seçenekli bir
  `select` Android'de aranamayan, ağır bir listeye dönüşüyor ve sure ile
  sayfasını yan yana gösteremiyor. Alt sayfa olarak açılır, üç sekmesi var
  (sure/sayfa/cüz), her satır iki bilgiyi birden taşır — cüzde satırın
  adı "1. cüz" değil cüzün BAŞLADIĞI suredir, numara zaten solda duruyor
  ve aynı sayı iki kez okunuyordu ve bulunduğun satır
  işaretli gelip listenin ortasına kaydırılır. Gitme kutusunun YERİNE değil
  yanına konur: biri yazarak arayan, öbürü göz gezdirerek seçen için.
- Arapça yazı tipi ayardan gelir (`settings.quranFont`, varsayılan Lateef) ve
  `ensureFont(id)` ile YALNIZCA o aile indirilir — arapça grubunun tamamı 16
  aile eder. Liste bilinçli dar: nesih hatları (Lateef, Scheherazade, Amiri,
  Noto Naskh); talik ve kufi mushaf için değil.
- **İki okuyucu var ve bu bilinçli.** `Oku` SERBESTTİR, hiçbir hatme
  yazmaz. `Hatim` sekmesinde bir hatme dokununca o hatmin İÇİNDE bir
  okuyucu açılır: hangi hatimde olduğun tepede yazılı durur ve çevirdiğin
  sayfa okundu sayılır. Önce tek okuyucu vardı ve "Okudum" düğmesi
  görünmeyen bir "etkin hatme" yazıyordu — hangi hatmi okuduğun ekranda
  hiçbir yerde yazmıyordu, ilk kullanışta sorulan soru bu oldu.
- **Hatim adı ve okuyucu tercihleri hatim kaydındadır.** `hatim.reader`
  tam ekranı, görünümü, mushaf hattını, Arapça yazı tipi ve boyutunu,
  tecviti, meal listesini ve yazı tipini, kârîyi ve takibi taşır.
  Eski hatimler bir kez Serbest okuma tercihlerinden doldurulur.
  `HatimForm` yeni hatme hazır okuma ayarı seçtirir ve karttan ya da
  okuyucudaki hatim adına dokunarak düzenlenir. Okuyucu doğrudan hatim
  profilini kullanır çünkü genel ayarlara yazıp sonra geri almak
  serbest okumaya ve eşzamanlı ayet isteklerine yanlış değer sızdırabilir.
  Bir hatimden diğerine giriş, önceki sayfayı yeni hatme okundu yazmaz.
- **İşaretleme sayfa çevrilince olur**, düğmeyle değil: sayfayı çevirmek
  zaten onu bitirdiğini söylüyor, araya bir iş daha koymaya gerek yok.
  Ayrılınan sayfa işaretlenir (iki yönde de), yanlışlıkla sayılan sayfa
  tepedeki rozete dokunarak geri alınır. Bu yüzden işaretleme sessiz
  değil: her sayfada görünür bir durum taşır.
- Sekme değişince okuyucudan çıkılır (`watch(tab)`), yoksa hatim rozeti
  serbest okumaya sızıyor.
- **Yön mushafın yönüdür: sağdan sola.** Sonraki sayfa SOLDAKİ düğmedir
  (`‹`), önceki sağdakidir (`›`) — Latin kitaplardaki dizilişin aynadaki
  hâli. Parmakla da öyle: sağa doğru kaydırmak İLERİ götürür.
- Kaydırma üç şart arar (yatay yol ≥ 60px, yatay dikeyden baskın, süre
  < 800ms) ve farede hiç çalışmaz — farede sürükleme metin seçmektir.
  `.sheet`te `touch-action: pan-y`, dikey kaydırma tarayıcıda kalır.
- **Okunan hatim adreste durur** (`?h=<id>&s=<sayfa>&b=hatim`): sayfayı
  yenileyince okuduğun yerden düşmüyorsun. Kayıtta olmayan bir kimlik
  gelirse yok sayılır ve liste açılır.
- **Sayfa gezinmesi ÜSTTE**, başlık satırının içinde. Altta denendi ve
  sayfanın uzunluğuna göre yer değiştiriyordu — her sayfada başka bir
  yere basmak gerekiyordu. Dipte yalnızca tek bir "sonraki sayfa" var,
  uzun sayfada başa dönmemek için.
- **Geri alınan sayfa SİLİNMEZ, `undone`a taşınır** (`stores/hatim.js`).
  İşaret kaldırılınca kayıt tamamen siliniyordu ve o günün çizelgedeki
  izi de yok oluyordu: "dün üç sayfa okumuştum" diye bakan biri bomboş
  bir gün görüyordu. İki ayrı soru var — *hatim ne kadar ilerledi* ve
  *o gün ne yaptım*. Birincisi (`readCount`, `ratio`, `isRead`,
  `nextPage`) yalnızca `progress`e bakar, yani geri alınan sayfa
  okunmamıştır ve oran düşer. İkincisi `undone`u da görür ama ONAYLI
  bir okuma gibi değil: hatim çizelgesinde kesikli çerçeveli bir kutu
  (dolgu yok, `.day.undone`), takvim sayfasında ve genel toplamda
  "+N geri alındı" diye ayrı bir sayı. Sayfa yeniden işaretlenirse
  `undone`dan düşer — çift sayılmaz. Okunduğu GÜN korunur, bugünün
  tarihiyle değiştirilmez.
- **Hatim bir sayaç değil kayıt**: `stores/hatim.js` "hangi sayfayı hangi gün
  okudum" tutar (`progress: { sayfa: 'YYYY-MM-DD' }`). Günlük takvim şeridi,
  kaldığın yer ve oran hep bu tek kayıttan türer; yanlış işareti geri almak
  da bunu gerektiriyor. Birden fazla hatim sürebilir, biri etkindir.
- Görselleştirme `HatimRing`: Behold'un dolan yuvarlağı yerine **otuz dilim**,
  çünkü hatim cüz cüz okunur — tek parça bir yay "yüzde kaç" der, otuz dilim
  "kaçıncı cüzdeyim" der. Son dolan dilim kısmen dolu (opaklıkla).
- **Hatim listesi tek bir listedir, üstte ayrı bir "etkin hatim" bloğu
  yoktur.** Önce vardı ve iki sakıncası görüldü: aynı hatim ekranda iki
  kez duruyordu, bir de okuyucuya girip çıkınca üstteki blok başka bir
  hatme geçtiği için hangisine baktığın kayıyordu. Şimdi her satır kendi
  görselleştirmesini taşır; açık satır şeridini, kaldığı yeri ve silme
  düğmesini gösterir, kapalı satır halka + niyet + sayıdan ibarettir.
- Günlük şerit (`HatimCalendar`) bugünü SAĞA alır ve geriye uzanır
  (`direction: rtl` kapta, içerik `ltr`); dolgu o dönemdeki en yüksek güne
  göre ölçeklenir, yoksa günde iki sayfa okuyanda şerit hep sönük kalır.
  Kutucuklar HAFTA HAFTA gruplanır (pazartesi–pazar, aralarında boşluk) ve
  sayfa sayısı kutunun İÇİNDE yazar. Şerit kart çerçevesi içinde tutulur
  (negatif margin'le taşırılmaz) ve kenarlara yumuşak `mask-image`
  gradyanı verilir; böylece kutu sınırları delinmeden kaydırma hissi sağlanır.
  Önce ince çubuklardı, sayı yalnızca fare ipucundaydı — dokunmatikte öyle
  bir ipucu yok, "hangi gün kaç sayfa" hiç görünmüyordu. Bir güne
  dokunmak altındaki satırda onu okutur.
- **Hatim sekmesinin tepesinde bütün hatimlerin TOPLAMI** duruyor (sayfa
  sayısı + ortak şerit). Tek tek hatimler aşağıda kendi şeritlerini
  taşıyor; üstteki "bugün hiç okudum mu" sorusunun cevabı, hangi hatme
  yazıldığına bakmaksızın — hatim bitip yenisi başladığında süreklilik
  orada görünür. (Bu, kaldırılan "etkin hatim" bloğundan farklı: o, hangi
  hatme baktığın kayıyordu; bu toplam hiç değişmiyor.)
- Kartlar arasında boşluk var ve ayırıcı çizgi yerini kartın kendi
  kenarlığına bıraktı: satırlar birbirine çok yakınken hangi niyetin
  hangi tarihe ait olduğu karışıyordu. Zemin ve soldaki aksan çubuğu
  YALNIZCA açık karttadır — kalınlaşan niyet yazısı tek başına "şu an
  buna bakıyorum" demeye yetmiyordu.
- Silme düğmesi okuma düğmesinin yanında DURMAZ, satırın öbür ucundadır:
  ikisi yan yanayken yanlış olana basmak bir dokunuş uzaklıkta.
- **Takvim sayfası da okumayı gösterir**: seçili günde hangi hatimden kaç
  sayfa okunduğu dinî gün satırının altında yazar, ızgarada o günün
  altında ince bir çizgi durur. Çizgi dinî gün NOKTASINDAN ayrı bir
  biçimdir — ikisi aynı güne düşebiliyor ve aynı biçim olsalar ayırt
  edilemezlerdi. Rengi noktayla aynı mantıkta (`--bg`), çünkü `canli`
  paletinde `--accent-ui` hücre zeminiyle aynı renge düşüyor.
- Okuma sayfası adres çubuğunda: `?s=<sayfa>&b=hatim`. Paylaşılabilsin ve
  geri tuşu sayfalar arasında çalışsın diye.

## Dinleme (mukabele)

- **Oynatıcı sayfaya değil UYGULAMAYA aittir** (`stores/recitation.js`).
  Önce bütün düzenek `ListenBar`ın içindeydi ve `<audio>` onun
  şablonunda duruyordu: Kur'an sayfasından çıkmak elemanı DOM'dan
  silip sesi kesiyordu. Dinlemek sayfaya bağlı bir iş değil —
  vakitlere bakarken kıraat sürer. Ses elemanı, damga tablosu ve çalma
  durumu artık bir modülde (ES modülü zaten tekil; Pinia gerekmedi,
  kalıcılaştırılacak bir şey yok), şerit yalnızca onun GÖRÜNÜMÜ.
  - Eleman şablonda olmadığı için `<source>` çocukları da yok: yedeğe
    geçiş (`yayıncı → aynamız`) elle yapılıyor, konum korunarak.
  - `currentTime` süre bilinmeden yazılamıyor; hedef `pendingSeek`te
    bekler ve `loadedmetadata`da uygulanır.
  - **Duraklattıktan sonra bir `timeupdate` daha gelebiliyor**:
    korumasız bırakılınca "bırak" dedikten sonra ayet yeniden yazılıyor,
    mushaftaki vurgu ve adresteki ayet asılı kalıyordu (ölçüldü).
  - Sayfa çevirme oynatıcıda DEĞİL: hangi sayfada olduğunu bilen
    Kur'an sayfası, orada çalan ayet izlenip vurgu ve çevirme yapılıyor
    (kural aynı: yalnızca ileri, yalnızca bir adım).
- **Kur'an sayfasının dışında mini oynatıcı var** (`MiniPlayer.vue`,
  kabukta `BottomNav`un üstünde): ne çaldığı (sure, ayet, kârî) yazar,
  duraklatılır, bırakılır ve bir dokunuşla okunan yere dönülür —
  kontrolsüz çalan bir ses olmasın diye. Kur'an sayfasında
  GÖSTERİLMEZ, orada tam şerit var. Masaüstünde alt gezinme sol raya
  döndüğü için akışta yeri yok: sağ alt köşede durur.
- **Ayrı bir "Dinle" sayfası YOK.** Dinleme, okunan sayfanın üstüne
  oturan bir şerittir (`ListenBar.vue`, `MushafView`in `bar` yuvası):
  ses çalarken okunan ayet mushafta vurgulanır ve kıraat sayfanın
  sonuna varınca sayfa kendiliğinden çevrilir. Dinlemek ve okumak aynı
  anda olan bir iş; iki ekrana bölmek gözü mushaftan koparıyor.
- Şerit sayfanın ÜSTÜNDE: altta denendi, gezinme düğmelerindeki
  sorunun aynısı çıktı — sayfanın uzunluğuna göre yer değiştiriyordu.
- **Vurgu için ayrı bir düzenek yazılmadı**: `focus` zaten vardı
  (gitme kutusunun vurgusu), çalan ayet onu sürüyor. Ayet adrese de
  yazılıyor (`?a=2:6`), yani dinlerken sayfayı paylaşmak okunan yeri
  paylaşmak oluyor.
- **Sayfa çevirme yalnızca İLERİ ve yalnızca bir adım**: hedef sayfa
  o ankinin tam bir fazlaysa çevrilir. Kullanıcı elle başka bir yere
  giderse ses onu geri sürüklemesin diye.
- Ses SURE başına tek dosyadır; sayfadan başlamak için o sayfanın ilk
  ayetinin damgasına atlanır (`startOf`). Damga yoksa baştan çalar.
- **Damgası olmayan kârîde vurgu YAPILMAZ ve bu söylenir** ("ayet
  takibi yok"). Ayet sürelerini eşit bölüp tahmin yürütmek okuyanı
  yanlış yere baktırır; hiç vurgulamamak dürüst olanı.
- Zaman damgaları `utils/recitation.js` üzerinden okunur
  (`src/data/recitation/<kari>/ayah.json`, kârî başına ~100 kB / 46 kB
  gzip, `import.meta.glob` ile tembel). Ayet araması ikili aramadır:
  `timeupdate` saniyede birkaç kez geliyor ve bir surede 286 ayet
  olabiliyor. Ayetler arası nefes payına düşen an ÖNCEKİ ayete sayılır,
  yoksa vurgu bir an sönüp yanıyor.
- Damga verisi QUL'dan gelir ve indirme GİRİŞ ister; dosya elle
  indirilip `scripts/import-qul-recitation.js` ile çevrilir. Betik
  114 sure / 6236 ayet, sıra ve aralık denetimi yapar ve ses adresi
  kalıbını ekrana basar — Turé'nin adresi (hiçbir katalogda yoktu)
  böyle bulundu.
- **Damga belirli bir KAYDA aittir; eşleşme süreyle sınanır.** Aynı
  kârînin birden çok okuyuşu dolaşımda ve zamanlar birbirinin yerine
  KULLANILAMAZ. Sınav: QUL'un `surah_list.duration` değeri ile bizim
  aynaladığımız dosyanın gerçek süresi (ffprobe). Ölçüldü — mücevved
  Abdülbasit 78=78 ✓, Benna 47=47 ✓, Alakmî 55≈54 ✓, Turé 46=46 ✓;
  ama Hüsarî 57≠48 ✗ ve murattal Abdülbasit 47≠41 ✗. Bu ikisinin
  kaynağı damgaların ait olduğu kayda çevrildi
  (`qdc/khalil_al_husary/murattal/`, `qdc/abdul_baset/murattal/`).
- **Bir QUL dosyasında iki kayıt olabilir** (228 sure satırı, 12472
  damga): Hüsarî'de hem `khalil_al_husary/murattal` (48 sn) hem
  `..._iza3a` radyo kaydı (34 sn) var. İçe aktarıcı, `reciters.js`'teki
  adrese UYAN kümeyi seçer; uymazsa uyarıp ilkini alır.
- **QUL'un `verses` şemalı dosyaları AYET kaydıdır** (Şüreym böyle):
  zamanlar ayetin kendi dosyasına görelidir, sure dosyası çalarken
  kullanılamaz. İçe aktarıcı bunu tanıyıp açıklamayla çıkar — ayet
  düzeninde vurgu için zaten damga gerekmiyor.
- **Tempo Fâtiha'nın süresinden ölçülür** (`tempoOf`): aynı sure
  herkeste aynı metin, süre farkı doğrudan tempo farkı. Ölçülen aralık
  35–78 sn; eşikler 45 ve 55. Kârî seçicide üç kare + söz olarak
  gösterilir — yalnızca kare bırakmak "üç kare hızlı mı ağır mı"
  sorusunu okurun tahminine bırakırdı.
- **Açık bir "şuraya git" isteği kaydırılır** (`MushafView`in `jump`
  prop'u, her hedefte artan bir sayaç). Oto kaydırma yalnızca ses
  ÇALARKEN devrede, ama üstten bir sure seçmek açık bir istektir:
  sayfa değişiyordu ve sure sayfanın ortasında başlıyorsa ekran
  sayfanın başında kalıyordu. Hedef surenin BAŞIYSA önce künye bloğu
  aranır (`data-sh`) — ayetin ilk kelimesi ortalandığında başlık
  yukarıda kalıyor ve "sureye gittim" hissi vermiyordu. Eleman hemen
  var olmayabildiği için (dizim + font bekleniyor) birkaç tur denenir.
- **Sayfaya dönünce okunan yere gidilir**: adreste `a` yoksa ve kıraat
  sürüyorsa açılış ayeti ÇALAN ayettir. Vakitlere bakıp Kur'an'a
  dönünce takip açık olduğu hâlde mushaf birinci sayfada açılıyordu —
  ses Kehf'i okurken ekran Fâtiha'yı gösteriyordu.
- **Elle sarma sayfayı da götürür** (`seekSeq`): kendiliğinden çevirme
  yalnızca ileri ve bir adımdır (ses kullanıcıyı geri sürüklemesin),
  ama sürgüyü çekmek ya da bildirim alanından ileri almak açık bir
  istektir ve sayfa kaç adım uzakta olursa olsun okunan ayete gidilir.
  Sarmada ayet `playing` şartı OLMADAN yeniden çözülür (`syncVerse`):
  ses bir yeri okurken ekranın başka yeri göstermesi en şaşırtanıydı.
- **Oynatıcı ekranı** (`PlayerSheet.vue`, ortak `BottomSheet` kabuğunun
  dördüncü müşterisi): sürgü, kalan süre, ayet ayet ilerleme ve okunan
  ayetin metni + seçili mealleri. Şerit okurken bakılan yerdir (tek
  satır); bunlar oraya sığmıyor ve sığdırılsa şerit mushafın üstünde
  bir denetim paneline dönüyordu. Hem şeritten hem MİNİ oynatıcıdan
  açılır — Kur'an sayfasının dışında dinlerken yapılabilecek tek şey
  duraklatmaktı. Açma düğmesinin ikonu YUKARI OK ("bu şerit açılıyor");
  önce bir çubuk grafikti ve neyi açtığı okunmuyordu. Ekranda İKİ çarpı
  olmaz: köşedeki çarpı sayfayı kapatır, kıraati durdurmak yazıyla
  ("Kıraati durdur") — iki çarpı yan yana hangisinin sesi hangisinin
  pencereyi kapattığını belirsiz bırakıyordu.
- **Oynatıcı ekranı okuma sayfasının AYNI yazı ayarlarını kullanır**:
  okunan ayet, seçilen Arapça fontta, yazı boyutu ölçeğiyle (70–180%)
  ve tecvit işaretlemesiyle basılır. Önce popup'taki ayet sabit 1.5rem
  ve DÜZ metin basıyordu (ölçüldü: popup `.ar` = 25.6px, ölçek yok,
  `.tj` parçası 0) — kullanıcının seçtiği font yalnızca akan metinde
  geçerliydi. Ölçülen yeni hâl: açık ölçek 1.4 → 33.6px, font
  "Amiri, serif", 7 renkli tecvit parçası. Tek ayetin tecviti
  `utils/qpc`de `verseTajweed` ile geliyor (`verses/by_key`; sayfa
  yolu `by_page` idi ama oynatıcıda sayfa bilinmiyor — kıraat sure
  bazında ilerliyor). Font `ensureFont` ile yükleniyor.
- **Tecvit sınıf adları API'nin GÖNDERDİĞİ yazımla**: `idgham_ghunnah`
  ve `qalaqah` (ölçüldü: `by_page` 255 ve `by_key` 2:255 yanıtları).
  Eski liste `idgham_with_ghunnah` / `qalqalah` diyordu — bu iki kural
  API'den GELMİYORDU ve bu yüzden HİÇ renklenmiyordu (metin çıkıyordu,
  renksiz). Ölçülen fark: sayfa 255'te 7 `qalaqah` + 2
  `idgham_ghunnah` parçası artık renkleniyor. Renkler artık GLOBAL
  (`assets/css/tajweed.css`): aynı blok MushafView'da ve PlayerSheet'te
  iki kez gerekliydi, kopyalanmış hali silindi.
- **Kârî bağlama App.vue'da**: kârî seçici artık Kur'an sayfasının
  dışından da (mini oynatıcıdan) açılabiliyor, `setReciter` izleyicisi
  sayfada kalsaydı orada yapılan seçim oynatıcıya hiç ulaşmazdı.
  Varsayılan kârî **Hadi Turé**: damgaları bizde, yani ayet takibi ilk
  açılışta çalışıyor.
- **Okunan ayet ekranın ortasında tutulur** (`Takip` anahtarı,
  `settings.quranAutoScroll`, varsayılan açık). Anahtar şeritte durur,
  ayarlar sayfasında değil: dinlerken verilen bir karar ve etkisi
  hemen aynı ekranda görülüyor. Kaydırma YALNIZCA ses çalarken yapılır
  — elle okurken sayfanın kendiliğinden kayması okuyanı yerinden eder.
  - Hedef `data-v="sure:ayet"` ile bulunur; üç görünüm de bu işareti
    taşıyor (mushafta ayetin ilk kelimesi, esnekte ayetin kendisi,
    ayet ayet görünümünde hem blok hem ayet), böylece tek arama yetiyor.
  - `scrollIntoView` KULLANILMAZ (`utils/scrollCenter.js`): yoldaki
    bütün kaydırma kutularını birden kaydırıyor ve iç içe kutularda
    (sayfa kutusu, tam ekran kabuğu, belge) biri kayarken öbürü
    yerinden oynuyor. Yalnızca elemanın ilk kaydırılabilir atası
    kaydırılır; ölçüldü: ayet değişiminde kutunun merkezinden sapma 0px.
  - Kaydırma `nextTick` sonrası yapılır: sayfa kıraatle çevrildiğinde
    vurgu yeni sayfa çizilmeden yazılıyor ve eleman henüz yok.
  - **Takip açıkken ekran kararmaz** (`composables/useWakeLock.js`,
    Screen Wake Lock): mukabelede ekrana bakılıyor ama dokunulmuyor,
    telefon bir iki dakikada ekranı karartıyordu. Kilit yalnızca ses
    ÇALARKEN istenir; kullanıcı ekranı kendi kilitlerse geri alınmaz
    ("cebimde ekran yanıyor" olmasın), sekme öne gelince
    `visibilitychange` ile yeniden istenir. Desteklemeyen tarayıcıda
    sessizce atlanır.
- **Dinle düğmesi nota değil KULAKLIKTIR**: nota müziği çağrıştırıyor,
  buradaki iş kıraat dinlemek.
- **Sistem oynatıcısına künye yazılır** (Media Session): bildirim
  alanında ve kilit ekranında başlıkta sure numarası, adı ve okunan
  ayet, sanatçı alanında kârî ve okuyuş (`Hadi Turé · Murattal`),
  kapakta uygulama simgesi durur. Yazılmazsa orada sayfanın başlığı ve
  dosya adı (`001.mp3`) görünüyor — ne okunduğu da kimin okuduğu da
  belli olmuyordu. Başlık okunan ayetle güncellenir, bu yüzden çalan
  ayet artık bir `ref` (`lastVerse`) ve sayfa çevirmeyle aynı kaynaktan
  sürülür. İleri/geri düğmeleri PARÇA değil AYET değiştirir
  (`step(±1)`) — mukabelede istenen hareket bu. `setPositionState`
  yalnızca süre bilindiğinde çağrılır, yoksa tarayıcı hata atıyor.
- **Sure hedefi İLK AYETİNİ de taşır.** Bir sure sayfanın ortasında
  başlıyor olabiliyor (Kehf 293. sayfanın ortasında); hedef yalnızca
  sayfa olarak verilince hem vurgu hem kıraat sayfanın başındaki ÖNCEKİ
  sureden başlıyordu (Kehf'e tıklayınca İsrâ okunuyordu). Üç giriş de
  (`GoTo`, `PickerSheet`, hızlı erişim) artık `{ surah, verse: 1 }`
  yolluyor. Kıraatin başlangıcı buna bağlandı: `ListenBar`'ın `start`
  prop'u işaretli ayettir, çalınan sure ve başlama noktası ondan gelir;
  işaret yoksa eski davranış sürer (sayfanın ilk suresi).
- **Adres çubuğu TEK izleyiciden yazılır.** Sayfa/sekme ve vurgu için
  iki ayrı `router.replace` vardı ve ikisi aynı turda tetiklendiğinde
  her biri `route.query`nin DİĞERİNDEN ÖNCEKİ halini yayıp öbürünün
  anahtarını düşürüyordu — ölçüldü: Kehf'e gidince adres `?s=1&a=18:1`
  kalıyor, sayfa 293 olmuşken.
- **Sure künyesinde "başından dinle" düğmesi var**: ayete çift dokunmak
  kıraati o ayetten başlatıyor ama sureyi BAŞINDAN dinlemek en sık
  istenen şey ve çift dokunuş onu bilinmez bir hareketin arkasında
  bırakıyordu. Düğme ayrı bir düzenek kurmaz, mevcut `ayah` olayını
  `{ surah, verse: 1 }` ile yollar — şerit kapalıysa açılması ve
  besmele de oradan geliyor.
- **Esnek görünümde ayet numarası madalyondur**, düz rakam değil: akan
  metinde küçük bir rakam seçilmiyordu, ayetin nerede bittiğini gözle
  aramak gerekiyordu. Ölçü `em` cinsinden — yazı boyu %70–180 arasında
  değişiyor, madalyon onunla büyüyüp küçülmeli.
- **Yayıncı dosya adları tek biçim değil**: çoğu sıfır dolgulu
  (`001.mp3`), Turé ve mücevved Abdülbasit dolgusuz (`1.mp3`).
  `sourceFile()` bunu `padded: false` ile ayırır; AYNADAKİ ad hep
  dolguludur. Dolgulu istemek 404 veriyor ve kârî sessizce atlanıyordu.

## Kârî Kayıtları

- Kütük `src/data/reciters.js`. **Sesi biz taşımıyoruz, ikinci kopya
  tutuyoruz**: çalma sırası önce kaydın KENDİ kaynağı (yayıncının
  CDN'i), hata verirse bizim aynamız (`VITE_AUDIO_MIRROR_BASE`, R2).
  Normal halde bize bant genişliği maliyeti çıkmıyor, kaynak düşerse
  okuma durmuyor. **Fontlarda sıra TERSTİR** ve sebebi farklı: ses
  büyüktür (bir hatim ~1 GB), font küçüktür ve her sayfada gerekir.
- Adresi doğrulanmış kârîler: Abdülbasit (murattal + mücevved), Hüsarî,
  Şüreym, Benna, Alakmî — `download.quranicaudio.com`. Kalan ikisi
  (Hadi Turé, Fatih Seferagić) quranicaudio kataloğunda (177 kârî) YOK
  ve QUL ses adresini betikle kuruyor, HTML'de geçmiyor: adres
  bulunana kadar `base`/`path` boş ve `availableReciters()` onları
  listelemiyor. Yarım bir kayıt göstermektense göstermemek doğru.
- Ayna ağacı kaynaktakiyle aynı DEĞİL, `<kari>/<sure>.mp3` diye
  düzleniyor: yayıncıların yol düzenleri birbirini tutmuyor, aynada tek
  düzen olmalı ki `audioSources()` tahmin yürütmesin.
- İndirme betikleri (`scripts/mirror-recitations.js`,
  `scripts/mirror-mushaf-fonts.js`) hedef ağacı **CDN'de görünecek
  yolun birebir aynısı** olarak kurar (`<out>/ses/…`, `<out>/mushaf/…`),
  böylece yükleme tek dizin kopyalamaya iner. Hedef `--out` ile verilir
  (varsayılan `.mirror/`, gitignore'da). Kova `alaturkavakitler-assets`,
  alan adı `cdn.alaturkavakitler.com`: mushaf ve ses ayrı kova değil
  ayrı ÖN EK — tek alan adı, tek ayar.
- QUL kayıt numaraları (`qul`) kütükte duruyor: **ses için değil, zaman
  damgası için** — kelime vurgulama o veriden gelecek.

## Hazır Arka Planlar

- `src/data/backgrounds.js` — dokuz görselin kütüğü. Dosyalar bizim
  CDN'imizde (`cdn.alaturkavakitler.com/gorsel/bg/`), her birinin tam
  (2560px) ve küçük (`-k`, 640px) hâli var; küçük olan yalnızca seçici
  içindir.
- **Görseller Pexels'ten seçilip kopyalandı.** Pexels şu an API
  anahtarı vermiyor ve koleksiyon sayfası betikle çekilmiyor (403);
  görseller tarayıcıda açılan koleksiyon sayfalarından okunan
  kimliklerle `images.pexels.com` üzerinden indirildi. Her açılışta
  başkasının sunucusuna gitmek, sayfanın açılış hızını başkasının
  eline bırakmak demek — bu yüzden kopya bizde.
- Seçim ölçütü: YATAY ve yazıyı boğmayan kareler. Kalabalık olanlar
  (vapur kuyruğu, orman kulübeleri, araç içinden yol) elendi; `tone`
  alanı ortalama parlaklıktır ve açık görsellerde karartmaya bir taban
  ekleniyor.
- **Görsel oluşturucuda hazır görsel seçmek, onu İNDİRİP data URI'ye
  çevirir** (`pickPreset`): dışa aktarım belgeyi rasterize ediyor ve
  uzaktaki bir görsel orada CORS'a takılıp tuvali kirletiyor. İndirilen
  görsel, galeriden seçilmiş bir fotoğraftan farksız davranır.
- Aynı kütük yeni sekme eklentisinde de duruyor
  (`alaturka-newtab/src/data/backgrounds.js`): iki ayrı depo, ortak
  paket yok. Biri değişirse öbürü de değişmeli.
- Yükleme: `SRC_ROOT=<depo>/.mirror scripts/upload-cdn.sh gorsel/bg`
  (hız sınırı betiğin içinde).

## Yedekleme

- Uygulamanın bütün hafızası tarayıcıdadır ve geri getirecek bir sunucu
  yoktur: tarayıcı verisini temizlemek ayarları, şehri, kaza sayaçlarını,
  hatimleri, kaydedilen ayetleri ve görsel düzenini siler. Bu yüzden dışa aktarma bir özellik
  değil, zorunluluk (`src/utils/backup.js`, ayarlarda "Yedek" bloğu).
- Yedeğe giren: `city`, `kazaCounts`, `hatimler`, `kayitliAyetler`, `shareEditor` ve bütün
  `settings_*`. **Girmeyen**: `vakitler`, `kuranVerses`, `vakitNotifyFired`
  — üçü de yeniden üretilebilir, yedeği şişirmekten başka işe yaramazlar.
- Dosya tarayıcıda üretilir (`Blob` + `URL.createObjectURL`), hiçbir yere
  gönderilmez. Ad: `alaturka-yedek-YYYY-AA-GG.json`.
- **İçe aktarma iki adımlı**: önce dosya okunup doğrulanır ve "kaç kayıt,
  hangi tarihli" diye söylenir, sonra onaylanır. Tek dokunuşla üzerine
  yazmak yanlış dosyada geri dönüşü olmayan bir iş olurdu.
- Yedek elle düzenlenebilir bir metindir: yüklerken yalnızca TANINAN
  anahtarlar yazılır (`KEYS` + `settings_` öneki), gerisi yok sayılır.
- Yükleme sonrası sayfa yenilenir — store'lar veriyi açılışta okuyor.

## Vakit Hatırlatmaları

- Bildirim vaktin KENDİSİNDE değil öncesinde verilir: ezanla gelen haberin
  hazırlanacak vakti kalmıyor. Süre vakit başına ayarlanır —
  `src/data/vakitNotify.js` (varsayılanlar, seçenek listesi, metin kalıbı),
  ayar `settings.notifyOffsets` (dakika; `-1` kapalı, `0` tam vakitte).
- `notifyOffsets` bir obje olduğu için settings store'un kayıt izleyicisi
  `deep: true` ile kurulu; tek bir vakit değişince de yazılır.
- Zamanlama `useVakitNotifications()` içinde ve **tek bir `setTimeout`
  değil 20 saniyelik bir yoklama**: arka plan sekmesinde tarayıcı
  zamanlayıcıları kısıyor, cihaz uyuduğunda uzun timeout çok geç uyanıyor.
  Yoklama "şu an ile beş dakika öncesi arasında bir hatırlatma vakti geçti
  mi" diye bakar, böylece geciken bir tik hatırlatmayı düşürmez.
- Verilen hatırlatmalar `vakitNotifyFired` anahtarında tutulur
  (`gün-vakit-dakika`); sayfa yenilenince aynı hatırlatma tekrar verilmez.
- Bugünün ve yarının tablosu birlikte taranır: bir saatlik imsak uyarısı
  gece yarısının öbür tarafına düşüyor.
- Bildirim mümkünse servis çalışanından verilir (`registration.showNotification`);
  Android Chrome `new Notification()` çağrısını reddediyor.
- İzin verilmediyse anahtar AÇILMAZ — açık görünüp hiç bildirim gelmemesi,
  kapalı durmasından daha yanıltıcı.
- **Web Push** isteğe bağlıdır. Desteklenen cihazlarda Ayarlar’daki
  “Uygulama kapalıyken de bildir” düğmesi tarayıcı aboneliği oluşturur.
  Düğme kapalı ayarda da görünür ve neden kullanılamadığı altında yazılır.
  `src/stores/vakitPush.js` il ve süre değişikliklerini sırayla gönderir.
  Çevrimdışı değişiklik bağlantı gelince yeniden gönderilir. Push aboneliği
  olan cihazda sekme zamanlayıcısı susar, böylece aynı uyarı iki kez üretilmez.
- **Dağıtım:** `workers/vakit-push/wrangler.jsonc`, yalnızca
  `alaturkavakitler.com/api/vakit-push/*` yolunu ayrı Cloudflare Worker’a
  yönlendirir. Worker 1 dakikalık UTC cron tetikleyicisi ve `DB` D1 bağını
  kullanır. VAPID anahtar çifti Worker secrets olarak tutulur. Özel anahtar
  repoya ve Pages derlemesine girmez. Yeniden dağıtırken mevcut anahtar
  çiftini koru, aksi halde tarayıcı abonelikleri geçersiz olur.
- **Zamanlama:** D1’de abonelik, il, süre ayarları ve bir sonraki yoklama
  saklanır. Worker zamanı gelen kayıtları dizinden alır, güncel miladi
  tabloyu okur ve aynı hatırlatmayı iki cron çağrısının göndermesini
  koşullu D1 güncellemesiyle önler. İl/süre güncellemesi eski zamanlamayı
  geçersiz kılar. Bildirim aracı 404/410 döndürürse kayıt silinir.
  Beş dakikayı geçen uyarılar atlanır. D1 şeması
  `workers/vakit-push/migrations` altındadır.
- **Service worker:** Workbox üretimi ve önbellekler korunur.
  `public/vakit-push-sw.js` üretilen service worker’a `importScripts`
  ile yüklenir ve gelen push’u gösterir. Geliştirme sunucusu service
  worker’ı kaldırdığı için akış üretim derlemesinde denenir.

## Hicri Takvim

- Dönüşüm **tablo tabanlıdır** ve core'dadır: paketin `data/hijri-months.json`
  dosyası her hicri ayın 1'ine denk gelen miladi günü tutar, `toHijri` /
  `fromHijri` ikili aramayla çevirir. `hijri-date` paketi kaldırıldı.
- **Neden:** aritmetik (tabular) kütüphaneler sabit kural uygular, Diyanet
  hesabî takvim kullanır. Ölçüldü — 2026'nın 12 ay başlangıcından 9'u tutmuyordu,
  Ramazan'da sapma 2 güne çıkıyordu. Sabit düzeltme katsayısı işe yaramaz.
- Tablodaki `Diyanet` işaretli satırlar doğrudan Diyanet'ten (2023–2026);
  gerisi Umm al-Qura'dan üretildi (Diyanet'in 49 başlangıcının 44'ü birebir
  aynıydı, farklı 5'i Diyanet değeriyle değiştirildi). Kapsam 2022-07 – 2036-05;
  dışına çıkılırsa ortalama ay uzunluğuyla tahmin yürütülür (`exact: false`).
- Satır bütünlüğü (ardışık ay araları 29/30 gün) DEV modunda konsola yazılır.
- **Hicri gün akşam ezanıyla başlar.** `settings.hijriOffset` açıkken tarih
  akşamdan sonra bir gün ileri alınır. Tek kaynak `useHijriToday()` composable'ı;
  tarih gösteren her yer oradan beslenir (`shareSnapshot` hariç — o anlık
  görüntü aldığı için `aksamCutoff`'u doğrudan çağırır).
- **Türkiye'nin sabit miladi tatilleri** (`src/data/publicHolidays.js`)
  ay ızgarasındaki miladi tarihe göre işaretlenir. Akşam ezanıyla hicri
  gün değişince tatilin miladi günü değişmez. Dinî gün noktası ve resmî
  tatil karesi aynı hücrede birlikte gösterilebilir. 28 Ekim için seçili
  gün etiketinde tatilin saat 13.00’te başladığı yazılır.
- **Hicri ay künyesi ve TDV bağlantısı**: Takvim sayfasında (`HijriMonthCalendar.vue`)
  hem seçili ay başlığının hem de ay gezinti şeridinin yanındaki bilgi butonuyla
  `HijriMonthInfoSheet.vue` açılır. `src/data/hijriMonthInfo.js` dosyasından
  ayın etimolojik kökeni, lügat manası, İslami önemi, önemli günleri ve
  TDV İslam Ansiklopedisi doğrudan madde bağlantısı (`islamansiklopedisi.org.tr`)
  sunulur.

## Geliştirme Notları
- **Yükleme hızı SINIRLI tutulur.** Hattın yükleme tavanı ~2,5–3 MB/s;
  tamamı doldurulduğunda internet kullanılamaz hâle geliyor (yaşandı —
  CDN'e ses yüklerken). Kural: `--bwlimit 1M` (en çok 1,5M), iki eşzamanlı
  aktarım. `scripts/upload-cdn.sh` bunu zaten uyguluyor, elle `rclone`
  çağırma.
- **Aynı hedefe iki rclone birden çalıştırma**: bir kez üç kopyalama
  üst üste bindi (biri kullanıcının, ikisi benim) ve hat tıkandı.
  Başlamadan `pgrep -fa rclone` ile bak.
- R2 ilk istekte sık sık `501 Not Implemented` döner, ikinci denemede
  geçer — `--s3-disable-checksum --retries 10 --low-level-retries 20`
  ile sessizleşir. Hata değil, gürültü.

- `git commit` GPG imzası gerektirir — Claude doğrudan commit atamaz, kullanıcı atar.
- `npm ci` yerine `npm install` kullan (package-lock.json değişiyor).
- Cloudflare Pages'te `yarn.lock` varsa Yarn kullanır — repo'da olmamalı.
- `vite-plugin-pwa` ile `manifest: false` → `public/manifest.json` olduğu gibi kullanılır.
- Ay fazı SVGleri: `/public/Icons/moon/1.svg` → `29.svg` (hicri gün numarasıyla).
- `nowPercent` VakitRangeView'da: `(now - imsak_bugün) / (imsak_yarın - imsak_bugün) * 100`.
- v1 React kodu `_v1/` klasöründe arşivlendi — referans için okunabilir.

---

## Logo Animasyonu

- `brand/logo-animation/` — logonun açılış/kapanış animasyonu. İki tüketicisi var:
  `src/components/ui/LogoMotion.vue` (üst çubuktaki marka işareti + yükleyici)
  ve tanıtım videoları (`render.mjs` ile video).
- **Animasyon iki yerde tanımlı** (`index.html` ve `LogoMotion.vue`); koreografi
  ve zamanlama aynı, birini değiştirince diğerini de güncelle.
- Koreografi (video): işaret ortada belirir → sola kayar → kayarken harfler
  soldan sağa tek tek açılır, her harf biraz sağdan gelir (çekiliyormuş hissi).
- Sitede kayma YOK (`slide` varsayılan false): logo zaten yerinde dururken onu
  ortadan getirmek yersiz bir hareket. İşaret yerinde belirir, harfler açılır.
- Harfler gerçek ayrı yollar: kelime yolundaki alt yollar mutlak koordinata
  çevrilip x konumuna göre gruplandı (8+8). İki tuzak: kapalı konturda `z`
  sonrası imleç alt yolun başına döner; `m` sonrası örtük koordinatlar GÖRELİ
  linetodur (başı `M` yapınca mutlak sayılıp şekil dağılıyor, önüne `l` koy).
- SVG'de `transform` ÖZNİTELİĞİ ile CSS animasyonunu aynı elemanda birleştirme:
  CSS `transform` özniteliği eziyor. İşaretin `scale(-1)` taşıyan parçası ayrı
  bir `<g>` içinde durmalı — yoksa sol parça kayboluyor.
- Vue scoped stilde `:root` seçicisi `:root[data-v-...]` olur ve hiç eşleşmez;
  bileşen değişkenleri bileşenin kökünde tanımlanır.
- SVG'de dönüşüm kullanırken `transform-box: fill-box` şart; yoksa köken
  tuvalin tamamına göre hesaplanıp parçalar ekrandan uçuyor.
- `render.mjs` zamanı **Web Animations API** ile sürer (animasyonları
  duraklatıp kare başına `currentTime` kurar). CDP sanal saati denendi ve
  çalışmadı: saat tamamen duruyorken `Page.captureScreenshot` hiç dönmüyor,
  yüklenme payı için bütçe verilince de o süre animasyonun başından yeniyor.
- Saydam kayıt için komut satırı bayrağı (`--default-background-color`) değil
  `Emulation.setDefaultBackgroundColorOverride` kullanılır; bayrakla ekran
  görüntüsü hiç dönmüyordu.

## Sosyal Medya Kartları

- `brand/social/` — özellikleri tanıtan Instagram story (1080×1920) ve 4:5
  gönderi (1080×1350) kareleri ve ~10 sn videolar. Ayrıntı:
  `brand/social/README.md`.
- **Karttaki telefonun içinde uygulamanın kendisi çalışır** (iframe, `dist/`).
  Arayüz kart için yeniden ÇİZİLMEZ. Bir kez çizildi ve hemen yanlış oldu:
  kaza sayacı gerçekte vakte basılı tutunca açılan tam genişlikte bir bant,
  elle çizilen sürümde yan yana +/− düğmeleri olan bir satır listesiydi.
  Taklit edilen arayüz, uygulama değiştikçe sessizce yalan söyler.
- Hareket de taklit değil: her belgeye kendi betikleri çalışmadan önce sahte
  bir saat enjekte edilir (`Date`, `setTimeout`, `setInterval` sanal zamana
  bağlanır) ve kare başına zaman ilerletilir. Sayaç gerçekten sayar, basılı
  tutma gerçekten bandı açar, palet gerçekten değişir.
- Kart ve uygulama **aynı kökenden** sunulmalı, yoksa karttan iframe'e
  erişilemez. `dist/sw.js` yayınlanmamalı: kayıtlı bir servis çalışanı
  gezinme isteklerine app shell'i döndürüp `/_card.html`'i de uygulamayla
  değiştiriyor.
- Ölçekleme `transform: scale()` ile yapılır. Kök elemana `zoom` vermek
  viewport'u küçültmüyor — uygulama 559px genişlikte bir tablet gibi
  yerleşiyor, alt gezinme ekran dışında kalıyordu.
- Kartta `--accent` ile `--grad` AYRI: aksan koyu zeminin üstünde okunmak
  için parlaktır, aynı rengi kartın tepesine koyunca beyaz başlık okunmuyor
  (sarı/turuncu vakitlerde ölçüldü). `--primary` / `--accent-ui` ayrımının
  aynısı.
- Kart çerçevesinin yazı tipi siteyle aynı (Inter Tight); monospace
  kullanılmaz.
- `node render.mjs --youtube` aynı sahnelerden YouTube için tek parça
  1920×1080 film basar (~86 sn): giriş + yedi özellik + çıkış. Yatayda
  metin solda bir kolonda, telefon sağda durur — dikeydeki gibi üst üste
  dizilince telefon 1080px'e sığmak için okunmaz hâle geliyor. Bölümler
  siyaha düşerek (`.veil`) birleşir; her bölüm kendi MP4'üne basılıp akış
  kopyalanarak birleştirilir (tek dizi hâlinde PNG tutmak birkaç GB eder).
  Film sessizdir, müzik sonradan bindirilir.
