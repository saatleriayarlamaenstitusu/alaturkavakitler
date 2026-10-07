<script setup>
import { computed, ref, watch, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { useKazaStore, KAZA_KEYS } from '@/stores/kaza'
import { DateTime } from 'luxon'

const appStore = useAppStore()
const kaza = useKazaStore()

// Herhangi bir vakte basılı tutunca listenin tam genişliğinde kaza bandı
// açılır. Tek vaktin üstünde mini +/− de düşünüldü; 1/6 genişlikte iki düğüm
// parmak için dar kalıyor ve kaza borcu zaten hepsini birlikte görmek
// istediğin bir şey.
const editing = ref(false)
let holdTimer = null
let startY = 0

function startHold(e) {
  startY = e.clientY
  clearTimeout(holdTimer)
  holdTimer = setTimeout(() => { editing.value = true }, 400)
}

// Liste kaydırma alanının içinde; parmak kayıyorsa bu bir basılı tutma değil.
function moveHold(e) {
  if (Math.abs(e.clientY - startY) > 10) clearTimeout(holdTimer)
}

const endHold = () => clearTimeout(holdTimer)

// Bandın dışına dokununca kapanır. Dinleyici bir sonraki döngüde bağlanıyor:
// bandı açan basılı tutmanın kendi `pointerup`'ı hemen kapatmasın.
const blockRef = ref(null)
function onOutside(e) {
  if (!blockRef.value?.contains(e.target)) editing.value = false
}

watch(editing, (open) => {
  if (open) setTimeout(() => document.addEventListener('pointerdown', onOutside), 0)
  else document.removeEventListener('pointerdown', onOutside)
})

onUnmounted(() => {
  clearTimeout(holdTimer)
  document.removeEventListener('pointerdown', onOutside)
})

const canEdit = (key) => KAZA_KEYS.includes(key)

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
  <div v-if="appStore.vakit" ref="blockRef" class="vakit-block">
    <div
      class="vakit-list"
      @pointerdown="startHold"
      @pointermove="moveHold"
      @pointerup="endHold"
      @pointerleave="endHold"
      @pointercancel="endHold"
      @contextmenu.prevent
    >
      <div
        v-for="item in vakitItems"
        :key="item.key"
        class="vakit-item"
        :class="{ active: appStore.currentVakit === item.key }"
      >
        <span class="dot"></span>
        <span class="label">{{ item.name }}</span>
        <span class="value">{{ formatTime(item.valueDateObj) }}</span>
        <!-- Bant kapalıyken de borcun olduğu görünsün. -->
        <span v-if="!editing && kaza.has(item.key)" class="kaza-badge">
          {{ kaza.counts[item.key] }}
        </span>
      </div>
    </div>

    <!-- Sütunlar listeyle aynı flex yapısında, bu yüzden kendiliğinden hizalı. -->
    <div v-if="editing" class="kaza-band">
      <div class="kaza-head">
        <span class="kaza-title">Kaza</span>
        <button class="kaza-close" @click="editing = false">Bitti</button>
      </div>
      <div class="kaza-cols">
        <div
          v-for="item in vakitItems"
          :key="item.key"
          class="kaza-col"
          :class="{ off: !canEdit(item.key) }"
        >
          <!-- Düğmeler sayının üstünde ve altında: sütun ~65px, yan yana
               koyunca üçü birbirine giriyordu. Yukarı = artır da doğal okunuyor. -->
          <template v-if="canEdit(item.key)">
            <button
              class="kaza-step"
              :aria-label="`${item.name} kazasını artır`"
              @click="kaza.add(item.key, 1)"
            >+</button>
            <span class="kaza-count">{{ kaza.counts[item.key] }}</span>
            <button
              class="kaza-step"
              :disabled="!kaza.has(item.key)"
              :aria-label="`${item.name} kazasını azalt`"
              @click="kaza.add(item.key, -1)"
            >−</button>
          </template>
          <span v-else class="kaza-dash" aria-hidden="true">·</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vakit-block {
  width: 100%;
}

.vakit-list {
  width: 100%;
  display: flex;
  justify-content: space-between;
  /* Basılı tutmak tarayıcının metin seçimini ve "kopyala" baloncuğunu
     tetikliyordu; bu liste bir denetim yüzeyi, seçilecek metin değil. */
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
}

.vakit-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  padding: 0.25rem 0;
  /* Geçmiş vakitler (aktiften önce) — en soluk */
  color: var(--text-dim);
}

/* Gelecek vakitler (aktiften sonra) — muted */
.vakit-item.active ~ .vakit-item {
  color: var(--text-muted);
}

/* Sonraki vakit — beyaz/tam metin */
.vakit-item.active + .vakit-item {
  color: var(--text);
}

/* Aktif vakit — en öne çıkan */
.vakit-item.active {
  color: var(--text);
}

.vakit-item.active .value {
  font-weight: 700;
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
  background: var(--accent-ui);
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
/* ── Kaza ── */
.kaza-badge {
  position: absolute;
  top: -0.15rem;
  right: 50%;
  transform: translateX(1.45rem);
  min-width: 0.95rem;
  padding: 0 0.2rem;
  border-radius: 999px;
  background: var(--accent-ui);
  color: var(--bg);
  font-size: 9px;
  font-weight: 700;
  line-height: 1.1rem;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.kaza-band {
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  margin-top: 0.6rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border);
}

.kaza-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.35rem;
}

.kaza-title {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--text-dim);
}

.kaza-close {
  border: 0;
  background: transparent;
  padding: 0.1rem 0.2rem;
  font-family: inherit;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--accent-ui);
  cursor: pointer;
}

/* Liste ile aynı flex düzeni — sütunlar üstteki vakitlerle hizalanır. */
.kaza-cols {
  display: flex;
  justify-content: space-between;
}

.kaza-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
}

.kaza-col.off { opacity: 0.3; }

.kaza-step {
  width: 2.1rem;
  height: 1.6rem;
  flex-shrink: 0;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: transparent;
  color: var(--text);
  font-family: inherit;
  font-size: 0.8125rem;
  line-height: 1;
  cursor: pointer;
}

.kaza-step:disabled {
  color: var(--text-dim);
  cursor: default;
}

.kaza-count {
  min-width: 1.1rem;
  text-align: center;
  font-size: 0.9375rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--text);
}

.kaza-dash { color: var(--text-dim); }
</style>
