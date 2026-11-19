<script setup>
import { ref, computed, watch } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { rangesOfPage, versesOfPage, juzOfPage, surahOfPage, clampPage, PAGE_COUNT } from '@/utils/mushaf'
import { fetchRange, eastern } from '@/utils/kuran'
import { AUTHORS } from '@/data/kuranMeta'
import { MUSHAF_SCRIPTS, scriptById } from '@/utils/qpc'
import MushafSheet from '@/components/quran/MushafSheet.vue'
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
})
const emit = defineEmits(['update:page', 'toggle-read', 'info'])

const settings = useSettingsStore()

const state = ref({ loading: false, error: '', groups: [] })

const juz = computed(() => juzOfPage(props.page))
const surah = computed(() => surahOfPage(props.page))
const meal = computed(() => AUTHORS.find((a) => a.id === settings.quranMeal) ?? AUTHORS[0])

const mushaf = computed(() => settings.quranView !== 'esnek')
// Kayıtta artık sunulmayan bir hat durabilir (V4 kaldırıldı):
// listeyi değil, listenin çözdüğü kimliği ölçüt al.
const scriptId = computed(() => scriptById(settings.quranScript).id)
const toggleView = () => { settings.quranView = mushaf.value ? 'esnek' : 'mushaf' }

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
    text: r.from === r.to
      ? r.text
      : r.text.replace(new RegExp(`^\\(${r.from}\\s*[-–]\\s*${r.to}\\)\\s*`), ''),
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
  state.value = { loading: true, error: '', groups: [] }
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

watch(() => props.page, (p) => load(p), { immediate: true })
watch(() => [settings.quranMeal, settings.quranView], () => load(props.page))

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
  <div class="mushaf" :style="{ '--quran-scale': settings.quranFontSize / 100 }">
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
        <span class="meta-sub">{{ juz }}. cüz · sayfa {{ page }}/{{ PAGE_COUNT }}</span>
      </span>
      <button class="page-btn" :disabled="page <= 1" @click="go(-1)" aria-label="Önceki sayfa">›</button>
    </header>

    <!-- Görünüm tek dokunuşta değişir; yanındaki alan moda AİT olanı
         gösterir: mushafta hat, esnekte yazı boyu. İkisini birden
         göstermek çalışmayan bir ayarı göstermek olurdu. -->
    <div class="viewbar">
      <button
        class="view-toggle"
        :aria-pressed="mushaf"
        :title="mushaf ? 'Esnek görünüme geç' : 'Mushaf görünümüne geç'"
        @click="toggleView"
      >
        <span class="view-opt" :class="{ on: mushaf }">Mushaf</span>
        <span class="view-opt" :class="{ on: !mushaf }">Esnek</span>
      </button>

      <nav v-if="mushaf" class="scripts" aria-label="Hat">
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
        <button class="size-btn" :disabled="!sizeable(-1)" aria-label="Küçült" @click="resize(-1)">A−</button>
        <span class="size-val">{{ settings.quranFontSize }}%</span>
        <button class="size-btn" :disabled="!sizeable(1)" aria-label="Büyüt" @click="resize(1)">A+</button>
      </div>
    </div>

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
        @info="emit('info', $event)"
      />

      <div v-if="state.loading" class="sheet-note">Yükleniyor…</div>
      <div v-else-if="state.error" class="sheet-note sheet-note--error">{{ state.error }}</div>

      <article v-else class="flow" :class="{ 'flow--meal-only': mushaf }">
      <section v-for="g in state.groups" :key="g.surah + '-' + g.from" class="surah-block">
        <SurahHeader
          v-if="g.from === 1 && !mushaf"
          :surah="g.surah"
          :name="g.name"
          @info="emit('info', $event)"
        />

        <p v-if="!mushaf" class="ar" dir="rtl" lang="ar">
          <template v-for="v in g.verses" :key="v.no">
            <span
              class="ar-verse"
              :class="{ focus: focusVerse && focusVerse.surah === g.surah && focusVerse.verse === v.no }"
            >{{ v.ar }}</span>
            <span class="ar-no">{{ eastern(v.no) }}</span>
          </template>
        </p>

        <ul v-if="settings.quranMeal" class="meal">
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

.view-opt {
  font-size: 0.68rem;
  letter-spacing: 0.06em;
  padding: 0.25rem 0.7rem;
  border-radius: 999px;
  color: var(--text-muted);
}

.view-opt.on {
  background: var(--text);
  color: var(--bg);
}

.scripts { display: inline-flex; gap: 0.3rem; }

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
}

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

/* Ayet numarası: metnin kendisi değil, ayracı. */
.ar-no {
  display: inline-block;
  font-size: 0.62em;
  color: var(--accent-ui);
  padding: 0 0.35em;
  vertical-align: 0.15em;
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




@media (min-width: 900px) {
  .ar { font-size: calc(2rem * var(--quran-scale, 1)); line-height: 2.6; }
  .meal-row { font-size: 0.95rem; }
}
</style>
