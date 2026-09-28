# Ekran Görüntüleri

Tanıtım materyalleri için hazırlanmış ekran görüntüleri.
430×932 mantıksal viewport, 2× yoğunluk → **860×1864 px** PNG.

| Dosya | Sayfa |
|---|---|
| `01-ana-sayfa.png` | Ana sayfa — LED alaturka saat, vakit sayacı, hicri tarih |
| `02-vakitler.png` | Namaz vakitleri |
| `03-takvim.png` | Hicri aylık takvim |
| `04-saat.png` | Analog alaturka saat |
| `05-gorsel-olustur.png` | Görsel oluşturucu — saat + besmele + tarih kompozisyonu |
| `06-gorsel-olustur-ayarlar.png` | Görsel oluşturucu — katman ayarları ve yazı tipi seçici |
| `07-gorsel-olustur-takvim.png` | Görsel oluşturucu — aylık takvim parçası |
| `08-ayarlar.png` | Ayarlar |
| `09-yenilikler.png` | Yenilikler listesi |
| `10-saat-uzerine.png` | Saat Üzerine yazıları |
| `11-hakkinda.png` | Hakkında |
| `12-yenilik-detay.png` | Yenilik detay sayfası (Ayarlar bölümü yazısı) |

## Tema ve renk stilleri

| Dosya | Görünüm |
|---|---|
| `20-tema-acik.png` | Ana sayfa — açık tema |
| `21-tema-acik-vakitler.png` | Vakitler — açık tema |
| `22-stil-pastel.png` | Ana sayfa — Pastel stili |
| `23-stil-canli.png` | Ana sayfa — Canlı stili |
| `24-stil-mesh.png` | Ana sayfa — Mesh stili |
| `25-stil-mono.png` | Ana sayfa — Mono stili (koyu) |
| `26-stil-mono-acik.png` | Ana sayfa — Mono stili (açık) |
| `27-stil-canli-takvim.png` | Takvim — Canlı stili |

## Yeniden üretmek

Dev sunucusu `localhost:5173`'te açıkken headless Chromium ile alınır.
Üreten betik oturumluktur; tekrar gerekiyorsa aynı yöntemle alınabilir:
Chromium `--headless=new --force-device-scale-factor=2`, CDP üzerinden
`Emulation.setDeviceMetricsOverride` (430×932, mobile) + `Page.captureScreenshot`.
Tema ve renk stili, sayfa açılmadan önce `localStorage`'a yazılır
(`settings_darkMode`, `settings_colorStyle`).

Saat ve tarih içeren sayfalar çekildikleri ana aittir; güncel görüntü
gerekiyorsa yeniden alınmalıdır.
