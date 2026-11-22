# Kart metinleri — üslup

Kartlardaki alanlar (`ustbaslik`, `baslik1`, `baslik2`, `aciklama`) bir
özellik listesi değildir. Okuyan kişi "bu uygulamada şu var" değil,
"ben bunu yaşarım" diye anlamalı.

Metinlerin kendisi `metinler.txt` dosyasındadır; üreticiler oradan
okur. Burası nasıl yazılacağını anlatır.

---

## Birinci turda neyi yanlış yaptım

Aşağıdaki maddeler teoriden değil, yazdığım ilk kart metinlerinin
kullanıcı tarafından baştan yazılmasından çıktı. Fark rastgele değil,
sistematik: ben **ürünü** anlatmışım, o **ibadeti ve o anı** anlatmış.

### 1. Başlık bilgi değil çağrıdır

| Benim | Yeniden yazılan |
|---|---|
| Vakti **kaçırmazsınız** | Namazı **Kaçırmayın!** |
| Dinlerken ayeti görürsünüz | İlahi Kelama **Kulak Verin** |

Haber kipi ("…sınız") kullanıcıya olup biteni bildiriyor; emir kipi onu
çağırıyor. Kart bir vitrin, vitrin çağırır. Ünlem en çok bir kartta.

### 2. Soru başlığı kurulabilir — ama kişisel olmalı

"Bugün Kaç Sayfa Okudun?" okuyanı kendi hâline baktırıyor. Eski
kuralım "soru cümlesi kurma" idi ve yanlıştı. Doğrusu: soru **genel**
olmasın ("Hatim tutmak ister misiniz?"), okuyanın o günkü hâline
dokunsun.

### 3. Dinî kelime dağarcığı kullan

`kıraat` → **tilavet**, `ayet metni` → **ilahi kelam**,
`hicri ay` → **hicri ayın ruhu**, `vakit` → yerine göre **namaz**.
Nötr ürün dili ("okunan ayet mushafta işaretlenir") teknik olarak doğru
ama bu uygulamanın ağzı değil.

### 4. Önce niyet, sonra mekanizma

Hatim kartına mekanizmayı yazmıştım: "Sayfayı çevirdiğinizde okundu
sayılır." Yeniden yazılanda önce **kimin için** okunduğu geliyor:
"Deden, sevdiklerin veya bütün ümmet için… Niyetini belirle, her gün
hangi hatimden ne kadar okuduğunu gör." Mekanizma ikinci cümlede ve
orada kalıyor.

### 5. Hayattaki anı adlandır, ekranı değil

| Ekranı tarif eden | Günü tarif eden |
|---|---|
| Bir günün tamamı, altı vakit, tek bir şeritte. | Namaz vakitleri sade ve reklamsız şekilde cebinizde. |
| Her vakit için kaç dakika önce uyarılacağınızı siz seçersiniz. | Bu vakti kıldın mı? Günün telaşesi içinde sonraki vakit girmeden haberdar olun. |
| Nerede olursanız olun, yönünüz belli. | Yolculukta veya günlük hayatınızda, vakitlere bakarken kıble yönünü kolayca bulun. |

"Günün telaşesi içinde", "yolculukta", "her vakit sayacına baktığında"
— metin kullanıcının gününün içinde bir yere oturmalı.

### 6. Mühendislik kanıtı karta girmez

"Ay başlangıçları Diyanet ile aynı gün" doğrudur ve önemlidir, ama bir
tanıtım karesinin işi değil. Böyle maddeler mağaza açıklamasında ve
hakkında sayfasında durur. Kartta o ayın **manevi** tarafı konuşur:
"Mübarek günler, kandiller, bayramlar… Her ayın manevi ruhuna önceden
hazırlanın."

### 7. Aforizma kurma

"Geride kalanı bilmek, tamamlamanın ilk adımı." Kulağa hoş geliyor,
hiçbir şey söylemiyor. Yerine: "Her vakit sayacına baktığında ne kadar
kaza namazı borcunun kaldığını gör." Yüklemi olan, neyi nerede
göreceğini söyleyen bir cümle her zaman daha iyi.

### 8. Hazır kültürel metin varsa uydurma

Saat kartının açıklaması artık Ahmet Haşim'in *Müslüman Saati*
yazısından bir cümle; filmin açılışı bir dizedir. Alıntı, benim
kuracağım herhangi bir cümleden ağır basar. Kaynağı mutlaka yazılır.

### 9. Üç nokta ritimdir

"Mübarek günler, kandiller, bayramlar…" — liste artı üç nokta,
"devamı var" demenin en kısa yolu. Cümle sonunda değil, listenin
ucunda kullanılır.

### 10. Başlıklar Başlık Düzeninde

Her kelimenin ilk harfi büyük: "Kaza Namazı / Sayacı", "Hicri Ayın /
Ruhunu Keşfet". Tek istisna alıntı ve dizelerdir; onlar kaynaktaki
yazımıyla, gerekirse tamamen küçük harfle kalır.

### 11. Uzunluk metne göre ayarlanır, metin uzunluğa göre değil

