<script setup>
import { ref, computed } from 'vue'
import { hijriMonth, nowHijri } from '@/utils/hijri'
import { DateTime } from 'luxon'

// Görüntülenen aya ait taban tarih (navigasyonla değişir)
const viewDate = ref(new Date())
const info = computed(() => hijriMonth(viewDate.value))

const today = nowHijri('object')
const isCurrentMonth = computed(
  () => info.value.month === today.month && info.value.year === today.year
)

// Üstte gösterilen seçili gün — varsayılan bugün, bir güne tıklayınca değişir
const selected = ref({
  day: today.date,
  monthName: today.monthName,
  year: today.year,
  greg: DateTime.now(),
})
const selectedWeekday = computed(() => selected.value.greg.setLocale('tr').toFormat('cccc'))
const selectedGregLine = computed(() =>
  selected.value.greg.setLocale('tr').toFormat('d LLLL yyyy')
)
// Seçili hicri güne göre ay fazı görseli (görseller 1–29; 30. gün 29'a sabitlenir)
const moonSrc = computed(() => `/Icons/moon/${Math.min(selected.value.day, 29)}.svg`)

function selectDay(cell) {
  const greg = DateTime.fromJSDate(info.value.firstGregorian).plus({ days: cell.day - 1 })
  selected.value = {
    day: cell.day,
    monthName: info.value.monthName,
    year: info.value.year,
    greg,
  }
}

// Boş alana tıklayınca bugüne dön (görünümü ve seçimi sıfırla)
function resetToday() {
  viewDate.value = new Date()
  selected.value = {
    day: today.date,
    monthName: today.monthName,
    year: today.year,
    greg: DateTime.now(),
  }
}

function onCellClick(cell, event) {
  if (cell.empty) return // boş hücre: yukarı baloncuklanıp bugüne dönsün
  event.stopPropagation()
  selectDay(cell)
}

function isSelected(cell) {
  return (
    selected.value.monthName === info.value.monthName &&
    selected.value.year === info.value.year &&
    selected.value.day === cell.day
  )
}

// Bu hicri ayın kapsadığı miladi ay(lar) — minimal gösterim
const gregSpan = computed(() => {
  const start = DateTime.fromJSDate(info.value.firstGregorian).setLocale('tr')
  const end = start.plus({ days: info.value.daysInMonth - 1 })
  if (start.month === end.month) return `${start.monthLong} ${start.year}`
  if (start.year === end.year) return `${start.monthLong} – ${end.monthLong} ${end.year}`
  return `${start.monthLong} ${start.year} – ${end.monthLong} ${end.year}`
})

const weekLabels = ['P', 'S', 'Ç', 'P', 'C', 'C', 'P']

const cells = computed(() => {
  const { startOffset, daysInMonth, firstGregorian } = info.value
  const firstGreg = DateTime.fromJSDate(firstGregorian)
  const list = []
  for (let i = 0; i < startOffset; i++) {
    list.push({ empty: true, key: `e${i}` })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = isCurrentMonth.value && d === today.date
    list.push({
      empty: false,
      day: d,
      gregDay: firstGreg.plus({ days: d - 1 }).day,
      key: `d${d}`,
      state: isToday ? 'today' : isCurrentMonth.value && d < today.date ? 'past' : 'future',
    })
  }
  return list
})

function prevMonth() {
  const first = DateTime.fromJSDate(info.value.firstGregorian)
  viewDate.value = first.minus({ days: 1 }).toJSDate() // önceki hicri ayın son günü
}

function nextMonth() {
  const first = DateTime.fromJSDate(info.value.firstGregorian)
  viewDate.value = first.plus({ days: info.value.daysInMonth }).toJSDate() // sonraki ayın 1'i
}
</script>

