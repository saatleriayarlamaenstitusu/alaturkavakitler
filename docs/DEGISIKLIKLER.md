# Değişiklik günlüğü (mühendislik)

Zaman sıralı, **en yeni en üstte**. Bu dosya `CLAUDE.md`nin yerine
geçmez: orası zamansızdır ("burası neden böyle"), burası zamanlıdır
("geçen hafta ne oldu, hangi dosyalar değişti"). Yeni gelen bir ajan
ikisini de okur — önce buradan son 10 maddeyi, sonra dokunacağı alt
sistemin `CLAUDE.md` bölümünü.

`src/content/yenilikler.json` ile de karıştırma: orası **kullanıcıya**
anlatılan değişikliklerdir ve altyapı maddeleri oraya girmez.

## Şablon

Her madde dört satırdan ibarettir. Uzun anlatım buraya değil
`CLAUDE.md`ye ya da kodun içine yazılır.

```
### YYYY-AA-GG — Kısa başlık
**Ne:** bir iki cümle, kullanıcı ya da geliştirici açısından ne değişti.
**Dosyalar:** a.vue, b.js (yeni), c.md
**Neden:** sebep; bir hata düzeltildiyse ÖLÇÜM ("962px içerik, 800px kutu").
**Etkisi:** başka nereye dokunuyor, nelere dikkat edilmeli. Yoksa "—".
```

## Devam eden

Şu an uzun soluklu bir iş yok. Bir işe başlarken buraya bir satır ekle
(kim · hangi dosyalar · ne), bitince sil ve aşağıya normal bir madde yaz.

---

### 2026-11-24 — Meal menüsünde tutarlı seçim satırları
**Ne:** Arapça kapalı ve Meal kapalı satırları listedeki meallerle aynı onay işaretini, satır vurgusunu ve klavye odağını kullanıyor.
**Dosyalar:** src/components/quran/MealSheet.vue
**Neden:** Arapça kapalı bir onay kutusu, Meal kapalı ayrı bir düğme olarak görünüyordu. 360 px Chromium testinde iki yeni düğme de 358 × 34,6 px ölçüldü ve başlıkları aynı hizada başladı.
**Etkisi:** Seçim durumu klavyeyle değiştirilebilir ve `aria-pressed` üzerinden okunur.

### 2026-11-24 — Yalnızca meal veya Arapça okuma
**Ne:** Esnek ve Ayet ayet görünümlerinde Meal kapalı seçimi artık Arapça metni getiriyor. Arapça kapalı seçeneği mealleri tek başına gösteriyor ve hatme özel ayar olarak da saklanıyor.
**Dosyalar:** functions/api/kuran/[[path]].js, vite.config.js, src/pages/QuranPage.vue, SettingsPage.vue, src/components/quran/MealSheet.vue, MushafView.vue, PlayerSheet.vue, HatimForm.vue, src/data/hatimReader.js, src/stores/settings.js, src/content/yenilikler.json, CLAUDE.md
**Neden:** Boş meal listesi HTTP 400 dönüyordu. Yerel vekilde aynı önbellek yanıtını ikinci kez okumak da hata veriyordu. 360 px Chromium testinde iki görünüm, yenileme sonrası tercih ve son meal kapatılınca Arapçanın dönmesi doğrulandı.
**Etkisi:** Ayet ve aralık isteklerindeki boş meal listesi artık geçerli. Ardışık geliştirme istekleri birbirinden bağımsız yanıt alıyor.

### 2026-11-24 — Yenilikler sayfasının dili
**Ne:** Yenilikler sayfasındaki 32 metin, okurun Kur’an, hatim, namaz ve takvimle ilgili günlük kullanımına göre yeniden yazıldı. Bugünkü dört başlığa hatim tercihleri, vakit bildirimi, kaydedilen ayetlerin yedeği ve masaüstü takvimindeki resmî tatiller işlendi.
**Dosyalar:** src/content/yenilikler.json, brand/social/METIN.md
**Neden:** Sayfada hitap biçimi değişiyor ve okurun kullanmadığı teknik ayrıntılar yer kaplıyordu.
**Etkisi:** Yazı kimlikleri ve tarihleri korundu. Bundan sonraki yenilik metinleri için hitap ve kapsam kuralı üslup belgesine eklendi.

