import { ref, computed, watch } from 'vue'
import { reciterById, audioSources } from '@/data/reciters'
import { loadTimings, verseAt, startOf } from '@/utils/recitation'
import { pageOfVerse } from '@/utils/mushaf'
import { surahById } from '@/data/kuranMeta'
import { infoOf } from '@/data/surahInfo'

/**
 * Kıraat oynatıcısı — SAYFAYA değil UYGULAMAYA ait.
 *
 * Önce bütün düzenek `ListenBar` bileşeninin içindeydi: `<audio>`
 * elemanı onun şablonunda duruyordu ve Kur'an sayfasından çıkmak
 * elemanı DOM'dan silip sesi kesiyordu. Dinlemek sayfaya bağlı bir iş
 * değil — vakitlere bakarken kıraat sürmeli. Bu yüzden ses elemanı,
 * zamanlama tablosu ve çalma durumu bir modülde yaşıyor (ES modülü
 * zaten tekil), şerit yalnızca onun GÖRÜNÜMÜ.
 *
 * Pinia kullanılmadı: burada kalıcılaştırılacak ya da sunucudan
 * gelecek bir şey yok, ihtiyaç duyulan tek şey uygulama ömrü boyunca
 * tek bir örnek. Modül kapsamı onu kendiliğinden veriyor.
 *
 * Sayfa çevirme burada DEĞİL: hangi sayfada olduğunu bilen Kur'an
 * sayfası, o yüzden burada yalnızca "şu an hangi ayet" yazılıyor ve
 * sayfa onu izliyor.
 */

/** Kur'an sayfasındaki şerit açık mı. */
export const barOpen = ref(false)
export const playing = ref(false)
export const loading = ref(false)
export const error = ref('')
export const reciterId = ref('')
/** Çalan kayıt: sure ve ayet (0 = henüz bilinmiyor). */
export const curSurah = ref(0)
export const curVerse = ref(0)
/** Zaman damgaları; kârî değişince yeniden yüklenir. */
const timings = ref(null)

export const reciter = computed(() => reciterById(reciterId.value))
export const surahName = computed(() => surahById(curSurah.value)?.name ?? '')
/** Çalan ayet var mı — mini oynatıcı buna bakar. */
export const active = computed(() => Boolean(curSurah.value) && (playing.value || curVerse.value > 0))

let el = null
/** Besmele ayrı elemandan çalar: ana dosyayı yeniden yüklemesin. */
let bismEl = null
/** Kaynak listesi ve sıradaki kaynak: önce yayıncı, sonra aynamız. */
let srcList = []
let srcIdx = 0
/** Süre bilinmeden `currentTime` yazılamıyor; hedef burada bekler. */
let pendingSeek = null

function ensureEl() {
  if (el) return el
  el = new Audio()
  el.preload = 'none'
  el.addEventListener('loadedmetadata', onMeta)
  el.addEventListener('timeupdate', onTime)
  el.addEventListener('ended', onEnded)
  el.addEventListener('error', onError)
  bismEl = new Audio()
  bismEl.preload = 'none'
  bindMedia()
  return el
}

async function ensureTimings() {
  if (!timings.value && reciterId.value) timings.value = await loadTimings(reciterId.value)
  return timings.value
}

/** Kârî ayardan gelir; değişince damgalar ve kaynak yenilenir. */
export async function setReciter(id) {
  if (!id || id === reciterId.value) return
  reciterId.value = id
  timings.value = null
  await ensureTimings()
  if (!curSurah.value) return
  // Kayıt değişti: aynı ayetten devam et, ama kendiliğinden çalmasın.
  pause()
  const at = startOf(timings.value, curSurah.value, curVerse.value || 1)
  setSource(curSurah.value)
  if (at != null) seek(at)
}

function setSource(surah) {
  const a = ensureEl()
  srcList = audioSources(reciterId.value, surah)
  srcIdx = 0
  const src = srcList[0]
  if (!src) return
  a.src = src
  a.load()
}

function seek(sec) {
  const a = ensureEl()
  if (a.readyState >= 1) { a.currentTime = sec; pendingSeek = null } else pendingSeek = sec
}

