<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'
import { useHatimStore } from '@/stores/hatim'
import { useSeo, seoBreadcrumb } from '@/composables/useSeo'
import { ensureFont } from '@/composables/useShareFonts'
import { getFont } from '@/data/shareFonts'
import { clampPage, juzOfPage, surahOfPage, pageOfSurah, pageOfJuz, pageOfVerse } from '@/utils/mushaf'
import { AUTHORS } from '@/data/kuranMeta'
import { mealFontById } from '@/data/mealFonts'
import { QURAN_SHORTCUTS } from '@/data/quranShortcuts'
import GoTo from '@/components/quran/GoTo.vue'
import MushafView from '@/components/quran/MushafView.vue'
import HatimPanel from '@/components/quran/HatimPanel.vue'
import PickerSheet from '@/components/quran/PickerSheet.vue'
import MealSheet from '@/components/quran/MealSheet.vue'
import SurahInfoSheet from '@/components/quran/SurahInfoSheet.vue'
import FontSheet from '@/components/quran/FontSheet.vue'
import ListenBar from '@/components/quran/ListenBar.vue'
import * as player from '@/stores/recitation'
import ReciterSheet from '@/components/quran/ReciterSheet.vue'
import PlayerSheet from '@/components/quran/PlayerSheet.vue'

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

/**
 * Sekmeler ne YAPTIĞINI söyler, nereye gittiğini değil.
 *
 * "Oku" ve "Hatim" iki ayrı işin adı gibi duruyordu ve hangisinin
 * hangisi olduğu ancak girince anlaşılıyordu: ikisinde de Kur'an
 * okunuyor, fark okumanın bir hatme YAZILIP yazılmaması. İkonlar da
 * bunu taşıyor — açık kitap serbest okuma, halka hatim (hatim
 * görselleştirmesi zaten halkadır).
 */
const TABS = [
  {
    id: 'oku',
    label: 'Serbest okuma',
    icon: 'M11 6.1C9.2 4.9 7.1 4.2 5 4.1A1.5 1.5 0 0 0 3.5 5.6v11.3c0 .8.6 1.5 1.4 1.5 2 .1 4.1.7 6.1 1.9V6.1zm2 0v14.2c2-1.2 4.1-1.8 6.1-1.9.8 0 1.4-.7 1.4-1.5V5.6A1.5 1.5 0 0 0 19 4.1c-2.1.1-4.2.8-6 2z',
  },
  {
    id: 'hatim',
    label: 'Hatimlerim',
    icon: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 3.2a6.8 6.8 0 1 1 0 13.6 6.8 6.8 0 0 1 0-13.6zm0 3.3a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z',
  },
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

/**
 * Adresteki ayet (`?a=2:255`).
 *
 * Önce yalnızca sayfa yazılıyordu: aranan ayet bulunuyor, vurgulanıyor,
 * ama sayfa yenilenince ya da bağlantı paylaşılınca vurgu kayboluyordu —
 * "ayete gitmek" sayfaya gitmeye düşüyordu. Ayet de adrese yazılıyor ve
 * açılışta geri kuruluyor.
 */
function parseAyah(q) {
  const m = /^(\d+):(\d+)$/.exec(String(q ?? ''))
  if (!m) return null
  const surah = Number(m[1])
  const verse = Number(m[2])
  return surah >= 1 && surah <= 114 && verse >= 1 ? { surah, verse } : null
}

/**
 * Açılışta işaretli ayet.
 *
 * Adreste `a` varsa o. Yoksa ve kıraat SÜRÜYORSA çalan ayet: başka bir
 * sayfaya geçip (vakitler, takvim) Kur'an'a dönünce takip açık olduğu
 * hâlde mushaf birinci sayfada açılıyordu — ses Kehf'i okurken ekran
 * Fâtiha'yı gösteriyordu.
 */
const startAyah = parseAyah(route.query.a)
  ?? (player.active.value
    ? { surah: player.curSurah.value, verse: player.curVerse.value || 1 }
    : null)

// Açılış sayfası: adres verilmişse o; ayet verilmişse ayetin sayfası;
// hatim okunuyorsa kaldığı yer; yoksa baştan.
const page = ref(clampPage(
  route.query.s
  ?? (startAyah ? pageOfVerse(startAyah.surah, startAyah.verse) : null)
  ?? (readingHatim.value ? hatim.nextPage(readingHatim.value) : 1)))

// Arapça yazı tipi ayardan gelir; yalnızca o aile indirilir.
const fontFamily = computed(() => getFont(settings.quranFont).family)
onMounted(() => ensureFont(settings.quranFont))
watch(() => settings.quranFont, (id) => ensureFont(id))


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
  // "Okunmadı" denmiş sayfanın BİR KERELİK muafiyeti var: o sayfadan
  // ayrılmak kararı sessizce geri alıyordu (arka arkaya geri alınan
  // sayfalardan yalnızca sonuncusu kalıyordu, çünkü her çevirme bir
  // öncekini yeniden işaretliyordu). Muafiyet kalıcı DEĞİL: sayfaya
  // tekrar gelip tekrar çıkmak onu yine okundu yapar — o zaman sayfa
  // gerçekten yeniden okunmuştur.
  if (skipMark.has(before)) { skipMark.delete(before); return }
  if (hatim.isRead(readingHatim.value, before)) return
  hatim.togglePage(before, reading.value)
})

