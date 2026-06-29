<script setup>
import { ref, computed } from 'vue'
import { nowHijri } from '@/utils/hijri'
import { DateTime } from 'luxon'

const now = DateTime.now().setLocale('tr')
const hijri = ref(nowHijri('object'))

const moonSrc = computed(() => `/Icons/moon/${hijri.value.date}.svg`)
const miladiLine = computed(() =>
  `${now.day} ${now.monthLong} ${now.year} · ${now.weekdayLong}`
)
</script>

<template>
  <div class="calendar-widget">
    <div class="hijri-day">{{ String(hijri.date).padStart(2, '0') }}</div>

    <div class="cal-info">
      <div class="hijri-line">
        <span class="cal-label">Hicri</span>
        <span class="hijri-date">{{ hijri.monthName }} {{ hijri.year }}</span>
      </div>

      <div class="divider"></div>

      <div class="miladi-line">{{ miladiLine }}</div>
    </div>

    <div class="moon">
      <img :src="moonSrc" :alt="`${hijri.date}. gün ay`" />
    </div>
  </div>
</template>

<style scoped>
.calendar-widget {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--text);
  padding: 0 1.25rem;
}

.hijri-day {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  border: 1.5px solid var(--primary);
  border-radius: 6px;
  color: var(--primary);
  font-family: var(--font2);
  font-size: 2.4rem;
  font-weight: 700;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.cal-info {
  flex: 1;
  min-width: 0;
}

.hijri-line {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.cal-label {
  font-size: 0.55rem;
  font-weight: 400;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.hijri-date {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.01em;
}

.divider {
  height: 1px;
  background: var(--border);
  margin: 0.5rem 0;
}

.miladi-line {
  font-size: 0.8rem;
  font-weight: 400;
  letter-spacing: 0.02em;
  color: var(--text-muted);
}

.moon {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 0.5rem;
}

.moon::before {
  content: "";
  background: rgba(255, 255, 255, 0.35);
  position: absolute;
  width: 70%;
  height: 70%;
  display: block;
  border-radius: 50%;
  z-index: -1;
  filter: blur(15px);
}

.moon img {
  width: 56px;
  height: 56px;
  background: black;
  border-radius: 50%;
  border: 1px solid black;
}
</style>
