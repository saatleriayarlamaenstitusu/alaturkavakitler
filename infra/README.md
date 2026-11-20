# infra

Elle kurulan ama **sürümlenmesi gereken** yapılandırma. Buradaki
dosyalar uygulamanın derlemesine girmez; Cloudflare tarafına uygulanır.

## `r2-cors.json` — CDN kovasının CORS kuralı

Kova: `alaturkavakitler-assets` · alan adı: `cdn.alaturkavakitler.com`

```bash
npx wrangler r2 bucket cors set alaturkavakitler-assets --file infra/r2-cors.json
npx wrangler r2 bucket cors list alaturkavakitler-assets      # doğrulama
```

Panelden yapılacaksa: **R2 → alaturkavakitler-assets → Settings →
CORS Policy → Edit**.

**Biçim S3'ünki DEĞİL.** R2'nin kendi API'si `rules` dizisi ve
`allowed.{origins,methods,headers}` / `exposeHeaders` / `maxAgeSeconds`
alanlarını istiyor; S3'ün `CORSRules` + `AllowedOrigins` yazımı
"must contain a 'rules' array" hatası verir (alındı ve düzeltildi).
Panel S3 biçimini kabul ediyor olabilir — karışmaması için her iki yolda
da bu dosyadaki JSON kullanılmalı.

İlk kurulumdan ÖNCE `cors list` çalıştırılırsa
`The CORS configuration does not exist [code: 10059]` döner; bu hata
değil, "henüz kural yok" demektir.

### Kuralın gerekçesi

- **Neden gerekiyor:** mushaf sayfa fontları `FontFace` ile yükleniyor
  ve yazı tipi istekleri tarayıcıda **her zaman CORS'ludur**, `<img>`
  gibi serbest değildir. `Access-Control-Allow-Origin` dönmezse font
  sessizce reddedilir ve uygulama yayıncının CDN'ine düşer — yani ayna
  "çalışıyor" görünür ama hiç kullanılmaz.
- **`AllowedMethods` yalnızca GET/HEAD:** CDN okunur; yazma
  `wrangler`/`rclone` ile, S3 API üzerinden yapılıyor, tarayıcıdan değil.
- **`Range` izinli, `Content-Range` açık:** ses dosyaları parça parça
  istenir (ileri sarma, önden yükleme). Bu ikisi olmadan tarayıcı
  kaydın ortasına atlayamaz.
- **`alaturkavakitler.pages.dev`:** Pages'in üretim takma adı. Her
  önizleme dağıtımı `<hash>.alaturkavakitler.pages.dev` gibi AYRI bir
  köken alır; joker (`https://*.…pages.dev`) R2 tarafında kabul
  edilmeyebilir, bu yüzden listeye konmadı. Önizlemede aynayı denemek
  gerekirse o dağıtımın kökeni tek seferlik eklenir — ya da hiç
  eklenmez: ayna yoksa uygulama yayıncının CDN'ine düşer, önizleme
  yine çalışır.
- **`localhost:5173` / `127.0.0.1:5173`:** geliştirme sunucusu. İkisi
  ayrı kökendir, biri diğerini kapsamaz.

### Sınırı: CORS hotlink engeli DEĞİLDİR

CORS yalnızca **tarayıcıdaki betiğin yanıtı okumasını** kısıtlar.
Adresi bilen biri dosyayı `curl` ile ya da `<audio src>` / `<img src>`
ile doğrudan çekebilir; bu isteklerde CORS hiç devreye girmez. Başka
bir sitenin sesi doğrudan gömmesini gerçekten engellemek isteniyorsa
gereken şey Cloudflare tarafında **Hotlink Protection** ya da
`Referer` denetimli bir WAF kuralıdır. Şu an buna ihtiyaç yok:
dosyalar zaten herkese açık yayınlardan alınmış kopyalar ve ayna
yalnızca yedek yol olarak kullanılıyor.
