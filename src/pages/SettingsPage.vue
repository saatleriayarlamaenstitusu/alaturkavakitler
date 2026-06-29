<script setup>
import { useSettingsStore } from '@/stores/settings'
import { COLOR_STYLES } from '@/data/colorStyles'

const settings = useSettingsStore()

const themeOptions = [
  { value: 'auto',  label: 'Sistem', icon: '⊙' },
  { value: 'light', label: 'Açık',   icon: '☀' },
  { value: 'dark',  label: 'Koyu',   icon: '☽' },
]
</script>

<template>
  <div class="settings-page">
    <h1 class="page-title">ayarlar</h1>

    <div class="settings-section">
      <h2 class="section-title">Görünüm</h2>

      <div class="setting-row">
        <span class="setting-label">Tema</span>
        <div class="theme-selector">
          <button
            v-for="opt in themeOptions"
            :key="opt.value"
            class="theme-btn"
            :class="{ active: settings.darkMode === opt.value }"
            @click="settings.darkMode = opt.value"
          >
            <span class="theme-icon">{{ opt.icon }}</span>
            <span>{{ opt.label }}</span>
          </button>
        </div>
      </div>
    </div>

    <div class="settings-section">
      <h2 class="section-title">Renk Stili</h2>

      <div class="style-grid">
        <button
          v-for="style in COLOR_STYLES"
          :key="style.id"
          class="style-card"
          :class="{ active: settings.colorStyle === style.id }"
          @click="settings.colorStyle = style.id"
        >
          <span class="style-swatch">
            <span
              v-for="(c, i) in style.swatch"
              :key="i"
              class="swatch-dot"
              :style="{ background: c }"
            ></span>
          </span>
          <span class="style-label">{{ style.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-page {
  padding: 0 1.25rem 2rem;
}

.settings-section {
  margin-top: 2rem;
}

.section-title {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
  padding-left: 0.25rem;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1rem;
  background: var(--surface);
  border-radius: var(--radius);
}

.setting-label {
  font-size: 0.95rem;
  color: var(--text);
}

.theme-selector {
  display: flex;
  gap: 0.25rem;
  background: rgba(0, 0, 0, 0.2);
  padding: 0.2rem;
  border-radius: 8px;
}

.theme-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  color: var(--text-muted);
  transition: background 0.15s ease, color 0.15s ease;
  cursor: pointer;
}

.theme-btn.active {
  background: var(--primary);
  color: white;
}

.theme-icon {
  font-size: 0.9rem;
  line-height: 1;
}

/* Renk stili kartları */
.style-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.style-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  padding: 1rem 0.5rem;
  background: var(--surface);
  border: 1.5px solid transparent;
  border-radius: var(--radius);
  transition: border-color 0.15s ease;
}

.style-card.active {
  border-color: var(--primary);
}

.style-swatch {
  display: flex;
  gap: 3px;
}

.swatch-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
}

.style-label {
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  color: var(--text);
}
</style>
