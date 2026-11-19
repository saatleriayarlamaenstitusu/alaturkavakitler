<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { SURAHS } from '@/data/kuranMeta'
import { PAGE_COUNT, pageOfSurah, pageOfJuz, juzOfPage, surahOfPage } from '@/utils/mushaf'
import { JUZ_PAGES } from '@/data/mushafPages'
import BottomSheet from '@/components/ui/BottomSheet.vue'

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
})
const emit = defineEmits(['close', 'go'])

const TABS = [
  { id: 'sure', label: 'Sure' },
  { id: 'sayfa', label: 'Sayfa' },
  { id: 'cuz', label: 'Cüz' },
]
const tab = ref('sure')
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
      main: s.name,
      sub: `s. ${pageOfSurah(s.id)}`,
      on: s.id === here.value.surah,
      go: () => emit('go', pageOfSurah(s.id)),
    }))

  // Cüzde numara zaten solda duruyor; satırın adı da "1. cüz" olursa
  // aynı sayı iki kez okunuyor. Ad yerine cüzün BAŞLADIĞI sure yazar —
  // aranan bilgi odur.
  if (tab.value === 'cuz')
    return JUZ_PAGES.map((p, i) => ({
      key: i + 1,
      lead: String(i + 1),
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

    <div ref="list" class="rows">
      <button
        v-for="r in rows"
        :key="r.key"
        class="row"
        :class="{ on: r.on }"
        @click="pick(r)"
      >
        <span class="row-lead">{{ r.lead }}</span>
        <span class="row-main">{{ r.main }}</span>
        <span class="row-sub">{{ r.sub }}</span>
      </button>
    </div>
  </BottomSheet>
</template>

<style scoped>
.panel-tabs { display: flex; gap: 0.3rem; }

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
  grid-template-columns: 2.2rem 1fr auto;
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
