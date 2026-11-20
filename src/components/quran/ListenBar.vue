<script setup>
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import { reciterById, audioSources } from '@/data/reciters'
import { loadTimings, verseAt, startOf, hasTimings } from '@/utils/recitation'
import { surahOfPage, versesOfPage, rangesOfPage, pageOfVerse } from '@/utils/mushaf'
import { surahById } from '@/data/kuranMeta'
import { infoOf } from '@/data/surahInfo'

/**
 * Dinleme şeridi — mukabele.
 *
 * Ayrı bir "Dinle" sayfası DEĞİL, okuduğun sayfanın altına oturan bir
 * şerit: ses çalarken okunan ayet mushafta vurgulanıyor ve kıraat
 * sayfanın sonuna gelince sayfa kendiliğinden çevriliyor. Dinlemek ve
 * okumak aynı anda olan bir iş; ikisini iki ekrana bölmek, gözün
 * mushafta kalmasını engelliyor.
 *
 * Ses SURE başına tek dosyadır. Sayfadan başlamak için o sayfanın ilk
 * ayetinin damgasına atlanır — dosyayı baştan dinletip beklemek yerine.
 */
const props = defineProps({
  page: { type: Number, required: true },
  reciter: { type: String, required: true },
  /**
   * Ayete çift dokunuş isteği: `{ surah, verse, n }`.
   * `n` her dokunuşta artar — aynı ayete ikinci kez dokunmak da
   * yeni bir istek sayılsın diye (yoksa durdurma çalışmazdı).
   */
  request: { type: Object, default: null },
})
const emit = defineEmits(['verse', 'update:page', 'pick-reciter', 'close'])

const audio = ref(null)
/** Besmele ayrı bir elemandan çalar: ana dosyayı yeniden yüklemesin. */
const bism = ref(null)
const playing = ref(false)
const loading = ref(false)
const error = ref('')
const table = ref(null)

/**
 * Çalınan sure.
 *
 * Varsayılan sayfanın ilk suresidir, ama bir sayfada birden çok sure
 * olabiliyor (son cüzde üç tane) ve kullanıcı öbürünün ayetine çift
 * dokunabiliyor. O yüzden istekle GEÇERSİZ KILINABİLİR — önce
 * kılınamıyordu ve sayfanın ikinci suresine dokunmak sessizce hiçbir
 * şey yapmıyordu.
 */
const override = ref(null)
const surah = computed(() => override.value ?? surahOfPage(props.page)?.id ?? 1)

/** Sayfada hangi sureler var. */
const surahsOn = (page) => rangesOfPage(page).map((g) => g.surah)

// Kullanıcı başka bir yere giderse geçersiz kılma düşer; kıraat sayfayı
// kendi çevirdiğinde (aynı sure sürüyor) düşmez.
watch(() => props.page, (p) => {
  if (override.value && !surahsOn(p).includes(override.value)) override.value = null
})
const surahName = computed(() => surahById(surah.value)?.name ?? '')
const reciterObj = computed(() => reciterById(props.reciter))
const follows = computed(() => hasTimings(props.reciter))

/** Kaynak listesi: önce yayıncı, sonra aynamız. */
const sources = computed(() => audioSources(props.reciter, surah.value))

watch(() => props.reciter, async (id) => {
  table.value = await loadTimings(id)
}, { immediate: true })

/**
 * Besmele.
 *
 * Sure dosyalarında besmele YOK: damgalar 1. ayeti 0. milisaniyeden
 * başlatıyor ve dosya süresi son damgayla örtüşüyor (ölçüldü —
 * Benna 22,2/22,5 sn, Alakmî 19,7/20,2, mücevved 29,4/29,2).
 *
 * Ama Fâtiha'nın BİRİNCİ AYETİ zaten besmeledir ve aynı kârînin aynı
 * kaydında duruyor. Dolayısıyla ayrı bir kayıt aramaya gerek yok:
 * 1. surenin dosyası baştan, 1. ayetin bitişine kadar çalınıyor.
 * Başka bir kayıttan parça eklemek ses rengini değiştirirdi.
 *
 * Tevbe'de besmele yoktur, Fâtiha'da zaten metnin içindedir; ikisi de
 * `surahInfo`daki `bismillah` ile eleniyor.
 */