/**
 * Bir kerelik işaretleme muafiyeti taşıyan sayfalar.
 *
 * Reaktif değil, çünkü ekranda hiçbir şey göstermiyor: yalnızca bir
 * sonraki sayfa çevirmesinin ne yapacağını belirliyor ve o anda
 * okunup tüketiliyor. Kalıcı da değil — sayfa yenilenince düşer,
 * zaten "şu an verdiğim karar" demek.
 */
const skipMark = new Set()

function toggle() {
  if (!readingHatim.value) return
  const wasRead = read.value
  hatim.togglePage(page.value, reading.value)
  // Okundu → okunmadı: bu sayfadan çıkarken yeniden işaretlenmesin.
  // Ters yönde muafiyet kalkar, yoksa "okundu" deyip çıkınca bir
  // sonraki çevirme onu boşuna atlardı.
  if (wasRead) skipMark.add(page.value)
  else skipMark.delete(page.value)
}

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

/**
 * Meal düğmesinin yazısı.
 *
 * Seçim çoklu olduğu için tek bir ad yetmiyor: biri seçiliyse adı,
 * fazlası seçiliyse kaç tane. Hiç yoksa "Meal kapalı".
 */
const mealPicked = computed(() => settings.quranMeals.map((id) => AUTHORS.find((a) => a.id === id)).filter(Boolean))
const mealName = computed(() => {
  const list = mealPicked.value
  if (!list.length) return 'Meal kapalı'
  if (list.length === 1) return list[0].name
  return `${list.length} meal`
})
const mealLang = computed(() => (mealPicked.value.length === 1 ? mealPicked.value[0].lang : null))

/** Satıra dokunmak meali açar/kapatır; sıra AUTHORS sırasında kalır. */
function toggleMeal(id) {
  const want = new Set(settings.quranMeals)
  if (want.has(id)) want.delete(id)
  else want.add(id)
  settings.quranMeals = AUTHORS.filter((a) => want.has(a.id)).map((a) => a.id)
}

/** Meal yazı tipi: seçilen aile yalnızca gerektiğinde indirilir. */
const mealFont = computed(() => mealFontById(settings.quranMealFont))
watch(() => mealFont.value.font, (f) => { if (f) ensureFont(f) }, { immediate: true })



