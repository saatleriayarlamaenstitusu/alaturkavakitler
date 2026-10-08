<script setup>
import { computed } from 'vue'
import { getFont, nearestWeight } from '@/data/shareFonts'
import { monthGrid, WEEKDAYS_SHORT, WEEKDAYS_NARROW } from '@/utils/calendarGrid'
import { holyDaysOn } from '@/data/holyDays'
import { localizeNumerals } from '@/utils/numerals'
import WidgetLines from './WidgetLines.vue'

const props = defineProps({
  settings: { type: Object, default: () => ({}) },
  accent: { type: String, default: '#ae002e' },
})

const s = computed(() => props.settings)

// 'auto' → vakit rengi, 'tint' → metin renginin soluk tonu (gün zemini için
// okunur varsayılan; düz beyaz zemine beyaz yazı görünmüyordu).
const resolve = (v) => {
  if (v === 'auto') return props.accent
  if (v === 'tint') return 'color-mix(in srgb, currentColor 16%, transparent)'
  return v
}

const color = computed(() => resolve(s.value.color))
const todayColor = computed(() => resolve(s.value.todayColor))
const weekendColor = computed(() => resolve(s.value.weekendColor))
const dayBgColor = computed(() => resolve(s.value.dayBgColor))

const grid = computed(() => monthGrid(s.value.system, Number(s.value.year), Number(s.value.month)))

// Tek satır: ayın tamamı yan yana. Öndeki boş hücreler atılır, gün adı
// her hücrenin kendi üstünde durur (sabit bir başlık satırı anlamsız olurdu).
const isRow = computed(() => s.value.layout === 'row')
// Dinî günler hücrenin `iso` tarihinden bulunur; ızgara mı tek satır mı
// olduğundan bağımsız çalışır.
const holyOf = (cell) => (cell?.iso ? holyDaysOn(new Date(cell.iso)) : [])
const hasHoly = (cell) => s.value.holyDays && holyOf(cell).length > 0

// Takvimin altındaki liste: ayın dinî günleri, gün numarasıyla birlikte.
// Izgaradaki elmas işareti "bir şey var" der; ad burada okunur.
const holyList = computed(() => {
  if (!s.value.holyDays || !s.value.holyList) return []
  const out = []
  for (const cell of grid.value.cells) {
    if (!cell) continue
    for (const h of holyOf(cell)) out.push({ day: cell.day, name: h.name, id: `${cell.day}-${h.id}` })
  }
  return out
})

const cells = computed(() =>
  isRow.value ? grid.value.cells.filter(Boolean) : grid.value.cells
)

// Hafta sonu günün kendi tarihinden bulunur; tek satır düzeninde öndeki
// boşluklar atıldığı için dizideki sıra sütuna karşılık gelmiyor.
const dowOf = (iso) => (new Date(iso).getDay() + 6) % 7   // Pazartesi = 0
const isWeekendDay = (cell) => dowOf(cell.iso) >= 5
const isWeekendCol = (col) => col >= 5

function fontStyle(fontId, weight) {
  const font = getFont(fontId)
  return {
    fontFamily: font.family,
    fontWeight: nearestWeight(font.id, Number(weight) || 400),
  }
}

const titleStyle = computed(() => ({
  ...fontStyle(s.value.titleFont, s.value.titleWeight),
  fontSize: `${s.value.titleSize}px`,
  textAlign: s.value.titleAlign,
}))

const weekdayStyle = computed(() => ({
  ...fontStyle(s.value.weekdayFont, s.value.weekdayWeight),
  fontSize: `${s.value.weekdaySize}px`,
}))

const dayStyle = computed(() => ({
  ...fontStyle(s.value.dayFont, s.value.dayWeight),
  fontSize: `${s.value.daySize}px`,
}))

const altStyle = computed(() => ({
  ...fontStyle(s.value.dayFont, 400),
  fontSize: `${Math.round(s.value.daySize * 0.45)}px`,
}))

// Hücre yüksekliği sayı boyutuna bağlı: sabit kare hücre, sayı küçülünce
// ölü boşluk bırakıyordu. `dayBg` açıkken zemin kare/daire olabilsin diye
// genişlik de aynı ölçüye sabitlenir.
const box = computed(() => Math.round(s.value.daySize * (s.value.rowHeight ?? 2.5)))

// Zemin hücrenin tamamını değil, ortasındaki KARE kutuyu boyar — hücre
// genişliği sütuna göre değişiyor, tamamı boyansa daire elips olurdu.
// Izgarada kutu sabit kare; tek satırda sütun genişliğine oturur (31 gün
// yan yana geldiğinde sabit ölçü taşardı).
// Nokta boyutu gün sayısıyla ölçeklenir, küçük takvimde orantısız kalmasın.
const holyStyle = computed(() => ({
  width: `${Math.max(4, Math.round(s.value.daySize * 0.16))}px`,
  height: `${Math.max(4, Math.round(s.value.daySize * 0.16))}px`,
  background: resolve(s.value.holyColor),
}))

// Liste tipografisi gün sayılarını izler ama bir tık küçük: takvimin altında
// ikincil bilgi, başlıkla yarışmamalı.
const listStyle = computed(() => {
  const f = getFont(s.value.dayFont)
  return {
    fontFamily: f.family,
    fontWeight: nearestWeight(s.value.dayFont, s.value.dayWeight),
    fontSize: `${Math.round(s.value.daySize * 0.62)}px`,
    marginTop: `${Math.round(s.value.daySize * 0.5)}px`,
  }
})

const boxStyle = computed(() => (isRow.value
  ? { width: '100%', aspectRatio: '1', borderRadius: `${s.value.dayRadius}%` }
  : { width: `${box.value}px`, height: `${box.value}px`, borderRadius: `${s.value.dayRadius}%` }))

