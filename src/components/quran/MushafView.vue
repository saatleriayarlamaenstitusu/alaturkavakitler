<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { rangesOfPage, versesOfPage, juzOfPage, surahOfPage, clampPage, diyanetPage, PAGE_COUNT } from '@/utils/mushaf'
import { fetchRange, eastern } from '@/utils/kuran'
import { authorById } from '@/data/kuranMeta'
import { mealFontById } from '@/data/mealFonts'
import { MUSHAF_SCRIPTS, scriptById, pageTajweed } from '@/utils/qpc'
import { quranFontById } from '@/data/quranFonts'
import MushafSheet from '@/components/quran/MushafSheet.vue'
import { createDoubleTap } from '@/utils/doubleTap'
import { centerInScroller } from '@/utils/scrollCenter'
import { playing as reciting } from '@/stores/recitation'
import SurahHeader from '@/components/quran/SurahHeader.vue'

/**
 * Mushaf sayfası — okuma görünümü.
 *
 * Sayfa BASILI numarasıyla gezilir (1–604). İki görünüm var ve ikisi de
 * aynı sayfa biriminde çalışır, tepedeki tek dokunuşla değişir:
 *
 *  - **Mushaf**: basılı sayfanın satır satır kendisi (15 satır, sayfaya
 *    ait font). Hat seçilebilir; tecvitli hat da burada.
 *  - **Esnek**: ayetler akar, yazı boyu ayarlanır. Küçük ekranda ve
 *    meal eşliğinde okumak için.
 *
 * Hatim işaretlemesi, gezinme ve adres çubuğu iki görünümde de aynıdır:
 * değişen şey yalnızca sayfanın nasıl dizildiği.
 */
const props = defineProps({
  page: { type: Number, required: true },
  /** Hatim okuyucusundayken o hatmin adı; serbest okumada null. */
  hatimName: { type: String, default: '' },
  /** Hatim okuyucusunda bu sayfa okundu mu. */
  read: { type: Boolean, default: false },
  /** Gitme kutusundan gelen ayet: `{ surah, verse }` — vurgulanır. */
  focusVerse: { type: Object, default: null },
  /** Tam ekran okuma açık mı. */
  immersive: { type: Boolean, default: false },
  /** Dinleme şeridi açık mı — düğme basılı görünsün. */
  listening: { type: Boolean, default: false },
  /**
   * Açık bir "şuraya git" isteği sayacı.
   *
   * Oto kaydırma yalnızca ses ÇALARKEN çalışıyor (elle okurken sayfanın
   * kendiliğinden kayması okuyanı yerinden eder). Ama üstten bir sure
   * seçmek açık bir istektir: sayfa değişiyordu ve sure sayfanın
   * ortasında başlıyorsa ekran onun başında değil sayfanın başında
   * kalıyordu. Çağıran her hedefte bu sayıyı artırır, burada bir kerelik
   * kaydırma yapılır.
   */
  jump: { type: Number, default: 0 },
})
const emit = defineEmits(['update:page', 'toggle-read', 'info', 'font', 'listen', 'ayah', 'update:immersive', 'pick'])

const settings = useSettingsStore()

const state = ref({ loading: false, error: '', groups: [] })
/** Ayet anahtarına göre tecvitli metin; boşsa düz metin basılır. */
const tajweed = ref({})

async function loadTajweed(page) {
  if (mushaf.value || !settings.quranTajweed) { tajweed.value = {}; return }
  try {
    const map = await pageTajweed(page)
    if (page === props.page) tajweed.value = map
  } catch {
    // Tecvit gelmezse metin düz basılır; okumayı engellemeye değmez.
    if (page === props.page) tajweed.value = {}
  }
}

const juz = computed(() => juzOfPage(props.page))
const surah = computed(() => surahOfPage(props.page))
// Türk mushafında numara bir eksiktir (tezhipli açılış sayfası
// numarasızdır); elindeki nüshayla karşılaştırabilmek için yan yana
// yazılıyor. Son sayfalarda eşleme ölçülmediği için boş geçiliyor.
const diyanet = computed(() => diyanetPage(props.page))
/**
 * Seçili mealler — ÇOKLU.
 *
 * Birincisi (listedeki ilk) dizimi belirler: satırların nerede
 * başlayıp bittiği onun gruplamasından çıkar (bkz. `rowsOf`). Boş
 * liste "meal kapalı" demektir.
 */
const meals = computed(() =>
  settings.quranMeals.map((id) => authorById(id)).filter(Boolean))
const hasMeal = computed(() => meals.value.length > 0)
const mealFamily = computed(() => mealFontById(settings.quranMealFont).family)

/**
 * Oto kaydırma: okunan ayeti ekranın ortasında tut.
 *
 * YALNIZCA ses çalarken: elle okurken sayfanın kendiliğinden kayması
 * okuyanı yerinden ediyor. Ayet ayet görünümünde grup bloğu, esnekte
 * ayetin kendisi, mushafta o ayetin ilk kelimesi hedeftir — üçü de
 * `data-v` taşıyor, bu yüzden tek arama yetiyor.
 *
 * Bekleme (`nextTick`) gerekiyor: sayfa kıraatle birlikte çevrildiğinde
 * vurgu yeni sayfa çizilmeden önce yazılıyor ve eleman henüz yok.
 */