### 2026-11-24 — Hatim başına okuma tercihleri
**Ne:** Yeni hatimde Mushaf hatmi, Meal okuma veya Serbest okuma ayarları seçilebiliyor. Hatim adı ve ayarları karttan ya da okuyucudan düzenlenebiliyor. Okuma sırasında yapılan görünüm, meal, kârî, takip ve tam ekran değişiklikleri o hatme kaydediliyor.
**Dosyalar:** src/components/quran/HatimForm.vue, HatimPanel.vue, MushafView.vue, ListenBar.vue, PlayerSheet.vue, src/data/hatimReader.js, src/stores/hatim.js, settings.js, recitation.js, src/pages/QuranPage.vue, src/App.vue, src/content/yenilikler.json, CLAUDE.md, ROADMAP.md
**Neden:** Bir hatimdeki meal ve görünüm değişikliği genel ayarları etkiliyordu. 360 px Chromium testinde meal listesi [11] → [11, 14] → [14] olarak değişti ve yenilemeden sonra [14] kaldı. İki hatim birbirinin ayarını ve ilerlemesini değiştirmedi.
**Etkisi:** Eski hatimler mevcut Serbest okuma tercihleriyle bir kez tamamlanır. Hatim tercihleri, mevcut hatim yedeğinin içinde taşınır.

### 2026-11-24 — Bildirim düğmesinin satırı
**Ne:** Arka plan bildirimi düğmesi Açık/Kapalı seçeneğinin altında ayrı satıra alındı. İzin gerekiyorsa Açık seçeneğinin ne yapacağı açıklanıyor.
**Dosyalar:** src/pages/SettingsPage.vue
**Neden:** İki kontrol aynı satıra diziliyordu. Canlıda 360 ve 1280 px genişlikte yeni satır aralığı 12 px ölçüldü.
**Etkisi:** Pages dağıtımı dcb5d774.

### 2026-11-24 — Arka plan bildirimi seçeneği görünür
**Ne:** Arka plan bildirimi düğmesi Vakit Hatırlatması bölümünde baştan görünür. Ayar kapalıysa, izin eksikse veya tarayıcı hazır değilse nedeni altında gösterilir.
**Dosyalar:** src/pages/SettingsPage.vue, src/stores/vakitPush.js, CLAUDE.md
**Neden:** Düğme daha önce hatırlatma açılıp service worker hazır olunca görünüyordu. Kullanıcı ayarı açıkça bulabilmeli.
**Etkisi:** Bildirim hizmeti geçici olarak erişilemezse aynı düğmeden hazırlık yeniden başlatılır.

### 2026-11-24 — Kapalı web uygulamasında vakit hatırlatması
**Ne:** Ayarlar’dan isteğe bağlı Web Push etkinleştirilebiliyor. Şehir ve süre değişiklikleri sunucuya eşitleniyor. Test bildirimi ve aboneliği kapatma akışı eklendi.
**Dosyalar:** workers/vakit-push/, src/stores/vakitPush.js, src/composables/useVakitNotifications.js, src/pages/SettingsPage.vue, public/vakit-push-sw.js, vite.config.js, package.json, package-lock.json, src/data/privacy.js, src/content/yenilikler.json, CLAUDE.md, ROADMAP.md
**Neden:** Açık sayfa zamanlayıcısı kapalı PWA’yı uyandıramıyor. Chromium taklidinde şehir, süre, çevrimdışı değişiklik ve iptal akışları doğrulandı. SQLite senaryosunda gün değişimi, gece yarısı öncesine düşen imsak ve eşzamanlı cron çağrısında tek gönderim doğrulandı. Canlı cron İstanbul kaydının bir sonraki yoklamasını D1’e yazdı.
**Etkisi:** Cloudflare Worker ve D1 canlıda. Pages dağıtımı 856d3f35; mevcut canlı sürüme yalnızca Web Push değişiklikleri uygulandı. Fiziksel Android ve iPhone teslimat testi açık.

