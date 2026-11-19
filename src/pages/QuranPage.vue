<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'
import { useHatimStore } from '@/stores/hatim'
import { useSeo, seoBreadcrumb } from '@/composables/useSeo'
import { ensureFont } from '@/composables/useShareFonts'
import { getFont } from '@/data/shareFonts'
import { clampPage, juzOfPage, surahOfPage, pageOfSurah, pageOfJuz, pageOfVerse } from '@/utils/mushaf'
import { AUTHORS } from '@/data/kuranMeta'
import { QURAN_SHORTCUTS } from '@/data/quranShortcuts'
import GoTo from '@/components/quran/GoTo.vue'
import MushafView from '@/components/quran/MushafView.vue'
import HatimPanel from '@/components/quran/HatimPanel.vue'
import PickerSheet from '@/components/quran/PickerSheet.vue'
import MealSheet from '@/components/quran/MealSheet.vue'
import SurahInfoSheet from '@/components/quran/SurahInfoSheet.vue'

/**
 * Kuran sayfası — iki sekme: Oku ve Hatim.
 *
 * Dinle üçüncü sekme olacak (kıraat kesitleri + ayet ayet kayıtlar);
 * sekme çubuğu o yüzden iki öğe için fazla gelse de şimdiden şerit.
 *
 * Sayfa numarası adres çubuğunda (`?s=12`): okuduğun yeri paylaşabilmek
 * ve geri tuşunun sayfalar arasında çalışması için.
 */
useSeo({
  title: 'Kur\'an-ı Kerim',
  description: 'Mushaf sayfası, meal ve hatim takibi.',
  path: '/kuran',
  jsonLd: seoBreadcrumb([{ name: 'Kur\'an-ı Kerim', path: '/kuran' }]),
})

const route = useRoute()
const router = useRouter()
const settings = useSettingsStore()
const hatim = useHatimStore()

const TABS = [
  { id: 'oku', label: 'Oku' },
  { id: 'hatim', label: 'Hatim' },
]
const tab = ref(route.query.b === 'hatim' ? 'hatim' : 'oku')

/**
 * İki okuyucu var ve bu bilinçli.
 *
 * Oku SERBESTTİR: hiçbir hatme yazmaz. Hatim okuyucusu ise bir hatmin
 * İÇİNDEDİR — hangi hatimde olduğun tepede yazılı durur ve çevirdiğin
 * sayfa okundu sayılır. Önceden tek okuyucu vardı ve "Okudum" düğmesi
 * görünmeyen bir "etkin hatme" yazıyordu: hangi hatmi okuduğun ekranda
 * hiçbir yerde yazmıyordu.
 */
// Okunan hatim ADRESTE durur (`?h=`): sayfayı yenileyince okuduğun yerden
// düşmemek için. Kayıtta olmayan bir kimlik gelirse yok sayılır.
const known = (id) => (hatim.list.some((h) => h.id === id) ? id : null)
const reading = ref(known(route.query.h ?? null))

const readingHatim = computed(() => hatim.list.find((h) => h.id === reading.value) ?? null)

// Açılış sayfası: adres verilmişse o; hatim okunuyorsa kaldığı yer; yoksa baştan.
const page = ref(clampPage(
  route.query.s ?? (readingHatim.value ? hatim.nextPage(readingHatim.value) : 1)))

// Arapça yazı tipi ayardan gelir; yalnızca o aile indirilir.
const fontFamily = computed(() => getFont(settings.quranFont).family)
onMounted(() => ensureFont(settings.quranFont))
watch(() => settings.quranFont, (id) => ensureFont(id))

watch([page, tab, reading], ([p, t, h]) => {
  router.replace({
    query: {
      ...route.query,
      s: String(p),
      b: t === 'hatim' ? 'hatim' : undefined,
      h: h ?? undefined,
    },
  })
})

const read = computed(() => hatim.isRead(readingHatim.value, page.value))

/**
 * Sayfa çevrilince ayrılınan sayfa okundu sayılır.
 *
 * "Okudum" düğmesine basmak, okuma akışının ortasına konmuş bir iştir;
 * sayfayı çevirmek zaten o sayfayı bitirdiğini söylüyor. Yanlışlıkla
 * sayılan sayfa tepedeki rozete dokunarak geri alınır — bu yüzden
 * işaretleme sessiz değil, her sayfada görünür bir durum taşıyor.
 *
 * Geri giderken de sayılır: bir sayfayı tekrar okuyup ileri gitmek onu
 * yine okunmuş yapacaktı, ayrıca "okudum ama geri döndüm" diye bir
 * durumu ayırmak kullanıcının aklında olmayan bir ayrım.
 */
watch(page, (now, before) => {
  if (tab.value !== 'hatim' || !readingHatim.value) return
  if (before == null || before === now) return
  if (!hatim.isRead(readingHatim.value, before)) hatim.togglePage(before, reading.value)
})

const toggle = () => { if (readingHatim.value) hatim.togglePage(page.value, reading.value) }

/** Hatim listesinden "oku" — o hatmin kaldığı yerden açar. */
function openHatim(id, p) {
  reading.value = id
  hatim.setActive(id)
  page.value = clampPage(p)
}

const closeReader = () => { reading.value = null }

// Sekme değişince okuyucudan çıkılır: Oku serbest okumadır, hatim rozeti
// ve "hatme dön" oraya sızmamalı.
watch(tab, () => { reading.value = null })

/** Seçili mealin adı — düğmenin üstünde yazar. */
const mealName = computed(() =>
  AUTHORS.find((a) => a.id === settings.quranMeal)?.name ?? 'Meal kapalı')
const mealLang = computed(() =>
  AUTHORS.find((a) => a.id === settings.quranMeal)?.lang ?? null)