const root = ref(null)

/**
 * Hedefi ekranın ortasına getir.
 *
 * Eleman hemen var olmayabiliyor: sayfa kıraatle çevrildiğinde vurgu
 * yeni sayfa çizilmeden yazılıyor, mushaf görünümünde ayrıca dizim ve
 * font bekleniyor. Bu yüzden bir kaç tur denenir ve hedef değişirse
 * bırakılır (iki kaydırma birbiriyle yarışmasın).
 *
 * Surenin BAŞI hedefse önce künye bloğu aranır (`data-sh`): ayetin ilk
 * kelimesi ortalandığında başlık ekranın üstünde kalıyor ve "sureye
 * gittim" hissi vermiyordu.
 */
async function centerFocus(tries = 16) {
  const f = props.focusVerse
  if (!f) return
  const key = `${f.surah}:${f.verse}`
  for (let i = 0; i < tries; i++) {
    await nextTick()
    if (props.focusVerse && `${props.focusVerse.surah}:${props.focusVerse.verse}` !== key) return
    const el = (f.verse === 1 && root.value?.querySelector(`[data-sh="${f.surah}"]`))
      || root.value?.querySelector(`[data-v="${key}"]`)
    if (el) { centerInScroller(el); return }
    await new Promise((r) => setTimeout(r, 120))
  }
}

watch(() => props.focusVerse, (f) => {
  if (!f || !settings.quranAutoScroll || !reciting.value) return
  centerFocus(3)
})

// Açık istek (sure/ayet seçimi): çalma şartı yok, bekleme payı uzun —
// mushafta dizim ve font gelene kadar hedef DOM'da olmuyor.
watch(() => props.jump, () => centerFocus())

// Sayfa dışarıdan bir ayetle açıldıysa (adres çubuğu ya da mini
// oynatıcıdan "okunan yere dön") oraya kaydırılır.
onMounted(() => { if (props.focusVerse) centerFocus() })

const tap = createDoubleTap()
const onVerseTap = (surah, verse) =>
  tap(`${surah}:${verse}`, () => emit('ayah', { surah, verse }))

/**
 * Üç görünüm var ve üçü de aynı sayfa biriminde çalışır:
 *
 *  - `mushaf` — basılı sayfanın satır satır kendisi
 *  - `esnek`  — ayetler akar, meal altta ayrı bir liste
 *  - `ayet`   — ayet, hemen altında meali; sonra sonraki ayet
 *
 * Üçüncüsü akan metinde "bu cümlenin karşılığı hangisiydi" sorusunu
 * ortadan kaldırıyor: karşılaştırarak okuyan için ayrı listeye bakmak
 * sürekli göz kaydırmak demekti.
 *
 * Bilinmeyen bir değer mushafa düşer (kayıtta eski bir ad durabilir).
 */
const VIEWS = ['mushaf', 'esnek', 'ayet']
const view = computed(() =>
  (VIEWS.includes(settings.quranView) ? settings.quranView : 'mushaf'))
const mushaf = computed(() => view.value === 'mushaf')
const flowing = computed(() => view.value === 'esnek')
const byVerse = computed(() => view.value === 'ayet')
// Kayıtta artık sunulmayan bir hat durabilir (V4 kaldırıldı):
// listeyi değil, listenin çözdüğü kimliği ölçüt al.
const scriptId = computed(() => scriptById(settings.quranScript).id)
const fontLabel = computed(() => quranFontById(settings.quranFont).label)
const setView = (id) => { settings.quranView = id }

/**
 * Satır dizimi — hem "ayet ayet" görünümünün blokları hem meal listesi.
 *
 * Satırlar BİRİNCİ mealin gruplamasından çıkıyor: bazı mealler ayetleri
 * gruplayarak çeviriyor (Diyanet'te Fâtiha 2-4) ve API grubun metnini o
 * gruptaki HER ayet için döndürüyor — ayrı ayrı basılsa aynı cümle art
 * arda üç kez çıkardı. Meal kapalıyken her ayet kendi satırıdır.
 *
 * Çoklu mealde dizimi tek bir mealin belirlemesi bilinçli: her mütercim
 * başka yerde gruplarsa satırlar hiç hizalanmaz ve karşılaştırma
 * imkânsızlaşır. Öbür mealler o aralığa düşen metinlerini verir;
 * aralıkta farklı metinler varsa birleştirilir.
 */
const STRIP_NO = /^\(\s*\d+(?:\s*[-–]\s*\d+)*\s*\)\s*/

function joinText(verses, id, grouped) {
  const out = []
  for (const v of verses) {
    const t = (v.trs?.[id] ?? '').trim()
    if (!t) continue
    // Baştaki numara işareti atılır: satırın kendisi zaten "2–4" diyor.
    // Kalıp meale göre değişiyor — kimi "(2-4)" yazıyor, kimi
    // "(1-2-3-4)" diye tek tek sayıyor; ikisi de yalnızca rakam, tire
    // ve boşluktan oluştuğu için tek desenle yakalanıyor.
    const clean = grouped ? t.replace(STRIP_NO, '') : t
    if (out[out.length - 1] !== clean) out.push(clean)
  }
  return out.join(' ')
}