<template>
  <div class="hijri-month" @click="resetToday">
    <div class="hm-divider"></div>
    <div class="hm-head">
      <div class="hm-headtop">
        <div class="hm-day">{{ String(selected.day).padStart(2, '0') }}</div>
        <img class="hm-moon" :src="moonSrc" :alt="`${selected.day}. gün ay fazı`" />
      </div>
      <div class="hm-titlerow">
        <div class="hm-title">{{ selected.monthName }} <span class="hm-year">{{ selected.year }}</span></div>
        <div class="hm-weekday">{{ selectedWeekday }}</div>
      </div>
      <div class="hm-greg-line">{{ selectedGregLine }}</div>
    </div>

    <div class="hm-divider"></div>

    <div class="hm-cal">
      <div class="hm-nav" @click.stop>
        <button class="hm-arrow" aria-label="Önceki ay" @click="prevMonth">‹</button>
        <span class="hm-navlabel">
          <span class="hm-navmonth">{{ info.monthName }} {{ info.year }}</span>
          <span class="hm-navgreg">{{ gregSpan }}</span>
        </span>
        <button class="hm-arrow" aria-label="Sonraki ay" @click="nextMonth">›</button>
      </div>

      <div class="hm-weekrow">
        <span v-for="(w, i) in weekLabels" :key="i" class="hm-weeklabel">{{ w }}</span>
      </div>

      <div class="hm-grid">
        <span
          v-for="cell in cells"
          :key="cell.key"
          class="hm-cell"
          :class="[cell.empty ? 'is-empty' : `is-${cell.state}`, { 'is-selected': !cell.empty && isSelected(cell) }]"
          @click="onCellClick(cell, $event)"
        >
          <template v-if="!cell.empty">
            <span class="hm-num">{{ cell.day }}</span>
            <span class="hm-greg">{{ cell.gregDay }}</span>
          </template>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hijri-month {

  display: flex;
  flex-direction: column;
  min-height: 100%;
}

/* Başlık */
.hm-head {
  margin-bottom: 1.25rem;
  margin-top: 1.25rem;
}

/* Üst bölüm ile takvim arasındaki çizgi */
.hm-divider {
  height: 1px;
  width: 100%;
  background: var(--border);
}

/* Takvim bloğu — sayfanın altına yaslı */
.hm-cal {
  margin-top: auto;
  padding-top: 1.5rem;
}

.hm-headtop {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1em;
}

.hm-titlerow {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
}

.hm-weekday {
  font-family: var(--font2);
  font-size: 1.5rem;
  font-weight: 400;
  line-height: 1;
  color: var(--text-muted);
  text-transform: capitalize;
}

.hm-day {
  font-family: var(--font2);
  font-size: 5.5rem;
  font-weight: 700;
  line-height: 0.85;
  color: var(--text);
}

.hm-moon {
  flex: 0 0 auto;
  width: 64px;
  height: 64px;
  background: #000;
  border-radius: 50%;
  border: 1px solid var(--border);
}

.hm-title {
  font-family: var(--font2);
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.01em;
  color: var(--text);
  margin-top: 0.4rem;
}

.hm-year {
  font-weight: 700;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

.hm-greg-line {
  font-size: 0.7rem;
  font-weight: 400;
  letter-spacing: 0.04em;
  color: var(--text-muted);
  margin-top: 0.35rem;
}

/* Hafta + grid */
.hm-weekrow,
.hm-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.55rem;
}

.hm-weekrow {
  margin-bottom: 0.55rem;
}

.hm-weeklabel {
  text-align: center;
  font-size: 0.6rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}

/* Sayı içeren yuvarlaklar */
.hm-cell {
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--text);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  line-height: 1;
  cursor: pointer;
}

.hm-cell.is-empty {
  cursor: default;
}

.hm-num {
  font-size: 1rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--bg);
}

.hm-greg {
  font-size: 0.5rem;
  font-weight: 400;
  font-variant-numeric: tabular-nums;
  color: color-mix(in srgb, var(--bg) 55%, transparent);
  margin-top: 1px;
}

.hm-cell.is-empty {
  background: transparent;
}

/* Bugünden sonrakiler dolu/beyaz (varsayılan hm-num/hm-greg renkleri geçerli) */
.hm-cell.is-future {
  background: var(--text);
}

/* Bugünden öncekiler soluk */
.hm-cell.is-past {
  background: color-mix(in srgb, var(--text) 14%, transparent);
}

.hm-cell.is-past .hm-num {
  color: var(--text-muted);
}

.hm-cell.is-past .hm-greg {
  color: color-mix(in srgb, var(--text) 35%, transparent);
}

.hm-cell.is-today {
  background: var(--primary);
}

.hm-cell.is-today .hm-num,
.hm-cell.is-today .hm-greg {
  color: #fff;
}

/* Seçili gün (bugün değilse) — halka */
.hm-cell.is-selected:not(.is-today) {
  box-shadow: 0 0 0 2px var(--primary);
}

/* Ay navigasyonu — takvimin üstünde, minik ay adı + ok tuşları */
.hm-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
  margin-bottom: 1rem;
}

.hm-arrow {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 1.25rem;
  line-height: 1;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  transition: color 0.15s ease;
}

.hm-arrow:hover {
  color: var(--text);
}

.hm-navlabel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  min-width: 9rem;
  text-align: center;
}

.hm-navmonth {
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text);
}

.hm-navgreg {
  font-size: 0.6rem;
  font-weight: 400;
  letter-spacing: 0.04em;
  color: var(--text-muted);
}
</style>
