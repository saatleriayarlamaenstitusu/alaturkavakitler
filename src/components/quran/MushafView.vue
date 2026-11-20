<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { rangesOfPage, versesOfPage, juzOfPage, surahOfPage, clampPage, diyanetPage, PAGE_COUNT } from '@/utils/mushaf'
import { fetchRange, eastern } from '@/utils/kuran'
import { AUTHORS } from '@/data/kuranMeta'
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
})
const emit = defineEmits(['update:page', 'toggle-read', 'info', 'font', 'listen', 'ayah', 'update:immersive'])

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
const meal = computed(() => AUTHORS.find((a) => a.id === settings.quranMeal) ?? AUTHORS[0])

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

watch(() => props.focusVerse, async (f) => {
  if (!f || !settings.quranAutoScroll || !reciting.value) return
  await nextTick()
  const el = root.value?.querySelector(`[data-v="${f.surah}:${f.verse}"]`)
  centerInScroller(el)
})

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
 * Ayet ayet dizim.
 *
 * Satırlar MEAL gruplarından çıkıyor: bazı mealler ayetleri
 * gruplayarak çeviriyor (Diyanet'te Fatiha 2-4) ve o grubun ayetleri
 * tek bir karşılığı paylaşıyor — ayrı ayrı basılsa aynı cümle art arda
 * üç kez çıkardı. Meal kapalıyken her ayet kendi satırıdır.
 */
function verseRows(g) {
  if (!settings.quranMeal)
    return g.verses.map((v) => ({ key: v.no, from: v.no, to: v.no, label: String(v.no), verses: [v], text: '' }))
  return g.meals.map((m) => ({
    key: m.from,
    from: m.from,
    to: m.to,
    label: m.label,
    verses: g.verses.filter((v) => v.no >= m.from && v.no <= m.to),
    text: m.text,
  }))
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

/**
 * Meal satırları — aynı metni paylaşan ardışık ayetler tek satırda.
 *
 * Bazı mealler ayetleri gruplayarak çeviriyor (Diyanet'te Fatiha 2-4 ve
 * 6-7 böyle): API grubun metnini o gruptaki HER ayet için döndürüyor ve
 * ekranda aynı cümle üst üste üç kez çıkıyordu. Birleştirince satır
 * "2–4" diye etiketleniyor; metnin başındaki "(2-4)" işareti de artık
 * satırın kendisinde olduğu için atılıyor.
 */
function mealRows(verses) {
  const rows = []
  for (const v of verses) {
    const last = rows[rows.length - 1]
    if (last && last.text === v.tr && v.no === last.to + 1) last.to = v.no
    else rows.push({ from: v.no, to: v.no, text: v.tr })
  }
  return rows.map((r) => ({
    ...r,
    label: r.from === r.to ? String(r.from) : `${r.from}–${r.to}`,
    // Baştaki numara işareti atılır: satırın kendisi zaten "2–4" diyor.
    // Kalıp meale göre değişiyor — kimi "(2-4)" yazıyor, kimi
    // "(1-2-3-4)" diye tek tek sayıyor; ikisi de yalnızca rakam, tire
    // ve boşluktan oluştuğu için tek desenle yakalanıyor.
    text: r.from === r.to ? r.text : r.text.replace(/^\(\s*\d+(?:\s*[-–]\s*\d+)*\s*\)\s*/, ''),
  }))
}

async function load(page) {
  const want = rangesOfPage(page)
  if (!want.length) return
  // Mushaf görünümünde metin sayfanın kendi fontundan gelir; meal de
  // kapalıysa bu isteğin getireceği bir şey yok.
  if (mushaf.value && !settings.quranMeal) {
    state.value = { loading: false, error: '', groups: [] }
    return
  }
  // Eski meal de yerinde kalır: aynı sebeple (kutu çöküp kaydırma
  // sıfırlanıyordu).
  state.value = { ...state.value, loading: true, error: '' }
  try {
    const parts = await Promise.all(
      want.map((g) => fetchRange(g.surah, g.from, g.to, [meal.value.id])))
    const groups = parts.map((res, i) => {
      const g = want[i]
      const verses = res.ar.map((ar, n) => ({
        no: g.from + n,
        ar,
        tx: res.tx?.[n] ?? '',
        tr: res.trs?.[meal.value.id]?.[n] ?? '',
      }))
      return { surah: g.surah, name: g.surahName, from: g.from, verses, meals: mealRows(verses) }
    })
    // Sayfa değişmiş olabilir; geç gelen yanıt ekrandakini bozmasın.
    if (page === props.page) state.value = { loading: false, error: '', groups }
  } catch (e) {
    if (page === props.page)
      state.value = { loading: false, error: e.message ?? 'Ayetler alınamadı', groups: [] }
  }
}

watch(() => props.page, (p) => { load(p); loadTajweed(p) }, { immediate: true })
watch(() => [settings.quranMeal, settings.quranView], () => load(props.page))
watch(() => [settings.quranTajweed, settings.quranView, props.page],
  () => loadTajweed(props.page))

const go = (delta) => emit('update:page', clampPage(props.page + delta))

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
  <div ref="root" class="mushaf" :style="{ '--quran-scale': settings.quranFontSize / 100 }">
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
      <span class="meta">
        <span class="meta-main">{{ surah?.name }}</span>
        <span class="meta-sub">
          {{ juz }}. cüz · sayfa {{ page }}/{{ PAGE_COUNT }}
          <span
            v-if="diyanet && diyanet !== page"
            class="meta-alt"
            title="Türkiye'de basılan mushaflarda bu sayfanın numarası"
          >· Diyanet {{ diyanet }}</span>
        </span>
      </span>
      <button class="page-btn" :disabled="page <= 1" @click="go(-1)" aria-label="Önceki sayfa">›</button>
    </header>

    <!-- Görünüm tek dokunuşta değişir; yanındaki alan moda AİT olanı
         gösterir: mushafta hat, esnekte yazı boyu. İkisini birden
         göstermek çalışmayan bir ayarı göstermek olurdu. -->
    <div class="viewbar">
      <div class="view-toggle" role="group" aria-label="Görünüm">
        <button class="view-opt" :class="{ on: mushaf }" :aria-pressed="mushaf" @click="setView('mushaf')">Mushaf</button>
        <button class="view-opt" :class="{ on: flowing }" :aria-pressed="flowing" @click="setView('esnek')">Esnek</button>
        <button class="view-opt" :class="{ on: byVerse }" :aria-pressed="byVerse" @click="setView('ayet')">Ayet ayet</button>
      </div>

      <nav v-if="mushaf" class="scripts" aria-label="Hat">
        <span class="bar-label">Hat</span>
        <button
          v-for="s in MUSHAF_SCRIPTS"
          :key="s.id"
          class="script"
          :class="{ on: scriptId === s.id }"
          :title="s.note"
          @click="settings.quranScript = s.id"
        >{{ s.label }}</button>
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

      <!-- Tam ekran: hatim okurken ekranda sayfadan başka bir şey
           kalmasın. Mushaf modunda sayfa ekrana SIĞDIRILIR, kaydırma
           olmaz — bir mushaf sayfası kaydırılarak okunmaz. -->
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

      <button
        class="full-btn"
        :aria-pressed="immersive"
        :title="immersive ? 'Tam ekrandan çık' : 'Tam ekran oku'"
        @click="emit('update:immersive', !immersive)"
      >{{ immersive ? '⤡' : '⤢' }}</button>
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
            v-for="r in verseRows(g)"
            :key="r.key"
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
            <p v-if="r.text" class="vb-tr">
              <span class="vb-no">{{ r.label }}</span>
              <span>{{ r.text }}</span>
            </p>
          </div>
        </div>

        <ul v-if="settings.quranMeal && !byVerse" class="meal">
          <li
            v-for="m in g.meals"
            :key="m.from"
            class="meal-row"
            :class="{ focus: focusVerse && focusVerse.surah === g.surah
                      && focusVerse.verse >= m.from && focusVerse.verse <= m.to }"
          >
            <span class="meal-no">{{ m.label }}</span>
            <span class="meal-text">{{ m.text }}</span>
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
}

.meta-main {
  font-size: 0.78rem;
  letter-spacing: 0.04em;
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

/* Görünüm çubuğu: solda mod, sağda moda ait ayar. */
.viewbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  flex-wrap: wrap;
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

.vb-tr {
  display: grid;
  grid-template-columns: 2.4rem 1fr;
  gap: 0.5rem;
  margin: 0.45rem 0 0;
  font-size: 0.88rem;
  line-height: 1.6;
  color: var(--text-muted);
}

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