function rowsOf(verses) {
  const primary = meals.value[0]?.id
  const raw = []
  for (const v of verses) {
    const key = primary ? (v.trs?.[primary] ?? '') : ''
    const last = raw[raw.length - 1]
    if (primary && key && last && last.key === key && v.no === last.to + 1) {
      last.to = v.no
      last.verses.push(v)
    } else {
      raw.push({ key, from: v.no, to: v.no, verses: [v] })
    }
  }
  return raw.map((r) => {
    const grouped = r.from !== r.to
    return {
      from: r.from,
      to: r.to,
      label: grouped ? `${r.from}–${r.to}` : String(r.from),
      verses: r.verses,
      texts: meals.value
        .map((a) => ({ id: a.id, name: a.name, lang: a.lang, text: joinText(r.verses, a.id, grouped) }))
        .filter((t) => t.text),
    }
  })
}

/**
 * Esnek görünümde yazı boyu. Adım yüzde, sınır dar tutuldu: 70'in
 * altında hareke okunmuyor, 180'in üstünde satıra üç kelime sığıyor.
 */
const SIZE_MIN = 70
const SIZE_MAX = 180
const SIZE_STEP = 10
const sizeable = (d) => {
  const next = settings.quranFontSize + d * SIZE_STEP
  return next >= SIZE_MIN && next <= SIZE_MAX
}
const resize = (d) => { if (sizeable(d)) settings.quranFontSize += d * SIZE_STEP }

async function load(page) {
  const want = rangesOfPage(page)
  if (!want.length) return
  // Mushaf görünümünde metin sayfanın kendi fontundan gelir; meal de
  // kapalıysa bu isteğin getireceği bir şey yok.
  if (mushaf.value && !hasMeal.value) {
    state.value = { loading: false, error: '', groups: [] }
    return
  }
  // Eski meal de yerinde kalır: aynı sebeple (kutu çöküp kaydırma
  // sıfırlanıyordu).
  state.value = { ...state.value, loading: true, error: '' }
  try {
    const ids = meals.value.map((a) => a.id)
    const parts = await Promise.all(
      want.map((g) => fetchRange(g.surah, g.from, g.to, ids)))
    const groups = parts.map((res, i) => {
      const g = want[i]
      const verses = res.ar.map((ar, n) => ({
        no: g.from + n,
        ar,
        tx: res.tx?.[n] ?? '',
        // Mealler kimliğe göre: tek bir `tr` alanı çoklu seçimi
        // taşıyamıyor ve satır dizimi hangi mealin ne dediğini
        // ayrı ayrı bilmek zorunda.
        trs: Object.fromEntries(ids.map((id) => [id, res.trs?.[id]?.[n] ?? ''])),
      }))
      return { surah: g.surah, name: g.surahName, from: g.from, verses, rows: rowsOf(verses) }
    })
    // Sayfa değişmiş olabilir; geç gelen yanıt ekrandakini bozmasın.
    if (page === props.page) state.value = { loading: false, error: '', groups }
  } catch (e) {
    if (page === props.page)
      state.value = { loading: false, error: e.message ?? 'Ayetler alınamadı', groups: [] }
  }
}

watch(() => props.page, (p) => { load(p); loadTajweed(p) }, { immediate: true })
watch(() => [settings.quranMeals, settings.quranView], () => load(props.page), { deep: true })
watch(() => [settings.quranTajweed, settings.quranView, props.page],
  () => loadTajweed(props.page))

const go = (delta) => emit('update:page', clampPage(props.page + delta))

/**
 * Görünüm ayarları katlanır.
 *
 * Üst taraf altı satır ediyordu (başlık, gitme kutusu, kısayollar,
 * sayfa gezinmesi, görünüm şeridi, dinleme şeridi) ve mushaf ekranın
 * yarısından sonra başlıyordu. Her gün değişen tek şey sayfa; hat,
 * yazı boyu, tecvit ve kısayollar bir kez kurulup bırakılıyor —
 * onlar ⋯ düğmesinin arkasında. Görünüm seçimi (mushaf/esnek/ayet)
 * dışarıda kaldı: en sık dokunulan o.
 */
const tools = ref(false)

/**
 * Parmakla sayfa çevirme.
 *
 * Yön mushafın yönüdür: sonraki sayfa SOLDADIR, yani parmağı sola doğru
 * değil SAĞA doğru kaydırmak ileri götürür (soldaki sayfa sağa doğru
 * çekilerek açılır). Latin kitaplardaki kaydırmanın aynadaki hâli.
 *
 * Dikey kaydırma kaçırılmasın diye üç şart aranıyor: yeterli yatay yol,
 * yatayın dikeyden baskın olması ve hareketin kısa sürmesi. Uzun basıp
 * metin seçen biri sayfayı çevirmiş olmaz.
 */
