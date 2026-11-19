<script setup>
import { ref, watch, nextTick, onBeforeUnmount } from 'vue'
import { pageLines, ensurePageFont, pageFamily, ensureNameFont } from '@/utils/qpc'
import SurahHeader from '@/components/quran/SurahHeader.vue'

/**
 * Mushaf görünümü — basılı sayfanın satır satır kendisi.
 *
 * Esnek görünümden farkı akış değil DİZİM: 15 satır, her satır basılı
 * nüshadaki kelimelerle ve o sayfaya ait fontla. Satır sonları bizim
 * kırdığımız yerler değil, mushafın kırdığı yerler.
 *
 * Satır iki yana yaslanırken boşluk DEĞİL kelime araları esner
 * (`space-between`): mushafta satırı dolduran şey kelimelerin arası,
 * harflerin arası değil. Metni `justify` ile yasladığımızda tarayıcı
 * glifleri de geriyor ve hat bozuluyor.
 */
const props = defineProps({
  page: { type: Number, required: true },
  script: { type: String, default: 'v2' },
  /** Vurgulanacak ayet: `{ surah, verse }`. */
  focusVerse: { type: Object, default: null },
})
const emit = defineEmits(['info'])

const state = ref({ loading: false, error: '', lines: [], family: '' })
const names = ref('')

ensureNameFont().then((f) => { names.value = f }).catch(() => {})

async function load(page, script) {
  state.value = { loading: true, error: '', lines: [], family: '' }
  try {
    // Dizim ve font birlikte beklenir: font gelmeden satırları basmak
    // bir an için kutu kutu glif gösteriyor (kodlar PUA'da).
    const [lines] = await Promise.all([pageLines(page, script), ensurePageFont(script, page)])
    if (page === props.page && script === props.script)
      state.value = { loading: false, error: '', lines, family: pageFamily(script, page) }
  } catch (e) {
    if (page === props.page && script === props.script)
      state.value = { loading: false, error: e.message ?? 'Sayfa alınamadı', lines: [], family: '' }
  }
}

watch(() => [props.page, props.script], ([p, s]) => load(p, s), { immediate: true })

/**
 * Satırı sayfanın enine oturtur.
 *
 * Ölçüldü: aynı puntoda satırların doğal genişliği eşit değil. Seyrek
 * satır kutudan dar kalır (boşluklar esneyip doldurur, sorun yok), yoğun
 * satır kutuyu AŞAR — `space-between` taşan içeriği sıkıştıramadığı için
 * kelimeler sayfanın dışına çıkıyordu (544px'lik kutuda 601px'lik satır).
 *
 * Çözüm satırın kendi puntosunu oranla küçültmek: basılı mushafta da
 * yoğun satırın harfleri bir tık dardır. Oran bire bir, tek geçişte
 * oturuyor; `scaleX` ile germek harfleri bozardı.
 */
const sheet = ref(null)

function fitLines() {
  const root = sheet.value
  if (!root) return
  for (const line of root.querySelectorAll('.qpc-line')) {
    line.style.fontSize = ''
    const natural = line.scrollWidth
    const box = line.clientWidth
    if (!box || natural <= box) continue
    const base = parseFloat(getComputedStyle(line).fontSize)
    line.style.fontSize = `${base * (box / natural)}px`
  }
}

/** Font geç gelirse ölçü yanlış çıkar: yüklenince yeniden oturtulur. */
watch(() => state.value.lines, async () => {
  await nextTick()
  fitLines()
  if (state.value.family) {
    document.fonts.load(`1em "${state.value.family}"`).then(fitLines).catch(() => {})
  }
})

const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => fitLines()) : null
watch(sheet, (el) => { ro?.disconnect(); if (el) ro?.observe(el) })
onBeforeUnmount(() => ro?.disconnect())

const hit = (w) =>
  props.focusVerse && props.focusVerse.surah === w.s && props.focusVerse.verse === w.v
</script>

<template>
  <div class="qpc">
    <div v-if="state.loading" class="qpc-note">Sayfa yükleniyor…</div>
    <div v-else-if="state.error" class="qpc-note qpc-note--error">{{ state.error }}</div>

    <div v-else ref="sheet" class="qpc-page" :style="{ fontFamily: state.family }" dir="rtl" lang="ar">
      <template v-for="l in state.lines" :key="l.n">
        <!-- Sure başı: sayfanın kendi süslemesi (tek glif) + Türkçe
             künye. Süsleme Arapçadır, hangi sure olduğunu okuyabilen
             okur; künye onu herkes için açar. -->
        <SurahHeader
          v-if="l.kind === 'name'"
          variant="mushaf"
          :surah="l.surah"
          :name="l.name"
          :name-font="names"
          @info="emit('info', $event)"
        />

        <div v-else-if="l.kind === 'basmala'" class="qpc-basmala">
          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </div>

        <div v-else class="qpc-line">
          <span
            v-for="(w, i) in l.words"
            :key="i"
            class="qpc-word"
            :class="{ end: w.e, focus: hit(w) }"
          >{{ w.g }}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* Ölçü sayfanın GENİŞLİĞİNDEN sürülür (`cqw`): QPC fontları satırı
   sayfanın tamamını dolduracak şekilde çizilmiştir, sabit bir punto
   telefonda taşar, masaüstünde ortada incecik kalır. */
.qpc {
  container-type: inline-size;
}

.qpc-page {
  display: flex;
  flex-direction: column;
  gap: 0.35em;
  font-size: 7.2cqw;
  line-height: 1.75;
  color: var(--text);
}

.qpc-line {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  /* Tek kelimelik satır (son sayfalar) ortaya gelsin, iki yana
     yaslanıp kenara yapışmasın. */
  gap: 0.1em;
}

.qpc-line:only-child { justify-content: center; }

.qpc-word { white-space: nowrap; }

/* Ayet sonu numarası gliftir, metnin parçası. Rengi değiştirilmez:
   V4'te tecvit renkleri fontun kendisinden gelir ve CSS rengi o
   glifleri etkilemez, yarısı boyanıp yarısı boyanmamış görünür. */
.qpc-word.focus {
  background: color-mix(in srgb, var(--accent-ui) 20%, transparent);
  border-radius: 3px;
}



.qpc-basmala {
  text-align: center;
  font-family: var(--quran-ar);
  font-size: 0.62em;
  color: var(--text);
}

.qpc-note {
  padding: 4rem 0;
  text-align: center;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.qpc-note--error { color: var(--primary); }

/* Masaüstünde kabuk genişliyor ama sayfa bir MUSHAF sayfası: 1200px
   genişlikte satır bir kitabın satırı olmaktan çıkıyor. Sayfa kendi
   ölçüsünde ortalanır. */
@media (min-width: 900px) {
  .qpc { max-width: 34rem; margin-inline: auto; }
}
</style>
