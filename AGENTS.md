# Bu depoda çalışan yapay zekâ ajanları için

Bu dosya **sözleşmedir**: nasıl çalışılacağı, neyin yasak olduğu, bir işin
ne zaman bitmiş sayıldığı. Kısa tutuldu; derinlik başka dosyalarda.

OpenCode, Codex, Cursor ve benzerleri bu dosyayı okur. Claude Code
`CLAUDE.md`yi okur ve o dosya buraya işaret eder — **ikisi çelişirse
CLAUDE.md değil bu dosya değiştirilmeli**, kural tek yerde dursun.

---

## Hangi bilgi hangi dosyada

| Dosya | İçinde ne var | Ne zaman açılır |
|---|---|---|
| `AGENTS.md` (bu dosya) | Çalışma kuralları, yasaklar, bitti ölçütü | Her oturumun başında |
| `CLAUDE.md` | Mimari ve **ölçülmüş kararlar**: bir şeyin neden böyle olduğu, nelerin denenip bırakıldığı | Bir alt sisteme dokunmadan önce o bölümü |
| `docs/DEGISIKLIKLER.md` | Zaman sıralı mühendislik günlüğü: ne değişti, hangi dosyalar, neden | Oturum başında son 10 madde; **her iş sonunda yazılır** |
| `ROADMAP.md` | Yapılacaklar, fazlar, açık maddeler | İş seçerken ve bitirince (kutuyu işaretle) |
| `src/content/yenilikler.json` | **Kullanıcıya** anlatılan değişiklikler | Kullanıcının yaşadığı bir şey değiştiyse |
| `brand/social/METIN.md` | Metin üslubu (kartlar ve yenilikler) | Kullanıcının göreceği bir cümle yazarken |

**Ayrım önemli:** `CLAUDE.md` zamansızdır — "burası neden böyle".
`DEGISIKLIKLER.md` zamanlıdır — "geçen hafta ne oldu". Biri öbürünün
yerine geçmez; yeni gelen ajan ikisini de okur.

---

## Kaçınılmaz kurallar

Bunlar tercih değil; ihlali iş kaybettiriyor.

- **Commit atma.** `git commit` GPG imzası istiyor, ajan imzalayamaz.
  Değişiklikleri bırak, commit'i kullanıcı atar. İstersen hazır bir
  commit mesajı öner.
- **`npm ci` değil `npm install`.** `package-lock.json` değişiyor.
- **`yarn.lock` repoya girmez.** Cloudflare Pages onu görürse Yarn'a
  geçiyor ve derleme bozuluyor.
- **`.env` izlenmez.** Depo herkese açık ve içinde `ACIKKURAN_KEY` var.
  Bu anahtar **asla** `VITE_` önekiyle yazılmaz; öyle yazılırsa
  pakete gömülür ve herkese açılır.
- **`pkill -f vite` çalıştırma.** Kullanıcının başka sunucularını da
  öldürüyor.
- **Mobil düzene dokunma.** Uygulama mobil için tasarlandı; her
  masaüstü kuralı bir `@media (min-width: …)` içinde durur.
- **Yükleme hızı sınırlı.** CDN'e dosya atarken `--bwlimit 1M`, en çok
  iki eşzamanlı aktarım, aynı hedefe iki `rclone` birden yok
  (`scripts/upload-cdn.sh` bunu zaten uyguluyor). Başlamadan
  `pgrep -fa rclone`.

---

## Çalışma yordamı

1. **Oku:** bu dosya → `docs/DEGISIKLIKLER.md`in son maddeleri →
   dokunacağın alt sistemin `CLAUDE.md` bölümü. Kodu ondan sonra aç.
2. **Ölç, tahmin etme.** Bu depoda bir iddia ancak ölçüldüyse yazılır.
   "Muhtemelen taşıyor" değil, "ölçüldü: 962px içerik, 800px kutu".
   Tarayıcıda doğrulama DOM/konsol üzerinden yapılır; ekran görüntüsü
   yalnızca görsel bir yargı gerekiyorsa (hizalama, renk, "çirkin mi").
