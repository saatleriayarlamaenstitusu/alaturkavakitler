<script setup>
import { useSettingsStore } from '@/stores/settings'
import { COLOR_STYLES } from '@/data/colorStyles'

const settings = useSettingsStore()

const themeOptions = [
  { value: 'auto',  label: 'Sistem', icon: '⊙' },
  { value: 'light', label: 'Açık',   icon: '☀' },
  { value: 'dark',  label: 'Koyu',   icon: '☽' },
]

const homeClockOptions = [
  { value: 'led',    label: 'LED' },
  { value: 'normal', label: 'Normal' },
]

const firstPageOptions = [
  { value: '/',         label: 'Ana Sayfa',    desc: 'Ana sayfa' },
  { value: '/saat',     label: 'Saat',         desc: 'Alaturka saat' },
  { value: '/vakitler', label: 'Vakitler',     desc: 'Namaz vakitleri' },
  { value: '/takvim',   label: 'Takvim',       desc: 'Hicri / Rumi takvim' },
]
</script>

<template>
  <div class="settings-page">
    <h1 class="page-title">ayarlar</h1>

    <section class="setting-block">
      <div class="setting-head">
        <h2 class="setting-name">Görünüm</h2>
        <p class="setting-desc">Tema ve renk stili</p>
      </div>

      <span class="sub-label">Tema</span>
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

      <span class="sub-label sub-label--spaced">Renk stili</span>
      <div class="style-scroller">
        <button
          v-for="style in COLOR_STYLES"
          :key="style.id"
          class="style-card"
          :class="{ active: settings.colorStyle === style.id }"
          @click="settings.colorStyle = style.id"
        >
          <span class="style-square" :style="{ background: style.bg, color: style.fg }">
            <span class="square-label">{{ style.label }}</span>
            <span class="square-dots">
              <span
                v-for="(c, i) in style.swatch"
                :key="i"
                class="dot"
                :style="{ background: c }"
              ></span>
            </span>
          </span>
        </button>
      </div>
    </section>

    <section class="setting-block">
      <div class="setting-head">
        <h2 class="setting-name">Ana Sayfa Saati</h2>
        <p class="setting-desc">Saat görünümü</p>
      </div>
      <div class="theme-selector">
        <button
          v-for="opt in homeClockOptions"
          :key="opt.value"
          class="theme-btn"
          :class="{ active: settings.homeClock === opt.value }"
          @click="settings.homeClock = opt.value"
        >
          <span>{{ opt.label }}</span>
        </button>
      </div>
    </section>

    <section class="setting-block">
      <div class="setting-head">
        <h2 class="setting-name">Açılış Sayfası</h2>
        <p class="setting-desc">Uygulama açılınca hangi sayfa</p>
      </div>
      <div class="theme-selector">
        <button
          v-for="opt in firstPageOptions"
          :key="opt.value"
          class="theme-btn"
          :class="{ active: settings.firstPage === opt.value }"
          @click="settings.firstPage = opt.value"
        >
          <span>{{ opt.label }}</span>
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

/* Blok içi alt etiket (Tema / Renk stili) */
.sub-label {
  display: block;
  font-size: 0.6rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.sub-label--spaced {
  margin-top: 1.5rem;
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

/* Renk stili — yatay kaydırılabilir kare önizlemeler */
.style-scroller {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  /* ekran kenarlarına taşır, içerik 1.25rem hizada başlar */
  margin: 0 -1.25rem;
  padding: 0.25rem 1.25rem 0.5rem;
  scroll-snap-type: x proximity;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.style-scroller::-webkit-scrollbar {
  display: none;
}

.style-card {
  flex: 0 0 auto;
  scroll-snap-align: start;
  background: transparent;
  cursor: pointer;
  border-radius: 12px;
}

/* Kare: arka plan = palet rengi, içinde stil adı + aksan noktaları */
.style-square {
  width: 96px;
  height: 96px;
  border-radius: 10px;
  border: 1.5px solid var(--border);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.7rem;
  overflow: hidden;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.style-card.active .style-square {
  border-color: var(--text);
  box-shadow: 0 0 0 2px var(--text);
}

.square-label {
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.square-dots {
  display: flex;
  gap: 4px;
}

.square-dots .dot {
  width: 13px;
  height: 13px;
  border-radius: 50%;
}
</style>