/** Sure/sayfa/cüz seçici açık mı. */
const picker = ref(false)
/** Meal seçici açık mı. */
const mealPick = ref(false)
/** Künyesi açılan sure (null = kapalı). */
const infoSurah = ref(null)

/**
 * Gitme kutusundan gelen hedef. Vurgu SAYFAYA bağlı tutuluyor: sayfa
 * başka bir yolla değişince (ok, kaydırma) vurgu kendiliğinden düşer,
 * ayrı bir temizleme izleyicisi gerekmez.
 */
const focus = ref(null)
const focusVerse = computed(() =>
  focus.value && focus.value.page === page.value ? focus.value : null)

function goTo(p, verse) {
  page.value = p
  focus.value = verse ? { ...verse, page: p } : null
}

/** Hızlı erişim kısayolu: sure / ayet / cüz hedefini sayfaya çevirir. */
function goShortcut(sc) {
  if (sc.juz) return goTo(pageOfJuz(sc.juz), null)
  if (sc.verse) return goTo(pageOfVerse(sc.surah, sc.verse), { surah: sc.surah, verse: sc.verse })
  goTo(pageOfSurah(sc.surah), null)
}
</script>

<template>
  <div class="quran-page" :style="{ '--quran-ar': fontFamily }">
    <header class="head">
      <h1 class="page-title">kur'an</h1>
      <nav class="tabs">
        <button
          v-for="t in TABS"
          :key="t.id"
          class="tab"
          :class="{ on: tab === t.id }"
          @click="tab = t.id"
        >{{ t.label }}</button>
      </nav>
    </header>

    <template v-if="tab === 'oku' || readingHatim">
      <button v-if="readingHatim" class="back" @click="closeReader">‹ Hatme dön</button>

      <!-- Tek kutuyla gitme + meal seçimi. Dört ayrı açılır liste vardı ve
           bir ayete gitmenin yolu yoktu. -->
      <div class="jump">
        <GoTo @go="goTo" />
        <!-- Yazarak aramanın yanında göz gezdirerek seçmek: aynı işin
             iki yolu, farklı iki alışkanlık için. -->
        <button class="select pick" @click="picker = true">Seç ▾</button>
        <button class="select meal" aria-label="Meal seç" @click="mealPick = true">
          <span class="meal-name">{{ mealName }}</span>
          <span v-if="mealLang" class="meal-lang" :class="mealLang">
            {{ mealLang === 'tr' ? 'TR' : 'EN' }}
          </span>
        </button>
      </div>

      <!-- Mushafta en çok dönülen yerler. Hatim okuyucusunda yok: orada
           sıralı okunuyor, sıçramak akışı bozar. -->
      <nav v-if="!readingHatim" class="shortcuts" aria-label="Hızlı erişim">
        <button
          v-for="sc in QURAN_SHORTCUTS"
          :key="sc.label"
          class="chip"
          :title="sc.note ? `${sc.label} · ${sc.note}` : sc.label"
          @click="goShortcut(sc)"
        >{{ sc.label }}</button>
      </nav>

      <MushafView
        :page="page"
        :hatim-name="readingHatim?.niyet ?? ''"
        :focus-verse="focusVerse"
        :read="read"
        @update:page="page = $event"
        @toggle-read="toggle"
        @info="infoSurah = $event"
      />
    </template>

    <HatimPanel v-else @read="openHatim" />

    <SurahInfoSheet
      :open="infoSurah !== null"
      :surah="infoSurah"
      @close="infoSurah = null"
    />

    <MealSheet
      :open="mealPick"
      :value="settings.quranMeal"
      @close="mealPick = false"
      @select="settings.quranMeal = $event"
    />

    <PickerSheet
      :open="picker"
      :page="page"
      @close="picker = false"
      @go="goTo($event, null)"
    />
  </div>
</template>

<style scoped>
.quran-page { padding-bottom: 2rem; }

.head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.tabs { display: inline-flex; gap: 0.4rem; }

.tab {
  font: inherit;
  font-size: 0.8rem;
  padding: 0.4rem 0.9rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}

.tab.on {
  background: var(--text);
  border-color: var(--text);
  color: var(--bg);
}

.back {
  font: inherit;
  font-size: 0.75rem;
  padding: 0.35rem 0.7rem;
  margin-top: 1rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}

.back:hover { color: var(--text); border-color: var(--text); }

.jump {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  gap: 0.5rem;
  margin: 1.25rem 0;
}

.select {
  font: inherit;
  font-size: 0.8rem;
  padding: 0.35rem 0.5rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: transparent;
  color: var(--text);
  cursor: pointer;
}

.meal {
  flex: 0 1 12rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  text-align: start;
}

.meal-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meal-lang {
  flex: 0 0 auto;
  font-size: 0.55rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
  border: 1px solid var(--border);
  color: var(--text-muted);
}

.meal-lang.tr { border-color: var(--accent-ui); color: var(--text); }

.pick { flex: 0 0 auto; letter-spacing: 0.04em; }
.pick:hover { border-color: var(--text); }

/* Kısayollar yatay kaydırılır: masaüstünde sarmak daha iyi olurdu ama
   liste on bir öğe ve iki satıra bölününce gezinme çubuğu gibi duruyor;
   tek satır kalması onu bir "şerit" olarak okutuyor. */
.shortcuts {
  display: flex;
  gap: 0.35rem;
  margin: -0.5rem 0 1.25rem;
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: 0.25rem;
}

.shortcuts::-webkit-scrollbar { display: none; }

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

@media (min-width: 900px) {
  .shortcuts { flex-wrap: wrap; overflow: visible; }
}
.select:focus-visible { outline: 2px solid var(--accent-ui); outline-offset: 1px; }
</style>