/** Sure/sayfa/cüz seçici açık mı. */
const picker = ref(false)
/** Meal seçici açık mı. */
const mealPick = ref(false)
/**
 * Dinleme.
 *
 * Oynatıcının kendisi uygulama düzeyinde yaşıyor
 * (`stores/recitation.js`), bu sayfa yalnızca iki şeyi yapıyor:
 * şeridi göstermek ve ÇALAN AYETİ sayfaya bağlamak — vurgu ve sayfa
 * çevirme. Sayfa numarasını bilen burası, o yüzden çevirme kuralı da
 * burada.
 */
const reciterPick = ref(false)
/** Oynatıcı ekranı (sürgü + okunan ayet ve mealleri) açık mı. */
const playerOpen = ref(false)

/* Kârî bağlama App.vue'da: seçici Kur'an sayfasının dışından da
   (mini oynatıcıdan) açılabiliyor. */

/**
 * Ayete çift dokunmak o ayeti seslendirir; çalıyorsa durdurur.
 * Karar oynatıcıya ait — hangi ayetin çaldığını yalnızca o biliyor.
 */
const onAyahTap = (v) => player.requestVerse(v.surah, v.verse)

/** Kulaklık düğmesi: şeridi açar; kapatırken kıraati de bırakır. */
function toggleBar() {
  if (player.barOpen.value) player.stop()
  else player.barOpen.value = true
}

/**
 * Çalan ayet vurgulanır ve gerekirse sayfa çevrilir.
 *
 * Çevirme yalnızca İLERİ ve yalnızca bir adım: hedef sayfa o ankinin
 * tam bir fazlaysa çevrilir. Kullanıcı elle başka bir yere giderse ses
 * onu geri sürüklemesin diye.
 */
watch([player.curSurah, player.curVerse], ([s, v]) => {
  if (!s || !v) {
    if (!player.playing.value) focus.value = null
    return
  }
  const p = pageOfVerse(s, v)
  focus.value = { surah: s, verse: v, page: p }
  if (p === page.value + 1) page.value = p
})

/**
 * Elle sarma: okunan ayete GİT.
 *
 * Kendiliğinden çevirme bir adımla sınırlı (bkz. aşağıdaki izleyici),
 * ama sürgüyü çekmek ya da bildirim alanından ileri almak açık bir
 * istek: ses Kehf 19'u okurken ekran 293. sayfada kalıyordu.
 */
watch(player.seekSeq, () => {
  const s = player.curSurah.value
  const v = player.curVerse.value
  if (!s || !v) return
  goTo(pageOfVerse(s, v), { surah: s, verse: v })
})

/** Künyesi açılan sure (null = kapalı). */
const infoSurah = ref(null)
/** Yazı tipi seçici açık mı. */
const fontPick = ref(false)
/**
 * Tam ekran okuma.
 *
 * Gezinme ve üst çubuk `<html>`e yazılan bir imle gizleniyor
 * (`base.css`). `z-index` yetmedi ve sebebi ölçüldü: `.app-content`
 * kendi yığın bağlamını açıyor (`position: relative; z-index: 1`),
 * içerideki 50 o bağlamın İÇİNDE kalıyor ve üst çubuk sayfanın üstüne
 * biniyordu — mobilde logo ve şehir seçici mushafın başlığının üstünde
 * görünüyordu.
 */
const immersive = ref(false)

watch(immersive, (on) => {
  document.documentElement.toggleAttribute('data-immersive', on)
})
// Sayfadan çıkarken imi bırakma: gezinme bir daha hiç görünmezdi.
onUnmounted(() => document.documentElement.removeAttribute('data-immersive'))

/**
 * Gitme kutusundan gelen hedef. Vurgu SAYFAYA bağlı tutuluyor: sayfa
 * başka bir yolla değişince (ok, kaydırma) vurgu kendiliğinden düşer,
 * ayrı bir temizleme izleyicisi gerekmez.
 */