const SWIPE_PX = 60
const SWIPE_MS = 800
let start = null

function onDown(e) {
  if (e.pointerType === 'mouse') return   // farede sürükleme metin seçmektir
  start = { x: e.clientX, y: e.clientY, t: Date.now() }
}

function onUp(e) {
  if (!start) return
  const dx = e.clientX - start.x
  const dy = e.clientY - start.y
  const dt = Date.now() - start.t
  start = null
  if (dt > SWIPE_MS) return
  if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) < Math.abs(dy) * 1.5) return
  go(dx > 0 ? 1 : -1)
}
</script>

<template>
  <div
    ref="root"
    class="mushaf"
    :style="{ '--quran-scale': settings.quranFontSize / 100, '--meal-font': mealFamily }"
  >
    <!-- Hatim okuyucusunda hangi hatimde olduğun her an yazılı durur:
         işaretleme ona yazıyor, belirsiz kalmamalı. -->
    <p v-if="hatimName" class="in-hatim">
      <span class="in-hatim-label">Hatim</span>
      <span class="in-hatim-name">{{ hatimName }}</span>
      <button class="in-hatim-state" :class="{ on: read }" @click="emit('toggle-read')">
        {{ read ? '✓ okundu' : 'okunmadı' }}
      </button>
    </p>

    <!-- Gezinme ÜSTTE ve başlıkla aynı satırda: altta olduğunda sayfanın
         uzunluğuna göre yer değiştiriyordu ve her sayfada başka bir yere
         basmak gerekiyordu. Burada sabit. -->
    <header class="sheet-head">
      <button class="page-btn" :disabled="page >= PAGE_COUNT" @click="go(1)" aria-label="Sonraki sayfa">‹</button>
      <!-- Başlık SEÇİCİNİN KENDİSİ.
           Önce ayrı bir "Seç ▾" düğmesi vardı: neyi seçtiği de nerede
           olduğun da yazmıyordu, üstelik sure adı bir satır yukarıda
           zaten duruyordu — aynı bilgi iki yerde, biri tıklanabilir
           biri değil. Şimdi bulunduğun yer hem başlık hem düğme.
           Sure adı da büyüdü: 0.78rem'de sayfa numarasıyla aynı
           ağırlıktaydı ve "hangi suredeyim" okunmuyordu. -->
      <button class="meta" aria-label="Sure, sayfa veya cüz seç" @click="emit('pick')">
        <span class="meta-main">{{ surah?.name }}<span class="caret" aria-hidden="true">▾</span></span>
        <span class="meta-sub">
          {{ juz }}. cüz · sayfa {{ page }}/{{ PAGE_COUNT }}
          <span
            v-if="diyanet && diyanet !== page"
            class="meta-alt"
            title="Türkiye'de basılan mushaflarda bu sayfanın numarası"
          >· Diyanet {{ diyanet }}</span>
        </span>
      </button>
      <button class="page-btn" :disabled="page <= 1" @click="go(-1)" aria-label="Önceki sayfa">›</button>
    </header>

    <!-- Araç şeridi TEK satır: gitme kutusu (çağıranın yuvasından),
         görünüm seçimi ve üç düğme. Hat/yazı boyu/tecvit ve kısayollar
         ⋯ düğmesinin arkasında — bir kez kurulup bırakılan ayarlar her
         sayfada yer kaplamasın. -->
    <div class="toolbar">
      <slot name="jump" />

      <div class="view-toggle" role="group" aria-label="Görünüm">
        <button class="view-opt" :class="{ on: mushaf }" :aria-pressed="mushaf" @click="setView('mushaf')">Mushaf</button>
        <button class="view-opt" :class="{ on: flowing }" :aria-pressed="flowing" @click="setView('esnek')">Esnek</button>
        <button class="view-opt" :class="{ on: byVerse }" :aria-pressed="byVerse" @click="setView('ayet')">Ayet ayet</button>
      </div>

      <button
        class="full-btn"
        :class="{ on: tools }"
        :aria-pressed="tools"
        title="Hat, yazı boyu ve kısayollar"
        @click="tools = !tools"
      >⋯</button>

      <!-- Dinleme: okumayı bırakmadan açılıp kapanır, bu yüzden
           görünüm düğmeleriyle aynı şeritte. -->
      <button
        class="full-btn"
        :class="{ on: listening }"
        title="Dinle"
        @click="emit('listen')"
      >
        <!-- Nota DEĞİL kulaklık: nota müziği çağrıştırıyor, buradaki iş
             kıraat dinlemek. Satır içi SVG, rengini `currentColor`dan
             alıyor; dolgu tabanlı, gezinme ikonlarıyla aynı dilde. -->
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
          <path d="M12 2.5c-5 0-9 4-9 9v5.5A2.5 2.5 0 0 0 5.5 19H8a.5.5 0 0 0 .5-.5v-7A.5.5 0 0 0 8 11H5.2C5.9 7.4 8.6 5 12 5s6.1 2.4 6.8 6H16a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .5.5h2.5A2.5 2.5 0 0 0 21 17v-5.5c0-5-4-9-9-9z" />
        </svg>
      </button>

      <!-- Tam ekran: hatim okurken ekranda sayfadan başka bir şey
           kalmasın. Mushaf modunda sayfa ekrana SIĞDIRILIR, kaydırma
           olmaz — bir mushaf sayfası kaydırılarak okunmaz. -->
      <button
        class="full-btn"
        :aria-pressed="immersive"
        :title="immersive ? 'Tam ekrandan çık' : 'Tam ekran oku'"
        @click="emit('update:immersive', !immersive)"
      >{{ immersive ? '⤡' : '⤢' }}</button>
    </div>

    <div v-if="tools" class="toolbox">
      <nav v-if="mushaf" class="scripts" aria-label="Hat">
        <span class="bar-label">Hat</span>
        <button
          v-for="sc in MUSHAF_SCRIPTS"
          :key="sc.id"
          class="script"
          :class="{ on: scriptId === sc.id }"
          :title="sc.note"
          @click="settings.quranScript = sc.id"
        >{{ sc.label }}</button>
      </nav>

      <div v-else class="sizer" role="group" aria-label="Yazı boyu">
        <button class="script" @click="emit('font')">{{ fontLabel }}</button>
        <button
          class="script"
          :class="{ on: settings.quranTajweed }"
          :aria-pressed="settings.quranTajweed"
          title="Renkli tecvit"
          @click="settings.quranTajweed = !settings.quranTajweed"
        >Tecvit</button>
        <button class="size-btn" :disabled="!sizeable(-1)" aria-label="Küçült" @click="resize(-1)">A−</button>
        <span class="size-val">{{ settings.quranFontSize }}%</span>
        <button class="size-btn" :disabled="!sizeable(1)" aria-label="Büyüt" @click="resize(1)">A+</button>
      </div>

      <!-- Mushafta en çok dönülen yerler: aynı kutunun içinde, çünkü
           ikisi de "kurulup bırakılan" değil "ara sıra açılan" şeyler. -->
      <slot name="shortcuts" />
    </div>

    <!-- Dinleme şeridi: sayfanın ÜSTÜNDE, denetimlerin hemen altında.
         Altta denendi ve gezinme düğmelerinde olduğu gibi sayfanın
         uzunluğuna göre yer değiştiriyordu — her sayfada başka bir
         yere bakmak gerekiyordu. -->
    <slot name="bar" />

    <!-- Kaydırma iki görünümde de aynı: sayfa birimi değişmiyor. -->
    <div
      class="sheet"
      @pointerdown="onDown"
      @pointerup="onUp"
      @pointercancel="start = null"
    >
      <MushafSheet
        v-if="mushaf"
        :page="page"
        :script="scriptId"
        :focus-verse="focusVerse"
        :fit="immersive"
        @info="emit('info', $event)"
        @ayah="emit('ayah', $event)"
      />

      <div v-if="state.error" class="sheet-note sheet-note--error">{{ state.error }}</div>
      <div v-else-if="state.loading && !state.groups.length" class="sheet-note">Yükleniyor…</div>

      <article
        v-else
        class="flow"
        :class="{ busy: state.loading, 'flow--meal-only': mushaf }"
      >
      <section v-for="g in state.groups" :key="g.surah + '-' + g.from" class="surah-block">
        <SurahHeader
          v-if="g.from === 1 && !mushaf"
          :surah="g.surah"
          :name="g.name"
          :data-sh="g.surah"
          @info="emit('info', $event)"
          @play="emit('ayah', { surah: $event, verse: 1 })"
        />

        <p v-if="flowing" class="ar" dir="rtl" lang="ar">
          <template v-for="v in g.verses" :key="v.no">
            <span
              v-if="tajweed[`${g.surah}:${v.no}`]"
              class="ar-verse"
              :class="{ focus: focusVerse && focusVerse.surah === g.surah && focusVerse.verse === v.no }"
              :data-v="`${g.surah}:${v.no}`"
              v-html="tajweed[`${g.surah}:${v.no}`]"
              @pointerup="onVerseTap(g.surah, v.no)"
            />
            <span
              v-else
              class="ar-verse"
              :class="{ focus: focusVerse && focusVerse.surah === g.surah && focusVerse.verse === v.no }"
              :data-v="`${g.surah}:${v.no}`"
              @pointerup="onVerseTap(g.surah, v.no)"
            >{{ v.ar }}</span>
            <span class="ar-no">{{ eastern(v.no) }}</span>
          </template>
        </p>

        <!-- Ayet ayet: her satır ayetin kendisi ve hemen altında
             karşılığı. Gruplanmış mealde grubun ayetleri aynı satırda
             toplanır, karşılık bir kez yazılır. -->
        <div v-if="byVerse" class="vrs">
          <div
            v-for="r in g.rows"
            :key="r.from"
            class="vb"
            :class="{ focus: focusVerse && focusVerse.surah === g.surah
                      && focusVerse.verse >= r.from && focusVerse.verse <= r.to }"
            :data-v="`${g.surah}:${r.from}`"
          >
            <p class="ar vb-ar" dir="rtl" lang="ar">
              <template v-for="v in r.verses" :key="v.no">
                <span
                  v-if="tajweed[`${g.surah}:${v.no}`]"
                  class="ar-verse"
                  :data-v="`${g.surah}:${v.no}`"
                  v-html="tajweed[`${g.surah}:${v.no}`]"
                  @pointerup="onVerseTap(g.surah, v.no)"
                />
                <span
                  v-else
                  class="ar-verse"
                  :data-v="`${g.surah}:${v.no}`"
                  @pointerup="onVerseTap(g.surah, v.no)"
                >{{ v.ar }}</span>
                <span class="ar-no">{{ eastern(v.no) }}</span>
              </template>
            </p>
            <!-- Karşılıklar: tek meal seçiliyse mütercim adı yazmaz
                 (zaten tepedeki düğmede duruyor); birden fazlaysa
                 hangisinin kim olduğu satırın kendisinde olmalı. -->
            <div v-if="r.texts.length" class="vb-trs">
              <p v-for="t in r.texts" :key="t.id" class="vb-tr">
                <span class="vb-no">{{ r.label }}</span>
                <span class="vb-body">
                  <span v-if="r.texts.length > 1" class="tr-who">{{ t.name }}</span>
                  {{ t.text }}
                </span>
              </p>
            </div>
          </div>
        </div>

        <ul v-if="hasMeal && !byVerse" class="meal">
          <li
            v-for="r in g.rows"
            :key="r.from"
            class="meal-row"
            :class="{ focus: focusVerse && focusVerse.surah === g.surah
                      && focusVerse.verse >= r.from && focusVerse.verse <= r.to }"
          >
            <span class="meal-no">{{ r.label }}</span>
            <span class="meal-texts">
              <span v-for="t in r.texts" :key="t.id" class="meal-text">
                <span v-if="r.texts.length > 1" class="tr-who">{{ t.name }}</span>
                {{ t.text }}
              </span>
            </span>
          </li>
        </ul>
      </section>
      </article>
    </div>

    <!-- Sayfanın dibinde de bir "sonraki": uzun sayfada başa dönmemek
         için. Tek düğme, çünkü oraya gelmişsen yön bellidir. -->
    <footer v-if="!state.loading && !state.error" class="sheet-foot">
      <button class="next-wide" :disabled="page >= PAGE_COUNT" @click="go(1)">
        ‹ Sonraki sayfa
      </button>
    </footer>
  </div>
