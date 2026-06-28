# Alaturka Vakitler v2 — Yol Haritası

## Faz 1: Temel Altyapı (Migration)

**Hedef:** Çalışan bir Vue 3 uygulaması — v1 ile feature parity.

- [x] Vite + Vue 3 proje kurulumu
- [x] Vue Router 4 (history mode, mevcut rotalar)
- [x] Pinia store (city, vakitler, vakit, currentVakit)
- [x] Custom CSS mimarisi (base.css, typography.css, component scoped)
- [x] Vakit renk teması (CSS custom properties + data-vakit)
- [x] Vakitler veri çekme + localStorage cache
- [x] `createVakitObj` / `findVakit` / `isKerahat` utils
- [x] TopNav (logo + şehir seçici + dropdown menü)
- [x] BottomNav (4 nav item, active state)
- [x] VakitCounter (countdown + kerahat)
- [x] VakitList (vakitler listesi)
- [x] VakitRangeView (timeline bar)
- [x] AlaturkaClock + normal saat
- [ ] Calendar widget (hicri + miladi + ay resmi)
- [ ] SEO (@unhead/vue)
- [ ] Cloudflare Pages deploy + CI
- [ ] PWA (vite-plugin-pwa, offline destek)

---

## Faz 2: Hata Düzeltme &amp; Temel İyileştirmeler

- [ ] `100dvh` ile chrome mobil scroll sorunu
- [ ] Dropdown dışına tıklanırsa kapanma (clickOutside directive)
- [ ] Gece yarısından sonra dünün vakitlerini gösterme sorunu
- [ ] Akşam ezanı geçince günü güncelleme (reactive date watch)
- [ ] Açık/koyu tema (CSS + ayardan)
- [ ] Loading placeholder'lar (skeleton)
- [ ] Paylaş butonu + URL sorunu
- [ ] Hicri takvim doğruluğu araştırma (lib değişimi gerekirse)
- [ ] SEO: robots.txt, sitemap.xml, canonical
- [ ] OG/Twitter paylaşım görselleri sayfa bazlı
- [ ] Breadcrumb + article JSON-LD
- [ ] Google Analytics 4
- [ ] Yandex Webmaster

---

## Faz 3: Ayarlar Sayfası

- [ ] Sayfa tasarımı
- [ ] Birincil saat seçimi (alaturka / normal)
- [ ] İkincil saat seçimi (opsiyonel)
- [ ] Saat tipi (dijital / analog)
- [ ] Hicri takvimi akşam ezanıyla ilerlet
- [ ] Vakit kaynağı (Diyanet / Türkiye Takvimi)
- [ ] İlk açılacak sayfa seçimi
- [ ] Vakite göre tema rengi kullan/ma
- [ ] Bildirimler (vakit değişimi)
- [ ] İlk açılış sayfası ayarı
- [ ] Tüm ayarlar localStorage'a

---

## Faz 4: Saat Sayfası

- [ ] 5 farklı dijital tasarım (seçilebilir)
- [ ] 5 farklı analog saat tasarımı
- [ ] Analog saat component (SVG tabanlı, akrep/yelkovan)
- [ ] Alaturka saat web component (bağımsız embed edilebilir)
- [ ] Normal + alaturka eş zamanlı gösterim

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
- [ ] Amentü sayfasına ses ekleme

---

## Faz 8: Paylaş Özelliği

- [ ] Paylaş canvas engine (HTML Canvas tabanlı)
- [ ] Saat ağırlıklı post şablonu (1:1 ve 9:16)
- [ ] Takvim ağırlıklı post şablonu (1:1 ve 9:16)
- [ ] Kullanıcı özelleştirme (başlık, yazı, saat, tarih pozisyonları)
- [ ] Unsplash entegrasyonu (vakite göre önerilen görseller)
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
- [ ] Twitter botu (önemli dini günler)

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
8. **Faz 8+** — Paylaş, Oluşturucu, Platform

