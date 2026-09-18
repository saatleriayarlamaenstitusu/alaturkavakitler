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
- [x] Dropdown dışına tıklanırsa kapanma (clickOutside directive)
- [ ] Gece yarısından sonra dünün vakitlerini gösterme sorunu
- [ ] Akşam ezanı geçince günü güncelleme (reactive date watch)
- [ ] Loading placeholder'lar (skeleton)
- [ ] Hicri takvim doğruluğu araştırma (hijri-date lib değişimi gerekebilir)

### SEO

- [x] Sayfa bazlı dinamik `<title>`, `<meta description>`, `<canonical>` (`useSeo` composable — @unhead yerine hafif çözüm)
- [x] Her sayfa için ayrı OG/Twitter meta (og:title, og:description, og:url) — `useSeo` ile
- [x] JSON-LD: `WebSite` yapısal verisi (ana sayfa)
- [x] JSON-LD: `Article` + `BreadcrumbList` (blog detay sayfaları)
- [x] sitemap.xml otomatik üretimi (`scripts/generate-sitemap.js` — build öncesi, statik rotalar + blog detay sayfaları)
- [x] robots.txt güncelleme (Allow + sitemap URL)
- [x] Google Analytics 4 (`VITE_GA_ID` env var ile, SPA sayfa görüntüleme takibi)
- [ ] Google Search Console doğrulama (GA4 üzerinden veya `public/google<token>.html`)
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
- [ ] Kaza namazları sayacı + popup açan buton / popupta basit artı eksi olan sayaç / sayaç değer varsa vakit lstesinde badge ile saysını göster
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
- [x] Prismic içerik migration (yerel JSON — `src/content/saatuzerine.json`, Directus şemasına uyumlu)
- [x] Şule Gürbüz yazısı render hatası düzeltme
- [x] Saat üzerine sayfası: BlogPage liste (kapak görseli) + BlogDetailPage detay
- [ ] Yenilikler bölümü (changelog, blog formatında)
- [ ] Rumi ve hicri takvim üzerine yazılar
- [ ] Dini günler verisi oluşturma (Directus'a) — hazır olunca Tarih widget'ının "Etkinlik" alanı otomatik dolabilir
- [ ] Geliştiriciler için bölüm (API, web component dokümantasyonu)
- [x] Amentü sayfasına ses ekleme

---

## Faz 8: Paylaş Özelliği

- [x] Paylaş tuval motoru (gerçek boyutlu DOM tuval + snapdom export; katman modeli, sürükle/ölçekle/döndür)
- [x] Oran seçimi: 9:16 / 4:5 / 1:1 (katmanlar oran değişiminde oransal taşınır)
- [x] Widget seti: alaturka saat (dijital), analog saat, vakit (şu an + sonraki), hicri+miladi tarih (kart/sade/dikey + etkinlik satırı), serbest metin, Arapça hazır ibare, logo/sembol
- [x] Swiss ızgara katmanı (arka plan ayarlarında): sütun/satır, kenar boşluğu, kalınlık, belirginlik, renk, çerçeve
- [x] Kullanıcı özelleştirme (konum, ölçek, dönüş, renk, hizalama) + her değer elle girilebilir (saat, tarih, vakit adları); boş alan gizlenir
- [x] Yazı tipi seçimi (Google Fonts uyumlu, `src/data/shareFonts.js`'ten genişletilebilir) + kalınlık + italik — 7 latin + 8 Arapça hat (Amiri, Aref Ruqaa/rika, Scheherazade New, Noto Naskh, Noto Nastaliq/talik, Reem Kufi, Cairo, Tajawal)
- [x] Kullanıcı kendi resmini arka plan yapsın + kadraj (pinch zoom/kaydır), bulanıklık, karartma (overlay tasarımları **swiss style**)
- [ ] Ayet widget'ları (açık Kuran API'si ile): istenilen ayet(ler)in **Arapça metni** ve **Türkçe meali** ayrı birer widget olarak görsele eklenebilsin
  - [ ] Ayet seçimi (sure + ayet no / aralık) ve açık Kuran API entegrasyonu
  - [ ] Arapça widget ayarları: renk + Arapça font (font altyapısı hazır — `shareFonts.js`'te rika/nesih/kufi hatları tanımlı)
  - [ ] Türkçe meal widget ayarları: renk + font + boyut/hizalama
- [ ] **Hazır görsel kütüphanesi** (arka plan sekmesinde): Pexels/Unsplash üzerinde küratörlü galeriler oluşturulup widget'ta listelenir
  - [ ] Galerilerin oluşturulması — vakit temalı (şafak, gün batımı, gece), minimal doku, mimari/cami
  - [ ] Kaynak ve anahtar kararı: Pexels API ücretsiz ve atıf isteğe bağlı, Unsplash atıf zorunlu — lisans metni karşılaştırılacak
  - [ ] Galeri şeridi + küçük önizlemeler; seçilince tam çözünürlük indirilir
  - [ ] Seçilen görsel mevcut fotoğraf akışını kullanır (kadraj/pinch zoom, bulanıklık, karartma)
  - [ ] Atıf/lisans bilgisinin görselde ya da paylaşım metninde gösterimi
  - [ ] Önbellek: indirilen görsel localStorage kotasına sığmaz (bkz. mevcut fotoğraf geri çekilmesi) — IndexedDB değerlendirilmeli
- [ ] AI ile üretilmiş blurlu long-exposure minimal görseller (paylaşım arka planı olarak)
- [x] Görsel indirme + doğrudan paylaşım (Web Share API)
- [ ] Görselleri herkese açık payaşma moderotör kontrolünde
- [x] Ayet dışı Arapça dini hazır metinler (19 ibare, `src/data/arabicPhrases.js`) + serbest giriş + Latin alt satır + harekeli/harekesiz
- [x] Osmanlıca (eski yazı) hazır ifadeler widget'ı (14 ifade, `src/data/ottomanPhrases.js`)
- [x] Katman opaklığı + harf aralığı ayarları
- [x] Gren doku (film grain) ayarları: yoğunluk, kabalık, karışım modu
- [x] Alaturka saat widget'ında saat / başlık / alt yazı boyutları ayrı ayrı ayarlanabilir
- [x] Arapça rakam seçeneği (saat widget'ı)
- [x] Ayar panelinde gruplama + Swiss düzen geçişi (kolon ızgarası, sayısal okumalar, dik açılar)
- [x] Taşırken hizalama (snap): tuval kenar/merkez, grid kenar boşluğu, diğer katmanlar + kılavuz çizgiler; katman başlığından kapatılabilir
- [x] Renk seçici: fotoğraftan çıkarılan palet + kullanıcının ekleyebildiği kalıcı renkler
- [ ] **Hat widget'ı**: vektörel hatlar, rengi değiştirilebilir
  - [ ] Hat setinin toplanması (besmele, lafza-i celâl, çâr-ı yâr, kandil/vakit hatları) — her birinin telif/lisans durumu netleştirilecek
  - [ ] SVG'ler tek renge indirgenip `fill: currentColor` ile yazılacak; renk ayarı bunun üzerinden çalışır
  - [ ] **Export kuralı**: stroke'lu `<line>`/`<path>` kullanılamaz, dolgulu path'e dönüştürülmeli (bkz. `CLAUDE.md` → Görsel Oluşturucu)
  - [ ] Vektörü bulunamayan hatlar için şeffaf zeminli PNG yedeği (rengi değiştirilemez, ayar panelinde gizlenir)
  - [ ] Hat seti `src/data/` altında veri dosyası olarak; yeni hat eklemek bir satır olmalı
- [ ] **Görsel widget'ı**: kullanıcının kendi PNG / SVG / JPG dosyasını katman olarak ekleyebilmesi
  - [ ] Dosya seçici + sürükleyip bırakma; katman olarak eklenir (taşı/ölçekle/döndür mevcut motordan gelir)
  - [ ] Kırpma: dikdörtgen kadraj, isteğe bağlı yuvarlak/kare maske
  - [ ] Tek renkli SVG'lerde renk değiştirme (`fill: currentColor`'a indirgenebilenler için); çok renkli SVG ve PNG'de renk ayarı gizlenir
  - [ ] **Export kuralı**: eklenen SVG'deki stroke'lu `<line>`/`<path>` dışa aktarımı çökertiyor — içe alırken dolgulu path'e dönüştür ya da rasterize et (bkz. `CLAUDE.md` → Görsel Oluşturucu)
  - [ ] Boyut sınırı + kalıcılık: data URI olarak saklanan büyük görsel localStorage kotasını aşar; arka plan fotoğrafındaki geri çekilme yolunun aynısı ya da IndexedDB
  - [ ] Opaklık ve karışım modu (grenle tutarlı olsun diye)
- [x] Son düzenlemenin otomatik saklanması (localStorage) + Sıfırla
- [ ] **Şablon**: "mevcut tasarımı şablona ekle" + kayıtlı şablonlardan seçme
  Amaç aynı düzeni **başka bir görsele** uygulamak: şablon widget ayarlarını taşır, arka plan fotoğrafını taşımaz.
  - [ ] Şablon içeriği: katmanların tipi, konum/ölçek/dönüş/opaklık/z sırası ve **tüm widget ayarları** (yazı tipi, kalınlık, harf aralığı, renk, boyutlar, hizalama, varyant)
  - [ ] Şablona dahil: oran, grid ve gren ayarları, marka satırı
  - [ ] Şablona dahil DEĞİL: arka plan fotoğrafı ve o fotoğrafa özel kadraj (zoom/x/y). Şablon uygulanınca o an yüklü olan görsel yerinde kalır, düzen onun üstüne geçer
  - [ ] Panelde "Şablonlar" sekmesi: kayıtlı şablonlar şerit halinde, "Bu tasarımı kaydet" ile adlandırıp ekleme
  - [ ] **Değerler şablon uygulanırken tazelenir**: saat, tarih, hicri gün, vakit adları şablonun kaydedildiği ana değil, seçildiği ana ait olmalı
    - [ ] Bunun için her alanın "canlı mı, elle mi girildi" bilgisi gerekiyor: kaydederken değer o anki `defaultProps(snapshot)` çıktısıyla aynıysa canlı say, farklıysa elle girilmiş kabul edip olduğu gibi sakla
    - [ ] Uygulama anında yalnızca canlı alanlar `defaultProps(yeni snapshot)`'tan yeniden doldurulur; elle yazılmış metinler korunur
  - [ ] Oran farkı: şablon 9:16'da kaydedilip 1:1'de uygulanabilir — katmanlar `setRatio`'daki oransal taşıma mantığıyla yeniden konumlanmalı
  - [ ] Şablon silme / yeniden adlandırma
  - [ ] Önizleme: fotoğraf içermediği için küçük ölçekli bir export yeterli (mevcut `renderCanvasToBlob` düşük scale ile, küçük JPEG)
  - [ ] Depolama: fotoğraf dışarıda kaldığı için şablonlar küçük JSON; localStorage yeterli olmalı, önizleme görselleri büyürse ayrı düşünülür
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
- [ ] Sayfalarda belirli konumlarda ön tanımlı ayetlerin rastgele gösterilmesi (küçük ayet kartı/bandı — her açılışta farklı bir ayet)
- [ ] öntanımlı ayetleri uygulada günlük gösterme
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

