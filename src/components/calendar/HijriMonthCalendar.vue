<script setup>
import { ref, computed } from 'vue'
import { hijriMonth } from '@alaturkavakitler/core'
import { holyDaysOn } from '@alaturkavakitler/core'
import { useHatimStore } from '@/stores/hatim'
import { useHijriToday } from '@/composables/useHijriToday'
import { DateTime } from 'luxon'
import { publicHolidayOn } from '@/data/publicHolidays'
import HijriMonthInfoSheet from './HijriMonthInfoSheet.vue'

// Görüntülenen aya ait taban tarih (navigasyonla değişir)
const viewDate = ref(new Date())
const info = computed(() => hijriMonth(viewDate.value))

const today = useHijriToday().value
const isCurrentMonth = computed(
  () => info.value.month === today.month && info.value.year === today.year
)

// Üstte gösterilen seçili gün — varsayılan bugün, bir güne tıklayınca değişir
const selected = ref({
  day: today.date,
  month: today.month,
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

// Seçili günün dinî günü — başlıkta rozet olarak görünür.
const selectedHoly = computed(() => holyDaysOn(selected.value.greg.toJSDate()))
const selectedHoliday = computed(() => publicHolidayOn(selected.value.greg.month, selected.value.greg.day))

// Seçili günde hangi hatimden kaç sayfa okunmuş. Takvim "o gün ne oldu"
// sorusunun sorulduğu yer; dinî gün oradaysa okuma da orada olmalı.
const hatim = useHatimStore()
const selectedReading = computed(() =>
  hatim.readOn(selected.value.greg.toISODate()))

// Izgarada nokta koymak için: ay içinde okuma yapılan günler.
const readDays = computed(() => {
  const out = {}
  for (const h of hatim.list)
    for (const day of Object.values(h.progress)) out[day] = (out[day] ?? 0) + 1
  return out
})

// Izgarada işaretlemek için: hangi hicri günlerde dinî gün var.
const holyDays = computed(() => {
  const first = info.value.firstGregorian
  const map = {}
  for (let i = 0; i < info.value.daysInMonth; i++) {
    const d = new Date(first.getFullYear(), first.getMonth(), first.getDate() + i)
    const list = holyDaysOn(d)
    if (list.length) map[i + 1] = list
  }
  return map
})

function selectDay(cell) {
  const greg = DateTime.fromJSDate(info.value.firstGregorian).plus({ days: cell.day - 1 })
  selected.value = {
    day: cell.day,
    month: info.value.month,
    monthName: info.value.monthName,
    year: info.value.year,
    greg,
  }
}

// Boş alana tıklayınca bugüne dön (görünümü ve seçimi sıfırla)
function resetToday() {
  if (justSwiped.value) return // swipe sonrası tetiklenen click'i yok say
  viewDate.value = new Date()
  selected.value = {
    day: today.date,
    month: today.month,
    monthName: today.monthName,
    year: today.year,
    greg: DateTime.now(),
  }
}

// Ay tanıtım penceresi / sheet
const infoMonth = ref(null)
function openMonthInfo(m) {
  infoMonth.value = m
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
    const greg = firstGreg.plus({ days: d - 1 })
    const holiday = publicHolidayOn(greg.month, greg.day)
    const observances = [...(holyDays.value[d] ?? []).map(h => h.name), holiday].filter(Boolean)
    list.push({
      empty: false,
      day: d,
      gregDay: greg.day,
      iso: greg.toISODate(),
      holiday,
      observances: observances.join(' · '),
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

// Swipe ile aylar arası geçiş
let touchStartX = 0
let touchStartY = 0
const justSwiped = ref(false)

function onTouchStart(e) {
  const t = e.changedTouches[0]
  touchStartX = t.clientX
  touchStartY = t.clientY
}

function onTouchEnd(e) {
  const t = e.changedTouches[0]
  const dx = t.clientX - touchStartX
  const dy = t.clientY - touchStartY
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
    justSwiped.value = true
    setTimeout(() => (justSwiped.value = false), 350)
    if (dx < 0) nextMonth()
    else prevMonth()
  }
}
</script>

<template>
  <div class="hijri-month" @click="resetToday" @touchstart.passive="onTouchStart" @touchend.passive="onTouchEnd">
    <div class="hm-divider"></div>
    <div class="hm-head">
      <div class="hm-headtop">
        <div class="hm-day">{{ String(selected.day).padStart(2, '0') }}</div>
        <img class="hm-moon" :src="moonSrc" :alt="`${selected.day}. gün ay fazı`" />
      </div>
      <div class="hm-titlerow">
        <div class="hm-title">
          <span>{{ selected.monthName }} <span class="hm-year">{{ selected.year }}</span></span>
          <button
            type="button"
            class="hm-info-btn"
            :title="`${selected.monthName} ayı hakkında bilgi`"
            :aria-label="`${selected.monthName} ayı hakkında bilgi`"
            @click.stop="openMonthInfo(selected.month || selected.monthName)"
          >
            <svg viewBox="0 0 24 24" class="info-icon" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <line x1="12" y1="10" x2="12" y2="16" />
              <circle cx="12" cy="7.25" r="0.75" fill="currentColor" stroke="none" />
            </svg>
          </button>
        </div>
        <div class="hm-weekday">{{ selectedWeekday }}</div>
      </div>
      <div class="hm-greg-line">{{ selectedGregLine }}</div>
      <!-- Dinî gün varsa tarihin hemen altında; yoksa satır hiç çizilmez. -->
      <div v-if="selectedHoly.length" class="hm-holy">
        <span v-for="h in selectedHoly" :key="h.id" class="hm-holy-tag" :class="`is-${h.kind}`">
          {{ h.name }}
        </span>
        <span v-if="selectedHoly[0].note" class="hm-holy-note">{{ selectedHoly[0].note }}</span>
      </div>

      <div v-if="selectedHoliday" class="hm-holiday">
        <span class="hm-holiday-tag">{{ selectedHoliday }}</span>
      </div>

      <!-- O gün hatimden okunanlar; okuma yoksa satır hiç çizilmez. -->
      <div v-if="selectedReading.length" class="hm-read">
        <span v-for="r in selectedReading" :key="r.id" class="hm-read-row">
          <span class="hm-read-count">{{ r.pages }} sayfa</span>
          <!-- Geri alınan sayfa o gün okunmuştur ama hatme yazılmıyor:
               gün bomboş görünmesin diye yazılıyor, onaylı okumayla
               karışmasın diye ayrı. -->
          <span v-if="r.undone" class="hm-read-undone">+{{ r.undone }} geri alındı</span>
          <span class="hm-read-niyet">{{ r.niyet }}</span>
        </span>
      </div>
    </div>

    <div class="hm-divider"></div>

    <div class="hm-cal">
      <div class="hm-nav" @click.stop>
        <button class="hm-arrow" aria-label="Önceki ay" @click="prevMonth">‹</button>
        <span class="hm-navlabel">
          <span class="hm-navmonth">
            <span>{{ info.monthName }} {{ info.year }}</span>
            <button
              type="button"
              class="hm-info-btn is-nav"
              :title="`${info.monthName} ayı hakkında bilgi`"
              :aria-label="`${info.monthName} ayı hakkında bilgi`"
              @click.stop="openMonthInfo(info.month)"
            >
              <svg viewBox="0 0 24 24" class="info-icon" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <line x1="12" y1="10" x2="12" y2="16" />
                <circle cx="12" cy="7.25" r="0.75" fill="currentColor" stroke="none" />
              </svg>
            </button>
          </span>
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
          :class="[
            cell.empty ? 'is-empty' : `is-${cell.state}`,
            { 'is-selected': !cell.empty && isSelected(cell), 'has-holy': !cell.empty && holyDays[cell.day] },
          ]"
          :title="cell.observances || null"
          :role="cell.empty ? undefined : 'button'"
          :tabindex="cell.empty ? undefined : 0"
          :aria-label="cell.empty ? undefined : [`${cell.day} ${info.monthName}`, cell.observances].filter(Boolean).join(' · ')"
          @keydown.enter="onCellClick(cell, $event)"
          @keydown.space.prevent="onCellClick(cell, $event)"
          @click="onCellClick(cell, $event)"
        >
          <template v-if="!cell.empty">
            <span class="hm-num">{{ cell.day }}</span>
            <span class="hm-greg">{{ cell.gregDay }}</span>
            <!-- Dinî gün işareti: hücre zaten dolu, nokta en az yer kaplayanı. -->
            <span v-if="holyDays[cell.day]" class="hm-dot" aria-hidden="true"></span>
            <span v-if="cell.holiday" class="hm-holiday-mark" aria-hidden="true"></span>
            <!-- Okuma işareti: noktadan ayrı bir çizgi, ikisi aynı gün
                 düşebiliyor ve aynı biçim olurlarsa ayırt edilemezler. -->
            <span v-if="readDays[cell.iso]" class="hm-readmark" aria-hidden="true"></span>
          </template>
        </span>
      </div>
    </div>

    <!-- Ay tanıtım / bilgi penceresi -->
    <HijriMonthInfoSheet
      :open="infoMonth !== null"
      :month="infoMonth"
      @close="infoMonth = null"
    />
  </div>
</template>

<style scoped>
/* ── Dinî gün ── */
.hm-readmark {
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 10px;
  height: 2px;
  border-radius: 1px;
  /* Nokta ile aynı sebep: renk HÜCRENİN zeminine göre seçilir. `canli`
     paletinde `--accent-ui` hücre zeminiyle aynı renge düşüp kayboluyor. */
  background: var(--bg);
  opacity: 0.8;
}

.hm-read {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 0.5rem;
}

.hm-read-row {
  display: flex;
  align-items: baseline;
  gap: 0.45rem;
  font-size: 0.72rem;
  color: var(--text-muted);
}

.hm-read-count {
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text);
}

.hm-read-undone {
  font-size: 0.625rem;
  letter-spacing: 0.06em;
  color: var(--accent-ui);
}

.hm-holy {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.4rem 0.5rem;
  margin-top: 0.5rem;
}

.hm-holy-tag {
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  background: var(--accent-ui);
  color: var(--bg);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* Bayram ve arefe günleri kandillerden ayrışsın: içi boş halka. */
.hm-holy-tag.is-arefe {
  background: transparent;
  color: var(--accent-ui);
  box-shadow: inset 0 0 0 1px var(--accent-ui);
}

.hm-holy-note {
  font-size: 0.6875rem;
  letter-spacing: 0.04em;
  color: var(--text-muted);
}

.hm-holiday { margin-top: 0.5rem; }

.hm-holiday-tag {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  background: rgb(104 143 177 / 0.16);
  color: var(--text);
  font-size: 0.6875rem;
  font-weight: 500;
}

/* Kare işaret, aynı güne denk gelebilen dinî gün noktasından ve
   hatim çizgisinden konumu ve biçimiyle ayrılır. */
.hm-holiday-mark {
  position: absolute;
  inset-block-start: 17%;
  inset-inline-end: 17%;
  width: 5px;
  height: 5px;
  border: 1px solid;
  border-radius: 1px;
  color: color-mix(in oklab, var(--bg) 68%, #688fb1);
}

.hm-cell.is-past:not(.has-holy) .hm-holiday-mark {
  color: color-mix(in oklab, var(--text) 68%, #688fb1);
}

.hm-cell.is-today .hm-holiday-mark {
  color: #fff;
}

/* Izgaradaki işaret: hücrenin altına küçük bir nokta. */
.hm-cell { position: relative; }

/* Dinî gün belirteci: hafif parlayan nokta.
   Renk HÜCRENİN zeminine göre seçilir, sayfanınkine göre değil. Önce
   `--accent-ui` kullanılıyordu; `canli` paletinde hem hücre zemini (`--text`)
   hem aksan siyah olduğu için belirteç tamamen kayboluyordu. */
/* Nokta HER durumda `--bg`: geleceğin hücresi dolu `--text`, bugünün hücresi
   aksan, geçmişin hücresi ise aşağıda koyulaştırılıyor — üçünde de arkada
   `--text` tonlu bir zemin var ve `--bg` ona karşı okunuyor.
   Önce geçmiş için `--text` denendi; `canli` paletinde hem `--text` hem
   hücre zemini koyu olduğu için nokta kayboluyordu. */
.hm-dot {
  --dot: var(--bg);
  position: absolute;
  left: 50%;
  bottom: 0.14rem;
  width: 4px;
  height: 4px;
  margin-left: -2px;
  border-radius: 50%;
  background: var(--dot);
  box-shadow:
    0 0 4px 1px color-mix(in srgb, var(--dot) 70%, transparent),
    0 0 9px 3px color-mix(in srgb, var(--dot) 35%, transparent);
}

/* Geçmiş günlerin hücresi neredeyse saydam (%14); dinî gün olanda zemin
   koyulaştırılır ki noktanın arkasında tanımlı bir renk olsun. */
.hm-cell.is-past.has-holy {
  background: color-mix(in srgb, var(--text) 60%, transparent);
}

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
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.hm-info-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.35rem;
  height: 1.35rem;
  padding: 0;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: color-mix(in srgb, var(--text) 4%, transparent);
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.14s ease;
  flex: 0 0 auto;
}

.hm-info-btn:hover {
  color: var(--text);
  border-color: var(--text);
  background: color-mix(in srgb, var(--text) 10%, transparent);
}

.hm-info-btn .info-icon {
  width: 0.82rem;
  height: 0.82rem;
}

.hm-info-btn.is-nav {
  width: 1.15rem;
  height: 1.15rem;
}

.hm-info-btn.is-nav .info-icon {
  width: 0.7rem;
  height: 0.7rem;
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

/* `--primary` DEĞİL `--accent-ui`: `canli` paletinde `--bg: var(--primary)`
   olduğu için bugünün zemini sayfa zeminiyle aynı renge düşüp kayboluyordu. */
.hm-cell.is-today {
  background: var(--accent-ui);
}

.hm-cell.is-today .hm-num,
.hm-cell.is-today .hm-greg {
  color: #fff;
}

/* Seçili gün (bugün değilse) — halka */
.hm-cell.is-selected:not(.is-today) {
  box-shadow: 0 0 0 2px var(--accent-ui);
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
}

.hm-navgreg {
  font-size: 0.6rem;
  font-weight: 400;
  letter-spacing: 0.04em;
  color: var(--text-muted);
}

/* ── Masaüstü: iki kolon ──
   Seçili gün başlığı solda, ay ızgarası sağda. Tek kolonda ızgara
   sayfanın tamamına yayılıyordu ve hücreler kareliğini sütun
   genişliğinden aldığı için (`aspect-ratio: 1`) 127px'lik devasa
   daireler çıkıyordu; iki kolonda hücre kendiliğinden makul boyda kalır.
   Eşik `assets/css/desktop.css`te açıklanan 1240px. */
@media (min-width: 1240px) {
  .hijri-month {
    display: grid;
    grid-template-columns: minmax(0, 0.72fr) minmax(0, 1fr);
    column-gap: 3.5rem;
    align-items: start;
  }

  /* İlk ayraç iki kolonun üstünde tek çizgi olarak kalır; ikincisi
     mobilde başlıkla takvimi ayırıyordu, yan yana dizilince anlamsız. */
  .hm-divider:first-child { grid-column: 1 / -1; }
  .hm-divider ~ .hm-divider { display: none; }

  .hm-head { grid-column: 1; }
  .hm-cal  { grid-column: 2; }

  /* Seçili gün bloğu dikey yığılır. Mobilde iki satır yan yana durur
     (`space-between`) ve orada doğrudur; dar kolonda ay fazıyla hafta
     günü sayının yanına sığar. Masaüstünde aynı kural ikisini kolonun
     iki ucuna fırlatıyor, sayfanın ortasında bağlamsız duruyorlardı. */
  .hm-headtop {
    flex-direction: column-reverse;   /* ay fazı büyük sayının üstünde */
    align-items: flex-start;
    gap: 1.1rem;
  }

  .hm-titlerow {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.4rem;
  }

  /* Izgara yine de sınırsız büyümesin: 1200px'lik kabukta sağ kolon
     ~640px, hücreler oradan sonra tekrar şişmeye başlıyor. */
  .hm-nav,
  .hm-weekrow,
  .hm-grid {
    max-width: 620px;
  }

  /* Seçili gün bloğu sayfanın başlığıdır: sol kolonun tamamı onundur ve
     yanındaki ızgara kadar ağırlık taşır. Mobil ölçüler (5.5rem sayı,
     64px ay fazı) bu kolonun içinde küçük kalıyordu. Ölçüler akışkan —
     1024px'te sol kolon ~400px, sabit değerler taşardı. */
  .hm-headtop { gap: 1.4rem; }

  .hm-day { font-size: clamp(6rem, 9vw, 10rem); }

  .hm-moon {
    width: clamp(72px, 7.5vw, 104px);
    height: clamp(72px, 7.5vw, 104px);
  }

  .hm-title { font-size: clamp(1.75rem, 2.2vw, 2.5rem); }

  .hm-weekday { font-size: clamp(1.25rem, 1.6vw, 1.75rem); }

  .hm-greg-line {
    font-size: 0.85rem;
    margin-top: 0.6rem;
  }

  .hm-holy { margin-top: 0.9rem; }

  .hm-holy-tag,
  .hm-holy-note { font-size: 0.8125rem; }
}
</style>
