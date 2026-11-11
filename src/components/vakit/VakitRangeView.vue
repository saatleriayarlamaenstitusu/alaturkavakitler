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
  /* Şeridin boyu tek yerden sürülür: masaüstünde sağ kolona girince
     ince bir bant orada yapayalnız kalıyor, yükseklik oradan büyütülüyor.
     Mobildeki değer değişmedi. */
  --range-h: 75px;
  /* Bandın üstündeki boşluk döndürülmüş etiketler içindir. Mobilde bandın
     boyuyla aynı; masaüstünde bant büyüyünce aynı oranda büyütülürse
     şeridin yarısı boş kalıyor, bu yüzden ayrı bir değişken. */
  --range-gap: var(--range-h);
  display: flex;
  color: var(--text);
  position: relative;
}

.vakit-segment {
  display: block;
  background: var(--primary);
  height: var(--range-h);
  position: relative;
  margin-top: var(--range-gap);
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
  height: var(--range-h);
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
  height: var(--range-h);
  width: 1.5px;
  background: #e53e3e;
  z-index: 20;
  pointer-events: none;
  box-shadow: 0 0 4px rgba(229, 62, 62, 0.6);
}

/* ── Masaüstü ──
   Şerit boydan boya uzanır; boyu `--range-h` ile verilir. Etiketler bandın
   değil ÜSTÜNDEKİ BOŞLUĞUN tepesine göre konumlanır: `top: -40%` bant
   büyüdükçe etiketi boşluğun dışına taşıyordu. */
@media (min-width: 1240px) {
  /* Ayraç çizgisi bandın boyuna ORANLA uzuyor (`height: 130%`): mobilde
     bandın üstüne 22px çıkan çizgi, 180px'lik bantta 60px çıkıp etiket
     boşluğunu boydan boya geçiyor ve döndürülmüş adın ortasından
     geçiyordu. Masaüstünde sabit bir pay yeter. */
  .vakit-segment::before { height: calc(100% + 1rem); }

  /* Etiket çizginin SAĞINA kaydırılır. `rotate(270deg)` +
     `transform-origin: 0 0` ile metin kutusu satır yüksekliği kadar SAĞA
     taşar; `left` negatifken kutu çizgiyi içine alıyordu. */
  .label {
    top: calc(3.5rem - var(--range-gap));
    left: 0.3rem;
    font-size: 0.8125rem;
  }
}
</style>
