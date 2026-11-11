# Sosyal medya tanıtım kartları

Uygulamanın özelliklerini tanıtan kareler ve videolar. İki çıktı ailesi var:

- **Dikey kartlar** — Instagram story (1080×1920) ve 4:5 gönderi
  (1080×1350); her özellik için bir PNG ve ~10 sn MP4.
- **Yatay film** — YouTube için tek parça 1920×1080 tanıtım (~86 sn):
  giriş + yedi özellik + çıkış, bölümler siyaha düşerek birleşir.

```
node render.mjs                         # 7 özellik × 2 dikey boyut → PNG + MP4
node render.mjs --youtube                # tek parça 16:9 film + kapak PNG'si
node render.mjs --feature kaza          # yalnız bir özellik
node render.mjs --only png --no-build   # hızlı önizleme
node render.mjs --help
```

Dikey çıktılar `out/` altına `04-kaza-story.png` / `.mp4` biçiminde düşer.
Yatay film `out/alaturka-vakitler-tanitim.mp4`, kapak görseli
`out/alaturka-vakitler-tanitim-kapak.png`. Komut bittiğinde YouTube
açıklamasına yapıştırılacak bölüm zaman kodlarını da yazar.

## Temel kural

**Karttaki telefonun içinde uygulamanın kendisi çalışır.** Arayüz burada
yeniden çizilmez.

Bir kez çizilmişti ve hemen yanlış oldu: kaza sayacı gerçekte vakte basılı
tutunca açılan tam genişlikte bir bant, elle çizilen sürümde ise yan yana
+/− düğmeleri olan bir satır listesiydi. Arayüz taklit edildiğinde kartlar,
uygulama değiştikçe sessizce yalan söylemeye başlar. Bu yüzden `index.html`
yalnızca İsviçre tipografisiyle bir çerçeve çizer; içindeki iframe
`dist/`'ten gelen gerçek uygulamadır.

Hareket de taklit değil. Sayaç gerçekten sayar, basılı tutma gerçekten bandı
açar, ay gerçekten değişir, palet gerçekten değişir.

## Nasıl çalışıyor

1. `render.mjs` uygulamayı derler (`npm run build`) ve küçük bir sunucuyla
   yayınlar. Kart da aynı sunucudan gelir (`/_card.html`) — **aynı köken**
   olmazsa karttan iframe'e erişilemez, sahne sürülemez.
2. Her belgeye, kendi betikleri çalışmadan **önce** sahte bir saat enjekte
   edilir: `Date`, `setTimeout` ve `setInterval` sanal zamana bağlanır.
3. Kare başına sanal zaman ilerletilir, sahnenin o anki dokunuşları yapılır,
   ekran görüntüsü alınır; sonunda ffmpeg birleştirir.

Gerçek zamanlı ekran kaydı değil: kare atlamıyor, süre tam oturuyor ve aynı
komut her çalıştığında birebir aynı kareleri üretiyor.

### Sahne yazmak

Her özellik `index.html`'deki `FEATURES` dizisinde bir satırdır:

| Alan | Ne işe yarar |
|---|---|
| `route` | Uygulamanın hangi rotası |
| `at` | Uygulamanın göreceği "şimdi" |
| `speed` | Sanal zamanın gerçek zamana oranı. 1 = gerçek zaman |
| `focus` | Ekrana getirilecek eleman (uygulama bir telefon ekranından uzun) |
| `detail` | Yakın çekim: `{ sel, scale }` |
| `seed` | iframe'e enjekte edilecek ek localStorage anahtarları |
| `frame(t, w, d, once)` | Her karede çalışır; `once(ad, ms, fn)` ile zamanlanmış dokunuş |

`speed` zaman şeridinde 5400: bir gün 10 saniyeye sığar, çizgi gerçekten
kayar ve uygulama vakitten vakte yeniden renklenir.

Sahne geliştirirken `--probe` işe yarar — sahneyi kurar, verilen ifadeyi
uygulamanın içinde değerlendirir ve çıkar:

```
node render.mjs --feature kible --no-build --probe "d.querySelector('.qibla').className"
```

İfade `async` olabilir; `tick()` bir Vue güncellemesi bekler (DOM'u olay
gönderdikten hemen sonra okursan henüz değişmemiş olur).

## Yatay film