// Vurgunun sayfası AYETTEN hesaplanır, o anki sayfadan değil:
// paylaşılmış bir `?s=` ile çalan ayet başka sayfalarda olabiliyor ve
// vurgu yanlış sayfaya yazılıyordu.
const focus = ref(startAyah
  ? { ...startAyah, page: pageOfVerse(startAyah.surah, startAyah.verse) }
  : null)
/**
 * Açık "şuraya git" isteği sayacı — MushafView onu izleyip bir kerelik
 * kaydırma yapıyor. Oto kaydırma yalnızca ses çalarken devrede, ama
 * üstten bir sure seçmek açık bir istektir ve kaydırılmalı.
 */
const jump = ref(0)
const focusVerse = computed(() =>
  focus.value && focus.value.page === page.value ? focus.value : null)

/**
 * Adres çubuğu TEK yerden yazılır.
 *
 * Önce iki izleyici vardı (biri sayfa/sekme, biri vurgu) ve ikisi de
 * `route.query`yi yayıyordu: aynı turda ikisi birden tetiklendiğinde
 * her biri DİĞERİNDEN ÖNCEKİ anlık görüntüyü yayıyor ve sonra yazan
 * öbürünün anahtarını düşürüyordu. Ölçüldü: Kehf'e gidince adres
 * `?s=1&a=18:1` kalıyordu — sayfa 293 olmuşken.
 */
watch([page, tab, reading, focusVerse], ([p, t, h, f]) => {
  router.replace({
    query: {
      ...route.query,
      s: String(p),
      b: t === 'hatim' ? 'hatim' : undefined,
      h: h ?? undefined,
      a: f ? `${f.surah}:${f.verse}` : undefined,
    },
  })
})

function goTo(p, verse) {
  page.value = p
  focus.value = verse ? { ...verse, page: p } : null
  if (verse) jump.value += 1
}

/** Hızlı erişim kısayolu: sure / ayet / cüz hedefini sayfaya çevirir. */
function goShortcut(sc) {
  if (sc.juz) return goTo(pageOfJuz(sc.juz), null)
  if (sc.verse) return goTo(pageOfVerse(sc.surah, sc.verse), { surah: sc.surah, verse: sc.verse })
  goTo(pageOfSurah(sc.surah), { surah: sc.surah, verse: 1 })
}
</script>

