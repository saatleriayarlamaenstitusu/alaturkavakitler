<script setup>
import { ref, computed, watch, watchEffect } from 'vue'
import { useShareEditor } from '@/composables/useShareEditor'
import { SHARE_WIDGETS, getWidget } from './widgets/registry'
import { SHARE_RATIOS } from '@/data/shareRatios'
import { getFont, nearestWeight } from '@/data/shareFonts'
import { getPhraseFrom } from '@/data/phraseSets'
import SettingControl from './SettingControl.vue'

const editor = useShareEditor()
const { state, selected } = editor

const tab = ref('add')   // 'add' | 'bg' | 'ratio'

// Panel tuvalin ÜSTÜNE biner, onu itmez: tuval ölçeği panel açılıp
// kapandıkça değişmez. Sürükleme sırasında kendiliğinden küçülür ki
// taşınan widget panelin altında kalmasın.
const collapsed = computed(() => !state.panelOpen || state.dragging)

function togglePanel() {
  state.panelOpen = !state.panelOpen
}
const fileInput = ref(null)

const selectedDef = computed(() => (selected.value ? getWidget(selected.value.type) : null))

// Bazı alanların seçenekleri diğer ayarlara bağlıdır (örn. kalınlık listesi
// seçili fonta göre değişir). Bu alanlar `options`/`hidden` yerine fonksiyon
// verir; burada o anki props ile çözülür.
function resolveField(field) {
  const props = selected.value?.props ?? {}
  return {
    ...field,
    options: typeof field.options === 'function' ? field.options(props) : field.options,
  }
}

// Font değişince kalınlık o fontta bulunan en yakın değere çekilir;
// italiği olmayan bir fonta geçilirse italik kapanır.
function updateProp(key, value) {
  const layer = selected.value
  if (!layer) return
  const patch = { [key]: value }
  if (key === 'font') {
    patch.weight = nearestWeight(value, layer.props.weight)
    if (!getFont(value).italic) patch.italic = false
  }
  // Hazır metin seçimi iki satırı da doldurur; sonrasında ikisi de serbest.
  if (key === 'preset') {
    const field = selectedDef.value?.settings.find(f => f.key === 'preset')
    const p = getPhraseFrom(field?.source, value)
    patch.text = p.ar
    patch.sub = p.tr
  }
  editor.updateProps(layer.id, patch)
}

function fieldVisible(field) {
  return typeof field.hidden === 'function' ? !field.hidden(selected.value?.props ?? {}) : true
}

const hasPhoto = computed(() =>
  state.background.kind === 'photo' && Boolean(state.background.photo)
)

// Arka plan sekmesi açık ve fotoğraf varken tuval, katmanlar yerine
// fotoğrafın kaydırma/yakınlaştırma jestlerini dinler.
watchEffect(() => {
  state.bgEditing = tab.value === 'bg' && !selected.value && hasPhoto.value
})

// Bir katman seçilince ayarları görünür yap.
watch(selected, (layer) => {
  if (layer) state.panelOpen = true
})

function pickPhoto(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    editor.setBackground({ kind: 'photo', photo: reader.result, dim: 0.3 })
  }
  reader.readAsDataURL(file)
  e.target.value = ''
}
</script>

