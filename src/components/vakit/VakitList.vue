<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { DateTime } from 'luxon'

const appStore = useAppStore()

const vakitItems = computed(() => {
  if (!appStore.vakit) return []
  return Object.values(appStore.vakit)
})

function formatTime(dateObj) {
  if (!dateObj) return ''
  return dateObj.setLocale('tr').toLocaleString(DateTime.TIME_SIMPLE)
}
</script>

<template>
  <div v-if="appStore.vakit" class="vakit-list">
    <div
      v-for="item in vakitItems"
      :key="item.key"
      class="vakit-item"
      :class="{ active: appStore.currentVakit === item.key }"
    >
      <span class="dot"></span>
      <span class="label">{{ item.name }}</span>
      <span class="value">{{ formatTime(item.valueDateObj) }}</span>
    </div>
  </div>
</template>

<style scoped>
.vakit-list {
  width: 100%;
  display: flex;
  justify-content: space-between;
}

.vakit-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  padding: 0.25rem 0;
  color: var(--text-muted);
}

.vakit-item.active {
  color: var(--text);
}

.vakit-item.active + .vakit-item {
  color: var(--text-dim);
}

.dot {
  display: block;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  margin-bottom: 0.4rem;
  background: transparent;
}

.vakit-item.active .dot {
  background: var(--primary);
}

.label {
  display: block;
  font-weight: 300;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  line-height: 1.3;
  font-size: 9px;
}

.value {
  display: block;
  font-weight: 600;
  line-height: 1.2;
  font-size: 0.875rem;
  font-variant-numeric: tabular-nums;
  margin-top: 0.15rem;
}
</style>
