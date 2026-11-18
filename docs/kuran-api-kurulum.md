# Ayet widget'ı — kurulum

Ayet metni `functions/api/kuran/` altındaki Cloudflare Pages Function
üzerinden geliyor. İki şeyin panodan ayarlanması gerekiyor; ikisi de
yapılmadan widget metin getiremez.

## 1. API anahtarı (zorunlu)

Cloudflare panosu → **Workers & Pages → alaturkavakitler → Settings →
Variables and Secrets → Add**

| | |
|---|---|
| Tür | **Secret** (Text değil) |
| Ad | `ACIKKURAN_KEY` |
| Değer | Açık Kuran hesabındaki anahtar |

Production ve Preview ortamlarının ikisine de eklenmeli.

> Adın `VITE_` ile başlamaması şart. Vite `VITE_` önekli her değişkeni
> derleme anında paketin içine yazar — yani tarayıcıya ulaşır.

## 2. KV önbelleği (şiddetle önerilir)

Olmadan da çalışır, ama kalıcı önbellek olmaz: yalnızca edge cache kalır
ve o veri merkezi başına çalışıp az istenen içeriği düşürür. Yani rate
limit kalkanı KV'dir.

### Namespace'i oluştur

```sh
npx wrangler login                              # tarayıcıda hesap doğrulaması
npx wrangler kv namespace create KURAN_KV
npx wrangler kv namespace create KURAN_KV --preview
```

Her komut bir `id` basar. Bu projede oluşturulanlar:

| | id |
|---|---|
| Production | `728fa5d20fa049329418b486d262f617` |
| Preview | `34a6886d34ed47f7822445801b25fcbf` |

### Projeye bağla

Bu adım **panodan** yapılıyor. Wrangler var olan bir Pages projesine
binding ekleyemiyor — `wrangler pages project` altında yalnızca
list/create/delete var, `wrangler pages download config` ise tek yönlü
(okur, yazmaz).

Pano → **Workers & Pages → alaturkavakitler → Settings → Bindings →
Add binding → KV namespace**

| | |
|---|---|
| Variable name | `KURAN_KV` |
| KV namespace | yukarıda oluşturulan |

Production için normal namespace'i, Preview için `--preview` ile
oluşturulanı seç.

Değişken adı **tam olarak `KURAN_KV`** olmalı; kod onu bu adla arıyor
(`env.KURAN_KV`).

### Doğrula

Dağıtımdan sonra:

```sh
curl -s "https://alaturkavakitler.com/api/kuran/verse/112/1?authors=11" | head -c 200
```

Aynı isteği iki kez atınca ikincisi belirgin biçimde hızlı dönmeli.

## 3. Önbelleği önden doldurmak (isteğe bağlı)

```sh
node scripts/warm-kuran-cache.js                 # 1026 istek, ~17 dk
node scripts/warm-kuran-cache.js --authors=11    # 114 istek, ~2 dk
```

Gerekli değil: önbellek kullanıldıkça kendiliğinden dolar ve bir ayet
ömründe yalnızca bir kez ıskalanır. Isıtmanın tek kazancı, o ayeti dünyada
ilk isteyen kişinin ~0,3 saniye beklememesi. Bir duyuru dalgası
bekleniyorsa ve aynı dakikada 60'tan fazla FARKLI sure ilk kez istenecekse
anlamlı olur.

Yarıda kesilirse baştan çalıştırmak güvenli: ısıtılmış olanlar KV'den
döner, API'ye gitmez.

## Maliyet

| | |
|---|---|
| Tüm Kuran, 9 meal | 16.6 MB (ücretsiz plan 1 GB) |
| Tam ısıtma | 1026 istek (günlük bütçe 10.000) |
| Sonrasında API isteği | sure başına meal başına bir kez, ömür boyu |

## Geliştirme

`npm run dev` altında vekil çalışır: `vite.config.js` Function'ın
kendisini içe aktarıp bir ara katmanda çağırır, anahtarı `.env`'den okur.
KV taklit edilmez — dev'de kalıcı önbellek yoktur, her istek API'ye gider.