<template>
  <div class="panel" :class="{ collapsed }">
    <button
      class="grab"
      :aria-label="collapsed ? 'Ayarları aç' : 'Ayarları kapat'"
      :aria-expanded="!collapsed"
      @click="togglePanel"
    ><span class="grab-bar"></span></button>

    <!-- ── Katman seçiliyken: o katmanın ayarları ── -->
    <template v-if="selected && selectedDef">
      <header class="panel-head">
        <span class="title">{{ selectedDef.label }}</span>
        <div class="head-actions">
          <button class="ghost" @click="editor.sendToBack(selected.id)">Arkaya</button>
          <button class="ghost" @click="editor.bringToFront(selected.id)">Öne</button>
          <button class="ghost" @click="editor.duplicateLayer(selected.id)">Çoğalt</button>
          <button class="ghost" @click="editor.resetProps(selected.id)">Sıfırla</button>
          <button class="ghost primary" @click="editor.select(null)">Bitti</button>
        </div>
      </header>

      <div class="sheet-body fields">
        <SettingControl
          v-for="field in selectedDef.settings.filter(fieldVisible)"
          :key="field.key"
          :field="resolveField(field)"
          :accent="editor.snapshot.primary"
          :model-value="selected.props[field.key]"
          @update:model-value="updateProp(field.key, $event)"
        />

        <!-- Katman seviyesinde: widget tipinden bağımsız, hepsinde var. -->
        <SettingControl
          :field="{ type: 'range', label: 'Opaklık', min: 0.05, max: 1, step: 0.05 }"
          :model-value="selected.opacity ?? 1"
          @update:model-value="editor.updateLayer(selected.id, { opacity: $event })"
        />
      </div>
    </template>

    <!-- ── Seçim yokken: ekle / arka plan / oran ── -->
    <template v-else>
      <nav class="tabs">
        <button :class="{ active: tab === 'add' }" @click="tab = 'add'">Ekle</button>
        <button :class="{ active: tab === 'bg' }" @click="tab = 'bg'">Arka plan</button>
        <button :class="{ active: tab === 'ratio' }" @click="tab = 'ratio'">Oran</button>
      </nav>

      <div v-if="tab === 'add'" class="sheet-body strip">
        <button
          v-for="w in SHARE_WIDGETS"
          :key="w.id"
          class="chip"
          @click="editor.addLayer(w.id)"
        >
          <span class="chip-label">{{ w.label }}</span>
          <span class="chip-hint">{{ w.hint }}</span>
        </button>
      </div>

      <div v-else-if="tab === 'bg'" class="sheet-body bg-tab">
        <div class="strip">
          <button
            class="chip"
            :class="{ active: state.background.kind === 'palette' }"
            @click="editor.setBackground({ kind: 'palette' })"
          >
            <span class="chip-label">Vakit rengi</span>
            <span class="chip-hint">Gradyan</span>
          </button>
          <button class="chip" :class="{ active: hasPhoto }" @click="fileInput.click()">
            <span class="chip-label">Fotoğraf</span>
            <span class="chip-hint">{{ hasPhoto ? 'Değiştir' : 'Galeriden seç' }}</span>
          </button>
          <button v-if="hasPhoto" class="chip" @click="editor.resetPhoto()">
            <span class="chip-label">Sıfırla</span>
            <span class="chip-hint">Kadraj + efekt</span>
          </button>
          <input
            ref="fileInput"
            class="file"
            type="file"
            accept="image/*"
            @change="pickPhoto"
          />
        </div>

        <template v-if="hasPhoto">
          <SettingControl
            :field="{ type: 'range', label: 'Yakınlaştır', min: 1, max: 4, step: 0.05 }"
            :model-value="state.background.zoom"
            @update:model-value="editor.zoomPhoto($event)"
          />
          <SettingControl
            :field="{ type: 'range', label: 'Bulanıklık', min: 0, max: 60, step: 2 }"
            :model-value="state.background.blur"
            @update:model-value="editor.setBackground({ blur: $event })"
          />
        </template>

        <SettingControl
          :field="{ type: 'range', label: 'Karartma', min: 0, max: 0.8, step: 0.05 }"
          :model-value="state.background.dim"
          @update:model-value="editor.setBackground({ dim: $event })"
        />
        <SettingControl
          :field="{ type: 'toggle', label: 'Site adresi' }"
          :model-value="state.brand"
          @update:model-value="state.brand = $event"
        />

        <!-- Film grain: arka planın üstünde, grid ve widget'ların altında -->
        <SettingControl
          :field="{ type: 'toggle', label: 'Gren doku' }"
          :model-value="state.grain.on"
          @update:model-value="editor.setGrain({ on: $event })"
        />

        <template v-if="state.grain.on">
          <SettingControl
            :field="{ type: 'range', label: 'Doku yoğunluğu', min: 0.05, max: 1, step: 0.05 }"
            :model-value="state.grain.opacity"
            @update:model-value="editor.setGrain({ opacity: $event })"
          />
          <SettingControl
            :field="{ type: 'range', label: 'Doku kabalığı', min: 120, max: 900, step: 20 }"
            :model-value="state.grain.size"
            @update:model-value="editor.setGrain({ size: $event })"
          />
          <SettingControl
            :field="{ type: 'select', compact: true, label: 'Karışım', options: [
              { value: 'overlay', label: 'Overlay' },
              { value: 'soft-light', label: 'Yumuşak' },
              { value: 'normal', label: 'Düz' },
            ] }"
            :model-value="state.grain.blend"
            @update:model-value="editor.setGrain({ blend: $event })"
          />
        </template>

        <!-- Swiss ızgara: tuvalin tamamına yayılan hatlar, widget'ların altında -->
        <SettingControl
          :field="{ type: 'toggle', label: 'Grid' }"
          :model-value="state.grid.on"
          @update:model-value="editor.setGrid({ on: $event })"
        />

        <template v-if="state.grid.on">
          <SettingControl
            :field="{ type: 'range', label: 'Sütun', min: 1, max: 12, step: 1 }"
            :model-value="state.grid.cols"
            @update:model-value="editor.setGrid({ cols: $event })"
          />
          <SettingControl
            :field="{ type: 'range', label: 'Satır', min: 1, max: 12, step: 1 }"
            :model-value="state.grid.rows"
            @update:model-value="editor.setGrid({ rows: $event })"
          />
          <SettingControl
            :field="{ type: 'range', label: 'Kenar boşluğu', min: 0, max: 200, step: 8 }"
            :model-value="state.grid.margin"
            @update:model-value="editor.setGrid({ margin: $event })"
          />
          <SettingControl
            :field="{ type: 'range', label: 'Çizgi kalınlığı', min: 1, max: 10, step: 1 }"
            :model-value="state.grid.thickness"
            @update:model-value="editor.setGrid({ thickness: $event })"
          />
          <SettingControl
            :field="{ type: 'range', label: 'Belirginlik', min: 0.05, max: 1, step: 0.05 }"
            :model-value="state.grid.opacity"
            @update:model-value="editor.setGrid({ opacity: $event })"
          />
          <SettingControl
            :field="{ type: 'color', label: 'Çizgi rengi', swatches: ['#ffffff', '#000000', 'auto', '#ffd733', '#ff8c33', '#0491fb'] }"
            :model-value="state.grid.color"
            @update:model-value="editor.setGrid({ color: $event })"
            :accent="editor.snapshot.primary"
          />
          <SettingControl
            :field="{ type: 'toggle', label: 'Kenar çerçevesi' }"
            :model-value="state.grid.frame"
            @update:model-value="editor.setGrid({ frame: $event })"
          />
        </template>
      </div>

      <div v-else class="sheet-body strip">
        <button
          v-for="r in SHARE_RATIOS"
          :key="r.id"
          class="chip ratio"
          :class="{ active: state.ratioId === r.id }"
          @click="editor.setRatio(r.id)"
        >
          <span class="ratio-box" :style="{ aspectRatio: `${r.width} / ${r.height}` }"></span>
          <span class="chip-label">{{ r.label }}</span>
          <span class="chip-hint">{{ r.sub }}</span>
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.panel {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 3;
  /* Panel tuvalin üstüne binen bir katman: her palette MAT olmalı.
     Canlı/mono gibi paletlerde --surface yarı saydamdır (color-mix ile
     transparent), tek başına verilince tuval panelin içinden görünüyor.
     Bu yüzden önce mat --bg, üstüne --surface tonu boyanıyor. */
  background-color: var(--bg);
  background-image: linear-gradient(var(--surface), var(--surface));
  border-top: 1px solid var(--border);
  border-radius: 1rem 1rem 0 0;
  padding: 0 1rem calc(0.5rem + env(safe-area-inset-bottom));
  box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.28);
}