const hasBasmala = (n) => Boolean(infoOf(n)?.bismillah)

async function playBasmala() {
  const end = table.value?.['1']?.[0]?.[1]
  const el = bism.value
  const src = audioSources(props.reciter, 1)[0]
  if (!end || !el || !src) return
  try {
    if (el.src !== src) el.src = src
    el.currentTime = 0
    await el.play()
    await new Promise((done) => {
      const stop = () => {
        el.removeEventListener('timeupdate', watchEnd)
        el.pause()
        done()
      }
      const watchEnd = () => { if (el.currentTime * 1000 >= end) stop() }
      el.addEventListener('timeupdate', watchEnd)
      el.addEventListener('ended', stop, { once: true })
      el.addEventListener('error', stop, { once: true })
    })
  } catch { /* besmele çalmazsa okuma yine başlasın */ }
}

/** Sayfanın ilk ayeti — oradan başlanır. */
function firstVerseOfPage() {
  const list = versesOfPage(props.page).filter((v) => v.surah === surah.value)
  return list[0]?.verse ?? 1
}

async function play() {
  const el = audio.value
  if (!el) return
  error.value = ''
  loading.value = true
  try {
    // Sayfanın başına atla: damga yoksa baştan çalar.
    const from = firstVerseOfPage()
    const at = startOf(table.value, surah.value, from)
    if (at != null && Math.abs(el.currentTime - at) > 1) el.currentTime = at
    // Sure başından başlıyorsak önce besmele.
    if (from === 1 && el.currentTime < 1 && hasBasmala(surah.value)) await playBasmala()
    await el.play()
    playing.value = true
  } catch (e) {
    error.value = 'Ses başlatılamadı'
  } finally {
    loading.value = false
  }
}

function pause() {
  audio.value?.pause()
  playing.value = false
}

const toggle = () => (playing.value ? pause() : play())

/**
 * Çalarken okunan ayeti bildir ve gerekirse sayfayı çevir.
 *
 * Sayfa çevirme yalnızca İLERİ yönde ve yalnızca okunan ayet başka bir
 * sayfaya geçtiğinde yapılır. Kullanıcı elle başka bir sayfaya giderse
 * ses onu geri sürüklemesin diye: hedef sayfa, o anki sayfadan tam bir
 * fazlaysa çevrilir, uzaktaysa dokunulmaz.
 */
let lastVerse = 0

function onTime() {
  const el = audio.value
  if (!el || !table.value) return
  const v = verseAt(table.value, surah.value, el.currentTime * 1000)
  if (!v || v === lastVerse) return
  lastVerse = v
  emit('verse', { surah: surah.value, verse: v })
  const want = pageOfVerse(surah.value, v)
  if (want === props.page + 1) emit('update:page', want)
}

function onEnded() {
  playing.value = false
  lastVerse = 0
  emit('verse', null)
}

function onError() {
  // Tarayıcı kaynakları sırayla dener; son kaynak da düşerse buraya gelir.
  error.value = 'Kayıt alınamadı'
  playing.value = false
}

// Sure değişince (sayfa başka bir sureye geçti) yeni dosya yüklenir.
/** İstek yüzünden sure değiştiğinde yeniden yükleme orada yapılıyor. */
let applying = false

watch(surah, () => {
  lastVerse = 0
  if (applying) return
  if (playing.value) {
    // `load()` kaynakları baştan okur; çalmaya devam edilecekse
    // yeni dosyanın sayfa başına atlaması gerekir.
    audio.value?.load()
    play()
  }
})

/**
 * Çift dokunulan ayet: çalıyorsa ve ZATEN o ayetteysek durur, değilse
 * oraya atlayıp çalar. "Dur" kararının burada olması gerekiyor —
 * hangi ayetin çaldığını yalnızca şerit biliyor.
 */
