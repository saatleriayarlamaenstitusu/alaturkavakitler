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
- [x] SEO — sayfa bazlı dinamik meta (`useSeo` composable'ı; @unhead yerine)

---

## Faz 2: Hata Düzeltme &amp; Temel İyileştirmeler

- [x] `100dvh` ile chrome mobil scroll sorunu
- [x] Açık/koyu/sistem tema (CSS + ayardan)
- [x] OG/Twitter paylaşım görselleri (statik, index.html'de)
- [x] Dropdown dışına tıklanırsa kapanma (clickOutside directive)
- [x] Gece yarısından sonra dünün vakitlerini gösterme sorunu — sayaç core'un `nextVakit`'ine geçince kapandı
- [x] Akşam ezanı geçince günü güncelleme (reactive date watch)
- [ ] Loading placeholder'lar (skeleton)
- [x] Hicri takvim doğruluğu araştırma (hijri-date lib değişimi gerekebilir)
- [ ] version ve yeniliklerdeki metinleri üslubunun iyileştirilmesi

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
- [x] Saat tipi (dijital / analog)
- [x] Hicri takvimi akşam ezanıyla ilerlet
- [ ] Vakit kaynağı (Diyanet / Türkiye Takvimi)
- [x] İlk açılacak sayfa seçimi
- [ ] Vakite göre tema rengi kullan/ma
- [x] Renk stili seçimi (klasik / pastel / canlı / mesh / mono — `data-palette`)
- [x] Ana sayfa saati seçimi (LED / normal)
- [ ] AI görsel stili: her vakit için AI ile üretilmiş blurlu long-exposure minimal arka plan görselleri (ayrı bir `data-palette` stili olarak)
- [ ] Minimal dini görsellerden oluşan renk stili (ayrı bir `data-palette` stili — minimal dini illüstrasyon/desen arka planları)
- [x] **Vakit hatırlatması** — vakit GİRMEDEN ÖNCE bildirim
  - [x] Her vakit için ayrı "kaç dakika önce" ayarı (`src/data/vakitNotify.js`)
  - [x] Varsayılanlar: imsak 1 saat, güneş 20 dk, öğle 30 dk, ikindi 20 dk, akşam 30 dk, yatsı 15 dk
  - [x] Vakit başına "Kapalı" ve "Tam vakitte" seçenekleri (-1 / 0)
  - [x] Tarayıcı izni ayarlardan istenir; izin verilmediyse anahtar açılmaz
  - [x] Masaüstü (GNOME) uygulamasında aynı ayar — `notify-offsets` GSettings anahtarı
  - [ ] Gerçek push (pencere kapalıyken web tarafında bildirim) — sunucu + abonelik gerekir;
        şu an tarayıcı hatırlatması yalnızca uygulama açıkken çalışıyor, masaüstü uygulaması
        ise pencere kapalıyken de bildiriyor
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
- [x] Kaza namazları sayacı + popup açan buton / popupta basit artı eksi olan sayaç / sayaç değer varsa vakit lstesinde badge ile saysını göster
---

## Faz 6: Takvim Sayfası

- [x] Grid takvim görünümü (aylık)
- [x] Hicri takvime göre dini günler — Directus'a tablo girmek yerine `src/data/holyDays.js`'te kural olarak türetiliyor
- [ ] Rumi takvim araştırması + implementasyon
- [ ] Rumi takvime göre doğa olayları listesi
- [ ] Dini gün detay sayfası (dini gün + blog yazısı)
- [x] Takvim sayfasına dini günler entegrasyonu
- [ ] Hicri/Rumi/Miladi geçişi

---

## CMS Kararı

**Karar: Directus KURULMAYACAK. Yerine geliştirme sunucusunda çalışan,
dosyayı doğrudan düzenleyen bir yönetim sayfası yazılacak.**

Directus bir Node uygulaması + SQL veritabanıdır; Docker'la kaldırılır,
koleksiyonlar tanımlanır, bir yönetim arayüzü ve REST/GraphQL API verir.
Bizim senaryoda zincir şöyle olacaktı: Docker çalıştır → içerik gir →
`export-content.js` ile JSON'a dök → commit. Üç koleksiyon ve tek yazar
için bu zincir, içeriğin zaten repoda JSON olarak durduğu bir yerde
gereksiz bir veritabanı, bir yedek sorunu ve bir betik bakımı demek.

**Nasıl çalışacak:**

- `/admin` rotası YALNIZCA geliştirmede var (`import.meta.env.DEV`); üretim
  derlemesine hiç girmez, dolayısıyla kimlik doğrulama da gerekmez —
  sayfa yalnızca kendi makinende, `npm run dev` açıkken erişilebilir
- Kaydetme, Vite geliştirme sunucusuna eklenen bir uç noktadan geçer ve
  dosyayı diske yazar. Kalıp zaten var: `vite.config.js` içindeki
  `devKuranProxy` aynı şekilde geliştirmeye özel bir ara katman
- Değişiklikten sonra commit elle atılır — git zaten sürüm geçmişi,
  `git diff` de içerik incelemesi demek
- Sunucu yok, veritabanı yok, token yok, OAuth köprüsü yok

**Neyi yönetecek:**

- [ ] `src/content/yenilikler.json` — başlık, tarih, gövde (markdown alt
      kümesi: şu an yalnızca `**kalın**` destekleniyor)
- [ ] `src/content/saatuzerine.json` — yazılar, kapak görseli
- [ ] `src/data/widgetPresets.js` — ön tanımlar. Editördeki "Preset kopyala"
      düğmesi zaten `preset(...)` satırını panoya yazıyor; panel bu satırı
      doğrudan dosyaya ekleyip adlandırabilir
- [ ] Kıraat kesitlerinin künyesi (ses dosyasının kendisi değil — o R2'ye
      yüklenecek, panel yalnızca bağlantıyı ve ayet aralığını tutar)
- [ ] Dinî gün ve ayet kartı gibi küçük veri dosyaları (gerekirse)

**Yazarken dikkat:**

- [ ] Yazma uç noktası **yalnızca `server.middlewares` içinde** tanımlanacak;
      üretim derlemesinde böyle bir yol var olmamalı
- [ ] Yazılacak dosyalar beyaz listeyle sınırlanacak (`src/content/*.json`,
      `src/data/widgetPresets.js`) — gelen yol doğrudan kullanılmayacak
- [ ] JSON yazımı mevcut biçimi korusun (2 boşluk girinti, sonda yeni satır),
      yoksa her kayıt kocaman bir diff üretir
- [ ] Markdown desteği: bağlantı yazımı (`[metin](url)`) şu an render
      edilmiyor; panelde göstermeden önce `BlogDetailPage`in dönüştürücüsüne
      eklenmeli ya da panelde de desteklenmediği belirtilmeli

**Deployment: Cloudflare Pages** (GitHub Pages / Vercel yerine)

---

## Faz 7: İçerik &amp; Blog

- [x] CMS kararı — Directus değil, geliştirmede çalışan dosya tabanlı yönetim
      sayfası (bkz. "CMS Kararı" bölümü)
- [ ] `/admin` sayfası: yenilikler + saat üzerine yazıları
- [ ] Vite geliştirme sunucusuna yazma uç noktası (`devKuranProxy` kalıbıyla)
- [ ] Panelden ön tanım (preset) ekleme
- [x] Prismic içerik migration (yerel JSON — `src/content/saatuzerine.json`)
- [x] Şule Gürbüz yazısı render hatası düzeltme
- [x] Saat üzerine sayfası: BlogPage liste (kapak görseli) + BlogDetailPage detay
- [x] Yenilikler bölümü (changelog, blog formatında) — `src/content/yenilikler.json`
- [ ] Rumi ve hicri takvim üzerine yazılar
- [x] Dini günler verisi — Directus yerine `holyDays.js`'te kural olarak; Tarih parçasının "Etkinlik" alanı buradan doluyor
- [ ] Geliştiriciler için bölüm (API, web component dokümantasyonu)
- [x] Amentü sayfasına ses ekleme

---

## Faz 8: Paylaş Özelliği

- [x] Paylaş tuval motoru (gerçek boyutlu DOM tuval + snapdom export; katman modeli, sürükle/ölçekle/döndür)
- [x] Oran seçimi: 9:16 / 4:5 / 1:1 (katmanlar oran değişiminde oransal taşınır)
- [x] Widget seti: alaturka saat (dijital), analog saat, vakit (şu an + sonraki), hicri+miladi tarih (kart/sade/dikey + etkinlik satırı), serbest metin, Arapça hazır ibare, logo/sembol, aylık takvim (hicri/miladi/çift, ızgara/tek satır, gün zemini, hafta sonu)
- [x] Swiss ızgara katmanı (arka plan ayarlarında): sütun/satır, kenar boşluğu, kalınlık, belirginlik, renk, çerçeve
- [x] Kullanıcı özelleştirme (konum, ölçek, dönüş, renk, hizalama) + her değer elle girilebilir (saat, tarih, vakit adları); boş alan gizlenir
- [x] Yazı tipi seçimi (Google Fonts uyumlu, `src/data/shareFonts.js`'ten genişletilebilir) + kalınlık + italik — 70 font, 5 sekmeli seçici (sans / serif / display / el yazısı / arapça); gruplar tembel yüklenir
- [x] Kullanıcı kendi resmini arka plan yapsın + kadraj (pinch zoom/kaydır), bulanıklık, karartma (overlay tasarımları **swiss style**)
- [x] **Ayet parçası** (Açık Kuran API'si ile): Arapça metin, okunuş ve meal tek parçada, her biri ayrı açılıp kapatılabilir
  - [x] Ayet seçimi (sure + ayet no + aralık) ve API entegrasyonu
  - [x] API anahtarı dışarı açılmıyor: Cloudflare Pages Function vekili (`functions/api/kuran/[[path]].js`)
  - [x] Dört katmanlı önbellek — tarayıcı (bellek + localStorage) → kenar önbelleği → Workers KV → API; çekme birimi SURE, böylece ömür boyu üst sınır 114 × 9 istek
  - [x] Sure adları, ayet sayıları ve meal listesi bizde bir kopya (`src/data/kuranMeta.js`, `scripts/export-kuran-meta.js` üretiyor)
  - [x] Dokuz meal (Diyanet, Elmalılı ×2, Çantay, İbni Kesir, Esed + Pickthall, Arberry, Yusuf Ali), birden fazlası aynı anda
  - [x] Üç düzen: birleşik / satır satır / ayet ayet (her ayetin Arapçası ve meali birlikte)
  - [x] Arapça ve Latin metin için AYRI hizalama; meal sahibinin adı altta veya üstte + boyut oranı; kaynak satırı oranı
  - [x] Altı hazır görünüm: Klasik, Celî, Nastalik, Kûfî, Editöryel, Modern
  - [ ] Görsel oluştur widgetlerinde presetlerin iyileştirilmesi
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
- [x] **Görsel widget'ı**: kullanıcının kendi PNG / SVG / JPG dosyasını katman olarak ekleyebilmesi
  - [x] Dosya seçici; katman olarak eklenir (taşı/ölçekle/döndür mevcut motordan gelir)
  - [ ] Sürükleyip bırakma
  - [ ] Kırpma: dikdörtgen kadraj, isteğe bağlı yuvarlak/kare maske
  - [ ] Tek renkli SVG'lerde renk değiştirme (`fill: currentColor`'a indirgenebilenler için); çok renkli SVG ve PNG'de renk ayarı gizlenir
  - [ ] **Export kuralı**: eklenen SVG'deki stroke'lu `<line>`/`<path>` dışa aktarımı çökertiyor — içe alırken dolgulu path'e dönüştür ya da rasterize et (bkz. `CLAUDE.md` → Görsel Oluşturucu)
  - [x] Boyut sınırı + kalıcılık: kota aşılırsa önce arka plan fotoğrafı, sonra katman görselleri düşürülerek saklanır (düzen korunur)
  - [x] Opaklık ve karışım modu (16 mod, her katmanda)
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

- [ ] **Chrome yeni sekme eklentisi** — "alaturka new tab"
  Her yeni sekmede saat, vakitler ve takvim; sayfanın geri kalanı minimal bir
  başlangıç sayfası.
  - [ ] Minimal arama çubuğu (arama motoru ayarlardan seçilebilir)
  - [ ] Hazır dinî site kısayolları + kullanıcının kendi ekleyebildiği kısayollar
        (ad, URL, ikon; sırası sürüklenerek değişir)
  - [ ] Eklenti ayarlarından açılıp kapanabilen bloklar: alaturka saat, vasati
        saat, namaz vakitleri + kalan süre, hicri ve miladi tarih, aylık takvim
  - [ ] Şehir seçimi ve vakit verisi siteyle aynı kaynaktan; veri eklentinin
        kendi deposunda (`chrome.storage`) önbelleklenir, çevrimdışı çalışır
  - [ ] Tema: sitedeki renk stilleri ve vakit rengi aynen taşınır
  - [ ] Manifest V3; eklenti kodu ayrı bir klasör/depo, çekirdek hesaplar
        `@alaturkavakitler/core`'dan gelir (siteyle ikinci bir kopya tutulmaz)
  - [x] Chrome Web Store geliştirici hesabı açıldı
  - [ ] Eklentinin yayına gönderilmesi
  - [ ] arka plan resimleri pexels apisi görsel oluştura bağlanınca aynı galeriler new tab arka planında kullanılabilir
- [ ] PWA mağazalarına yükleme (Samsung Galaxy Store, Microsoft Store)
- [ ] **Mobil uygulama ve widget'lar**
  - [ ] Kabuk kararı: mevcut PWA'yı Capacitor ile paketlemek mi, yoksa yalnızca
        widget'lar için ince bir native katman mı (ölçülecek: bildirim ve widget
        güncelleme kısıtları)
  - [ ] Ana ekran widget'ları: kalan süre + sonraki vakit, alaturka saat,
        günün vakit listesi, hicri tarih — küçük/orta/büyük boylar
  - [ ] Android: Glance/AppWidget; iOS: WidgetKit + App Group ile veri paylaşımı
  - [ ] Widget'ın verisi uygulamanın önbelleğinden okunur, widget kendi ağ
        isteğini yapmaz
  - [ ] Yerel bildirimler (vakit hatırlatması) — ayarlar web tarafıyla aynı
  - [ ] Kilit ekranı / StandBy ve watchOS komplikasyonu (sonraki adım)
  - [ ] App Store + Play Store yayını, ekran görüntüleri, gizlilik formları
- [ ] **Kuran video editörü** — ayrı alt alan adında (ör. `video.alaturkavakitler.com`)
  Mevcut proje: https://github.com/saatleriayarlamaenstitusu/quran-recitation-video-editor
  İstenen kıraat kaydından ayet + meal + arka plan + animasyon + font seçenekleriyle
  video üretiyor. Mevcut sisteme KARIŞTIRILMAZ: ayrı depo, ayrı yayın.
  - [ ] Projenin şu hâlinin gözden geçirilmesi: ne çalışıyor, nesi eksik
  - [ ] İşlemin nerede yapılacağı: ffmpeg ile LOKALDE (tarayıcıda ffmpeg.wasm ya
        da kullanıcının kendi makinesinde bir CLI) — sunucuda video işlemek
        maliyeti ve süresiyle ayrı bir mesele
  - [ ] Ayet ve meal verisi mevcut Kuran vekilinden (`/api/kuran/...`) beslenir,
        ikinci bir anahtar/kaynak olmaz
  - [ ] Kıraat ses kayıtlarının kaynağı ve lisans durumu
  - [ ] Yazı tipleri ve hazır görünümler siteyle aynı dili konuşsun
        (`shareFonts.js` ve ön tanım kalıbı oradan taşınabilir)
  - [ ] Alt alan adı + yayın: Cloudflare Pages'te ikinci bir proje
  - [ ] Siteden bağlantı (menüde ya da Görsel Oluştur'un yanında)
- [ ] Twitter botu (önemli dini günler)

---

## Masaüstü Uygulaması (alaturka-desktop)

GTK4 + libadwaita ile yazılmış yerel Linux uygulaması; kural katmanı siteyle
aynı (`@alaturkavakitler/core`). Depo: `saatleriayarlamaenstitusu/alaturka-desktop`.

- [x] GitHub'da Releases boş görünüyordu — sebebi etiket atılmamış olmasıydı.
      `publish` işi `if: startsWith(github.ref, 'refs/tags/')` taşıyor, elle
      koşuda paketler yalnızca artifact olarak kalıyordu. `v0.1.0` ile ilk
      sürüm çıktı (.deb 71 kB + Flatpak 99 kB).
- [x] **Vakit bildirim hatırlatıcı** — vakit başına "kaç dakika önce"
      (`notify-offsets`), bildirim store'un saniyelik tikinden çıkıyor
- [ ] **Linux Mint applet** — panelde alaturka saat ve sonraki vakte kalan süre
  - [ ] Cinnamon applet'i ayrı bir paket biçimi (`~/.local/share/cinnamon/applets/`,
        kendi `metadata.json`'ı ile); uygulamanın içine konamaz, ayrı yayınlanır
  - [ ] Hesaplar yine core'dan; applet veriyi kendi indirmesin, uygulamanın
        önbelleğini okusun ya da D-Bus ile sorsun
  - [ ] Tıklayınca uygulamayı açması, sağ tık menüsünde şehir seçimi
  - [ ] Cinnamon Spices deposuna gönderim
- [ ] **GNOME Shell eklentisi** — aynı iş, GNOME'un üst panelinde
  - [ ] Applet ile ortak kod: ikisi de GJS, panel çizimi dışında aynı şeyi yapıyor
  - [ ] `extensions.gnome.org` gönderimi; GNOME sürüm uyumluluğu her yıl
        güncellenmek zorunda (eklentilerin asıl bakım yükü burada)
- [ ] **AppImage** — tek dosya, kurulumsuz çalıştırma
  - [ ] Karşı argüman kayıtlı: GJS/GTK4 uygulamasının kendi ikili dosyası yok;
        AppImage bütün GTK yığınını ve JS yorumlayıcısını içine almak zorunda
        kalır (65 kB → yüzlerce MB) ve Flatpak'in portal entegrasyonunu da
        kaçırır. Yine de "indir çalıştır" isteyen için değerlendirilecek
- [ ] **Flatpak gerçekten çalışıyor mu** — paket CI'da derleniyor ama hiç
      kurulup çalıştırılmadı
  - [ ] `flatpak install --user alaturka-vakitler.flatpak` + açılış denemesi
  - [ ] Kum havuzunda ağ erişimi (vakit JSON'u) ve bildirim izni doğrulanacak
  - [ ] GSettings şeması kum havuzunda ayrı; ayarların kalıcı olduğu görülecek
- [ ] **Mağazalara yükleme**
  - [ ] Flathub (manifest zaten var, ayrı bir PR süreci ve inceleme istiyor)
  - [ ] Snap Store değerlendirilecek
  - [ ] AppStream metinleri ve ekran görüntüleri mağaza ölçülerine göre
- [ ] **Görsel oluştur masaüstüne** — tuval motoru DOM + snapdom üzerine
      kurulu, GTK'da karşılığı yok; ya Cairo/Snapshot ile yeniden yazılacak
      ya da bir WebView gömülecek. Önce hangisi olduğuna karar verilecek
- [ ] **Kuran, meal ve hatim bölümü masaüstüne** — site tarafındaki hatim
      bölümü (Faz 11) oturduktan sonra; ayet verisi aynı vekilden
      (`/api/kuran/...`), hatim ilerlemesi için yerel bir depo gerekecek
- [ ] **Windows ve macOS sürümü** — GTK4 uygulaması ikisinde de derlenebilir
      ama paketleme ve görünüm ayrı bir iş; alternatif, PWA'yı kabuklamak
      (Tauri/Electron). Karar verilecek

---

## Faz 11: Dini Araçlar &amp; İçerik

- [x] Kıble pusulası (cihaz sensörüyle minimal kıble yönü gösterimi)
- [ ] Dini radyo / Kuran dinleme bölümü (plak tarzı arayüz, YouTube listesi üzerinden)
- [ ] Kuran kayıtlarını içerik yönetiminde ayrı kategori olarak girme (`/admin` paneli)
### Kuran verisi: iki kaynak, iki ayrı kısıt

İki API de kullanılabilir ama şartları birbirinin tersi; hangi verinin
nereden geldiği bu yüzden bilinçli bir seçim olmalı.

| | Açık Kuran | Quran Foundation (quran.com) |
|---|---|---|
| Şart | CC BY-NC-SA 4.0 | Geliştirici şartları |
| Önbellek | süre sınırı yok | **en fazla 1 hafta** (kalıcı kopya yalnızca Content Sync API ile) |
| Repoda kopya | serbest (atıf + aynı lisans) | **yasak** — public repoya veri koymak dağıtım sayılıyor |
| Ticari kullanım | **yasak (NC)** | serbest |
| Atıf | zorunlu | zorunlu (QF + kârî) |
| Veri | Arapça, okunuş, 9 meal | mushaf dizimi, ses, zaman damgası, tecvid, 5 Türkçe meal |

- **Mevcut KV önbelleğimiz (1 yıl) yalnızca Açık Kuran için geçerli.** QF'den
  gelen her şey (sayfa dizimi dahil) kısa ömürlü önbelleklenmeli.
- **Site ticari olmadığı sürece** Açık Kuran'ın NC şartı sorun değil; reklam
  ya da ücretli bir katman düşünülürse bu madde yeniden açılmalı.
- [x] **Atıf**: hakkında sayfasına "Veri Kaynakları" bloğu eklendi — namaz
      vakitleri ve hicri takvim (Diyanet), Kuran metni/okunuş/mealler
      (Açık Kuran, CC BY-NC-SA 4.0 bağlantısıyla)
- [ ] Ayet parçasına ve Kuran sayfasına da kaynak satırı (görsel çıktıda ve
      okuma ekranında görünecek şekilde)
#### Mushaf dizimi — ETAP 1 YAPILDI

**Satır satır mushaf görünümü çalışıyor** (`src/utils/qpc.js`,
`components/quran/MushafSheet.vue`): 604 sayfa, 15 satır, sayfaya ait QPC
fontu, sure adı süslemesi ve besmele satırı.

- [x] Dizim quran.com v4'ten canlı okunuyor (`verses/by_page/{n}?words=true`,
      `line_number` + `code_v1`/`code_v2`). Sayfa ~1,5 kB; son 90 sayfa
      localStorage'da
- [x] Sayfa fontları `static.qurancdn.com`'dan tembel yükleniyor
      (`FontFace`, sayfa başına ~15–43 kB). İkisi de `Access-Control-Allow-Origin: *`
- [x] **Veri repoda taşınmıyor** — ne dizim ne font. QF'nin dağıtım şartı
      böylece hiç devreye girmiyor; biz yalnızca okuyoruz
- [x] Başlık satırları veride yok, sayımla bulunuyor: kullanılmayan satır
      numaraları sure adı/besmeledir. 293. sayfada (Kehf ortada başlıyor)
      ve 187'de (Tevbe, besmelesiz) doğrulandı
- [x] İki görünüm, tepeden tek dokunuşla: **Mushaf** (satır sadık) ve
      **Esnek** (akan metin + yazı boyu %70–180)
- [ ] Çevrimdışı okuma: şu an sayfa ilk kez açılırken ağ gerekiyor. Service
      worker'a sayfa dizimi + font için `CacheFirst` kuralı eklenecek
- [ ] Diyanet mushafıyla gözle karşılaştırma (birkaç sayfa) — hatim takibi
      sayfa numarasına bağlı

#### Diyanet (Türkiye) mushafı dizilimi

Sayfa numarası kullanıcının ELİNDEKİ nüshayla karşılaştırılıyor; iki
mushaf farklı numaralandırıyor. Ölçüm ve kısmi eşleme `utils/mushaf.js`
içindeki `diyanetPage()` başlığında.

- [x] Fark ölçüldü ve belgelendi: Diyanet = Medine − 1 (2–583 arası),
      son cüzde sayfa sınırları da ayrışıyor, numaralar 603'te örtüşüyor
- [x] Bilinen aralıkta Diyanet numarası sayfa başlığında yan yana yazılıyor
- [ ] **Tam eşleme** için Diyanet dizilim verisi gerekiyor. Denenen ve
      BAŞARISIZ olan ucuz yol: PDF'teki ayet sonu işaretlerini sayıp
      sınırları çıkarmak — gliflerin CID'leri sayfa başına değişiyor
      (aynı işaret 2. sayfada başka, 293. sayfada başka kod), frekans
      sayımı tutmuyor
  - [ ] Kalan yol: CID → Unicode deşifresi (sayfa fontu alt kümeleriyle
        hizalama) ya da sayfa görüntülerinden işaret tanıma
  - [ ] Ya da Diyanet'e doğrudan sorulabilir: dizilim verisi yayımlıyorlar mı
- [ ] QUL'da Türk/Osmanlı (ayet-berkenar) dizilimi YOK — 12 dizilimin hepsi
      Medine, Indopak ya da Katar. Oradan çıkmıyor

#### CDN: tek kova, iki ön ek

Kova **`alaturkavakitler-assets`** (EEUR), özel alan adı
**`cdn.alaturkavakitler.com`** — ikisi de zaten var ve etkin.
Mushaf ile ses ayrı kova değil ayrı ÖN EK: tek alan adı, tek ayar,
tek fatura.

```
cdn.alaturkavakitler.com/mushaf/hafs/v2/woff2/p42.woff2
cdn.alaturkavakitler.com/mushaf/hafs/v1/woff2/p42.woff2
cdn.alaturkavakitler.com/mushaf/surah-names/v1/sura_names.woff2
cdn.alaturkavakitler.com/ses/husary/036.mp3
```

İndirme betikleri bu ağacı **birebir** kurar; yükleme tek bir dizin
kopyalamaya iner:

```bash
node scripts/mirror-mushaf-fonts.js --out /media/abdullah/F929-FA97/alaturka
node scripts/mirror-recitations.js  --out /media/abdullah/F929-FA97/alaturka

rclone copy /media/abdullah/F929-FA97/alaturka/mushaf r2:alaturkavakitler-assets/mushaf
rclone copy /media/abdullah/F929-FA97/alaturka/ses    r2:alaturkavakitler-assets/ses
```

Sonra Cloudflare Pages ortam değişkenleri:

```
VITE_MUSHAF_FONT_BASE=https://cdn.alaturkavakitler.com/mushaf
VITE_AUDIO_MIRROR_BASE=https://cdn.alaturkavakitler.com/ses
```

- [x] CORS kuralı yazıldı: `infra/r2-cors.json` (+ `infra/README.md`)
  - [ ] Uygula: `npx wrangler r2 bucket cors set alaturkavakitler-assets --file infra/r2-cors.json`
  - [ ] Doğrula: `npx wrangler r2 bucket cors list alaturkavakitler-assets`
- [ ] Dizim JSON'ları CDN'e KONMAZ: repoda duruyorlar, derlemeye
      giriyorlar ve çevrimdışı çalışıyorlar — CDN'e taşımak onları
      yeniden ağa bağımlı yapardı

#### Veriyi kendi depomuzda tutmak

- [x] **Dizim verisi depoya alındı** (`src/data/mushaf/juz-NN.json`, 3,3 MB
      ham / cüz başına ~13 kB gzip, `scripts/export-mushaf-lines.js`).
      Okuma artık API'siz: 293. sayfa açılırken sıfır istek ölçüldü.
      quran.com yalnızca yedek yol
- [x] Font kaynağı ayna-önce kuruldu (`VITE_MUSHAF_FONT_BASE`); ayna
      tanımlı değilse CDN'e düşer, yani kurulum beklemeden çalışır
- [ ] **Fontları R2'ye yükle.** ÖLÇÜLDÜ: V2 ~75 MB, V1 ~38 MB (604 sayfa).
      Önceki 25 MB tahmini yanlıştı — ilk sayfalar küçük, orta sayfalar
      130–220 kB. Git deposuna girmez
  - [x] İndirme betiği hazır: `scripts/mirror-mushaf-fonts.js`
  - [ ] Var olan kovaya yükle: **`alaturkavakitler-assets`**, özel alan adı
        **`cdn.alaturkavakitler.com`** (etkin). Yeni kova gerekmiyor;
        mushaf ve ses aynı kovada ayrı ön eklerde durur
  - [ ] `VITE_MUSHAF_FONT_BASE=https://cdn.alaturkavakitler.com/mushaf`
- [ ] Service worker'a font + cüz dosyaları için `CacheFirst`: okunan
      sayfalar cihazda kalsın, çevrimdışı hatim mümkün olsun
- [ ] **Lisans netleştirilecek**: KFGQPC fontlarının dağıtım şartları.
      QUL'un kendi lisans sayfaları 404 veriyor (ölçüldü), Credits var —
      gerekirse doğrudan sorulacak. Aynaya koymak "yeniden dağıtmak"tır,
      okumaktan farklıdır

#### Seslendirme: kaynak kendi, yedek bizim

- [x] Kârî kütüğü (`src/data/reciters.js`) + ayna indirme betiği
      (`scripts/mirror-recitations.js`, hedef `.mirror/`, repoya girmez)
- [x] Çalma sırası: önce yayıncının CDN'i, hata verirse `VITE_AUDIO_MIRROR_BASE`
- [x] Adresi doğrulananlar: Abdülbasit (murattal + mücevved), Hüsarî,
      Şüreym, Benna, Alakmî — `download.quranicaudio.com`
- [ ] **Adresi bulunamayan ikisi**: Hadi Turé (QUL 421) ve Fatih Seferagić.
      quranicaudio kataloğunda (177 kârî) yoklar; QUL ses adresini
      betikle kuruyor, sayfa HTML'inde geçmiyor
  - [ ] QUL'un ağ isteklerini tarayıcıda izleyip adresi çıkar, ya da sor
  - [ ] Seferagić tam hatim değil: hangi sureler var, listelenecek
- [x] İndirme betiği hazır: `scripts/mirror-recitations.js`
- [ ] `alaturkavakitler-assets` kovasına `ses/` ön ekiyle yükle, sonra
      `VITE_AUDIO_MIRROR_BASE=https://cdn.alaturkavakitler.com/ses`
- [ ] Zaman damgaları QUL'dan (`qul` numaraları kütükte): kelime
      vurgulama bu veriden gelecek, ses değil damga indirilecek
- [x] **Dinleme şeridi çalışıyor** (`ListenBar.vue`): sure sure çalma,
      okunan ayetin mushafta vurgulanması, sayfanın kendiliğinden
      çevrilmesi, kârî seçici şeridin içinde. Uçtan uca denendi:
      İhlâs'ta ayet takibi, Bakara'da 2:5 → 2:6 geçişinde sayfa 2 → 3
- [x] QUL damga içe aktarıcısı (`scripts/import-qul-recitation.js`);
      Turé içe aktarıldı (114 sure / 6236 ayet)
- [x] Altı kârînin damgası içe aktarıldı: Abdülbasit murattal +
      mücevved, Hüsarî, Benna, Alakmî, Turé (her biri 114/6236)
- [x] Kayıt eşleşmesi Fâtiha süresiyle sınandı (QUL `duration` ↔ ffprobe)
- [ ] **Hüsarî ve murattal Abdülbasit yeniden indirilecek**: damgalar
      başka bir okuyuşa aitti, kaynak değişti
      (`qdc/khalil_al_husary/murattal/{n}.mp3`,
      `qdc/abdul_baset/murattal/{n}.mp3`, ikisi de DOLGUSUZ).
      Eski dosyalar silinmeli, yoksa ayna yanlış kaydı sunar
- [ ] Şüreym'in QUL dosyası AYET kaydı: sure dosyası için damga yok.
      Ya ayet düzeninde dinlenir ya da sure kaydının damgası aranır
- [ ] Kelime kelime vurgulama (veri hazır: `w/<sure>.json`)
- [ ] Hatimle bağ: dinlenen sayfa da okundu sayılsın mı (karar)
- [ ] Sure bitince sonrakine geçme, ayet tekrarı, aralık seçme
- [ ] Kelime damgaları repoda 1,5 MB/kârî tutuyor; yedi kârîde ~10 MB.
      Ayet damgaları kalsın, kelime damgaları CDN'e taşınsın

#### Sure künyesi ve ayet konuları

- [x] **Sure künyesi** (`src/data/surahInfo.js`, `scripts/export-surah-info.js`):
      114 sure için Türkçe ad anlamı, iniş yeri (Mekkî/Medenî), ayet sayısı,
      iniş sırası, besmele durumu ve **TDV İslam Ansiklopedisi bağlantısı**.
      Bağlantıların 114'ü de üretim sırasında tek tek HTTP ile doğrulandı
      (eksik: 0); doğrulanmayan bir bağlantı dosyaya hiç yazılmıyor
- [x] Sure başlarında zeminli künye bloğu (iki görünümde de) + alt sayfada
      ayrıntı penceresi
- [ ] **Türkçe tanıtım metni yok ve uydurulmadı.** quran.com'un sure tanıtımı
      yalnızca İngilizce (`?language=tr` yok sayılıyor, ölçüldü). Seçenekler:
      TDV maddesinden alıntı (telif izni gerekir), Diyanet'in kendi sure
      girişleri, ya da elle yazıp kaynak göstermek
- [ ] **Ayet konuları** (`qul.tarteel.ai/resources/ayah-topics`) — tek kayıt,
      yalnızca SQLite, "ayet ayet" eşleme ve kavramlar arası anlamsal ilişki
      vaat ediyor. Dili ve lisansı sayfada YAZMIYOR; indirilip içine
      bakılmadan karar verilemez
  - [ ] İndir, şemasına bak, konu sayısını ve dilini ölç
  - [ ] İngilizceyse: ya çeviri işi (114 sure değil, binlerce konu — elle
        olmaz) ya da yalnızca arama/filtre altyapısı olarak kullanmak
  - [ ] Arayüzdeki yeri: ayete basılınca açılan "bu ayet şu konularda geçiyor"
        satırı; oradan konuya ait ayet listesine

**Tecvitli hat (V4) bir duvara çarptı ve ölçüldü.** V4 sayfa fontları CDN'de
duruyor ama kendi glif kodlarını istiyor; V1 kodlarıyla çizdirilince harfler
birleşmiyor, sayfa anlamsız bir harf dizisine dönüyor (293. sayfada görüldü).
quran.com API'si `code_v4` vermiyor. Tecvit için iki yol kaldı:

- [ ] QUL'un **KFGQPC V4 (1441H)** dizimini indirip (sqlite) kendi JSON'umuza
      çevirmek — veri repoya girer, lisans netleştirilmeli
- [x] Tecvit **esnek görünüme** alındı: quran.com'un `text_uthmani_tajweed`
      alanı renk etiketli veriyor, sayfa dizimi gerektirmiyor. Mushaf
      sadakati yok ama renkli tecvit okunabiliyor

Aşağıdaki alternatifler hâlâ geçerli — kendi kopyamızı tutmaya karar
verilirse (çevrimdışı okuma, V4 tecvit) başvurulacak yerler.

- [ ] **QUL — Quranic Universal Library** (Tarteel AI, `qul.tarteel.ai`):
      12 ayrı mushaf dizimi indirilebiliyor (KFGQPC V1/V2/V4, Nastaleeq 15
      satır, Indopak çeşitleri, Digital Khatt, Mushaf Qatar). Biçim çoğunlukla
      SQLite + docx; Indopak 15 satırın JSON'u da var. **İlk bakılacak yer bu**
  - [ ] Kullanım şartları sayfası okunacak — site üzerinde doğrudan bir lisans
        metni görünmüyor, indirme sayfasında bağlantı var
  - [ ] SQLite'ı bir kerelik JSON'a (sayfa → satır → kelime) çevirecek betik
- [ ] **Hazır JSON veri seti**: `zonetecde/mushaf-layout` — 604 sayfa, sayfa
      başına bir JSON dosyası; satır tipi (sure başlığı / besmele / metin),
      ayet aralığı ve kelime başına `qpcV1`/`qpcV2` glifleri hazır. İşi
      doğrudan görür **ama lisans beyanı yok** (GitHub "None" diyor), kullanım
      için netleştirmek gerekir
- [ ] **Yazı tipleri**: KFGQPC mushaf fontları (`nuqayah/qpc-fonts`,
      `mustafa0x/qpc-fonts` — sayfa başına ayrı font, woff2 sürümleri mevcut;
      asıl kaynak `qurancomplex.gov.sa`). Glif kodları ancak doğru sayfa
      fontuyla anlam taşıyor, ikisi birlikte gelir
  - [ ] 604 ayrı font dosyası demek: hepsi birden indirilmez, **okunan sayfanın
        fontu tembel yüklenir** (görsel oluşturucudaki grup grup font yükleme
        kalıbı)
  - [ ] KFGQPC fontlarının dağıtım şartları okunacak
- [ ] Karar: QUL/hazır veri seti ile **kendi kopyamızı tutmak** mı, yoksa QF'den
      canlı çekip kısa önbelleklemek mi. Birincisi çevrimdışı okumayı mümkün
      kılar, ikincisi bakım istemez

#### Hangi hat, hangi dizim (karar)

Türkiye'deki mushaflara yakın durulacak; talik/kufi gibi tarzlar listeye
girmeyecek. Dört seçenek sunulacak:

- [x] **QPC V2 (1421H)** — varsayılan. Sayfa birebir, glif tabanlı
- [ ] **QPC V4 Tecvitli** — renkli tecvit; denendi ve V1 kodlarıyla
      uyumsuz çıktı (yukarıya bakınız). QUL'un V4 dizimi indirilmeden olmaz
- [x] **QPC V1 (1405H)** — klasik Medine baskısı
- [ ] **Diyanet hattı (Hamdullah)** — Türk hattı, ama **akış metni**; sayfa
      birebir değil (sebebi aşağıda). Arayüzde bu fark açıkça söylenecek
- [ ] Doğrulama: Türk mushafı da 604 sayfa / 15 satır / ayet-berkenar; QPC
      sayfa numaralarının Diyanet mushafıyla örtüştüğü birkaç sayfada gözle
      karşılaştırılacak (hatim takibi buna bağlı)

**Diyanet fontları incelendi** (`kuran.diyanet.gov.tr/yayinlarimiz`, üç `.ttf`):

| Dosya | Font adı | Sahibi | Glif / kod noktası | PUA |
|---|---|---|---|---|
| `KuranKerimFontAbay.ttf` | Emine | Muhammet Abay, *All rights reserved* | 670 / 288 | yok |
| `KuranKerimFontHamdullah.ttf` | Shaikh Hamdullah Mushaf | Muhammet Abay, *All rights reserved* | 299 / 142 | yok |
| `KuranKerimFontLatif.ttf` | Lateef | SIL International, "copyrighted freeware" | 1147 / 510 | yok |

- **Hiçbirinde özel alan (PUA) glifi yok** → üçü de düz Unicode metin yazı
  tipi. Sayfa dizimini taşımıyorlar; Diyanet'in kendi talimatı da bunu
  söylüyor ("Word'de yazı tipini değiştirin"). Sayfa birebir görünüm bu
  fontlarla mümkün değil, dizim verisi ayrıca gerekiyor
- [ ] **Emine ve Hamdullah için izin gerekiyor**: ikisi de Muhammet Abay'a ait,
      "all rights reserved" ve tescilli isim. Diyanet indirmeye açmış olması
      bizim siteden **webfont olarak yayınlamamıza** izin vermez — bu yeniden
      dağıtımdır. Muhammet Abay'a ya da Diyanet'e sorulacak
      (`fsType=0` yalnızca gömme kısıtı olmadığını söyler, lisans yerine geçmez)
- [x] **Lateef serbest**: SIL'in yazı tipi, güncel sürümü OFL ile Google
      Fonts'ta duruyor (`fonts.googleapis.com/css2?family=Lateef` → 200).
      Diyanet'in verdiği 2005 sürümünü indirmeye gerek yok, mevcut font
      altyapımıza (`shareFonts.js`) bir satırla eklenir

#### Diyanet'in bilgisayar hatlı PDF'inden dizim verisi çıkarmak

Diyanet, mushafın PDF'ini de yayımlıyor (`dijital.diyanet.gov.tr/File/Download`
üzerinden, Yayınlarımız sayfasındaki "Kur'an-ı Kerim — PDF formatında").
Bilgisayar hattıyla dizildiği için **metin katmanı taşıyor olabilir**; öyleyse
sayfa düzeni verisi doğrudan oradan çıkarılabilir ve Türk mushafına birebir
uyan bir dizim elde edilir (QPC'den farklı olarak harf biçimi de Türk hattı).

- [x] **Fizibilite yapıldı — PDF elverişli.** Ölçülenler (`kuran.pdf`, 23 MB,
      616 sayfa, InDesign CC 13 / Distiller 18, 2018):
  - [x] Metin katmanı VAR, glif konumları tam
  - [x] Ana metin yazı tipi **SuleymanFeyzullahoglu-Bold** (Diyanet'in hattı),
        24,5 pt; sayfa başına ~1150 glif
  - [x] **Satır ayrımı temiz**: glif y değerleri kümelenince sayfa tam
        **15 satır** veriyor (denenen sayfalarda birebir)
  - [x] **Sayfa eşlemesi çözüldü**: mushaf sayfası = PDF sayfası − 2
        (PDF 101 → 99, PDF 301 → 299; sayfa numarası `AdobeArabic` ile
        gerçek Unicode rakam olarak geliyor, sırası ters okunuyor)
  - [x] Gömülü font çıkarıldı: 462 kB, **bare CFF CIDFont (Adobe-Identity-0)**,
        692 glif, alt küme DEĞİL — ama `cmap` yok, `ToUnicode` yok, glif
        adları `cidNNNNN`. Yani **harf kimliği doğrudan okunamıyor**
  - [x] Kelime ayrımı x boşluklarıyla çıkarılabiliyor ama **harekeler ayrı
        glif** ve kendi x konumları var; ham boşluk sayımı satır başına 20+
        "kelime" veriyor. Taban çizgisi süzgeci ile makul sayılara (3–10)
        iniyor, süzgecin düzgün yazılması gerekiyor
- [ ] **Yöntem (katman varsa)**: her glifin sayfa üzerindeki x/y konumu
      okunur (`pdftotext -bbox-layout`, pdfplumber ya da PyMuPDF), y'ye göre
      **satırlara** gruplanır, x'e göre (sağdan sola) sıralanır → sayfa → satır
      → kelime tablosu. Bizim ihtiyacımız olan şey tam olarak bu
- [ ] **Asıl iş — CID → Unicode**: 692 glifin karşılığı bilinmiyor. İki yol:
  - [ ] **(A) Unicode'a hiç çevirmemek**: konumlardan sayfa → satır → kelime
        kutuları çıkarılır, bilinen ayet metniyle SIRA ile hizalanır (sayfadaki
        kelime sayısı ile metindeki kelime sayısı tutuyorsa eşleme kesindir).
        Harf kimliğine gerek kalmaz, çıktı yine "hangi kelime hangi satırda"
  - [ ] **(B) Bir kerelik çözmek**: 692 glif sonlu bir küme; bütün PDF'in CID
        akışı bilinen Kuran metniyle hizalanıp her CID'in karşılığı çıkarılır
        (sıklık + bağlam ile neredeyse kendiliğinden oturur). Sonrası temiz:
        PDF okunabilir hale gelir, hizalama sorunu kalmaz
  - [x] (A) denendi, **tek başına yetmiyor**: kelime sınırları x
        konumundan çıkmıyor. Kümeler arası boşluklar 0–0,56 pt (metin
        kaşide ile hizalanmış, kelimeler bitişik); boşluk KARAKTERİ sayımı
        bir sayfada 110 kelime verdi, beklenen 115 kelime + 5 ayet işareti.
        Aralık birleştirme 122 verdi — yani doğruya yakın ama kesin değil
  - [ ] Sıradaki deneme (B): CID → Unicode deşifresi. 692 glif sonlu bir
        küme ve bütün PDF'in CID akışı bilinen metinle hizalanabilir
  - [ ] Not: ilk karşılaştırma YANLIŞ sayfayla yapılmıştı (Açık Kuran'ın
        sayfa kayması yüzünden). Düzeltilmiş karşılaştırma yukarıdaki
- [ ] **Beklenen zorluk 2 — hizalama**: her kelimeyi `sure:ayet:kelime`
      kimliğine bağlamak lazım. Sayfadaki ayet numarası süsleri çapa olarak
      kullanılabilir; Açık Kuran'dan gelen ayet metinleriyle sıralı hizalama
      yapılır (hata payı sayfa sayfa gözle denetlenir)
- [ ] **Beklenen zorluk 3 — harekeler**: hareke ve secavend işaretleri ayrı
      glifler olarak gelir, kelimeye geri yapıştırılmaları gerekir
- [ ] **Telif**: PDF Diyanet'in yayını. "Hangi kelime hangi satırda" bilgisi
      olgusal bir veri sayılabilir ama türetilmiş veriyi yayımlamadan önce
      Diyanet'e sorulması doğru olur. Fontlar için zaten izin isteniyor
      (Emine ve Hamdullah, Muhammet Abay'a ait)
- [ ] Çıkarılan veri başarılıysa dizim seçeneklerine **"Diyanet (bilgisayar
      hattı)"** eklenir ve "akış metni" kısıtı ortadan kalkar
- [ ] Yerel araçlar: `pdftotext` (poppler 24.02) kurulu; konum tabanlı çıkarım
      için `pdfplumber` ya da `PyMuPDF` ayrıca kurulacak

- [ ] QF kimlik bilgisi alınacak (Developer Console, OAuth2 client credentials;
      `x-client-id` + `x-auth-token`). Anahtar yine Pages Function'da kalır,
      tarayıcıya çıkmaz. `api.quran.com/api/v4` hâlâ anahtarsız cevap veriyor
      ama resmî yol bu değil

### Etaplama — önce okuma ve hatim, ses sonra

- [x] **1. etap (ses yok) — YAPILDI:** `/kuran` rotası, Oku + Hatim
      sekmeleri, sayfa/cüz/sure gezinmesi, meal seçimi, basit hatim takibi
  - [x] Sayfa dizini `src/data/mushafPages.js` (604 satır, üretim sırasında
        hepsi doğrulandı) + `scripts/export-mushaf-pages.js`
  - [x] Alt gezinmede beşinci giriş + ikon; ray ve alt çubuk ölçüleri sorun
        çıkarmadı (öğeler `flex: 1`, vurgu her öğenin kendi içinde)
  - [x] Arapça yazı tipi ayarı (dört nesih hattı), yalnız seçilen aile iner
  - [x] Meal satırı birleştirme (Diyanet 2-4, 6-7 gibi grupları)
  - [x] Oku ve Hatim ayrıldı: Oku serbest okuma, hatim kendi okuyucusunu
        taşıyor ve hangi hatimde olduğun tepede yazılı duruyor
  - [x] İşaretleme sayfa çevrilince kendiliğinden oluyor; rozete dokunarak
        geri alınabiliyor
  - [x] Sayfa gezinmesi üste alındı (altta sayfa uzunluğuna göre yer
        değiştiriyordu)
  - [x] Sağdan sola yön: sonraki sayfa solda; parmakla kaydırma (sağa =
        ileri), farede kapalı
  - [x] Okunan hatim ve sayfa adreste (`?h=…&s=…`) — yenileyince yerinden
        düşmüyor
  - [x] Hatim listesi tek liste; her satır kendi halkasını ve günlük
        şeridini taşıyor (ayrı "etkin hatim" bloğu kaldırıldı)
  - [x] Şeritteki ay başları artık ayın adıyla işaretli (önce açıklamasız
        "1"ler duruyordu)
  - [x] Şerit haftalara bölündü, sayfa sayısı kutunun içinde yazıyor, güne
        dokununca altında okunuyor
  - [x] Hatim sekmesinin tepesinde bütün hatimlerin toplamı ve ortak şerit
  - [x] Takvimde seçili günün okuması (hangi hatimden kaç sayfa) + ızgarada
        okuma işareti
  - [x] Tek alanlı gitme kutusu (sure adı / `2:255` / `s42` / `c5`) ve
        bulunan ayetin sayfada vurgulanması
  - [x] Serbest okumada hızlı erişim şeridi (Yasin, Tebâreke, Amme, Vâkıa,
        Ayetel Kürsi, 30. cüz…)
  - [x] İlk açılışta "Ümmet için" hatmi hazır geliyor
  - [ ] Ayarlardaki Kuran bloğu genişleyebilir: okunuş (transkripsiyon)
        anahtarı henüz yok
- [ ] **2. etap:** QPC mushaf dizimi (QF) — sayfa birebir, satır satır
- [ ] **3. etap:** Dinle — kârî kayıtları, kelime vurgulama, kıraat kesitleri
- [ ] Ayarlardaki **Kuran gösterimi** bloğu 1. etapta yazılır (Arapça,
      okunuş, hangi meal) ve sonraki etapların hepsi onu okur

- [ ] **Kuran sayfası** — alt menüde ayrı bir bölüm, içinde iki sekme:
      **Oku** ve **Dinle**. Hatim bu sayfanın üçüncü ayağı (aşağıda).
  - [ ] **Oku**: sure/cüz/sayfa ile gezinme; Arapça, okunuş ve meal(ler)
        kullanıcının ayarına göre açılıp kapanır. Ayet verisi mevcut vekilden
        (`/api/kuran/...`), sayfa ve cüz numarası zaten API'den geliyor
        (`page`, `juz_number` alanları — hatimdeki sayfa takibi de bunu kullanır)
    - [x] Sayfa → ayet dizini üretildi. **Kaynak quran.com oldu, Açık Kuran
          değil**: Açık Kuran'ın `page` alanı tutarsız (Fatiha 0, Bakara 1–5
          → 1, Kehf 292, Yasin 439, Mülk 561 — hepsi bir eksik; ama Adiyat
          599, Tebbet 603, İhlas/Felak/Nas 604 — birebir). Kayma ortada
          kapanıyor, toplam 605 ayrı sayfa değeri çıkıyor
  - [ ] **Açık uç — QF şartları**: üretilen dizin ayet metni taşımıyor,
          yalnızca sayfa sınırlarını anlatan sayılar. QF "içeriğini public
          repoya koymak" yeniden dağıtım sayıyor; bu dizinin olgusal veri
          sayılıp sayılmayacağı karara bağlı. Seçenekler: QF'ye sormak,
          Diyanet PDF'inden türetmek, ya da Açık Kuran'ın verisini düzeltmek
    - [ ] **Mushaf dizimi (QPC) ikinci etap**: QF'nin `verses/by_page` ucu her
          KELİME için `line_number` + glif kodu (`code_v1`/`code_v2`) veriyor,
          yani Medine mushafı sayfaya özel yazı tipiyle satır satır birebir
          dizilebiliyor — tarama ve koordinat derdi yok
  - [ ] **Dinle**: iki tür kayıt bir arada
    - [ ] Kıraat kesitleri (aşağıdaki madde) — Instagram'da paylaşılanlar
    - [ ] **Ayet ayet seslendirme**: birkaç ünlü kârînin tam kaydı, mukabele
          gibi ayet ayet dinlenir. Okunan ayet vurgulanır, ayet bitince
          sıradakine geçer; duraklatma, tekrar, aralık seçme
    - [ ] Kârî seçimi ayarlardan (sesini sevdiğin biriyle okumak tercih meselesi)
    - [ ] **Ses kaynağı: Quran Foundation** (bkz. aşağıdaki kaynak notu).
          Açık Kuran ses vermiyor (ölçüldü: `verse`, `transcription`,
          `translation`, `page`, `juz_number` — audio yok). QF'de 12 kârî var
          ve ses dosyaları ayet ayet bölünmüş
    - [ ] **Kelime kelime zaman damgası QF'de hazır** (`?fields=segments` →
          `[[konum, kelime, başlangıç_ms, bitiş_ms], …]`), yani okunanı kelime
          seviyesinde vurgulamak için elle işaretleme gerekmiyor
    - [ ] Ayet ayet çalmak ayet başına bir istek demek: bir sonraki ayet
          önden yüklenmeli, yoksa her ayet arasında boşluk oluyor
    - [ ] Çevrimdışı: dinlenen sure/cüz'ün indirilip saklanabilmesi (ses
          dosyaları localStorage'a sığmaz — IndexedDB ya da Cache API)
    - [ ] **QUL kıraat kataloğu** (`qul.tarteel.ai/resources/recitation`) —
          133 kayıt; etiketler Hafs (44), Murattal (35), Mujawwad (5),
          Muallim, "Kids repeat", Ijazah. 59'unda **zaman damgası var**
          (kelime/ayet bölütleri), indirme biçimi JSON ve SQLite. Bir
          kayıtta harf seviyesinde bölüt bile var (Abdulbasit, Mücevved)
    - [ ] Kârî listesi veriden üretilecek (ad, kıraat türü, bölüt var mı),
          ayarda değil **Dinle sekmesinin kendi seçicisinde** durmalı:
          dinlerken değiştirilen bir tercih
  - [ ] **Sesi nereye koyacağız — cevap: hiçbir yere.** QUL'un indirilebilir
        dosyaları zaman damgası verisidir, sesin kendisi değil; ses zaten
        yayıncıların CDN'lerinde ayet ayet bölünmüş duruyor
        (`verses.quran.com`, `everyayah.com`) ve oradan akıtılır. Mushaf
        fontlarında işleyen kalıbın aynısı: okuyoruz, kopyasını dağıtmıyoruz
    - [ ] Yalnızca iki durumda kendi depomuz gerekir: (1) çevrimdışı indirme,
          (2) **kendi kıraat kesitlerimiz** (Instagram kayıtları — zaten
          bize ait). İkisi için de **Cloudflare R2** doğru yer: Pages ile
          aynı hesap, çıkış trafiği ücretsiz, S3 uyumlu. 10 GB'a kadar
          ücretsiz katman bir hatimlik kayda fazlasıyla yeter
    - [ ] Zaman damgası verisi (JSON) küçük ve bize ait olmayan bir hesaplama
          değil — o repoda durabilir; lisansı QUL'dan netleştirilecek
  - [ ] Oku ve Dinle aynı yeri işaret eder: dinlerken "burayı oku", okurken
        "burayı dinle" tek dokunuşla
  - [ ] Hatim ilerlemesi buradan da işaretlenebilsin (okuduğun/dinlediğin yer
        hatime yazılır)
- [ ] **Kıraat kesitleri** — Instagram'da paylaşılan kıraat kayıtları için sitede
      bir alan. Video değil, **yalnızca ses**: kesit bir içerik parçası gibi
      listelenir, çalınır ve okunan ayetler metin olarak yanında durur.
  - [ ] İçerik modeli: ses dosyası, okuyucu, sure + ayet aralığı, süre, tarih,
        varsa Instagram gönderi bağlantısı, kısa not
  - [ ] **Ayetler kesitin içinde saklanmaz, aralık saklanır** — metin mevcut
        Kuran vekilinden (`/api/kuran/range/...`) gelir, böylece aynı önbellek
        kullanılır ve meal listesi tek yerde durur
  - [ ] Gösterim kullanıcının KENDİ ayarına uyar: Arapça açık/kapalı, okunuş,
        hangi meal(ler) — ayet parçasındaki alanların aynısı, ayarlar sayfasına
        taşınacak (şu an yalnızca görsel oluşturucuda)
  - [ ] Oynatıcı: minimal, tek parça; listede çalarken sayfalar arasında
        gezilebilmeli (kalıcı bir alt çalar mı, yoksa sayfaya bağlı mı — karar)
  - [ ] Ses dosyaları nerede durur: repoya konmaz (her kesit MB'larca).
        Cloudflare R2 ya da benzeri bir nesne deposu; vakit JSON'undaki gibi
        doğrudan bağlantı
  - [ ] Dosya biçimi ve boyut: mobil veri için makul bir bitrate (opus/m4a),
        kesit başına hedef boyut belirlenecek
  - [ ] İleride: ayet ayet zaman damgası ile okunan ayetin vurgulanması
        (kesitleri elle işaretlemek gerekir, önce ölçülecek)
  - [ ] Paylaşım: kesitin kendi sayfası + görsel oluşturucuya "bu ayetler"
        olarak aktarma
- [ ] **Hatim bölümü** — alt menüde, vakitler/takvim gibi ayrı bir Kuran sayfası
  Kullanıcı bir NİYETLE hatim başlatır ("babam için", "Ramazan hatmi") ve
  ilerledikçe okuduğunu işaretler. Behold'daki alışkanlık takibinin fikri, ama
  görselleştirmesi bize ait olacak.
  - [ ] Yeni hatim başlatma: niyet metni, başlangıç tarihi, hedef (isteğe bağlı
        bitiş tarihi ya da günlük sayfa/cüz hedefi)
  - [ ] Birden fazla hatim aynı anda sürebilir; biri "etkin" olarak işaretlenir
  - [ ] İlerleme girişi: okunan sayfa/cüz aralığı işaretlenir (son okunan yerden
        devam eden tek dokunuşluk bir "buraya kadar okudum" yolu olmalı)
  - [ ] **Günlük ilerleme yatay bir takvimde**: gün gün şerit, her günün
        kutucuğu o gün okunan miktarla doluyor; şerit bugüne yapışık başlar ve
        geriye kaydırılır
  - [ ] **Hatim listesinde her hatim bir görselleştirmeyle**: Behold yuvarlak
        içini gradyanla dolduruyor; biz daha farklısını yapabiliriz — 604
        sayfayı ya da 30 cüzü temsil eden bir halka/ızgara, dolan kısmı vakit
        rengiyle. Karar verilecek, bir iki alternatif denenecek
  - [ ] Hatim içinde minimal okuma: o anki sayfanın Arapçası ve meali
        (mevcut `/api/kuran/...` vekilinden; ayet parçasındaki veri yolu)
  - [ ] Veri nerede durur: localStorage yeterli mi, cihazlar arası taşınması
        gerekir mi (gerekiyorsa hesap/senkron ayrı bir mesele)
  - [ ] Tamamlanan hatim: bitiş ekranı + paylaşılabilir görsel (Görsel Oluştur'a
        bir hatim parçası olarak bağlanabilir)
  - [ ] Alt gezinmede beşinci bir giriş olacağı için ray/alt çubuk ölçüleri
        yeniden bakılacak
- [ ] **Farklı hatlarla okuma** — hatim ve Kuran sayfası için mushaf hattı
      seçilebilsin. Varsayılan nesih dışında Hafız Osman hattı gibi klasik
      hatlar dijitalleştirilip eklenir. **Ayrı bir iş**: kendi deposunda,
      açık kaynak olarak yayınlanabilir (alaturka-core kalıbının aynısı).
  - [ ] Önce temel karar: **yazı tipi mi, sayfa görseli mi**. Hafız Osman
        mushafları el yazması sayfalardır; yazı tipine çevirmek ayrı bir
        hattatlık + font mühendisliği işi, sayfa görseli ise tarama demek
  - [ ] Yazı tipi yolu: mevcut açık nesih/osmanî yazı tiplerinin envanteri ve
        lisansları çıkarılacak (bir kısmı `shareFonts.js`'te zaten var);
        hangi hatların karşılığı var, hangisi sıfırdan üretim gerektiriyor
  - [ ] Sayfa görseli yolu: 604 sayfalık tarama + **ayet başına koordinat**
        gerekiyor, yoksa okunan ayet vurgulanamaz ve hatim ilerlemesi sayfaya
        bağlanamaz. Koordinat verisi işin asıl ağır kısmı
  - [ ] **Medine mushafı için bu yola gerek kalmadı**: QF'nin QPC glif kodları
        + satır numaraları sayfayı yazı tipiyle birebir diziyor. Bu madde
        artık "Medine dışındaki hatlar" (Hafız Osman vb.) için geçerli
  - [ ] Telif ve kaynak durumu her hat için ayrı ayrı netleştirilecek
  - [ ] Ayarlardan seçim: hat + yazı boyutu; seçim okuma, hatim ve ileride
        görsel oluşturucuda da geçerli olmalı
  - [ ] Dosya boyutu: hat yazı tipleri büyük olur, tembel yüklenmeli
        (görsel oluşturucudaki grup grup font yükleme kalıbı burada da geçerli)
- [ ] Ana ekranda seçili ayetlerden gösterim
- [ ] Sayfalarda belirli konumlarda ön tanımlı ayetlerin rastgele gösterilmesi (küçük ayet kartı/bandı — her açılışta farklı bir ayet)
- [ ] öntanımlı ayetleri uygulada günlük gösterme
---

## Masaüstü Görünüm İyileştirmeleri (sitenin geniş ekran düzeni)

Uygulama mobile-first; geniş ekranlarda içerik gereksiz yayılıyor.

- [x] İçerik için maksimum genişlik / ortalanmış kolon (`--shell` / `--shell-wide`)
- [x] Masaüstünde çok kolonlu yerleşim (ana sayfa, saat, vakitler, takvim)
- [x] BottomNav yerine masaüstünde sol ray (üst çubuğun üç parçası da raya taşındı)
- [x] LED saat ve başlıkların geniş ekranda ölçek/oran ayarı
- [x] Responsive kırılma noktaları: 900px (ray + ortalama), 1240px (iki kolon)
- [ ] Klavye navigasyonu (hover durumları var)

---

## Teknik Borç &amp; Sürekli

- [x] **Siteyi `@alaturkavakitler/core`'a geçirmek** — kural katmanı artık tek
      kopya; site ve masaüstü uygulaması aynı paketi kullanıyor.
      - [x] Paket `@alaturkavakitler/core` adıyla npm'de; yayın GitHub
            Actions'tan trusted publishing ile, token saklamadan
            (`.github/workflows/release.yml`, `v*` etiketinde)
      - [x] Silinen yerel kopyalar: `utils/{vakit,clock,hijri,qibla}.js`,
            `data/{hijriMonths,holyDays,cities,cityCoords}.js`
      - [x] Doğrulama: 2022–2037 arası 5844 günde eski/yeni `toHijri` ve
            `holyDaysOn` çıktıları birebir aynı, 81 ilin kıble açısı aynı
      - [x] Sayaç `nextVakit`e geçti — gece yarısı sonrası 27 saatlik sayaç
            hatası (Faz 2) kapandı
      - [ ] Luxon hâlâ biçimlendirme için duruyor (17 dosya); tamamen kaldırmak
            ayrı bir iş
      - [ ] Masaüstü uygulaması core'u hâlâ submodule olarak taşıyor, npm
            paketine geçirilebilir
- [x] **Yedek alma / geri yükleme** — bütün tarayıcı verisi tek JSON
      dosyasına (ayarlar, şehir, kaza, hatimler, görsel düzeni); içe
      aktarma iki adımlı onayla. Önbellekler dışarıda
- [ ] Yedeğin buluta/dosyaya otomatik kopyası (şimdilik elle indiriliyor)
- [ ] Scraper: dünün verisi kaybolmaması
- [ ] Service worker + web worker ayrımı
- [ ] Performans: VakitCounter interval optimizasyonu
- [x] Lazy loading (sayfa bazlı code splitting — router'da dinamik import)
- [ ] E2E test (Playwright)
- [ ] **Hicri hesabı ayrı bir kütüphaneye çıkar** — Diyanet'e göre hicri
      ay/gün hesabı yapan bağımsız bir paket (ayrı repo, npm'e yayınlanabilir).
      Şu an `src/data/hijriMonths.js` + `src/utils/hijri.js` bu işi yapıyor;
      tablo Diyanet'in yayımladığı ay başlangıçlarından üretiliyor, ileri
      yıllar Umm al-Qura'dan tamamlanıyor. Kütüphaneye taşınırken hedef,
      tabloyu her yıl elle güncellemek yerine Diyanet'in kullandığı hesabî
      ölçütü (kavuşum + görünürlük) doğrudan hesaplamak olmalı.
- [ ] **Ayet notları ve kaydedilen ayetler** — bir ayete not düşmek ve
      ayeti bir listeye kaydetmek (yer imi). Veri tarayıcıda durur, yani
      yedeğe de girmesi gerekir (`src/utils/backup.js` anahtar listesi).
      Arayüz: ayete uzun basmak bir eylem sayfası açar (dinle / kaydet /
      not). **Mobil uygulama yapılırsa** burası onunla birlikte
      düşünülmeli: not alıp ona geri dönmek bildirim ve çevrimdışı
      senkron isteyen bir iş, web tarafında yarım kalır.
- [ ] Hicri tablo kapsamı 2036'da bitiyor; Diyanet yeni yılları yayımladıkça
      `src/data/hijriMonths.js` içindeki satırları doğrula.

---

## Öncelik Sırası

1. **Faz 1** — Çalışan Vue app (blocker)
2. **Faz 2** — Bilinen hatalar (kullanıcı deneyimi)
3. **Faz 3** — Ayarlar sayfası (çok istenen özellik)
4. **Faz 4** — Saat sayfası (uygulamanın kalbi)
5. **Faz 5** — Vakitler iyileştirme
6. **Faz 6** — Takvim
7. **Faz 7** — İçerik / yönetim paneli
8. **Faz 8+** — Paylaş, Oluşturucu, Platform, Dini Araçlar (kıble/Kuran)

