# Alaturka Vakitler v2 — Yol Haritası

## Faz 1: Temel Altyapı (Migration)

**Hedef:** Çalışan bir Vue 3 uygulaması — v1 ile feature parity.

- [x] Vite + Vue 3 proje kurulumu
- [x] Vue Router 4 (history mode, mevcut rotalar)
- [x] Pinia store (city, vakitler, vakit, currentVakit)
- [x] Custom CSS mimarisi (base.css, typography.css, component scoped)
- [x] Vakit renk teması (CSS custom properties + data-vakit)
- [x] Açık/koyu/sistem tema desteği
- [x] Vakitler veri çekme + localStorage cache
- [x] `createVakitObj` / `findVakit` / `isKerahat` utils
- [x] TopNav (logo inline SVG + şehir seçici + dropdown menü)
- [x] BottomNav (4 nav item, active state + glow)
- [x] VakitCounter (countdown + kerahat)
- [x] VakitList (vakitler listesi)
- [x] VakitRangeView (timeline bar + now-line)
- [x] AlaturkaClock + normal saat (dijital)
- [x] AnalogClock (SVG, alaturka vakti gösterir)
- [x] Calendar widget (hicri + miladi + ay fazı SVG)
- [x] PWA (vite-plugin-pwa, offline destek, Workbox)
- [x] Cloudflare Pages deploy (v2 branch, otomatik CI)
- [x] OG/Twitter meta, favicon, manifest, apple-touch-icon
- [ ] SEO (@unhead/vue — sayfa bazlı dinamik meta)

---

## Faz 2: Hata Düzeltme &amp; Temel İyileştirmeler