### 2026-11-24 — Takvimde sabit miladi tatiller
**Ne:** Türkiye’nin dinî olmayan sabit resmî tatilleri ay ızgarasında soluk mavi kareyle gösteriliyor. Seçili günün altında tatil adı, 28 Ekim’de ise başlangıç saati yazıyor.
**Dosyalar:** src/data/publicHolidays.js, src/components/calendar/HijriMonthCalendar.vue, src/content/yenilikler.json, CLAUDE.md
**Neden:** Resmî tatili dinî gün ve hatim işaretlerinden ayırmak için. 360 px Chromium testinde işaret 5 × 5 px, ızgara 320 px ve taşmasız. 23 Nisan 2023 hücresinde Ramazan Bayramı noktası ve resmî tatil karesi birlikte görüldü.
**Etkisi:** Tatil işareti miladi tarihe bağlı. Verinin kaynağı 2429 sayılı Kanun’un 1. ve 2. maddeleri.

### 2026-11-24 — Kopyalanan ayet metni
**Ne:** Ayeti kopyala, panoya yalnızca ayetin Arapça metnini yazar.
**Dosyalar:** src/components/quran/VerseActions.vue, src/content/yenilikler.json, CLAUDE.md
**Neden:** Arapça metni tek başına yapıştırabilmek için.
**Etkisi:** Okuma ve kayıt listesi aynı kopyalama düğmesini kullanır. Paylaşımda meal, künye ve bağlantı da yer alır.

### 2026-11-24 — Ayet menüsü düğmenin yanında açılıyor
**Ne:** Üç nokta ayetin üzerine gelince, dokununca veya klavyeyle odaklanınca belirir. İkonlu işlem paneli ayetin yanında açılır. Kaydedilen ayetler yer imiyle işaretlenir ve kayıt listesinde aynı menü bulunur.
**Dosyalar:** src/components/quran/MushafView.vue, src/components/quran/VerseActions.vue, src/components/quran/SavedVerses.vue, src/content/yenilikler.json, CLAUDE.md
**Neden:** Üç nokta her satırda sürekli görünüyordu. 360 px dokunmatik Chromium testinde yalnızca dokunulan satırın düğmesi göründü. Açılan panel 184 × 118 px ölçüldü.
**Etkisi:** Yerel popover ve eski tarayıcı yolu aynı konum hesabını kullanır. Kayıt listesinden kopyalama, paylaşma ve kaydı kaldırma yapılabilir.

### 2026-11-24 — Ayet işlemleri ve Kaydedilen Ayetler
**Ne:** Ayet ayet görünümünde her ayetin yanındaki üç nokta menüsü kopyalama, paylaşma ve kaydetme seçeneklerini açıyor. Kaydedilen Ayetler, Hatimlerim'den sonra gelen üçüncü sekmede açılıyor.
**Dosyalar:** src/pages/QuranPage.vue, src/components/quran/MushafView.vue, src/components/quran/VerseActions.vue, src/components/quran/SavedVerses.vue, src/stores/savedVerses.js, src/utils/backup.js, src/pages/SettingsPage.vue, src/content/yenilikler.json, CLAUDE.md, ROADMAP.md
**Neden:** Gruplu meal aynı blokta dururken tek bir ayet üzerinde işlem yapılabilmesi gerekiyor. 360 px Chromium testinde yedi ayet için yedi menü ve 2–4 aralığı için tek meal satırı görüldü. Sekme şeridi 320 px genişlikte taşmadı.
**Etkisi:** Kayıtlar tarayıcıda tutulur ve yedeğe dahil edilir. Liste yenilendiğinde ayetler için ağ isteği yapılmaz. Ayet bağlantısı serbest okumada ilgili ayeti açar.