watch(() => props.request, async (req) => {
  if (!req) return
  const sameSurah = req.surah === surah.value
  if (sameSurah && playing.value && lastVerse === req.verse) { pause(); return }

  // Damga tablosu istekten SONRA gelmiş olabilir: ilk çift dokunuş
  // şeridi aynı anda açıyor ve tablo o sırada daha yükleniyor.
  const t = table.value ?? await loadTimings(props.reciter)
  if (t && !table.value) table.value = t
  const at = startOf(t, req.surah, req.verse)
  if (at == null) { error.value = 'Bu kârîde ayet takibi yok'; return }

  const el = audio.value
  if (!el) return
  try {
    if (!sameSurah) {
      // Başka surenin dosyası: kaynaklar değişiyor, `load()` olmadan
      // eleman eskisini çalmaya devam eder. Konumlandırma da ancak
      // süre bilindikten sonra tutuyor.
      applying = true
      override.value = req.surah
      await nextTick()
      el.load()
      if (el.readyState < 1) {
        await new Promise((done) => {
          el.addEventListener('loadedmetadata', done, { once: true })
          el.addEventListener('error', done, { once: true })
        })
      }
      applying = false
    }
    el.currentTime = at
    lastVerse = req.verse
    emit('verse', { surah: req.surah, verse: req.verse })
    if (req.verse === 1 && hasBasmala(req.surah)) await playBasmala()
    await el.play()
    playing.value = true
    error.value = ''
  } catch {
    applying = false
    error.value = 'Ses başlatılamadı'
  }
// `immediate`: şerit çift dokunuşla AÇILIYOR, yani ilk istek bileşen
// kurulmadan önce verilmiş oluyor; izleyici sonradan başlarsa o
// dokunuş sessizce düşerdi.
}, { immediate: true })

onBeforeUnmount(() => { pause(); emit('verse', null) })
</script>

<template>
  <div class="listen">
    <audio
      ref="audio"
      preload="none"
      @timeupdate="onTime"
      @ended="onEnded"
      @error="onError"
    >
      <source v-for="s in sources" :key="s" :src="s" type="audio/mpeg" />
    </audio>

    <!-- Besmele: 1. surenin dosyasından, 1. ayetin bitişine kadar. -->
    <audio ref="bism" preload="none" />

    <button class="play" :disabled="loading" :aria-label="playing ? 'Duraklat' : 'Dinle'" @click="toggle">
      {{ playing ? '❙❙' : '▶' }}
    </button>

    <div class="info">
      <button class="who" @click="emit('pick-reciter')">
        {{ reciterObj?.name ?? 'Kârî seç' }}
        <span class="caret">▾</span>
      </button>
      <span class="what">
        {{ surahName }}
        <span v-if="!follows" class="warn">· ayet takibi yok</span>
        <span v-else-if="error" class="warn">· {{ error }}</span>
      </span>
    </div>

    <button class="x" aria-label="Dinlemeyi kapat" @click="emit('close')">×</button>
  </div>
</template>

<style scoped>
/* Şerit sayfanın DİBİNDE ve akışta: üstüne binen bir çubuk olsaydı
   mushafın son satırını örterdi. */
.listen {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: 0.75rem;
  padding: 0.5rem 0.6rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background-color: var(--bg);
  background-image: linear-gradient(var(--surface), var(--surface));
}

.play {
  flex: 0 0 auto;
  width: 2.3rem;
  height: 2.3rem;
  font: inherit;
  font-size: 0.8rem;
  border: 1px solid var(--accent-ui);
  border-radius: 999px;
  background: transparent;
  color: var(--text);
  cursor: pointer;
}

.play:disabled { opacity: 0.4; cursor: default; }

.info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.1rem; }

.who {
  font: inherit;
  font-size: 0.8rem;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--text);
  text-align: start;
  cursor: pointer;
}

.caret { font-size: 0.6rem; color: var(--text-muted); }

.what {
  font-size: 0.6rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.warn { color: var(--primary); }

.x {
  flex: 0 0 auto;
  width: 1.8rem;
  height: 1.8rem;
  font: inherit;
  font-size: 1.1rem;
  line-height: 1;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}
</style>