<template>
  <div class="quran-page" :class="{ immersive }" :style="{ '--quran-ar': fontFamily }">
    <header v-if="!immersive" class="head">
      <h1 class="page-title">kur'an</h1>
      <nav class="tabs">
        <button
          v-for="t in TABS"
          :key="t.id"
          class="tab"
          :class="{ on: tab === t.id }"
          @click="tab = t.id"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
            <path :d="t.icon" />
          </svg>
          {{ t.label }}
        </button>
      </nav>
    </header>

    <template v-if="tab === 'oku' || readingHatim">
      <button v-if="readingHatim && !immersive" class="back" @click="closeReader">‹ Hatimlerime dön</button>

      <MushafView
        :page="page"
        :hatim-name="readingHatim?.niyet ?? ''"
        :focus-verse="focusVerse"
        :read="read"
        :jump="jump"
        @update:page="page = $event"
        @toggle-read="toggle"
        @info="infoSurah = $event"
        @font="fontPick = true"
        @pick="picker = true"
        :listening="player.barOpen.value"
        @listen="toggleBar"
        @ayah="onAyahTap"
        :immersive="immersive"
        @update:immersive="immersive = $event"
      >
        <!-- Gitme kutusu araç şeridinin İÇİNDE: ayrı bir satırdayken
             üst taraf altı satır ediyor ve mushaf ekranın yarısından
             sonra başlıyordu. -->
        <!-- Yuva tam ekranda da çizilir: içindeki arama ve meal gizlenir
             ama TAM EKRAN düğmesi kalır, yoksa çıkış yolu olmazdı. -->
        <template #jump>
          <div class="jump" :class="{ 'jump--bare': immersive }">
            <GoTo v-if="!immersive" @go="goTo" />
            <!-- Göz gezdirerek seçme sayfanın BAŞLIĞINA bağlı
                 (MushafView `@pick`): bulunduğun yeri yazan bir düğmeyi
                 ikinci kez buraya koymak aynı bilgiyi iki yerde
                 göstermek olurdu. -->
            <button v-if="!immersive" class="select meal" aria-label="Meal seç" @click="mealPick = true">
              <!-- Çeviri ikonu: düğmede yalnızca mütercim adı yazıyordu
                   ve "Diyanet İşleri" tek başına neyin ayarı olduğunu
                   söylemiyordu. -->
              <svg class="meal-icon" viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true">
                <path d="M3.5 4h7v2H8.4c.3 1.7 1 3.2 2 4.4-.6.6-1.3 1.1-2.1 1.5l.8 1.8c1-.5 2-1.2 2.8-2 .5.5 1 .9 1.6 1.3l.7-1.9c-.3-.2-.6-.5-.9-.7 1-1.3 1.8-2.8 2.1-4.4H17V4h-5.3V2.2h-2V4H3.5zm6.9 7c-.7-.9-1.2-2-1.5-3.2h3.2c-.3 1.2-.9 2.3-1.7 3.2zM16.8 11l-4.3 10.8h2.2l1-2.6h4.2l1 2.6H23L18.8 11h-2zm-.4 6.3 1.4-3.6 1.4 3.6h-2.8z" />
              </svg>
              <span class="meal-name">{{ mealName }}</span>
              <span v-if="mealLang" class="meal-lang" :class="mealLang">
                {{ mealLang === 'tr' ? 'TR' : 'EN' }}
              </span>
            </button>

            <!-- Tam ekran ARAMA SATIRINDA: görünüm düğmelerinin yanında
                 ⋯ ve kulaklıkla üç kare yan yana düşüyor ve hangisinin
                 ne yaptığı seçilmiyordu. Mushaf modunda sayfa ekrana
                 SIĞDIRILIR, kaydırma olmaz. -->
            <button
              class="select full"
              :aria-pressed="immersive"
              :title="immersive ? 'Tam ekrandan çık' : 'Tam ekran oku'"
              @click="immersive = !immersive"
            >{{ immersive ? '⤡' : '⤢' }}</button>
          </div>
        </template>

        <template #bar>
        <ListenBar
          v-if="player.barOpen.value"
          :page="page"
          :start="focusVerse"
          @pick-reciter="reciterPick = true"
          @expand="playerOpen = true"
        />
        </template>
      </MushafView>
    </template>

    <HatimPanel v-else @read="openHatim" />

    <ReciterSheet
      :open="reciterPick"
      :value="settings.quranReciter"
      @close="reciterPick = false"
      @select="settings.quranReciter = $event"
    />

    <FontSheet
      :open="fontPick"
      :value="settings.quranFont"
      @close="fontPick = false"
      @select="settings.quranFont = $event"
    />

    <SurahInfoSheet
      :open="infoSurah !== null"
      :surah="infoSurah"
      @close="infoSurah = null"
    />

    <MealSheet
      :open="mealPick"
      :value="settings.quranMeals"
      :font="settings.quranMealFont"
      @close="mealPick = false"
      @toggle="toggleMeal"
      @clear="settings.quranMeals = []"
      @font="settings.quranMealFont = $event"
    />

    <PlayerSheet
      :open="playerOpen"
      @close="playerOpen = false"
      @pick-reciter="playerOpen = false; reciterPick = true"
    />

    <!-- Hızlı erişim kısayolları seçicinin İÇİNDE: ⋯ kutusunda hat ve
         yazı boyu ayarlarının yanında alakasız duruyorlardı. Oysa
         "Yasin'e git" ile "42. sayfaya git" aynı iştir. Hatim
         okuyucusunda gizli: orada sıralı okunuyor, sıçramak akışı
         bozar. -->
    <PickerSheet
      :open="picker"
      :page="page"
      :shortcuts="readingHatim ? [] : QURAN_SHORTCUTS"
      @close="picker = false"
      @go="goTo"
      @shortcut="goShortcut"
    />
  </div>
