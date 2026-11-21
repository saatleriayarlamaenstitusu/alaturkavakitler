<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { SURAHS } from '@/data/kuranMeta'
import { PAGE_COUNT, pageOfSurah, pageOfJuz, juzOfPage, surahOfPage } from '@/utils/mushaf'
import { JUZ_PAGES } from '@/data/mushafPages'
import BottomSheet from '@/components/ui/BottomSheet.vue'
import { ensureNameFont, suraNameGlyph } from '@/utils/qpc'

/**
 * Sure / sayfa / cüz seçici — yerel `select` DEĞİL.
 *
 * Sebebi ölçüldü: 114 seçenekli bir `select` Android'de ekranı kaplayan,
 * aranamayan, kaydırması ağır bir listeye dönüşüyor ve sure numarasıyla
 * sayfa numarasını yan yana gösteremiyor. Burada her satır iki bilgiyi
 * birden taşır (sure → sayfası, sayfa → suresi), bulunduğun yer işaretli
 * gelir ve liste oraya kaydırılmış açılır.
 *
 * Gitme kutusunun (`GoTo`) yerine değil YANINA konur: biri yazarak
 * arayan, öbürü göz gezdirerek seçen için.
 */
const props = defineProps({
  open: { type: Boolean, default: false },
  page: { type: Number, required: true },
  /**
   * Hızlı erişim kısayolları (`data/quranShortcuts.js`). Boş dizi =
   * gösterilmez (hatim okuyucusunda sıçramak akışı bozar).
   */
  shortcuts: { type: Array, default: () => [] },
})
const emit = defineEmits(['close', 'go', 'shortcut'])

const TABS = [
  { id: 'sure', label: 'Sure' },
  { id: 'sayfa', label: 'Sayfa' },
  { id: 'cuz', label: 'Cüz' },
]
const tab = ref('sure')

/**
 * Sure adının kendi görseli — ad glifi (vektörel, tek karakter).
 *
 * Latin harfli ad listeyi okutuyor ama sure ADI aslında bir şekildir;
 * mushafta da öyle durur. Font tek dosya (~87 kB) ve yalnızca seçici
 * ilk açıldığında inmeye başlar; gelmezse satır sade kalır, liste
 * çalışmaya devam eder.
 */
const names = ref('')
watch(() => props.open, (open) => {
  if (open && !names.value) ensureNameFont().then((f) => { names.value = f }).catch(() => {})
}, { immediate: true })
const list = ref(null)

const here = computed(() => ({
  surah: surahOfPage(props.page)?.id ?? 1,
  juz: juzOfPage(props.page),
}))

const rows = computed(() => {
  if (tab.value === 'sure')
    return SURAHS.map((s) => ({
      key: s.id,
      lead: String(s.id),
      glyph: s.id,
      main: s.name,
      sub: `s. ${pageOfSurah(s.id)}`,
      on: s.id === here.value.surah,
      // Sure, sayfanın ORTASINDA başlıyor olabilir: hedef yalnızca
      // sayfa olursa vurgu da kıraat da sayfanın başındaki önceki
      // sureden başlıyor.
      go: () => emit('go', pageOfSurah(s.id), { surah: s.id, verse: 1 }),
    }))

  // Cüzde numara zaten solda duruyor; satırın adı da "1. cüz" olursa
  // aynı sayı iki kez okunuyor. Ad yerine cüzün BAŞLADIĞI sure yazar —
  // aranan bilgi odur.
  if (tab.value === 'cuz')
    return JUZ_PAGES.map((p, i) => ({
      key: i + 1,
      lead: String(i + 1),
      glyph: surahOfPage(p)?.id ?? null,
      main: surahOfPage(p)?.name ?? '',
      sub: `s. ${p}`,
      on: i + 1 === here.value.juz,
      go: () => emit('go', pageOfJuz(i + 1)),
    }))

  return Array.from({ length: PAGE_COUNT }, (_, i) => {
    const p = i + 1
    return {
      key: p,
      lead: String(p),
      glyph: surahOfPage(p)?.id ?? null,
      main: surahOfPage(p)?.name ?? '',
      sub: `${juzOfPage(p)}. cüz`,
      on: p === props.page,
      go: () => emit('go', p),
    }
  })
})

/** Bulunduğun satır listenin ortasına getirilir: 604 sayfalık bir
 *  listeyi tepeden açmak "neredeyim" sorusunu cevapsız bırakıyor. */