</template>

<style scoped>
.mushaf {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sheet-head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid var(--border);
}

.meta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  text-align: center;
  font: inherit;
  padding: 0.2rem 0.4rem;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--text);
  cursor: pointer;
}

.meta:hover { border-color: var(--border); }
.meta:focus-visible { outline: 2px solid var(--accent-ui); outline-offset: 1px; }

.caret { margin-left: 0.3rem; font-size: 0.6rem; color: var(--text-muted); vertical-align: 0.15em; }

.meta-main {
  font-size: 1.15rem;
  font-weight: 500;
  letter-spacing: -0.01em;
  line-height: 1.1;
  color: var(--text);
}

.meta-sub {
  font-size: 0.58rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.meta-alt { opacity: 0.75; }

.sheet-note {
  padding: 3rem 0;
  text-align: center;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.sheet-note--error { color: var(--primary); }

.surah-block + .surah-block {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border);
}

.surah-title {
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--text-muted);
  text-align: center;
  margin-bottom: 1rem;
}

/* Arapça metin: mushaf sayfası gibi iki yana yaslı tek blok.
   `--quran-ar` ayarlardan gelen yazı tipi. */
/* Dikey kaydırma serbest kalsın, yatay jest bize ait olsun. */
.sheet { touch-action: pan-y; }

