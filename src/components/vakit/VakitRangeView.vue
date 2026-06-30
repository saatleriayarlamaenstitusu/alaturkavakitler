<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { DateTime } from 'luxon'

const appStore = useAppStore()
const now = ref(DateTime.now())
let intervalId = null

const KERAHAT_MINUTES = 45
const MINUTES_IN_DAY = 1440

function minutesBetween(start, end) {
  return end.diff(start, 'minutes').minutes
}

function toPercent(minutes) {
  return (minutes * (100 / MINUTES_IN_DAY)) + '%'
}

const kerahatWidth = toPercent(KERAHAT_MINUTES)

const vakitItems = computed(() => {
  const v = appStore.vakit
  if (!v) return []

  return [
    ...Object.values(v),
    { ...Object.values(v)[0], _overflow: true },
  ].map((item) => {
    if (item._overflow) return { ...item, width: '0' }

    let width
    if (item.key === 'yatsi') {
      width = toPercent(minutesBetween(item.valueDateObj, v['imsak'].valueDateObj2))
    } else {
      width = toPercent(minutesBetween(item.valueDateObj, v[item.next].valueDateObj))
    }

    return { ...item, width }
  })
})

const nowPercent = computed(() => {
  const v = appStore.vakit
  if (!v?.imsak?.valueDateObj) return null

  const imsakToday = v.imsak.valueDateObj
  const imsakTomorrow = v.imsak.valueDateObj2 ?? imsakToday.plus({ days: 1 })

  const totalMs = imsakTomorrow.toMillis() - imsakToday.toMillis()
  const elapsedMs = now.value.toMillis() - imsakToday.toMillis()
  const pct = (elapsedMs / totalMs) * 100

  if (pct < 0) return 0
  if (pct > 100) return 100
  return pct
})

onMounted(() => {
  intervalId = setInterval(() => { now.value = DateTime.now() }, 60000)
})

onUnmounted(() => clearInterval(intervalId))
</script>

<template>
  <div v-if="appStore.vakit" class="vakit-range-view">
    <div
      v-for="item in vakitItems"
      :key="item.key + (item._overflow ? '-end' : '')"
      class="vakit-segment"
      :class="[item.key, { active: appStore.currentVakit === item.key }]"
      :style="{ width: item.width }"
    >
      <span class="label">{{ item.name }}</span>

      <template v-if="item.key === 'gunes'">
        <span class="kerahat kerahat--left" :style="{ width: kerahatWidth }"></span>
        <span class="kerahat kerahat--right" :style="{ width: kerahatWidth }"></span>
      </template>

      <template v-if="item.key === 'ikindi'">
        <span class="kerahat kerahat--right" :style="{ width: kerahatWidth }"></span>
      </template>
    </div>

    <div class="ticks" aria-hidden="true"></div>

    <div
      v-if="nowPercent !== null"
      class="now-line"
      :style="{ left: nowPercent + '%' }"
    />
  </div>
</template>

<style scoped>
.vakit-range-view {
  display: flex;
  color: var(--text);
  position: relative;
}

.vakit-segment {
  display: block;
  background: var(--primary);
  height: 75px;
  position: relative;
  margin-top: 75px;
  opacity: 0.35;
}

.vakit-segment:last-child {
  width: 0 !important;
}

.vakit-segment::before {
  content: "";
  position: absolute;
  display: block;
  width: 1px;
  height: 130%;
  left: 0;
  bottom: 0;
  background: var(--text);
  opacity: 0.4;
}

.label {
  position: absolute;
  top: -40%;
  left: -0.5em;
  transform: rotate(270deg);
  transform-origin: 0 0;
  font-size: 0.75em;
  font-weight: 300;
}

.vakit-segment.active,
.vakit-segment.active::before,
.vakit-segment.active + .vakit-segment::before,
.vakit-segment.active + .vakit-segment .label {
  opacity: 1;
}

.vakit-segment.active .label {
  color: rgb(22, 163, 74);
  font-weight: 600;
}

.kerahat {
  position: absolute;
  bottom: 0;
  height: 10px;
  z-index: 10;
  background: #991b1b;
  opacity: 0.5;
}

.kerahat--left  { left: 0; }
.kerahat--right { right: 0; }

/* Radyo kadranı tarzı ince çizgi aralıkları (minör + her 5'te bir majör) */
.ticks {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 75px;
  z-index: 5;
  pointer-events: none;
  background-image:
    repeating-linear-gradient(90deg, color-mix(in srgb, var(--text) 38%, transparent) 0 1px, transparent 1px 30px),
    repeating-linear-gradient(90deg, color-mix(in srgb, var(--text) 18%, transparent) 0 1px, transparent 1px 6px);
  background-repeat: repeat-x, repeat-x;
  background-position: bottom, bottom;
  background-size: 30px 18px, 6px 10px;
}

.now-line {
  position: absolute;
  bottom: 0;
  height: 75px;
  width: 1.5px;
  background: #e53e3e;
  z-index: 20;
  pointer-events: none;
  box-shadow: 0 0 4px rgba(229, 62, 62, 0.6);
}
</style>
