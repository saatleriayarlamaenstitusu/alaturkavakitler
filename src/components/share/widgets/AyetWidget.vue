<script setup>
import { computed } from 'vue'
import { useWidgetFont } from './useWidgetFont'
import WidgetLines from './WidgetLines.vue'
import { getFont } from '@/data/shareFonts'

/**
 * Ayet parçası: Arapça, okunuş, bir ya da birden çok meal, kaynak satırı.
 *
 * Widget ağa çıkmaz — metin ayarların içinde durur, seçici oraya yazar
 * (bkz. share/AyetPicker.vue). Böylece parça saf kalır, dışa aktarımda
 * bekleyen bir istek olmaz ve her satır elle düzenlenebilir.
 *
 * Arapça ve Latin metin AYRI yazı tipleri kullanır. Tek fontla çizilseydi
 * ya Arapça harfler bir Latin fontunun yedeğine düşerdi ya da meal Arapça
 * bir fontun Latin karakterleriyle yazılırdı; ikisi de kötü.
 */
const props = defineProps({
  settings: { type: Object, default: () => ({}) },
  accent: { type: String, default: '#ae002e' },
})

const s = computed(() => props.settings)
const resolve = (c) => (c === 'auto' ? props.accent : c)

// Kök tipografi Arapça fontundan gelir; Latin bölümler kendi ailesini
// satır içinde ezer.
const arFont = useWidgetFont(s, 400)
const latinFamily = computed(() => getFont(s.value.latinFont).family)

const meals = computed(() => (s.value.meals ?? []).filter((m) => m?.text))

// Tek meal varken mütercim adını yazmak gürültü: hangi meal olduğu
// ayarlarda görünüyor ve görselde bir satır daha yer kaplıyor. Birden
// çoksa ad ŞART, yoksa iki paragraf neden farklı belli olmuyor.
const showNames = computed(() => s.value.mealNames !== false && meals.value.length > 1)

const latinSize = computed(() => Math.round(s.value.size * (s.value.latinScale ?? 0.3)))
// Kaynak satırı da Latin metnine oranlı — mütercim adıyla aynı mantık.
// Varsayılan 0.6, eski sabit orandan (Arapça'nın 0.2'si) görsel olarak
// ayırt edilemeyecek kadar yakın: latinScale 0.34'te ikisi de aynı puntoyu
// veriyor, yani mevcut katmanlar olduğu gibi kalıyor.
const refSize = computed(() =>
  Math.max(8, Math.round(latinSize.value * (s.value.refScale ?? 0.6))))

// Mütercim adı Latin metnine ORANLA ölçülür, Arapça'ya değil: yanında
// durduğu paragrafla birlikte kayması gerekiyor.
const nameSize = computed(() =>
  Math.max(8, Math.round(latinSize.value * (s.value.mealNameScale ?? 0.6))))

// Arapça ve Latin ayrı hizalanabilir — biri sağa, biri sola. Latin için
// ayrı bir değer verilmemişse Arapça'nınkini izler, yani eski katmanlar
// göründükleri gibi kalır.
const latinAlign = computed(() => s.value.latinAlign ?? s.value.align)
const nameAbove = computed(() => s.value.mealNamePos !== 'alt')

// 'ayri': her ayet kendi bloğunda — önce birinci ayetin Arapçası, hemen
// altında onun mealleri, sonra ikinci ayet. Diğer iki kip (birleşik ve
// satır satır) metin birleştirme kararıdır ve seçicide halledilir; bu
// kip yapıyı değiştirdiği için burada ayrı bir dal gerekiyor.
const blocks = computed(() => {
  if (s.value.ayet?.layout !== 'ayri') return null
  const list = (s.value.verses ?? []).filter((v) => v?.ar || v?.meals?.length)
  return list.length ? list : null
})

/** Bir ayet bloğunun gösterilecek mealleri. */
const mealsOf = (v) => (v.meals ?? []).filter((m) => m?.text)
</script>