İlk turda "açıklama en çok 110 karakter" diye bir sınır koymuştum ve
metinler o sınıra sıkıştırıldığı için cılız kaldı. Sınır kalktı:
kartlar artık yazı boyunu metnin uzunluğuna göre kendileri küçültüyor
(bkz. `index.html`'deki `fitDeck`). Yine de 220 karakterin üstü bir
kapakta okunmuyor.

---

## Değişmeyen kurallar

- **Kullanıcıya hitap et, ürünü özne yapma.** "Hatim sizinle ilerler"
  değil, "nerede kaldığını görürsün".
- **Abartı sıfat yok**: "devrim", "en iyi", "muhteşem", "benzersiz".
- **Olmayan şeyi söyleme.** Tepsi simgesi henüz yazılmadı, ses
  dosyalarını biz barındırmıyoruz, web tarafı pencere kapalıyken
  bildirmiyor.
- **Emoji yok.**

## Çözülmemiş: sen mi siz mi

Şu an ikisi karışık. Aynı açıklamanın içinde bile geçiyor: "Bu vakti
**kıldın mı**? … haberdar **olun**." Kaza ve hatim kartları tamamen
"sen", kıble ve dinleme kartları "siz". İkisi de savunulabilir — "sen"
daha samimi, "siz" daha geniş bir kitleye hitap eder — ama bir kart
dizisi içinde karışması dikkatsizlik gibi okunur. Karar verilip bütün
dosyaya uygulanmalı.

---

## Yenilikler maddeleri

Aynı kurallar `src/content/yenilikler.json` için de geçerli, bir fark
dışında: orada ürün değil **değişiklik** anlatılıyor, yani cümleler
"şunu yapabiliyorsunuz" diye kurulur, slogan aranmaz.

**Her değişiklik bir madde değildir.** Kullanıcının yaşadığı bir şey
değişmediyse yenilikler sayfasında işi yok. İlk turda şunları yazmıştım
ve çıkarıldı:

- "Gizlilik politikası yayında, site ve eklenti için ayrı ayrı." —
  hukuki bir gereklilik; kullanıcı onu okumaya karar verdiğinde zaten
  hakkında sayfasında duruyor.
- "Satır dizimini birinci meal belirliyor, öbürleri aynı aralığa kendi
  karşılığını yazıyor." — bu bir uygulama kararı. Kullanıcının gördüğü
  şey: "iki mütercimin karşılığı alt alta duruyor".
- "İki ipucu eklendi." — eklenen şey ipucu, ama kullanıcıyı ilgilendiren
  şey hareketin kendisi. Madde "Ayete iki kez dokunun" diye başlar,
  "ipucu ekledik" diye değil.

Özet: başlığı **kullanıcının kazandığı kabiliyet** olsun, yaptığımız iş
olmasın. Altyapı, hukuk ve iç düzenleme maddeleri commit mesajında
kalır.

## Dışarıdan metin ürettirmek için istem (prompt)

> Türkçe yazıyorsun. "Alaturka Vakitler" adlı bir namaz vakitleri
> uygulamasının sosyal medya tanıtım kartları için başlık ve açıklama
> yazacaksın. Uygulama alaturka saati (gün, akşam ezanıyla başlar),
> Diyanet namaz vakitlerini, vakit hatırlatmalarını, hicri takvimi,
> Kur'an okuma ve hatim takibini, tilavet dinlemeyi, kaza sayacını ve
> kıble pusulasını kapsıyor; web uygulaması, Linux masaüstü uygulaması
> ve Chrome yeni sekme eklentisi olarak var.
>
> Şu özellik için üç alan üret: [ÖZELLİĞİN BİR CÜMLELİK TARİFİ].
>
> - `baslik1` ve `baslik2`: başlığın iki satırı, toplam 5–7 kelime.
>   Başlık Düzeninde yaz (her kelimenin ilk harfi büyük).
> - `aciklama`: bir ya da iki cümle, en çok 220 karakter.
>
> Kurallar:
> - Başlık bir çağrı olsun: emir kipi ("Kulak Verin") ya da okuyanın
>   kendi hâline dokunan kişisel bir soru ("Bugün Kaç Sayfa Okudun?").
>   Haber kipiyle bilgi verme ("…görürsünüz" gibi).
> - Açıklama kullanıcının gününün içinde bir ana otursun: yolculuk,
>   günün telaşı, vakit sayacına bakmak gibi. Ekranda ne olduğunu
>   tarif etme, kullanıcının ne yaptığını söyle.
> - Dinî kelimeleri kullan: tilavet, ilahi kelam, mübarek günler,
>   kandil, hatim, niyet. Nötr ürün dilinden kaçın.
> - Önce niyet ve anlam, sonra mekanizma. Mekanizma en çok bir cümle.
> - Teknik doğruluk kanıtı (veri kaynağı, doğruluk oranı, kullanılan
>   kütüphane) yazma.
> - Aforizma ve yüklemsiz slogan kurma. Her cümlenin yüklemi olsun.
> - Abartı sıfat ve emoji kullanma. En çok bir ünlem.
>
> Birbirinden gerçekten farklı 5 seçenek ver, sadece kelime
> değiştirerek çoğaltma.