### 2026-11-23 — Oynatıcı popup'ında font, boyut ve tecvit ayarları
**Ne:** Oynatıcı ekranında (oynatıcıda "Oynatıcıyı aç" düğmesi) gösterilen okunan ayet artık okuma sayfasındaki ayarları kullanıyor: seçilen Arapça yazı tipi, yazı boyutu (70–180%) ve tecvit işaretlemesi. Ayrıca iki tecvit kuralı (`idgham_ghunnah`, `qalaqah`) artık renkleniyor — önce hiç renklenmiyordu.
**Dosyalar:** src/components/quran/PlayerSheet.vue, src/utils/qpc.js, src/assets/css/tajweed.css (yeni), src/main.js, src/components/quran/MushafView.vue, CLAUDE.md
**Neden:** Popup'taki ayet sabit 1.5rem ve DÜZ metin basıyordu (ölçüldü: popup `.ar` = 25.6px, ölçek yok, `.tj` parçası 0); kullanıcının seçtiği font yalnızca akan metinde geçerliydi. Ölçülen yeni hâl: ölçek 1.4 → 33.6px, font "Amiri, serif", 7 renkli tecvit parçası. İkinci bulgu: API `idgham_ghunnah` ve `qalaqah` gönderiyor (by_page 255 ve by_key 2:255 ölçüldü), uygulamanın listesi `idgham_with_ghunnah`/`qalqalah` diyordu — o iki kural API'den gelmediği için hep renksiz kalıyordu; sayfa 255'te 7 `qalaqah` ve 2 `idgham_ghunnah` parçası artık renkli.
**Etkisi:** Tek ayetin tecviti `utils/qpc`de `verseTajweed` ile geliyor (`verses/by_key`; sayfa yolu `by_page` idi, oynatıcıda sayfa bilinmiyor). Tecvit renkleri global (`assets/css/tajweed.css`) oldu; MushafView'daki kopyası silindi.

### 2026-11-23 — Kur'an araç şeridinde ikon düğmeleri
**Ne:** Tam ekran düğmesinin ince yazı glifi yerine kalın bir SVG ikon geldi; meal düğmesi yalnızca ikona indi (mütercim adı ve TR/EN rozeti şeritten kalktı).
**Dosyalar:** src/pages/QuranPage.vue, CLAUDE.md
**Neden:** Tam ekran ikonu `⤢`/`⤡` yazı glifiydi, fonta göre ~1px çizgi (ölçüldü: ink 17.9 css-px²); yerine sabit 1.6px konturlu çift köşe ok kondu (ink 53.3 css-px², 3×). Meal ikonu çeviri yazısı (文/A) yerine KÜRE (Material "language", 16px): ink 47.3 → 106.0 css-px², medyan çizgi değişmedi (1.67px) ama silüet tek parça oldu; 17px'de halka kalınlıkları birbirine giriyor. Gir/çık için ayrı ikon dört adayda da 16px'te ayırt edilemedi.
**Etkisi:** Hangi mealin açık olduğu şeritte artık yazmıyor — düğmenin `title`/`aria-label` metninde (`mealTitle`) ve alttaki meal listesinde duruyor. Seçili meal varsa düğme vurgulanıyor (`aria-pressed`).

### 2026-11-23 — Hicri ay künyesi ve TDV bağlantısı
**Ne:** Takvim sayfasında seçili ay başlığının ve ay gezinti şeridinin yanındaki bilgi düğmesi, ayın etimolojisini, İslami önemini ve TDV İslâm Ansiklopedisi maddesini gösteren bir pencere açıyor.
**Dosyalar:** src/components/calendar/HijriMonthInfoSheet.vue (yeni), src/data/hijriMonthInfo.js (yeni), src/components/calendar/HijriMonthCalendar.vue, CLAUDE.md
**Neden:** Hicri ayların adları ve anlamları uygulamada hiç yoktu; on iki ayın künyesi TDV İslâm Ansiklopedisi maddelerinden toplandı.
**Etkisi:** —

### 2026-11-23 — Açık temalarda Amentü ve Makili logosu okunurluğu
**Ne:** Amentü sayfasındaki metinler ve Hakkında sayfasındaki Makili logosu açık temalara uyumlu hale getirildi.
**Dosyalar:** src/pages/AmentuPage.vue, src/pages/AboutPage.vue, public/Icons/makili.svg
**Neden:** `color: white` ve SVG içindeki `fill: #f9f1f2` nedeniyle açık temalarda metinler ve logo zemin üzerinde beyaz kalıp görünmüyordu. `var(--text)` ve `currentColor`a bağlandı (ölçüldü: açık temada `rgb(26, 26, 26)` ve Makili fill `rgb(61, 48, 128)`).
**Etkisi:** —

### 2026-11-23 — Hakkında sayfasında Diğer Uygulamalar bölümü
**Ne:** Hakkında sayfasına "Diğer Uygulamalar" bölümü eklenerek Chrome yeni sekme eklentisi ve Linux masaüstü uygulaması bağlantısı bir araya getirildi.
**Dosyalar:** src/pages/AboutPage.vue
**Neden:** Linux masaüstü uygulaması (GTK4) için bağlantı yoktu; eklenti tek başına duruyordu. İki bağımsız uygulama tek bir başlık altında toplandı.
**Etkisi:** —

