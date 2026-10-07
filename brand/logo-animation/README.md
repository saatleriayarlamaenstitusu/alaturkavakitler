# Logo animasyonu

Alaturka Vakitler logosunun açılış (intro) ve kapanış (outro) animasyonu.
İki yerde kullanılır:

- **Sitede** — üst çubuktaki marka işareti ve yükleyici (`src/components/ui/LogoMotion.vue`)
- **Tanıtım videolarında** intro/outro — buradaki `render.mjs` ile video olarak alınır

## Animasyon

1. **İşaret ortada** parça parça belirir.
2. **Sola kayarak** yerine oturur.
3. Kayarken sağda **harfler tek tek** soldan sağa açılır. Her harf kendi
   yerinin biraz sağından gelir — işaret onları çekiştiriyormuş gibi
   geriden yetişirler. Alt satır üst satırın bir tık gerisinden gelir;
   ikisi aynı anda açılınca hareket düz bir duvar gibi okunuyordu.

Harfler gerçekten ayrı yollar. Kelimeler kaynakta tek bir SVG yolu; alt
yolları mutlak koordinata çevrilip x konumlarına göre harflere gruplandı
(ALATURKA 8, VAKİTLER 8). İki incelik vardı:

- Kapalı konturda `z` sonrası imleç alt yolun başına döner; k. alt yolun
  mutlak başlangıcı = (k−1).in başlangıcı + k.nin `m` deltası.
- `m`den sonra gelen örtük koordinat çiftleri **göreli** linetodur. Başı
  `M`ye çevirince mutlak sayılıp şekil dağılıyordu; kalan kısım sayıyla
  başlıyorsa önüne açıkça `l` konuyor.

Parçalanmış hâlin birleşik sınır kutusu, orijinal yolunkiyle birebir aynı
çıkıyor (sapma 0,0000) — bölme doğruluğunun ölçüsü bu.

Toplam süre `--dur 1` iken ~2,4 saniye (hareket ~1,45 sn + nefes payı).

## Önizleme

```
xdg-open index.html
```

Alttaki panelden hız, boy, zemin rengi ve döngü denenebilir. Zeminler
uygulamanın kendi renkleri: koyu, kâğıt, imsak, öğle, ikindi, yatsı ve
saydam.

URL parametreleri (kayıt için de kullanılır):

| Parametre | Değer | Ne yapar |
|---|---|---|
| `chrome` | `0` | denetim panelini gizler |
| `bg` | `0`–`6` | zemin: 0 koyu, 1 kâğıt, 2 imsak, 3 öğle, 4 ikindi, 5 yatsı, 6 saydam |
| `size` | px | logonun genişliği |
| `dur` | sayı | hız çarpanı (1 = ~2,1 sn) |
| `mode` | `intro` \| `outro` | hangi animasyon |
| `autoplay` | `0` | açılışta oynatma |

## Video almak

```bash
node render.mjs                              # koyu zemin, 1080x1080, mp4
node render.mjs --bg 6 --format webm         # saydam zemin, alfa kanallı
node render.mjs --mode outro                 # kapanış
node render.mjs --canvas 1920x1080 --size 900 --fps 60
node render.mjs --help                       # tüm seçenekler
```

Çıktılar `out/` klasörüne yazılır. `out/` sürüm kontrolüne girmez.

**Biçimler:** `mp4` (H.264, saydamlık yok), `webm` (VP9 + alfa),
`mov` (QuickTime RLE + alfa, kurgu programları için en uyumlusu),
`png` (ham kare dizisi).

Saydam arka plan isteniyorsa `--bg 6` ile birlikte `webm` ya da `mov` seç;
mp4 alfa taşımaz, saydam istenirse arkası siyah çıkar.

> `ffprobe` saydam bir webm'i `pix_fmt=yuv420p` diye gösterir — alfa yok
> sanma. VP9 saydamlığı ayrı bir yan veri bloğunda taşınır ve ffprobe onu
> yüzeye çıkarmaz. Dosyayı geri çözüp köşe pikseline bakınca `rgba(0,0,0,0)`
> geliyor, yani saydamlık yerinde. `mov` (qtrle) tarafında ffprobe doğrudan
> `argb` gösterir.

### Nasıl çalışıyor

Gerçek zamanlı ekran kaydı yerine, headless Chromium'da animasyon kare kare
sürülüp her kare PNG olarak alınıyor, sonra ffmpeg birleştiriyor. Kare
atlamıyor ve süre tam oturuyor.

Zamanı sürmek için **Web Animations API** kullanılıyor: sayfadaki tüm
animasyonlar duraklatılıp her kare için `currentTime` elle kuruluyor.

> Önce CDP'nin sanal saati (`Emulation.setVirtualTimePolicy`) denendi, iki
> yönden de çıkmaz sokak: saat tamamen duruyorken `Page.captureScreenshot`
> kare üretemediği için hiç dönmüyor; yüklenme payı olarak bütçe verilince
> de o süre animasyonun başından yeniyor ve işaret çizgilerinin yükselişi
> kayda girmiyor. Bu not, aynı yolu tekrar denememek için burada duruyor.

## Sitede

`src/components/ui/LogoMotion.vue` aynı animasyonu iki yerde çalıştırır.

**Üst çubuktaki marka işareti** — sayfa açılınca bir kez oynar. `TopNav`
uygulama kabuğunda olduğu için sayfalar arası gezinirken yeniden kurulmaz;
animasyon yalnızca ilk açılışta görünür.

```vue
<LogoMotion width="140px" :speed="0.9" />
```

Sitede **kayma yok**: işaret doğrudan yerinde belirir, ardından harfler açılır.
Ortadan sola kayan tam koreografi tanıtım videoları için; logo zaten yerinde
dururken onu ortadan getirmek yersiz bir hareket oluyordu. Gerekirse
`slide` ile açılabilir.

**Yükleyici** — veri beklenirken sürekli döner:

```vue
<LogoMotion width="220px" :speed="0.85" loop role="status" label="Yükleniyor" />
```

| Prop | Varsayılan | Ne yapar |
|---|---|---|
| `width` | `220px` | logonun genişliği |
| `speed` | `0.85` | hız çarpanı; küçük değer daha çevik |
| `loop` | `false` | açıkken animasyon başa sarar |
| `slide` | `false` | açıkken işaret ortada belirip sola kayar (video koreografisi) |
| `role` | `img` | yükleyici olarak `status` verilir |
| `label` | `Alaturka Vakitler` | erişilebilirlik etiketi |

Logo `currentColor` kullanır, yani bulunduğu yerin `color` değerini alır —
vakit temasıyla birlikte renk değiştirir.

`prefers-reduced-motion` açıkken açılma yerine hafif bir nabız gösterilir;
"yükleniyor" bilgisi kaybolmasın diye tamamen durdurulmuyor.

> Bileşen değişkenleri `:root`ta DEĞİL bileşenin kökünde tanımlı. Vue scoped
> stilde `:root` seçicisi `:root[data-v-...]` hâline geliyor ve `<html>` ile
> hiç eşleşmiyor; `--shift` tanımsız kalınca sola kayma hiç çalışmıyordu.

## Değiştirirken

Animasyon **iki yerde** tanımlı: `index.html` (kayıt) ve `LogoMotion.vue`
(site). Zamanlama değerleri ikisinde aynı; birini değiştirince diğerini de
güncelle.