/* Araç şeridi: gitme kutusu solda genişler, görünüm ve düğmeler sağda.
   Sarmalı — mobilde iki satır, masaüstünde tek satır. */
.toolbar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* Katlanan kutu: hat / yazı boyu / tecvit ve kısayollar. Kendi zemini
   var ki açıldığında nereye ait olduğu belli olsun — şeridin altında
   serbest duran düğmeler sayfaya mı başlığa mı ait belli olmuyordu.
   Zemin MAT: `--surface` bazı paletlerde saydam. */
.toolbox {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.5rem 0.6rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background-color: var(--bg);
  background-image: linear-gradient(var(--surface), var(--surface));
}

/* İki durumu BİR düğmede göstermek bilinçli: hangi moddasın ve bir
   dokunuşta nereye geçeceğin aynı yerde okunuyor. */
.view-toggle {
  display: inline-flex;
  padding: 2px;
  gap: 2px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: transparent;
  font: inherit;
  cursor: pointer;
}

/* Seçenekler artık AYRI düğme (üç tane oldu, biri "öbürü" değil):
   her biri doğrudan kendi görünümünü seçer. */
.view-opt {
  font: inherit;
  font-size: 0.68rem;
  letter-spacing: 0.06em;
  padding: 0.25rem 0.7rem;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  white-space: nowrap;
}

