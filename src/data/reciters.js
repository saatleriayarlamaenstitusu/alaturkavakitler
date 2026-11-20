/**
 * Kârî kütüğü — sure sure seslendirme.
 *
 * **Ses dosyasını biz TAŞIMIYORUZ, ikinci kopya olarak tutuyoruz.**
 * Çalma sırası: önce kaydın KENDİ kaynağı (yayıncının CDN'i), o hata
 * verirse bizim aynamız (`VITE_AUDIO_MIRROR_BASE`, Cloudflare R2).
 * Böylece normal halde bize bant genişliği maliyeti çıkmıyor ama
 * kaynak düşerse okuma durmuyor.
 *
 * `path` kaydın yayıncısındaki yolu, `{n}` üç haneli sure numarasıyla
 * değişir (036 gibi). Aynadaki yol da aynıdır — indirme betiği
 * (`scripts/mirror-recitations.js`) aynı ağacı kurar, böylece iki
 * kaynak arasında geçiş tek bir ön ek değişikliğidir.
 *
 * İKİ ses düzeni var ve ayrımı önemli:
 *
 *  - `path`  — **sure başına tek dosya** (quranicaudio). Baştan sona
 *    dinlemek için. Okunan ayeti vurgulamak zaman damgası İSTER:
 *    dosyanın neresindeyiz sorusunun cevabı veride durur.
 *  - `ayah`  — **ayet başına tek dosya** (everyayah). Mukabele için.
 *    Vurgulama için AYRI VERİ GEREKMEZ: dosya sınırı zaten ayet sınırı,
 *    hangi dosyayı çaldığımız hangi ayette olduğumuzdur.
 *
 * `qc`: quran.com kıraat numarası. Yalnızca KELİME seviyesinde
 * vurgulama için gerekli (`?fields=segments` → `[sıra, kelime, başMs,
 * bitişMs]`, ayet dosyasına göreli). Olmayanlarda ayet vurgusu yine
 * çalışır, kelime vurgusu çalışmaz.
 *
 * `qul`: Quranic Universal Library kayıt numarası. Oradaki SURE
 * bazlı damgalar için — ama indirme giriş istiyor (ölçüldü:
 * `/resources/recitation/<id>/download` → `/users/sign_in`), bu yüzden
 * dosya elle indirilip `scripts/import-qul-recitation.js` ile
 * `src/data/recitation/<id>/` altına çevriliyor.
 *
 * `seg: true` → o kârînin damgaları İÇE AKTARILMIŞ demektir; sure
 * dosyası çalarken okunan ayet vurgulanabilir. Olmayanlarda sure
 * dosyası çalar ama vurgu yapılamaz (ayet düzeni `ayah` ile yapılır,
 * orada damga gerekmez).
 */

const QA = 'https://download.quranicaudio.com/quran/'
const QDC = 'https://download.quranicaudio.com/qdc/'
/** Ayet başına dosya; ad kalıbı `sssaaa.mp3` (sure+ayet, üçer hane). */
const EVERYAYAH = 'https://everyayah.com/data/'

export const RECITERS = [
  {
    id: 'abdulbasit-murattal',
    fatiha: 41,
    name: 'Abdülbasit Abdüssamed',
    style: 'Murattal',
    // Kayıt DEĞİŞTİ: damgalar bu okuyuşa ait. Eski adres
    // (`quran/abdul_basit_murattal/001.mp3`) başka bir kayıttı —
    // Fatiha 47 sn, bunda 42 sn; damgalar oraya uymuyordu (ölçüldü).
    base: QDC,
    path: 'abdul_baset/murattal/{n}.mp3',
    padded: false,
    ayah: 'Abdul_Basit_Murattal_64kbps',
    qc: 2,
    qul: 408,
  },
  {
    id: 'abdulbasit-mujawwad',
    fatiha: 78,
    name: 'Abdülbasit Abdüssamed',
    style: 'Mücevved',
    // Yol TAHMİN EDİLMİŞTİ ve yanlıştı (`abdul_basit_mujawwad/` → 404,
    // dizin boş kaldı). Doğrusu quran.com'un verdiği adres.
    base: QDC,
    path: 'abdul_baset/mujawwad/{n}.mp3',
    // Bu dizinde de sure numarası DOLGUSUZ: `.../mujawwad/1.mp3`.
    // Dolgulu istenirse 404 gelir; çalıcı ve ayna betiği de bu alana bakar.
    padded: false,
    ayah: 'Abdul_Basit_Mujawwad_128kbps',
    qc: 1,
    qul: null,
  },
  {
    id: 'husary',
    fatiha: 48,
    name: 'Mahmud Halil el-Hüsarî',
    style: 'Murattal',
    // Kayıt DEĞİŞTİ, sebebi yukarıdakiyle aynı: eski adreste Fatiha
    // 57 sn, damgaların ait olduğu kayıtta 48 sn.
    base: QDC,
    path: 'khalil_al_husary/murattal/{n}.mp3',
    padded: false,
    ayah: 'Husary_64kbps',
    qc: 6,
    qul: 368,
  },
  {
    id: 'shuraim',
    fatiha: 35,
    name: 'Suud eş-Şüreym',
    style: 'Murattal',
    base: QDC,
    path: 'saud_ash-shuraym/murattal/{n}.mp3',
    ayah: 'Saood_ash-Shuraym_64kbps',
    qc: 10,
    qul: 107,
  },
  {
    id: 'albana',
    fatiha: 47,
    name: 'Mahmud Ali el-Benna',
    style: 'Murattal',
    base: QA,
    path: 'mahmood_ali_albana/{n}.mp3',
    ayah: 'Mahmoud_Ali_Al_Banna_32kbps',
    qc: null,
    qul: 372,
  },
  {
    id: 'alaqmi',
    fatiha: 54,
    name: 'Ekrem el-Alakmî',
    style: 'Murattal',
    base: QA,
    path: 'akram_al_alaqmi/{n}.mp3',
    ayah: 'Akram_AlAlaqimy_128kbps',
    qc: null,
    qul: 370,
  },
  {
    // Adres QUL dosyasından çıktı (`surah_list.audio_url`); quranicaudio
    // kataloğunda ve everyayah'da yoktu. Sure numarası DOLGUSUZ:
    // `.../mp3/1.mp3`, `.../mp3/112.mp3`.
    id: 'toure',
    fatiha: 46,
    name: 'Hadi Turé',
    style: 'Murattal',
    base: 'https://download.quranicaudio.com/qdc/hadi_toure/mp3/',
    path: '{n}.mp3',
    padded: false,
    ayah: '',
    qc: null,
    qul: 421,
    seg: true,
  },
  {
    id: 'seferagic',
    name: 'Fatih Seferagić',
    style: 'Murattal',
    base: '',
    path: '',
    qul: null,
    note: 'qurancentral.com/audio/fatih-seferagic — tam hatim değil',
  },
]