3. **Sebebi koda yaz.** Bu depoda yorumlar "ne yaptığını" değil
   **neden böyle olduğunu ve neyin denenip bırakıldığını** anlatır.
   Bir tuzağa düştüysen yorumu oraya bırak; bir sonraki ajan aynı
   tuzağa düşmesin.
4. **Doğrula:** `npm run build` hatasız geçmeli. Arayüze dokunduysan
   `npm run dev` ile tarayıcıda bak.
5. **Yaz:** `docs/DEGISIKLIKLER.md`e bir madde ekle (şablon o dosyada).
   Kalıcı bir karar verdiysen `CLAUDE.md`nin ilgili bölümünü güncelle.
   Kullanıcının yaşadığı bir şey değiştiyse `yenilikler.json`a bir
   madde ekle. Yol haritasındaki bir maddeyi bitirdiysen kutuyu
   işaretle.
6. **Bırak:** commit atma, neyi değiştirdiğini say.

**İş bitmiş sayılmaz** eğer: derleme kırıksa, günlüğe yazılmadıysa, ya
da "şunu da yapmak lazım" diye bırakılan bir parça varsa ve bu
söylenmediyse.

---

## Aynı anda birden fazla ajan

Bu depoda birden fazla ajan çalışabilir ama **aynı dosyada değil**.

- İşe başlamadan `git status` ve `docs/DEGISIKLIKLER.md`in en üstündeki
  "Devam eden" bölümüne bak. Orada senin dokunacağın dosyalar yazıyorsa
  başka bir iş seç ya da kullanıcıya sor.
- Uzun bir işe giriyorsan o bölüme bir satır ekle (kim, hangi dosyalar,
  ne); bitince satırı sil ve normal bir madde yaz.
- Dalda çalışmak serbest, ama `v2` üretim dalıdır: her `push` canlıya
  çıkar. Yarım iş `v2`ye gitmez.

**Ayrı worktree varsa durum değişir.** Orca her ajana kendi worktree'sini
verebiliyor; o zaman dosya çakışması diye bir sorun kalmıyor, yukarıdaki
kural yalnızca AYNI worktree'de çalışan ajanlar için geçerli. Buna
karşılık iki şey ortaya çıkıyor:

- **Günlük birleşmede çakışır.** `docs/DEGISIKLIKLER.md`e herkes en üste
  yazdığı için paralel iki worktree aynı satırlarda çakışıyor. Çözümü
  basit: çakışmayı çözerken iki maddeyi de tut, tarih sırasına koy.
  Madde silinmez.
- **Çekirdek paketi ayrı iş.** Bir worktree `alaturka-core`a
  dokunuyorsa öbürleri `npm i` ile güncellenmeden onun değişikliğini
  görmez. Core değişikliği tek bir worktree'de yapılır ve bitene kadar
  öbürleri eski sürümle çalışır.

---

## Üç depo, tek kural kümesi

| Depo | Ne | Agent dosyası |
|---|---|---|
| `alaturkavakitler` | Site (Vue 3 PWA) — ana depo | `AGENTS.md` + `CLAUDE.md` |
| `alaturka-newtab` | Chrome yeni sekme eklentisi | `AGENTS.md` + `README.md` |
| `alaturka-desktop` | Linux masaüstü uygulaması (GTK4/GJS) | `AGENTS.md` + `README.md` |
| `alaturka-core` | Ortak çekirdek: hicri takvim, dinî günler, vakit tablosu, alaturka saat, kıble, şehirler | npm paketi |

**Takvim/vakit kuralı değiştirilecekse `alaturka-core`da değiştirilir**,
sitede değil. Aynı kural iki yerde yaşarsa ayrışıyor — bir kez yaşandı:
gece yarısı–imsak arası sayaç hatası core'da düzeltildi, sitedeki kopya
aylarca yanlış kaldı.

Üç deponun tanıtım metinleri tek dosyadan okunur:
`alaturkavakitler/brand/social/metinler.txt`.