/* Katlanınca yalnızca tutamak + başlık satırı kalır. */
.sheet-body {
  transition: max-height 0.22s ease, opacity 0.18s ease;
}

.panel.collapsed .sheet-body {
  max-height: 0 !important;
  opacity: 0;
  overflow: hidden;
}

.grab {
  display: block;
  width: 100%;
  border: 0;
  background: transparent;
  padding: 0.5rem 0 0.35rem;
  cursor: pointer;
}

.grab-bar {
  display: block;
  width: 2.5rem;
  height: 0.25rem;
  margin: 0 auto;
  border-radius: 1rem;
  background: color-mix(in srgb, var(--text) 25%, transparent);
}

/* Editör mobil önceliklidir; geniş ekranda panel tuvalle aynı sütunda kalır. */
.panel > * {
  max-width: 34rem;
  margin-inline: auto;
}

/* ── Seçili katman başlığı ── */
.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border);
}

.title {
  font-size: 0.9375rem;
  font-weight: 700;
}

.head-actions {
  display: flex;
  gap: 0.25rem;
}

.ghost {
  border: 0;
  background: transparent;
  color: var(--text-muted);
  font-family: inherit;
  font-size: 0.8125rem;
  font-weight: 600;
  padding: 0.35rem 0.5rem;
  border-radius: 0.4rem;
  cursor: pointer;
}

.ghost:hover { color: var(--text); }
.ghost.primary { color: var(--accent-ui); }

.fields {
  max-height: 34vh;
  overflow-y: auto;
}

.strip.sheet-body {
  max-height: 8rem;
}

/* Arka plan sekmesi grid ayarlarıyla uzayabiliyor. */
.bg-tab {
  max-height: 30vh;
  overflow-y: auto;
}

/* ── Sekmeler ── */
.tabs {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 0.6rem;
}

.tabs button {
  border: 0;
  background: transparent;
  color: var(--text-muted);
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.35rem 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
}

.tabs button.active {
  background: color-mix(in srgb, var(--text) 10%, transparent);
  color: var(--text);
}

/* ── Yatay şerit ── */
.strip {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
  scrollbar-width: none;
}

.strip::-webkit-scrollbar { display: none; }

.chip {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.15rem;
  min-width: 6.5rem;
  padding: 0.6rem 0.75rem;
  border-radius: 0.75rem;
  border: 1px solid var(--border);
  background: color-mix(in srgb, var(--text) 6%, transparent);
  color: var(--text);
  font-family: inherit;
  cursor: pointer;
  text-align: left;
}

.chip.active {
  border-color: var(--accent-ui);
  background: color-mix(in srgb, var(--accent-ui) 16%, transparent);
}

.chip-label { font-size: 0.875rem; font-weight: 600; }
.chip-hint { font-size: 0.6875rem; color: var(--text-muted); }

.ratio { align-items: center; min-width: 5rem; }

.ratio-box {
  width: 1.75rem;
  border-radius: 0.2rem;
  border: 2px solid currentColor;
  opacity: 0.6;
  margin-bottom: 0.15rem;
}

.file { display: none; }
</style>
