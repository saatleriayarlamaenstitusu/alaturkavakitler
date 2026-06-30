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

    <section class="setting-block">
      <div class="setting-head">
        <h2 class="setting-name">Tema</h2>
        <p class="setting-desc">Görünüm modu</p>
      </div>
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
    </section>

    <section class="setting-block">
      <div class="setting-head">
        <h2 class="setting-name">Renk Stili</h2>
        <p class="setting-desc">Palet seçimi</p>
      </div>
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
    </section>
  </div>
</template>

<style scoped>
.settings-page {
  padding-bottom: 2rem;
}

/* Çizgiyle ayrılmış, sola yaslı section */
.setting-block {
  padding: 1.5rem 1.25rem;
  border-top: 1px solid var(--border);
}

.setting-block:first-of-type {
  margin-top: 0.5rem;
}

.setting-head {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 1.1rem;
}

.setting-name {
  font-size: 1.05rem;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: var(--text);
  line-height: 1.1;
}

.setting-desc {
  font-size: 0.65rem;
  font-weight: 400;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-top: 0.4rem;
}

/* Tema seçici — sola yaslı segment kontrol */
.theme-selector {
  display: inline-flex;
  gap: 0.4rem;
}

.theme-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.9rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 0.8rem;
  color: var(--text-muted);
  background: transparent;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
  cursor: pointer;
}

.theme-btn.active {
  background: var(--text);
  border-color: var(--text);
  color: var(--bg);
}

.theme-icon {
  font-size: 0.9rem;
  line-height: 1;
}

/* Renk stili kartları */
.style-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.6rem;
}

.style-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.7rem;
  padding: 0.9rem;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.15s ease;
}

.style-card.active {
  border-color: var(--text);
}

.style-swatch {
  display: flex;
  gap: 4px;
}

.swatch-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
}

.style-label {
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.01em;
  color: var(--text);
}
</style>