function cellStyle(cell) {
  if (!cell) return isRow.value ? {} : { minHeight: `${box.value}px` }
  const today = cell.today && s.value.highlightToday
  const weekend = s.value.weekendOn && isWeekendDay(cell)

  const style = isRow.value ? {} : { minHeight: `${box.value}px` }
  // Bugün hafta sonuna denk gelebiliyor: zemin doluyken hafta sonu rengi
  // zeminle aynı tona düşüp sayıyı görünmez yapıyordu. Zemin varsa vurguyu
  // zemin taşır, yazı varsayılan renginde kalır.
  if (today) {
    if (!s.value.dayBg) style.color = todayColor.value
  } else if (weekend) {
    style.color = weekendColor.value
  }
  return style
}

function boxFill(cell) {
  if (!s.value.dayBg) return null
  const today = cell.today && s.value.highlightToday
  return { ...boxStyle.value, background: today ? todayColor.value : dayBgColor.value }
}

// Gün zemini açıkken satırlar dikeyde birbirine değiyordu; hafta aralığı
// bunu açar. Tek satır düzeninde satır kavramı yok, uygulanmaz.
const gridStyle = computed(() => (isRow.value ? null : { rowGap: `${s.value.rowGap ?? 0}px` }))

const weekdays = computed(() =>
  s.value.weekdayStyle === 'narrow' ? WEEKDAYS_NARROW : WEEKDAYS_SHORT
)

// Tek satırda gün adı hücrenin kendi gününden gelir.
const weekdayFor = (cell) => weekdays.value[dowOf(cell.iso)]

const num = (v) => localizeNumerals(v, s.value.numerals)

const title = computed(() => {
  const t = s.value.title?.trim()
  return t || num(grid.value.title)
})
</script>

<template>
  <div class="w-calendar" :class="{ 'is-row': isRow }" :style="{ color, width: `${s.width}px` }">
    <div v-if="title" class="cal-title" :style="titleStyle"><WidgetLines :text="title" /></div>

    <div v-if="s.showWeekdays && !isRow" class="cal-week" :style="weekdayStyle">
      <span
        v-for="(w, i) in weekdays"
        :key="i"
        class="cal-wd"
        :style="s.weekendOn && isWeekendCol(i) ? { color: weekendColor } : null"
      >{{ w }}</span>
    </div>

    <div class="cal-grid" :style="gridStyle">
      <div
        v-for="(cell, i) in cells"
        :key="i"
        class="cal-cell"
        :class="{ empty: !cell, today: cell?.today && s.highlightToday }"
        :style="cellStyle(cell)"
      >
        <template v-if="cell">
          <span
            v-if="s.showWeekdays && isRow"
            class="cal-wd"
            :style="weekdayStyle"
          >{{ weekdayFor(cell) }}</span>

          <span class="cal-box" :class="{ filled: s.dayBg }" :style="boxFill(cell)">
            <span class="cal-day" :style="dayStyle">{{ num(cell.day) }}</span>
            <span v-if="s.showAlt" class="cal-alt" :style="altStyle">{{ num(cell.alt) }}</span>
            <!-- Dinî gün işareti: dolgulu <circle> yerine <span>, export
                 kuralına uygun ve ölçeklenebilir. -->
            <span v-if="hasHoly(cell)" class="cal-holy" :style="holyStyle"></span>
          </span>
        </template>
      </div>
    </div>

    <!-- Dinî günler listesi: ad + hangi gün. Izgarada yalnızca işaret var. -->
    <div v-if="holyList.length" class="cal-list" :style="listStyle">
      <div v-for="item in holyList" :key="item.id" class="cal-list-row">
        <span class="cal-list-day" :style="{ color: resolve(s.holyColor) }">{{ num(item.day) }}</span>
        <span class="cal-list-name">{{ item.name }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Ölçüler tuval birimindedir (1080px genişlikte çıktı pikseli). */
.w-calendar {
  line-height: 1;
}

.cal-title {
  letter-spacing: -0.01em;
  margin-bottom: 0.55em;
}

.cal-week,
.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.cal-week {
  margin-bottom: 0.5em;
  opacity: 0.55;
}

.cal-wd {
  text-align: center;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.cal-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.12em;
  font-variant-numeric: tabular-nums;
}

.cal-cell.empty { visibility: hidden; }

/* Gün zemini: hücre ortasında kare kutu — daire gerçekten daire olsun. */
.cal-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.12em;
}

.cal-day { line-height: 1; }

/* Elmas belirteç: bugünün dolu hücresinden ve gün zemininden ayrışsın. */
/* ── Dinî gün listesi ── */
.cal-list {
  display: flex;
  flex-direction: column;
  gap: 0.28em;
  line-height: 1.25;
}

.cal-list-row {
  display: flex;
  align-items: baseline;
  gap: 0.6em;
}

.cal-list-day {
  flex-shrink: 0;
  min-width: 1.6em;
  text-align: right;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
}

.cal-list-name { opacity: 0.82; }

.cal-holy {
  position: absolute;
  left: 50%;
  bottom: -0.12em;
  transform: translateX(-50%) rotate(45deg);
}

.cal-cell { position: relative; }

.cal-alt {
  line-height: 1;
  opacity: 0.5;
}

.cal-cell.today .cal-alt { opacity: 0.75; }

/* ── Tek satır: ayın tamamı yan yana ── */
.is-row .cal-grid {
  display: flex;
  gap: 0;
}

.is-row .cal-cell {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.is-row .cal-box { width: 100%; }

.is-row .cal-wd {
  opacity: 0.5;
  margin-bottom: 0.15em;
}
</style>
