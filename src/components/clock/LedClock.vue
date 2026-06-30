<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { calculateAlaturka } from '@/utils/clock'
import { DateTime } from 'luxon'

const appStore = useAppStore()
const now = ref(DateTime.now())
let intervalId = null

const alaturkaTime = computed(() => calculateAlaturka(now.value, appStore.vakitler))
const normalTime = computed(() => now.value.setLocale('tr').toLocaleString(DateTime.TIME_SIMPLE))

// 5×7 nokta-matris font (rakamlar + ayraç + tire)
const FONT = {
  '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  '3': ['11111', '00010', '00100', '00010', '00001', '10001', '01110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  '6': ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
  ':': ['0', '0', '1', '0', '1', '0', '0'],
  '-': ['00000', '00000', '00000', '11111', '00000', '00000', '00000'],
}

const PATTERN_HEIGHT = 7

// Saat dizgisini sütun-dizilerine çevir (karakterler arası 1 sütun boşluk)
const patternColumns = computed(() => {
  const chars = alaturkaTime.value.split('')
  const cols = [] // her eleman 7 hücrelik bir sütun
  chars.forEach((ch, idx) => {
    const pat = FONT[ch] ?? FONT['-']
    const w = pat[0].length
    for (let c = 0; c < w; c++) {
      const col = []
      for (let r = 0; r < PATTERN_HEIGHT; r++) col.push(pat[r][c] === '1' ? 1 : 0)
      cols.push(col)
    }
    if (idx < chars.length - 1) cols.push(new Array(PATTERN_HEIGHT).fill(0))
  })
  return cols
})

// Grid boyutu — alanı dolduracak şekilde ResizeObserver ile hesaplanır
const gridEl = ref(null)
const cols = ref(0)
const rows = ref(0)
const dot = ref(8)
const gap = ref(4)
let ro = null

function recalc() {
  const el = gridEl.value
  if (!el) return
  const w = el.clientWidth
  const h = el.clientHeight
  if (!w || !h) return

  // Saat (~25 sütun) genişliğin ~%88'ini kaplasın → hücre boyutu
  const TARGET_COLS = 28
  let cell = Math.round(w / TARGET_COLS)
  cell = Math.max(7, Math.min(22, cell))

  dot.value = Math.round(cell * 0.62)
  gap.value = cell - dot.value
  cols.value = Math.max(1, Math.floor((w + gap.value) / cell))
  rows.value = Math.max(PATTERN_HEIGHT, Math.floor((h + gap.value) / cell))
}

// Tüm alanı kaplayan grid; saat deseni sol-alta yaslı yakılır
const grid = computed(() => {
  const R = rows.value
  const C = cols.value
  if (!R || !C) return []

  const out = Array.from({ length: R }, () => new Array(C).fill(0))
  const pcols = patternColumns.value
  const PAD = 2 // alt-sol kenardan 2 dot boşluk
  const rowStart = Math.max(0, R - PATTERN_HEIGHT - PAD) // alta yasla (+pad)
  const colStart = Math.min(PAD, Math.max(0, C - pcols.length)) // sola yasla (+pad)

  for (let c = 0; c < pcols.length && colStart + c < C; c++) {
    for (let r = 0; r < PATTERN_HEIGHT; r++) {
      if (rowStart + r < R) out[rowStart + r][colStart + c] = pcols[c][r]
    }
  }
  return out
})

onMounted(() => {
  intervalId = setInterval(() => { now.value = DateTime.now() }, 1000)
  recalc()
  ro = new ResizeObserver(recalc)
  if (gridEl.value) ro.observe(gridEl.value)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
  ro?.disconnect()
})
</script>

<template>
  <div class="led-clock">
    <div class="led-head">
      <span class="clock-label">Alaturka</span>
      <span class="normal-clock">{{ normalTime }}</span>
    </div>

    <div
      ref="gridEl"
      class="led-matrix"
      role="img"
      :aria-label="`Alaturka saat ${alaturkaTime}`"
      :style="{ '--dot': dot + 'px', '--gap': gap + 'px' }"
    >
      <div v-for="(row, r) in grid" :key="r" class="led-row">
        <span
          v-for="(cell, c) in row"
          :key="c"
          class="led-dot"
          :class="{ on: cell }"
        ></span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.led-clock {
  display: flex;
  flex-direction: column;
}

.led-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.clock-label {
  font-size: 0.6rem;
  font-weight: 300;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.led-matrix {
  /* Kesin yükseklik — flex/yüzde zinciri çökmesin, dot grid alanı dolsun */
  height: clamp(240px, 46vh, 520px);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: var(--gap);
  overflow: hidden;
}

.led-row {
  display: flex;
  gap: var(--gap);
}

.led-dot {
  width: var(--dot);
  height: var(--dot);
  border-radius: 50%;
  background: var(--text);
  opacity: 0.08;
  transition: opacity 0.25s ease;
}

.led-dot.on {
  opacity: 1;
}

.normal-clock {
  font-size: 1.5rem;
  font-weight: 300;
  font-family: var(--font2);
  color: var(--text);
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
</style>