Aynı kart, aynı sahneler; yalnızca düzen değişir (`SIZES.yt`, `land: true`):
metin solda bir kolonda, telefon sağda. Dikeydeki gibi üst üste dizilseydi
telefon 1080px yüksekliğe sığmak için küçülüp okunmaz hâle gelirdi.

- Bölüm sırası ve süreleri `render.mjs`'teki `YT_CHAPTERS`'ta. Özellik
  bölümleri **10 saniye**: sahnelerin dokunuş zamanlamaları (`index.html`)
  o bütçeye göre yazıldı, kısaltılırsa son dokunuşlar hiç gerçekleşmez.
- Giriş ve çıkış bölümlerinde uygulama yok (`phoneless`); giriş özelliklerin
  numaralı dizinini, çıkış logo + adresi gösterir.
- Geçiş, kartın üstündeki `.veil` ile yapılır: her bölüm siyahtan açılıp
  siyaha kapanır. Kareler bölüm bölüm basıldığı için ffmpeg tarafında bir
  geçiş süzgecine gerek kalmıyor.
- Her bölüm kendi MP4'üne basılır, sonra **akış kopyalanarak** birleştirilir.
  80 saniyelik 1920×1080 PNG dizisi diskte birkaç GB tutuyor; ayrıca yeniden
  kodlamak kaliteyi bir kez daha düşürürdü.
- Film sessizdir. Müzik eklenecekse birleştirilmiş MP4'e sonradan bindirmek
  yeterli (`ffmpeg -i film.mp4 -i muzik.m4a -c:v copy -shortest`).

## Ölçülen tuzaklar

- **Servis çalışanı.** `dist/sw.js` yayınlanırsa kayıtlı SW gezinme
  isteklerine app shell'i döndürür ve `/_card.html` de uygulamayla
  değiştirilir (ilk iki kart basılıp sonrakiler "kart yüklenmedi" verir).
  Sunucu SW dosyalarını 404'ler, `register` da ayrıca etkisizleştirilir ve
  her çalıştırma taze profille başlar.
- **`zoom` ile ölçeklemeyin.** Kök elemana `zoom: 1.4` vermek viewport'u
  küçültmüyor: uygulama 559px genişlikte bir tablet gibi yerleşiyor, alt
  gezinme ekranın dışında kalıyordu. iframe gerçek telefon ölçüsünde
  (402×844) açılır ve çerçeve `transform: scale()` ile büyütülür — ekran
  görüntüsü tam çözünürlükte rasterize ediliyor, bulanıklık yok (ölçüldü).
- **Yakın çekim telefonun dışına taşmamalı.** Taşarsa ekranın kenarı
  kadrajın ortasında bir dikiş gibi görünür; `applyDetail` kadrajı telefon
  kutusuna sıkıştırır.
- **`land` ile `solo` birlikte verilmez.** İkisi de `.card`'ın flex yönünü
  belirliyor; çıkış kartı ikisini birden alınca üst/alt şeritler ortaya
  sıkışıp üst üste biniyordu.
- **Yatay kadraj dikeyden dar.** Yakın çekimde istenen ölçek telefonun
  enini kırpabiliyor (kıble kartında ekranın iki yanı kesiliyordu);
  `applyDetail` yatayda ölçeği kadrajın enine çeker.
- **Vue eşzamansız günceller.** Olay gönderdikten sonra DOM'u okumadan önce
  bir kare beklemek gerekir.
- **`--accent` ile `--grad` ayrı.** Aksan koyu zeminin üstünde okunmak için
  parlaktır; aynı rengi kartın tepesine koyunca beyaz başlık okunmuyor
  (sarı/turuncu vakitlerde ölçüldü). Uygulamadaki `--primary` /
  `--accent-ui` ayrımının aynısı.

## Veriler

`data/vakitler-34.json` İstanbul vakitleridir (Diyanet deposu, plaka 34;
depo 36 günlük yürüyen bir pencere yayınlıyor, bu yüzden kopyası burada
duruyor). Sahnelerin anları bu aralığın içinde olmalı — dışına çıkılırsa
uygulama vakit bulamaz.

Geri kalan her şey (hicri aylar, kandiller, paletler, kıble açısı) zaten
uygulamanın içinden gelir; burada kopyası yoktur.

## Yazı tipi

Kart çerçevesi siteyle aynı yazı tipini kullanır: **Inter Tight**, Google
Fonts'tan. Monospace kullanılmaz. Telefonun içindekiler uygulamanın kendi
tipografisidir.
