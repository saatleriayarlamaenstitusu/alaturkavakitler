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