function waitMeta() {
  const a = ensureEl()
  if (a.readyState >= 1) return Promise.resolve()
  return new Promise((done) => {
    a.addEventListener('loadedmetadata', done, { once: true })
    a.addEventListener('error', done, { once: true })
  })
}

const hasBasmala = (n) => Boolean(infoOf(n)?.bismillah)

/**
 * Besmele.
 *
 * Sure dosyalarında besmele yok (damgalar 1. ayeti 0. milisaniyeden
 * başlatıyor), ama Fâtiha'nın BİRİNCİ AYETİ zaten besmeledir ve aynı
 * kârînin aynı kaydında duruyor: 1. surenin dosyası baştan, 1. ayetin
 * bitişine kadar çalınıyor. Başka bir kayıttan parça eklemek ses
 * rengini değiştirirdi.
 */
async function playBasmala() {
  ensureEl()
  const end = timings.value?.['1']?.[0]?.[1]
  const src = audioSources(reciterId.value, 1)[0]
  if (!end || !bismEl || !src) return
  try {
    if (bismEl.src !== src) bismEl.src = src
    bismEl.currentTime = 0
    await bismEl.play()
    await new Promise((done) => {
      const stop = () => {
        bismEl.removeEventListener('timeupdate', watchEnd)
        bismEl.pause()
        done()
      }
      const watchEnd = () => { if (bismEl.currentTime * 1000 >= end) stop() }
      bismEl.addEventListener('timeupdate', watchEnd)
      bismEl.addEventListener('ended', stop, { once: true })
      bismEl.addEventListener('error', stop, { once: true })
    })
  } catch { /* besmele çalmazsa okuma yine başlasın */ }
}

async function start() {
  const a = ensureEl()
  loading.value = true
  try {
    await a.play()
    playing.value = true
    error.value = ''
  } catch {
    error.value = 'Ses başlatılamadı'
  } finally {
    loading.value = false
    syncState()
  }
}

/** Duraklat — konum korunur, şerit açık kalır. */
export function pause() {
  el?.pause()
  playing.value = false
  syncState()
}

/** Tamamen bırak: şerit kapanır, vurgu düşer. */
export function stop() {
  pause()
  barOpen.value = false
  curVerse.value = 0
  const s = ms()
  if (s) s.playbackState = 'none'
}

/** Duraklatılmış yerden devam. */
export const resume = () => start()

export const toggle = () => (playing.value ? pause() : start())

/** Belirli bir ayetten başlat. */
export async function playVerse(surah, verse) {
  barOpen.value = true
  const a = ensureEl()
  await ensureTimings()
  const at = startOf(timings.value, surah, verse)
  if (at == null) { error.value = 'Bu kârîde ayet takibi yok'; return }
  if (surah !== curSurah.value || !srcList.length) {
    curSurah.value = surah
    setSource(surah)
    await waitMeta()
  }
  seek(at)
  curVerse.value = verse
  if (verse === 1 && hasBasmala(surah)) await playBasmala()
  await start()
}

/**
 * Ayete dokunma isteği: çalıyorsa ve ZATEN o ayetteysek durur, değilse
 * oraya atlayıp çalar. Karar burada, çünkü hangi ayetin çaldığını
 * yalnızca oynatıcı biliyor.
 */
export async function requestVerse(surah, verse) {
  barOpen.value = true
  if (playing.value && curSurah.value === surah && curVerse.value === verse) { pause(); return }
  await playVerse(surah, verse)
}

/** Komşu ayete atla: yön +1 / -1. */
export async function step(dir) {
  const target = (curVerse.value || 1) + dir
  if (target < 1 || !curSurah.value) return
  const at = startOf(timings.value, curSurah.value, target)
  if (at == null) return
  seek(at)
  curVerse.value = target
  if (!playing.value) await start()
  else syncState()
}

function onMeta() {
  if (pendingSeek != null) {
    el.currentTime = pendingSeek
    pendingSeek = null
  }
  syncState()
}