<template>
  <div
    class="w-ayet"
    :style="{ ...arFont, textAlign: s.align, width: `${s.width}px`, gap: `${s.gap}px` }"
  >
    <!-- Ayet ayet: her blok kendi Arapçası ve mealleriyle. -->
    <template v-if="blocks">
      <div
        v-for="(v, i) in blocks"
        :key="i"
        class="block"
        :style="{ gap: `${Math.round(s.gap * 0.55)}px` }"
      >
        <div
          v-if="s.showAr !== false && v.ar"
          class="arabic"
          :class="{ nastaliq: s.font === 'noto-nastaliq' }"
          dir="rtl"
          lang="ar"
          :style="{ fontSize: `${s.size}px`, color: resolve(s.color) }"
        >
          <WidgetLines :text="v.ar" dir="rtl" />
        </div>

        <div
          v-if="s.showTx && v.tx"
          class="transcription"
          :style="{
            fontFamily: latinFamily,
            fontSize: `${Math.round(latinSize * 0.86)}px`,
            color: resolve(s.txColor),
            textAlign: latinAlign,
          }"
        >
          <WidgetLines :text="v.tx" />
        </div>

        <div
          v-for="meal in mealsOf(v)"
          :key="meal.id"
          class="meal"
          :style="{
            fontFamily: latinFamily,
            fontSize: `${latinSize}px`,
            color: resolve(s.mealColor),
            textAlign: latinAlign,
          }"
        >
          <div
            v-if="showNames && nameAbove"
            class="meal-name above"
            :style="{ fontSize: `${nameSize}px`, color: resolve(s.refColor) }"
          >{{ meal.name }}</div>
          <WidgetLines :text="meal.text" />
          <div
            v-if="showNames && !nameAbove"
            class="meal-name below"
            :style="{ fontSize: `${nameSize}px`, color: resolve(s.refColor) }"
          >{{ meal.name }}</div>
        </div>
      </div>
    </template>

    <!-- Birleşik ve satır satır: metin zaten birleştirilmiş hâlde geliyor. -->
    <template v-else>
      <div
        v-if="s.showAr !== false && s.ar"
        class="arabic"
        :class="{ nastaliq: s.font === 'noto-nastaliq' }"
        dir="rtl"
        lang="ar"
        :style="{ fontSize: `${s.size}px`, color: resolve(s.color) }"
      >
        <WidgetLines :text="s.ar" dir="rtl" />
      </div>

      <div
        v-if="s.showTx && s.tx"
        class="transcription"
        :style="{
          fontFamily: latinFamily,
          fontSize: `${Math.round(latinSize * 0.86)}px`,
          color: resolve(s.txColor),
          textAlign: latinAlign,
        }"
      >
        <WidgetLines :text="s.tx" />
      </div>

      <div
        v-for="meal in meals"
        :key="meal.id"
        class="meal"
        :style="{
          fontFamily: latinFamily,
          fontSize: `${latinSize}px`,
          color: resolve(s.mealColor),
          textAlign: latinAlign,
        }"
      >
        <div
          v-if="showNames && nameAbove"
          class="meal-name above"
          :style="{ fontSize: `${nameSize}px`, color: resolve(s.refColor) }"
        >{{ meal.name }}</div>
        <WidgetLines :text="meal.text" />
        <div
          v-if="showNames && !nameAbove"
          class="meal-name below"
          :style="{ fontSize: `${nameSize}px`, color: resolve(s.refColor) }"
        >{{ meal.name }}</div>
      </div>
    </template>

    <div
      v-if="s.showRef !== false && s.ref"
      class="ref"
      :style="{
        fontFamily: latinFamily,
        fontSize: `${refSize}px`,
        color: resolve(s.refColor),
        textAlign: latinAlign,
      }"
    >{{ s.ref }}</div>
  </div>
</template>

<style scoped>
.w-ayet {
  display: flex;
  flex-direction: column;
}

/* Blok içi aralık, bloklar arasındakinden dar olmalı: eşit olsaydı hangi
   mealin hangi ayete ait olduğu okunmazdı. */
.block {
  display: flex;
  flex-direction: column;
}

/* Harekeler alt/üst çıkıntı yapar; satır aralığı bu yüzden geniş. */
.arabic {
  font-weight: var(--w);
  line-height: 1.8;
  word-break: normal;
}

.arabic.nastaliq {
  line-height: 2.4;
}

.transcription {
  font-weight: var(--w-soft);
  font-style: italic;
  line-height: 1.5;
  opacity: 0.78;
}

.meal {
  font-weight: var(--w-soft);
  line-height: 1.5;
  letter-spacing: calc(0.005em + var(--ls, 0em));
}

/* Mütercim adı mealin üstünde, onun ağırlığının dışında: aynı blokta iki
   ağırlık olmazsa paragrafın nerede başladığı okunmuyor.

   Büyük harfe ÇEVRİLMEZ. CSS'in `text-transform: uppercase` kuralı küçük
   `i`'yi dilin kuralına göre çevirir ve bu, klonlanmış bir DOM'dan
   rasterize edilen dışa aktarımda `lang` özniteliğine bağlı kalır:
   "Diyanet İşleri" kimi yolda "DIYANET İŞLERI" olur. Ad zaten özel isim,
   büyütmeye gerek yok. */
.meal-name {
  font-weight: 700;
  letter-spacing: 1.1px;
  opacity: 0.75;
}

.meal-name.above { margin-bottom: 4px; }
.meal-name.below { margin-top: 4px; }

.ref {
  font-weight: 600;
  letter-spacing: 1.4px;
  opacity: 0.7;
}
</style>