### 2026-11-23 — Kur'an aramasında boşluklu sure ayet desteği
**Ne:** Gitme kutusunda iki sayının boşlukla yazılması (`3 15`, `2 255`) sure ve ayet araması olarak tanınıyor.
**Dosyalar:** src/components/quran/GoTo.vue, CLAUDE.md
**Neden:** `2:255` ve `bakara 255` destekleniyordu ancak mobil klavyede iki nokta yerine boşlukla iki sayı yazıldığında (`3 15`) sonuç listelenmiyordu (`0` sonuç -> `Ali İmran 15, sayfa 51`).
**Etkisi:** —

### 2026-11-23 — Hatim takvim şeridi çerçeve taşması ve kenar gradyanı
**Ne:** Hatim görünümündeki gün şeridinin kart çerçevesi dışına taşması engellendi, kenarlarına yumuşak geçişli gradyan maskesi eklendi.
**Dosyalar:** src/components/quran/HatimCalendar.vue, CLAUDE.md
**Neden:** `margin: 0 -1.25rem` kuralı nedeniyle şerit kart sınırlarını aşıyordu (ölçüldü: 460px kart, 474px şerit, her iki yanda 7px taşma). Çerçeve içinde tutulup (`clearanceLeft/Right: 13px`) kenarlara `mask-image` gradyanı (`1.25rem`) verildi.
**Etkisi:** —

### 2026-11-23 — Oynatıcı durdurma metni
**Ne:** Kıraat oynatıcı panelindeki ve mini oynatıcı erişilebilirlik etiketindeki "Kıraati bırak" ifadesi "Kıraati durdur" olarak güncellendi.
**Dosyalar:** src/components/quran/PlayerSheet.vue, src/components/quran/MiniPlayer.vue, CLAUDE.md
**Neden:** Kullanıcı açısından eylemin (sesi kesme/durdurma) daha net ve yaygın bir dille ifade edilmesi.
**Etkisi:** —

### 2026-11-23 — Çoklu ajan belgeleri
**Ne:** `AGENTS.md` (çalışma sözleşmesi) ve bu günlük eklendi; üç depo
aynı kural kümesine bağlandı.
**Dosyalar:** AGENTS.md (yeni), docs/DEGISIKLIKLER.md (yeni),
CLAUDE.md (başa yönlendirme)
**Neden:** `CLAUDE.md` 96 kB ve adı gereği yalnızca Claude Code
tarafından okunuyor; OpenCode/Codex gibi ajanlar `AGENTS.md` arıyor ve
hiçbir kural göremeden çalışmaya başlıyordu.
**Etkisi:** Kural değişikliği artık `AGENTS.md`ye yazılır; `CLAUDE.md`
mimari ve ölçülmüş kararlar için kalır.

### 2026-11-23 — Yenilikler metinlerinde bağlantı
**Ne:** Yenilikler ve yazı gövdelerinde `[metin](adres)` artık
bağlantıya dönüşüyor; eskiden ham Markdown olarak görünüyordu.
**Dosyalar:** src/pages/BlogDetailPage.vue
**Neden:** Gövde çözümleyicisi yalnızca `**kalın**` tanıyordu.
**Etkisi:** Yalnızca `http(s)` adresler kabul ediliyor (`javascript:`
kapalı). Uygulama içi bağlantı desteklenmiyor — düz bir `<a href="/…">`
sayfayı baştan yükletirdi, oraya yönlendirici gerekiyor.

