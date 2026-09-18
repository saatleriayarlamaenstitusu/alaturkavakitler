<script setup>
import { computed } from 'vue'
import { useWidgetFont } from './useWidgetFont'
import { stripHarakat } from '@/data/arabicPhrases'

// Hazır Arapça metin + isteğe bağlı Latin alt satırı (okunuş ya da meal).
// Seçici metni doldurur; sonrasında iki satır da serbestçe düzenlenebilir.
const props = defineProps({
  settings: { type: Object, default: () => ({}) },
  accent: { type: String, default: '#ae002e' },
})

const s = computed(() => props.settings)
const color = computed(() => (s.value.color === 'auto' ? props.accent : s.value.color))
const subColor = computed(() => (s.value.subColor === 'auto' ? props.accent : s.value.subColor))
const font = useWidgetFont(s, 400)

// Nastaliq eğik ve derin iner; nesih/kufi için yeterli olan satır aralığı
// burada satırların birbirine girmesine yol açıyor.
const isNastaliq = computed(() => s.value.font === 'noto-nastaliq')

// Metin her zaman harekeli saklanır; harekesiz görünüm buradan türetilir,
// böylece anahtar geri alınabilir ve elle girilen metinlerde de çalışır.
const shown = computed(() =>
  s.value.harakat === false ? stripHarakat(s.value.text) : s.value.text
)
</script>

<template>
  <div class="w-phrase" :style="{ ...font, color, textAlign: s.align }">
    <div
      class="arabic"
      :class="{ nastaliq: isNastaliq, bare: s.harakat === false }"
      dir="rtl"
      :style="{ fontSize: `${s.size}px` }"
    >{{ shown }}</div>
    <div
      v-if="s.sub"
      class="sub"
      dir="auto"
      :style="{ color: subColor, fontSize: `${Math.round(s.size * 0.26)}px` }"
    >{{ s.sub }}</div>
  </div>
</template>

<style scoped>
.w-phrase {
  max-width: 940px;
}

/* Harekeler alt/üst çıkıntı yaptığı için satır aralığı bilerek geniş. */
.arabic {
  font-weight: var(--w);
  line-height: 1.75;
  word-break: normal;
}

/* Harekesizde alt/üst çıkıntı kalmadığı için satır aralığı sıkışabilir. */
.arabic.bare {
  line-height: 1.45;
}

.arabic.nastaliq {
  line-height: 2.35;
}

.sub {
  margin-top: 18px;
  font-family: 'Inter Tight', sans-serif;
  font-weight: 500;
  font-style: normal;
  letter-spacing: calc(0.08em + var(--ls, 0em));
  opacity: 0.72;
  line-height: 1.35;
}
</style>