async function center() {
  await nextTick()
  const el = list.value?.querySelector('.row.on')
  // Kaydıran kutu kabuğun gövdesi; `.rows` yalnızca satırları sarar.
  const box = list.value?.closest('.panel-body')
  if (el && box) box.scrollTop = el.offsetTop - box.clientHeight / 2 + 20
}

watch(() => [props.open, tab.value], ([open]) => { if (open) center() }, { immediate: true })

function pick(row) {
  row.go()
  emit('close')
}
</script>

<template>
  <BottomSheet :open="open" label="Sure, sayfa veya cüz seç" @close="emit('close')">
    <template #head>
      <nav class="panel-tabs">
        <button
          v-for="t in TABS"
          :key="t.id"
          class="panel-tab"
          :class="{ on: tab === t.id }"
          @click="tab = t.id"
        >{{ t.label }}</button>
      </nav>
    </template>

    <!-- Kısayollar sekmelerin HEMEN ALTINDA, listenin üstünde:
         Yasin ya da Amme'ye gitmek 114 satırı taramaktan sık yapılan
         bir iş ve ikisi de aynı sorunun cevabı. Daha önce görünüm
         ayarlarının yanındaydı, orada alakasız duruyordu. -->
    <div v-if="shortcuts.length" class="shortcuts">
      <button
        v-for="sc in shortcuts"
        :key="sc.label"
        class="chip"
        :title="sc.note ? `${sc.label} · ${sc.note}` : sc.label"
        @click="emit('shortcut', sc); emit('close')"
      >{{ sc.label }}</button>
    </div>

    <div ref="list" class="rows">
      <button
        v-for="r in rows"
        :key="r.key"
        class="row"
        :class="{ on: r.on }"
        @click="pick(r)"
      >
        <span class="row-lead">{{ r.lead }}</span>
        <span
          v-if="names && r.glyph"
          class="row-glyph"
          :style="{ fontFamily: names }"
          aria-hidden="true"
        >{{ suraNameGlyph(r.glyph) }}</span>
        <span v-else class="row-glyph" aria-hidden="true"></span>
        <span class="row-main">{{ r.main }}</span>
        <span class="row-sub">{{ r.sub }}</span>
      </button>
    </div>
  </BottomSheet>
</template>

<style scoped>
.panel-tabs { display: flex; gap: 0.3rem; }

/* Kısayollar sarar: alt sayfa dar değil ve yatay kaydırılan bir şerit
   burada kaybolurdu — listenin üstünde tek bakışta görünmeli. */
.shortcuts {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  padding: 0.2rem 0.8rem 0.7rem;
  border-bottom: 1px solid var(--border);
  margin-bottom: 0.3rem;
}

.chip {
  flex: 0 0 auto;
  font: inherit;
  font-size: 0.72rem;
  padding: 0.3rem 0.65rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  white-space: nowrap;
}

.chip:hover { color: var(--text); border-color: var(--text); }

.panel-tab {
  font: inherit;
  font-size: 0.75rem;
  padding: 0.35rem 0.8rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}

.panel-tab.on {
  background: var(--text);
  border-color: var(--text);
  color: var(--bg);
}

/* Kaydırma kutusu kabuğun gövdesidir; burada yalnızca satırlar. */
.rows { display: contents; }

.row {
  width: 100%;
  display: grid;
  grid-template-columns: 2.2rem 4.6rem 1fr auto;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.8rem;
  font: inherit;
  text-align: start;
  border: none;
  background: transparent;
  color: var(--text);
  cursor: pointer;
}

.row:hover { background: color-mix(in srgb, var(--text) 7%, transparent); }

.row.on {
  background: color-mix(in srgb, var(--accent-ui) 16%, transparent);
  box-shadow: inset 2px 0 0 var(--accent-ui);
}

.row-lead {
  font-size: 0.68rem;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  text-align: end;
}

/* Glif sabit bir kolonda durur: değişken genişlikte olsaydı adlar
   satırdan satıra kayardı ve liste taranamaz hâle gelirdi. */
.row-glyph {
  font-size: 1.35rem;
  line-height: 1;
  text-align: center;
  color: var(--text-muted);
  overflow: hidden;
  white-space: nowrap;
}

.row.on .row-glyph { color: var(--text); }

.row-main {
  font-size: 0.88rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-sub {
  font-size: 0.62rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
}
</style>