- [x] `100dvh` ile chrome mobil scroll sorunu
- [x] Açık/koyu/sistem tema (CSS + ayardan)
- [x] OG/Twitter paylaşım görselleri (statik, index.html'de)
- [ ] Dropdown dışına tıklanırsa kapanma (clickOutside directive)
- [ ] Gece yarısından sonra dünün vakitlerini gösterme sorunu
- [ ] Akşam ezanı geçince günü güncelleme (reactive date watch)
- [ ] Loading placeholder'lar (skeleton)
- [ ] Hicri takvim doğruluğu araştırma (hijri-date lib değişimi gerekebilir)

### SEO

- [ ] `@unhead/vue` kurulumu — sayfa bazlı dinamik `<title>`, `<meta description>`, `<canonical>`
- [ ] Her sayfa için ayrı OG meta (og:title, og:description, og:image)
- [ ] JSON-LD: `WebSite` yapısal verisi (ana sayfa)
- [ ] JSON-LD: `BreadcrumbList` (blog/detay sayfaları)
- [ ] sitemap.xml otomatik üretimi (`vite-plugin-sitemap` veya build script)
- [ ] robots.txt güncelleme (mevcut dosya var, sitemap URL ekle)
- [ ] Google Analytics 4 (`VITE_GA_ID` env var ile)
- [ ] Yandex Webmaster doğrulama meta etiketi

---

## Faz 3: Ayarlar Sayfası

- [x] Sayfa tasarımı
- [ ] Birincil saat seçimi (alaturka / normal)
- [ ] İkincil saat seçimi (opsiyonel)
- [ ] Saat tipi (dijital / analog)
- [ ] Hicri takvimi akşam ezanıyla ilerlet
- [ ] Vakit kaynağı (Diyanet / Türkiye Takvimi)
- [x] İlk açılacak sayfa seçimi
- [ ] Vakite göre tema rengi kullan/ma
- [x] Renk stili seçimi (klasik / pastel / canlı / mesh / mono — `data-palette`)
- [x] Ana sayfa saati seçimi (LED / normal)
- [ ] AI görsel stili: her vakit için AI ile üretilmiş blurlu long-exposure minimal arka plan görselleri (ayrı bir `data-palette` stili olarak)
- [ ] Minimal dini görsellerden oluşan renk stili (ayrı bir `data-palette` stili — minimal dini illüstrasyon/desen arka planları)
- [ ] Bildirimler (vakit değişimi)
- [x] İlk açılış sayfası ayarı
- [x] Tüm ayarlar localStorage'a

---

## Faz 4: Saat Sayfası

- [ ] 5 farklı dijital tasarım (seçilebilir)
- [ ] 5 farklı analog saat tasarımı
- [x] Analog saat component (SVG tabanlı, akrep/yelkovan)
- [x] LED nokta-matris alaturka saat (ana sayfa)
- [ ] Alaturka saat web component (bağımsız embed edilebilir)
- [x] Normal + alaturka eş zamanlı gösterim

---

## Faz 5: Vakitler Sayfası

- [ ] Mevcut timeline görünümü iyileştirmesi
- [ ] Aylık vakitler tablosu/listesi
- [ ] Aylık vakitleri önbelleğe alma
- [ ] Nafile namaz etiketleri (kerahat gibi)
- [ ] Namaz vakti + sayaç web component

---

## Faz 6: Takvim Sayfası

- [ ] Grid takvim görünümü (aylık)
- [ ] Hicri takvime göre dini günler verisi (Directus'a kaydet)
- [ ] Rumi takvim araştırması + implementasyon
- [ ] Rumi takvime göre doğa olayları listesi
- [ ] Dini gün detay sayfası (dini gün + blog yazısı)
- [ ] Takvim sayfasına dini günler entegrasyonu
- [ ] Hicri/Rumi/Miladi geçişi

---

## CMS Kararı

**Local Directus → JSON export workflow:**

- Directus local'de Docker ile çalıştırılır (`docker run -p 8055:8055 directus/directus`)
- İçerik girişi sonrası `scripts/export-content.js` çalıştırılır → `src/content/*.json`
- JSON dosyaları repo'da tutulur, `git push` → Cloudflare Pages otomatik deploy
- Tek kişilik proje için yeterli; sunucu maliyeti sıfır

**Deployment: Cloudflare Pages** (GitHub Pages / Vercel yerine)

---

## Faz 7: İçerik &amp; Blog

- [x] CMS kararı: local Directus → JSON export
- [ ] Directus Docker kurulumu + koleksiyonlar (blog, dini günler, yenilikler)
- [ ] `scripts/export-content.js` yazımı
- [ ] Prismic → Directus içerik migration
- [ ] Şule Gürbüz yazısı render hatası düzeltme
- [ ] Yenilikler bölümü (changelog, blog formatında)
- [ ] Rumi ve hicri takvim üzerine yazılar
- [ ] Dini günler verisi oluşturma (Directus'a)
- [ ] Geliştiriciler için bölüm (API, web component dokümantasyonu)
- [x] Amentü sayfasına ses ekleme

---

## Faz 8: Paylaş Özelliği

- [ ] Paylaş canvas engine (HTML Canvas tabanlı)
- [ ] Saat ağırlıklı post şablonu (1:1 ve 9:16)
- [ ] Takvim ağırlıklı post şablonu (1:1 ve 9:16)
- [ ] Kullanıcı özelleştirme (başlık, yazı, saat, tarih pozisyonları)
- [ ] Kullanıcı kendi resmini seçip üzerine tarih / saat / not / mesaj yazsın (overlay tasarımları **swiss style**)
- [ ] Unsplash entegrasyonu (vakite göre önerilen görseller)
- [ ] AI ile üretilmiş blurlu long-exposure minimal görseller (paylaşım arka planı olarak)
- [ ] Görsel indirme + doğrudan paylaşım (Web Share API)
- [ ] Şablonu lokal kaydetme
- [ ] Şablonu QR ile paylaşma
- [ ] Şablon mağazası (ileride)

---

## Faz 9: Takvim Oluşturucu

- [ ] Şablon seçimi (yatay / dikey / kare)
- [ ] Miladi veya hicri ay seçimi
- [ ] Font seçimi
- [ ] Sayfa alt yazısı
- [ ] PDF / görsel dışa aktarma
- [ ] Şablon kaydet/yükle (local)
- [ ] QR paylaşım

---

## Faz 10: Platform Genişletme

- [ ] Chrome yeni sekme eklentisi
- [ ] PWA mağazalarına yükleme (Samsung Galaxy Store, Microsoft Store)
- [ ] Basit mobil uygulama (vakit/saat widget özelliği ile)
- [ ] Twitter botu (önemli dini günler)

---

## Faz 11: Dini Araçlar &amp; İçerik

- [ ] Kıble pusulası (cihaz sensörüyle minimal kıble yönü gösterimi)
- [ ] Dini radyo / Kuran dinleme bölümü (plak tarzı arayüz, YouTube listesi üzerinden)
- [ ] Kuran kayıtlarını indirip içerik yönetiminde ayrı kategori olarak girme (Directus)
- [ ] Kuran okuma bölümü
- [ ] Ana ekranda seçili ayetlerden gösterim

---

## Masaüstü Görünüm İyileştirmeleri

Uygulama mobile-first; geniş ekranlarda içerik gereksiz yayılıyor.

- [ ] İçerik için maksimum genişlik / ortalanmış kolon (geniş ekranda yayılmayı engelle)
- [ ] Masaüstünde çok kolonlu yerleşim (saat + vakitler + takvim yan yana)
- [ ] BottomNav yerine masaüstünde yan/üst navigasyon
- [ ] LED saat ve başlıkların geniş ekranda ölçek/oran ayarı
- [ ] Responsive kırılma noktaları (breakpoint) sistemi tanımla
- [ ] Klavye navigasyonu / hover durumları (masaüstü etkileşim)

---

## Teknik Borç &amp; Sürekli

- [ ] Scraper: dünün verisi kaybolmaması
- [ ] Service worker + web worker ayrımı
- [ ] Performans: VakitCounter interval optimizasyonu
- [ ] Lazy loading (sayfa bazlı code splitting)
- [ ] E2E test (Playwright)

---

## Öncelik Sırası

1. **Faz 1** — Çalışan Vue app (blocker)
2. **Faz 2** — Bilinen hatalar (kullanıcı deneyimi)
3. **Faz 3** — Ayarlar sayfası (çok istenen özellik)
4. **Faz 4** — Saat sayfası (uygulamanın kalbi)
5. **Faz 5** — Vakitler iyileştirme
6. **Faz 6** — Takvim
7. **Faz 7** — İçerik/Directus
8. **Faz 8+** — Paylaş, Oluşturucu, Platform, Dini Araçlar (kıble/Kuran)