/** Kullanıma hazır olanlar: adresi bilinenler. */
export const availableReciters = () => RECITERS.filter((r) => r.base && r.path)

/**
 * Okuyuş temposu — Fâtiha'nın süresinden.
 *
 * Kârî seçerken asıl merak edilen "ne kadar ağır okuyor" sorusu ve
 * bunun ölçülebilir bir karşılığı var: aynı sure herkeste aynı metin,
 * süre farkı doğrudan tempo farkı. Fâtiha seçildi çünkü kısa, herkeste
 * var ve giriş duası gibi ayrı bir üslupla okunmuyor.
 *
 * Ölçülen aralık 35–78 sn. Eşikler oradan: 45'e kadar hızlı, 55'e
 * kadar orta, üstü ağır (mücevved okuyuş 78 sn ile tek başına en uçta).
 *
 * @returns {{level: 1|2|3, label: string}} level 3 = en hızlı.
 */
export function tempoOf(reciter) {
  const r = typeof reciter === 'string' ? reciterById(reciter) : reciter
  const sec = r?.fatiha
  if (!sec) return { level: 0, label: '' }
  if (sec <= 45) return { level: 3, label: 'hızlı' }
  if (sec <= 55) return { level: 2, label: 'orta' }
  return { level: 1, label: 'ağır' }
}

export const reciterById = (id) => RECITERS.find((r) => r.id === id) ?? null

/** Aynamızın kökü; tanımlı değilse yedek yol yoktur. */
const MIRROR = import.meta.env?.VITE_AUDIO_MIRROR_BASE ?? ''

const pad = (surah) => String(surah).padStart(3, '0')
/**
 * Yayıncının dosya adı: çoğu sıfır dolgulu (`001.mp3`), ikisi DOLGUSUZ
 * (`1.mp3` — Turé ve mücevved Abdülbasit). Ayna betiği de aynı adresi
 * kurmak için bunu kullanır; aynadaki HEDEF adı hep dolguludur.
 */
export const sourceFile = (r, surah) =>
  r.path.replace('{n}', r.padded === false ? String(surah) : pad(surah))

/**
 * Tek bir AYETİN ses adresleri (mukabele düzeni).
 *
 * Vurgulama için ek veri gerekmez: çalınan dosya zaten o ayettir.
 */
export function ayahSources(reciter, surah, verse) {
  const r = typeof reciter === 'string' ? reciterById(reciter) : reciter
  if (!r?.ayah) return []
  const file = `${pad(surah)}${pad(verse)}.mp3`
  const out = [`${EVERYAYAH}${r.ayah}/${file}`]
  if (MIRROR) out.push(`${MIRROR.replace(/\/$/, '')}/ayet/${r.id}/${file}`)
  // Ayna ağacı: sure düzeni <kök>/<kari>/036.mp3, ayet düzeni
  // <kök>/ayet/<kari>/002255.mp3 (bkz. scripts/mirror-recitations.js).
  return out
}

/**
 * Bir SURENİN ses adresleri: önce kaynağın kendisi, sonra aynamız.
 *
 * Dizi döner — çalıcı sırayla dener. Tek bir adres döndürseydik
 * "kaynak düştüğünde aynaya geç" mantığı çalıcının içine dağılırdı.
 */
export function audioSources(reciter, surah) {
  const r = typeof reciter === 'string' ? reciterById(reciter) : reciter
  if (!r?.path) return []
  const file = sourceFile(r, surah)
  const out = []
  if (r.base) out.push(r.base + file)
  if (MIRROR) out.push(`${MIRROR.replace(/\/$/, '')}/${r.id}/${pad(surah)}.mp3`)
  return out
}