.view-opt.on {
  background: var(--text);
  color: var(--bg);
}

.scripts { display: inline-flex; align-items: center; gap: 0.3rem; }

/* Şeritteki küçük başlık: yanındaki iki düğmenin neyi seçtiğini
   söyler. Olmadığında "1421H" tek başına bilmece gibi duruyor. */
.bar-label {
  font-size: 0.55rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.script {
  font: inherit;
  font-size: 0.66rem;
  letter-spacing: 0.04em;
  padding: 0.25rem 0.6rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}

.script.on { border-color: var(--accent-ui); color: var(--text); }

.sizer {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.full-btn {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.9rem;
  height: 1.7rem;
  font: inherit;
  font-size: 0.8rem;
  line-height: 1;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}

.full-btn[aria-pressed="true"],
.full-btn.on { border-color: var(--accent-ui); color: var(--text); }

.size-btn {
  font: inherit;
  font-size: 0.72rem;
  width: 1.9rem;
  height: 1.7rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: transparent;
  color: var(--text);
  cursor: pointer;
}

.size-btn:disabled { opacity: 0.3; cursor: default; }

.size-val {
  min-width: 2.6rem;
  text-align: center;
  font-size: 0.6rem;
  letter-spacing: 0.08em;
  color: var(--text-muted);
}

/* Mushaf görünümünde akan metin yok, yalnızca meal: sayfanın altındaki
   blok kendi ayracını taşır. */
.flow.busy { opacity: 0.45; transition: opacity 0.12s; }

.flow--meal-only .surah-block + .surah-block {
  margin-top: 1rem;
  padding-top: 1rem;
}

.flow--meal-only .meal {
  margin-top: 1.5rem;
}

.ar {
  font-family: var(--quran-ar);
  font-size: calc(1.6rem * var(--quran-scale, 1));
  line-height: 2.5;
  text-align: justify;
  text-align-last: center;
  color: var(--text);
}

.ar-verse { padding-inline-end: 0.15em; }

/* Aranan ayet: renk değil ZEMİN. Metnin rengini değiştirmek hat
   okunurluğunu bozuyor, arkasına ince bir vurgu koymak bozmuyor. */
.ar-verse.focus,
.meal-row.focus {
  background: color-mix(in srgb, var(--accent-ui) 18%, transparent);
  border-radius: 4px;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-ui) 18%, transparent);
}

.meal-row.focus .meal-no { color: var(--text); }

/* Ayet numarası bir MADALYONDUR, metnin içinde kaybolan bir rakam
   değil: mushafta da ayet sonu süslemeli bir durak işaretidir.
   Önce düz rakamdı (aksan renginde, küçük) ve akan metinde seçilmiyordu
   — nerede bittiğini anlamak için gözle aramak gerekiyordu.

   Ölçü `em` cinsinden: yazı boyu %70–180 arasında değişiyor, madalyon
   onunla birlikte büyüyüp küçülmeli. */
.ar-no {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5em;
  height: 1.5em;
  margin: 0 0.25em;
  font-size: 0.5em;
  line-height: 1;
  vertical-align: 0.5em;
  color: var(--accent-ui);
  border: 1px solid color-mix(in srgb, var(--accent-ui) 45%, transparent);
  border-radius: 50%;
  /* İçteki ince halka basılı mushafın çift konturlu durağını andırır;
     ayrı bir eleman istemesin diye kutu gölgesiyle çizildi. */
  box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--accent-ui) 12%, transparent);
}