</template>

<style scoped>
.quran-page { padding-bottom: 2rem; }

/* Tam ekran okuma: sayfa kabuğun dışına çıkar ve ekranı kaplar.
   Gezinme çubuğunun üstünü örter — App.vue'ya dokunmadan, çünkü bu
   bir ROTA özelliği değil, sayfanın geçici bir kipi.

   Zemin mat kurulur: `--surface` bazı paletlerde saydam ve altındaki
   gezinme çubuğu sayfanın içinden görünüyor. */
.quran-page.immersive {
  position: fixed;
  inset: 0;
  z-index: 50;
  /* Güvenli alan ÜSTTE de gerekli: ana ekrana eklenmiş uygulamada
     `inset: 0` durum çubuğunun/çentiğin altına giriyor ve sayfanın
     tepesindeki denetim şeridi örtülüyor. */
  padding:
    calc(0.4rem + env(safe-area-inset-top))
    calc(0.6rem + env(safe-area-inset-right))
    calc(0.4rem + env(safe-area-inset-bottom))
    calc(0.6rem + env(safe-area-inset-left));
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background-color: var(--bg);
  background-image: linear-gradient(var(--surface), var(--surface));
}

.quran-page.immersive :deep(.mushaf) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* Meal açıksa sayfanın altında kalır ve kaydırılır; kapalıyken
   kaydırılacak bir şey olmaz. */
.quran-page.immersive :deep(.sheet) {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

/* Hayalet başlık bu sayfada daha küçük: okuma sayfası zaten başlık,
   sekme, konum, araç şeridi ve dinleme şeridi taşıyor; 4em'lik "kur'an"
   mushafı ekranın yarısına itiyordu. Global `.page-title` değişmez —
   öbür sayfalarda o ölçü kompozisyonun kendisi. */
.head .page-title { font-size: 2.4em; margin: 0; }

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}

.tabs { display: inline-flex; gap: 0.4rem; }

.tab {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font: inherit;
  font-size: 0.75rem;
  padding: 0.35rem 0.75rem;
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
  margin-bottom: 0.6rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}

.back:hover { color: var(--text); border-color: var(--text); }

/* Araç şeridinin içinde: solda genişler, yanındaki görünüm düğmeleri
   sağa yapışır. */
/* Arama ve meal AYNI satırda: ikisi de "ne okunacak" sorusunun
   ayarı ve ayrı satırlara düştüklerinde şerit iki kat yer kaplıyordu.
   Sarmıyor (`nowrap`) — meal düğmesi daralır, arama kutusu esner. */
.jump {
  flex: 1 1 19rem;
  display: flex;
  flex-wrap: nowrap;
  align-items: stretch;
  gap: 0.4rem;
  min-width: 0;
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
  flex: 0 1 11rem;
  min-width: 5.5rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  text-align: start;
}

.meal-icon { flex: 0 0 auto; color: var(--text-muted); }

.full {
  flex: 0 0 auto;
  width: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}

.full:hover { border-color: var(--text); color: var(--text); }
.full[aria-pressed="true"] { border-color: var(--accent-ui); color: var(--text); }

/* Tam ekranda satırda yalnızca bu düğme kalır. Normalde arama ve meal
   solda olduğu için düğme satırın sağ ucuna düşüyor; aynı yerde
   kalsın diye tam ekranda da şeridin SONUNA alınıp sağa yapıştırılır
   (`order` + `margin-left: auto`). Yoksa görünüm düğmelerinin soluna
   geçip her tam ekrana girişte yer değiştiriyordu. */
.jump--bare { flex: 0 0 auto; order: 1; margin-left: auto; }

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



.select:focus-visible { outline: 2px solid var(--accent-ui); outline-offset: 1px; }
</style>