### 2026-11-22 — Görsel oluşturucu: yatay fotoğraf ve ön tanım şeridi
**Ne:** Yatay bir fotoğraf artık yana kaydırılabiliyor. Ön tanım şeridi
kırpılmıyor.
**Dosyalar:** src/composables/useShareEditor.js,
src/components/share/ShareCanvas.vue, src/components/share/EditorPanel.vue
**Neden:** Kaydırma sınırı `width × (zoom − 1) / 2` idi, yani fotoğrafın
oranı tuvalinkiyle aynı sayılıyordu; `cover` yerleşiminde yatay bir
fotoğraf 1x'te de enden taşıyor ve o taşan kısım sıfıra kilitleniyordu.
Ön tanım bölümü `presets` sınıfını taşıyordu ve o sınıf geliştirici
bloğuna ait bir ızgara (`minmax(4.6rem, 1fr)`); bölüm ızgaraya girince
şerit dar bir hücreye sıkışıp her ön tanım alt alta diziliyordu. Ayrıca
`overflow-x: auto` dikey taşmayı da kesiyor ve düğmelerin alt kenarlığı
siliniyordu.
**Etkisi:** Fotoğrafın doğal ölçüsü `<img>` yüklenince bildiriliyor
(`setPhotoSize`); bilinmeden önce tuvalin oranı varsayılıyor.

### 2026-11-22 — Hareket ipuçları
**Ne:** Ayete iki kez dokunma ve vakte basılı tutma hareketleri ilk
gelen kullanıcıya canlandırılarak gösteriliyor; bir kez yapılınca
kapanıyor.
**Dosyalar:** src/components/ui/GestureHint.vue (yeni),
src/components/quran/MushafView.vue, src/components/vakit/VakitList.vue
**Neden:** İki hareket de ekranda hiçbir iz bırakmıyordu.
**Etkisi:** Karar `localStorage`da `hint_<id>` anahtarında. Tanıtım
kartları bu anahtarları "done" tohumluyor, yoksa ipucu arayüzün parçası
gibi görünüyor.

### 2026-11-22 — Meal satırı dolgusu
**Ne:** Okunan ayetin meal satırındaki vurgu zemini yazıya yapışmıyor.
**Dosyalar:** src/components/quran/MushafView.vue
**Neden:** Vurgu bir zemindi ve satırda dolgu yoktu.
**Etkisi:** Dolgu HER satırda var, yalnızca vurgulananda değil; yoksa
okunan ayet öbürlerinden kayıyor. Satır arası boşluk artık `gap`ten
değil dolgudan geliyor.

### 2026-11-22 — Ayet vekilinde bozuk yanıt koruması
**Ne:** `/api/kuran` beklenen gövdeyi döndürmezse okunur bir hata
veriliyor; eskiden ham `TypeError` ekranda görünüyordu.
**Dosyalar:** src/utils/kuran.js
**Neden:** Vekil olmayan bir sunucuda istek `index.html`e düşüyor,
`res.json()` patlıyor, gövde boş nesneye iniyor ve çağıran `body.ar.map`
diyor: "Cannot read properties of undefined (reading 'map')".
**Etkisi:** Vekil düşerse canlıda da aynı şey görünürdü.

### 2026-11-21/22 — Tanıtım görselleri düzeneği
**Ne:** Site, eklenti ve masaüstü için sosyal medya kareleri ve
videoları; metinler tek dosyadan okunuyor.
**Dosyalar:** brand/social/{index.html,render.mjs,metinler.txt,METIN.md,
screenshots/}, alaturka-newtab/scripts/magaza-gorseller.mjs,
alaturka-desktop/brand/tanitim.mjs (yeni)
**Neden:** Metinleri kodun içinde tutmak her düzeltmede kodu açtırıyordu.
**Etkisi:** Üç üretici de `brand/social/metinler.txt`ten besleniyor;
depolar yan yana değilse yol `METINLER` ortam değişkeniyle verilir.
Üslup kuralları `brand/social/METIN.md`de.

### 2026-11-21 — Gizlilik politikaları
**Ne:** Site ve eklenti için ayrı iki gizlilik metni, `/gizlilik` ve
`/gizlilik/yeni-sekme`.
**Dosyalar:** src/data/privacy.js (yeni), src/pages/PrivacyPage.vue
(yeni), src/router/index.js, src/pages/AboutPage.vue, public/sitemap.xml
**Neden:** Chrome Web Store eklentiyi tarif eden bir metin istiyor;
sitenin ve eklentinin veri tablosu farklı.
**Etkisi:** `useSeo` alanları **tek tek** `computed` olmalı — tamamı tek
bir `computed` nesnesine sarılınca `unref` zamanında hepsi `undefined`
kalıyor ve başlık boş çıkıyordu (ölçüldü).