.meal {
  list-style: none;
  margin: 1.25rem 0 0;
  padding: 1.25rem 0 0;
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.meal-row {
  display: grid;
  grid-template-columns: 2.4rem 1fr;
  gap: 0.5rem;
  font-size: 0.88rem;
  line-height: 1.6;
}

/* Meal yazı tipi ayardan gelir (`--meal-font`): Arapça metnin hattı
   seçilebiliyordu ama uzun uzun okunan şey karşılığıdır. */
.meal-texts, .vb-trs { display: flex; flex-direction: column; gap: 0.6rem; }
.meal-text, .vb-body { font-family: var(--meal-font, var(--font1)); }

/* Mütercim adı yalnızca birden fazla meal seçiliyken yazar; metnin
   kendi yazısında değil arayüzün yazısında, çünkü bir etikettir. */
.tr-who {
  display: block;
  font-family: var(--font1);
  font-size: 0.55rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 0.1rem;
}

.meal-no {
  font-size: 0.66rem;
  color: var(--text-muted);
  padding-top: 0.35em;
}

/* Ayet ayet: her ayet kendi bloğu, aralarında ince bir çizgi. Kutu
   ya da zemin verilseydi sayfa kart listesine dönerdi; okunan şey
   hâlâ akan bir metin. */
.vrs { display: flex; flex-direction: column; }

.vb { padding: 0.9rem 0; border-top: 1px solid var(--border); }
.vb:first-child { border-top: none; padding-top: 0.2rem; }

/* Vurgu bloğun TAMAMINA: burada ayet ve meali bir birimdir. */
.vb.focus {
  background: color-mix(in srgb, var(--accent-ui) 12%, transparent);
  border-radius: 6px;
}

/* Blok içindeki Arapça ortalanmaz: tek ayet iki yana yaslanınca
   kelimeler arası uçuyor. */
.vb-ar {
  margin: 0;
  text-align: right;
  text-align-last: right;
}

.vb-trs { margin-top: 0.45rem; }

.vb-tr {
  display: grid;
  grid-template-columns: 2.4rem 1fr;
  gap: 0.5rem;
  margin: 0;
  font-size: 0.88rem;
  line-height: 1.6;
  color: var(--text-muted);
}

/* İkinci ve sonraki mealde numara tekrar yazılmaz: aynı sayı alt alta
   üç kez okunuyordu. Kolon yerinde kalır ki metinler hizalı dursun. */
.vb-trs .vb-tr + .vb-tr .vb-no { visibility: hidden; }

.vb.focus .vb-no { color: var(--text); }

.vb-no { font-size: 0.66rem; color: var(--text-muted); padding-top: 0.35em; }

.sheet-foot {
  padding-top: 1rem;
  border-top: 1px solid var(--border);
}

.next-wide {
  width: 100%;
  height: 2.5rem;
  font: inherit;
  font-size: 0.8rem;
  letter-spacing: 0.04em;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}

.next-wide:hover:not(:disabled) { color: var(--text); border-color: var(--text); }
.next-wide:disabled { opacity: 0.3; cursor: default; }

.in-hatim {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.7rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 0.78rem;
}

.in-hatim-label {
  font-size: 0.55rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.in-hatim-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.in-hatim-state {
  flex: 0 0 auto;
  font: inherit;
  font-size: 0.65rem;
  letter-spacing: 0.06em;
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}

.in-hatim-state.on {
  background: var(--accent-ui);
  border-color: var(--accent-ui);
  color: #fff;
}

.foot-page {
  flex: 1;
  text-align: center;
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  color: var(--text-muted);
}

.page-btn {
  flex: 0 0 auto;
  width: 2.25rem;
  height: 2.25rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: transparent;
  color: var(--text);
  font-size: 1.1rem;
  cursor: pointer;
}

.page-btn:disabled { opacity: 0.3; cursor: default; }




/* Tecvit renkleri.
   Sınıflar quran.com'un işaretlemesinden geliyor; tanınmayan sınıf
   renklenmiyor (bkz. utils/qpc `safeTajweed`). Renkler SABİT, palete
   bağlı değil: tecvit kuralının rengi okurun öğrendiği bir koddur,
   temaya göre değişirse anlamını kaybeder. Koyu zeminde okunurluk için
   açık tonlar seçildi; açık modda bir tık koyulaşıyorlar. */
.ar :deep(.tj-ghunnah),
.ar :deep(.tj-idgham_with_ghunnah),
.ar :deep(.tj-idgham_mimi),
.ar :deep(.tj-idgham_shafawi) { color: #88c9ff; }

.ar :deep(.tj-ikhafa),
.ar :deep(.tj-ikhafa_shafawi) { color: #ff9ad1; }

.ar :deep(.tj-iqlab) { color: #9ee37d; }

.ar :deep(.tj-qalqalah) { color: #ffd166; }

.ar :deep(.tj-madda_normal) { color: #f7a072; }
.ar :deep(.tj-madda_permissible) { color: #e0b0ff; }
.ar :deep(.tj-madda_necessary),
.ar :deep(.tj-madda_obligatory) { color: #ff6b6b; }

.ar :deep(.tj-ham_wasl),
.ar :deep(.tj-laam_shamsiyah),
.ar :deep(.tj-slnt) { color: var(--text-muted); }

:root[data-theme="light"] .ar :deep(.tj-ghunnah),
:root[data-theme="light"] .ar :deep(.tj-idgham_with_ghunnah),
:root[data-theme="light"] .ar :deep(.tj-idgham_mimi),
:root[data-theme="light"] .ar :deep(.tj-idgham_shafawi) { color: #1a73c7; }

:root[data-theme="light"] .ar :deep(.tj-ikhafa),
:root[data-theme="light"] .ar :deep(.tj-ikhafa_shafawi) { color: #c2186f; }

:root[data-theme="light"] .ar :deep(.tj-iqlab) { color: #2e7d32; }
:root[data-theme="light"] .ar :deep(.tj-qalqalah) { color: #a86a00; }
:root[data-theme="light"] .ar :deep(.tj-madda_normal) { color: #c1521d; }
:root[data-theme="light"] .ar :deep(.tj-madda_permissible) { color: #7b3fb8; }
:root[data-theme="light"] .ar :deep(.tj-madda_necessary),
:root[data-theme="light"] .ar :deep(.tj-madda_obligatory) { color: #c62828; }

.script.on { border-color: var(--accent-ui); color: var(--text); }

@media (min-width: 900px) {
  .ar { font-size: calc(2rem * var(--quran-scale, 1)); line-height: 2.6; }
  .meal-row { font-size: 0.95rem; }
}
</style>