function onTime() {
  // Duraklattıktan SONRA bir `timeupdate` daha gelebiliyor; korumasız
  // bırakılınca "bırak" dedikten sonra ayet yeniden yazılıyor ve
  // mushaftaki vurgu ile adresteki ayet asılı kalıyordu (ölçüldü).
  if (!playing.value || !el || !timings.value || !curSurah.value) return
  const v = verseAt(timings.value, curSurah.value, el.currentTime * 1000)
  if (!v || v === curVerse.value) return
  curVerse.value = v
}

function onEnded() {
  playing.value = false
  curVerse.value = 0
  syncState()
}

/**
 * Kaynak düşerse sıradakini dene.
 *
 * `<source>` çocukları yerine `src` elle kuruluyor (eleman artık bir
 * şablonda değil), yani yedeğe geçişi de kendimiz yapıyoruz: yayıncı
 * düşerse aynamız, o da düşerse hata. Konum korunur.
 */
function onError() {
  if (srcIdx + 1 < srcList.length) {
    const was = playing.value
    pendingSeek = el?.currentTime ?? pendingSeek
    srcIdx += 1
    el.src = srcList[srcIdx]
    el.load()
    if (was) start()
    return
  }
  error.value = 'Kayıt alınamadı'
  playing.value = false
}

/**
 * Sistem oynatıcısı (Media Session).
 *
 * Bildirim alanında ve kilit ekranında künye: başlıkta sure numarası,
 * adı ve okunan ayet; sanatçı alanında kârî. Yazılmazsa orada sayfanın
 * başlığı ve dosya adı (`001.mp3`) görünüyor.
 */
const ms = () => (typeof navigator !== 'undefined' && 'mediaSession' in navigator
  ? navigator.mediaSession
  : null)

const ART = [
  { src: '/logo192.png', sizes: '192x192', type: 'image/png' },
  { src: '/logo512.png', sizes: '512x512', type: 'image/png' },
]

export const mediaTitle = computed(() => {
  if (!curSurah.value) return 'Kur’an-ı Kerim'
  const head = `${curSurah.value}. ${surahName.value} sûresi`
  return curVerse.value ? `${head} · ${curVerse.value}. ayet` : head
})

export const mediaArtist = computed(() => {
  const r = reciter.value
  if (!r) return 'Kur’an-ı Kerim'
  return r.style ? `${r.name} · ${r.style}` : r.name
})

function syncMeta() {
  const s = ms()
  if (!s || typeof MediaMetadata === 'undefined') return
  s.metadata = new MediaMetadata({
    title: mediaTitle.value,
    artist: mediaArtist.value,
    album: 'Kur’an-ı Kerim · Alaturka Vakitler',
    artwork: ART,
  })
}

function syncState() {
  const s = ms()
  if (!s) return
  s.playbackState = playing.value ? 'playing' : 'paused'
  // Konum bilgisi kaydırma çubuğunu doldurur; süre bilinmeden
  // verilirse tarayıcı hata atıyor.
  if (!el || !Number.isFinite(el.duration) || el.duration <= 0) return
  try {
    s.setPositionState({
      duration: el.duration,
      playbackRate: el.playbackRate || 1,
      position: Math.min(el.currentTime, el.duration),
    })
  } catch { /* konum verilemezse oynatıcı yine çalışır */ }
}

function bindMedia() {
  const s = ms()
  if (!s) return
  const on = (name, fn) => { try { s.setActionHandler(name, fn) } catch { /* desteklenmiyor */ } }
  on('play', () => start())
  on('pause', () => pause())
  on('stop', () => stop())
  on('nexttrack', () => step(1))
  on('previoustrack', () => step(-1))
  on('seekto', (d) => {
    if (!el || d.seekTime == null) return
    el.currentTime = d.seekTime
    syncState()
  })
}

watch([mediaTitle, mediaArtist], syncMeta)

/** Çalan ayetin sayfası — mushafa dönerken oraya gidilir. */
export const curPage = computed(() =>
  (curSurah.value ? pageOfVerse(curSurah.value, curVerse.value || 1) : null))
