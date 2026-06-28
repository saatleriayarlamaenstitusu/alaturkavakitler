<script setup>
import { ref, computed } from 'vue'
import { nowHijri } from '@/utils/hijri'
import { DateTime } from 'luxon'

const now = DateTime.now().setLocale('tr')
const hijri = ref(nowHijri('object'))

const moonSrc = computed(() => `/Icons/moon/${hijri.value.date}.svg`)
</script>

<template>
  <div class="calendar-widget">
    <div class="calendars">
      <div class="primary-calendar">
        <div class="day">{{ String(hijri.date).padStart(2, '0') }}</div>
        <div class="month-year">
          <span>{{ hijri.monthName }}</span>
          <span>{{ hijri.year }}</span>
        </div>
      </div>

      <div class="secondary-calendar">
        <b>{{ String(now.day).padStart(2, '0') }}</b>
        {{ now.monthLong }} {{ now.year }}
        <div class="day-name">{{ now.weekdayLong }}</div>
      </div>
    </div>

    <div class="moon">
      <img :src="moonSrc" :alt="`${hijri.date}. gün ay`" />
    </div>
  </div>
</template>

<style scoped>
.calendar-widget {
  display: flex;
  color: var(--text);
}

.calendars {
  position: relative;
  flex: 1 1 75%;
  padding: 0 1.5em;
  overflow: hidden;
}

.primary-calendar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.day {
  border-top: 10px solid;
  color: var(--primary);
  flex: 0 1 1.5em;
  font-family: var(--font2);
  font-size: 3.5em;
  font-weight: 800;
  line-height: 1;
  padding-top: 1rem;
  text-align: center;
  border-radius: 5px;
}

.month-year {
  border-top: 20px solid transparent;
  display: flex;
  flex-direction: column;
  flex: 1 1 6em;
  font-weight: 300;
  letter-spacing: 1px;
  margin-left: 0.5em;
}

.secondary-calendar {
  display: flex;
  flex-wrap: wrap;
  font-size: 1em;
  font-weight: 200;
  margin-top: 0.5em;
  line-height: 1;
}

.secondary-calendar b {
  background: var(--primary);
  font-family: var(--font2);
  font-size: 1.4em;
  font-weight: 800;
  margin-right: 0.5em;
  padding: 10px 5px;
  border-radius: 5px;
}

.day-name {
  color: var(--primary);
  flex: 1 1 100%;
  font-weight: 400;
  letter-spacing: 3px;
  line-height: 1.2;
  margin: -1.2em 0 0 2.6em;
  text-transform: uppercase;
  font-size: 1.2em;
}

.moon {
  flex: 0 1 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1em;
  position: relative;
}

.moon::before {
  content: "";
  background: rgba(255, 255, 255, 0.35);
  position: absolute;
  width: 75%;
  height: 75%;
  display: block;
  border-radius: 75%;
  z-index: -1;
  filter: blur(15px);
}

.moon img {
  width: 75px;
  height: 75px;
  background: black;
  border-radius: 50%;
  border: 1px solid black;
}
</style>
