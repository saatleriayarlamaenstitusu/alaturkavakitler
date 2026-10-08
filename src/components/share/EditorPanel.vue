<script setup>
import { ref, computed, watch, watchEffect, onMounted, onUnmounted } from 'vue'
import { useShareEditor } from '@/composables/useShareEditor'
import { SHARE_WIDGETS, getWidget, FIELD_GROUPS } from './widgets/registry'
import { SHARE_RATIOS } from '@/data/shareRatios'
import { getFont, nearestWeight } from '@/data/shareFonts'
import { getPhraseFrom } from '@/data/phraseSets'
import { DateTime } from 'luxon'
import { toHijri } from '@/utils/hijri'
import { holyDayLabel } from '@/data/holyDays'
import { convertMonth } from '@/utils/calendarGrid'
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
    // Stepper etiketi diğer ayarlara bağlı olabilir (ay adı takvime göre).
    format: typeof field.format === 'function' ? (v) => field.format(v, props) : field.format,
  }
}

// Font değişince kalınlık o fontta bulunan en yakın değere çekilir;
// italiği olmayan bir fonta geçilirse italik kapanır.
function updateProp(key, value) {
  const layer = selected.value
  if (!layer) return
  const patch = { [key]: value }
  // Elle bir ayara dokunulduğunda görünüm artık o ön tanım değildir.
  if (layer.props.__preset) patch.__preset = null
  if (key === 'font') {
    patch.weight = nearestWeight(value, layer.props.weight)
    if (!getFont(value).italic) patch.italic = false
  }
  // Gün zemini ilk kez açıldığında satırlar birbirine değiyor; aralık
  // sıfırsa okunur bir değere çekilir (kullanıcı yine değiştirebilir).
  if (key === 'dayBg' && value && !layer.props.rowGap) {
    patch.rowGap = Math.max(4, Math.round(layer.props.daySize * 0.35))
  }

  // Tek satırda 31 gün yan yana sığmalı: ölçüler sütun genişliğine göre
  // yeniden hesaplanır. Izgaradaki değerler saklanıp geri dönüldüğünde
  // aynen geri verilir — yoksa ızgara minik ölçülerle kalıyordu.
  if (key === 'layout') {
    if (value === 'row') {
      patch.gridSizes = {
        daySize: layer.props.daySize,
        weekdaySize: layer.props.weekdaySize,
        weekdayStyle: layer.props.weekdayStyle,
      }
      Object.assign(patch, fitRow(layer.props.width))
      patch.weekdayStyle = 'narrow'
    } else if (layer.props.gridSizes) {
      Object.assign(patch, layer.props.gridSizes)
    }
  }

  if (key === 'width' && layer.props.layout === 'row') {
    Object.assign(patch, fitRow(value))
  }

  // Takvim türü değişince yıl/ay o takvimde geçersiz kalır (2026 ≠ hicri yıl);
  // görüntülenen ay diğer takvime çevrilir.
  // Ay 1↔12 sınırını aşınca yıl devreder — takvimde ileri/geri gezinmek
  // için iki ayrı alanı elle çevirmek gerekmesin.
  if (key === 'month' && layer.props.year != null) {
    if (value > 12) { patch.month = 1; patch.year = layer.props.year + 1 }
    else if (value < 1) { patch.month = 12; patch.year = layer.props.year - 1 }
  }

  if (key === 'system') {
    Object.assign(patch, convertMonth(layer.props.system, value, layer.props.year, layer.props.month))
  }

  // Tarih seçilince tarihe bağlı bütün alanlar birlikte güncellenir: hicri
  // gün/ay/yıl, miladi satır, ay fazı ve o güne denk gelen dinî gün.
  // Sonrasında her biri yine elle değiştirilebilir.
  if (key === 'date' && value) {
    const d = DateTime.fromISO(value).setLocale('tr')
    if (d.isValid) {
      const js = d.toJSDate()
      const h = toHijri(js)
      patch.hijriDay = String(h.day).padStart(2, '0')
      patch.hijriText = `${h.monthName} ${h.year}`
      patch.miladi = `${d.day} ${d.monthLong} ${d.year}`
      patch.miladiNote = d.weekdayLong
      patch.moonDay = Math.min(h.day, 29)
      patch.event = holyDayLabel(js)
    }
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

// Tek satır düzeninde gün sayısı/adı ölçüleri sütun genişliğine oturur.
function fitRow(width) {
  const col = width / 31
  return {
    daySize: Math.max(8, Math.round(col * 0.7)),
    weekdaySize: Math.max(6, Math.round(col * 0.34)),
  }
}

function fieldVisible(field) {
  return typeof field.hidden === 'function' ? !field.hidden(selected.value?.props ?? {}) : true
}

// Katman seviyesindeki alan: widget tipinden bağımsız, hepsinde var.
const LAYER_FIELDS = [
  { key: '__opacity', type: 'range', label: 'Opaklık', min: 0.05, max: 1, step: 0.05, unit: '%', group: 'gorunum', layerLevel: true },
]

// Alanlar grup başlıkları altında toplanır; boş grup çizilmez. Widget kendi
// `groups` listesini verebilir (takvimde ayarlar metin katmanına göre ayrılır).
const groupedFields = computed(() => {
  const def = selectedDef.value
  if (!def) return []
  const all = [...def.settings.filter(fieldVisible).map(resolveField), ...LAYER_FIELDS]
  return (def.groups ?? FIELD_GROUPS)
    .map(g => ({ ...g, fields: all.filter(f => (f.group || 'gorunum') === g.id) }))
    .filter(g => g.fields.length)
})

// Uzun ayar listelerinde (takvim ~25 alan) grupları kapatabilmek gerekiyor.
// Kapalı gruplar widget tipi bazında hatırlanır, katman değişince sıfırlanmaz.
const closedGroups = ref({})

const groupKey = (id) => `${selectedDef.value?.id}:${id}`
const isCollapsed = (id) => Boolean(closedGroups.value[groupKey(id)])

function toggleGroup(id) {
  const key = groupKey(id)
  closedGroups.value = { ...closedGroups.value, [key]: !closedGroups.value[key] }
}

// ── Ön tanım kopyalama (yalnızca geliştirme) ──
// Arayüzde bir görünüm kurup bunu `src/data/widgetPresets.js`'e yapıştırmak
// için: o katmanın BİÇİM alanlarını hazır bir `preset(...)` satırı olarak
// panoya yazar. İçerik alanları (`group: 'icerik'`) dışarıda bırakılır —
// bir ön tanım kullanıcının metnini/tarihini taşımamalı.
const isDev = Boolean(import.meta.env?.DEV)
const copied = ref(false)

function formatValue(v) {
  if (typeof v === 'string') return `'${v.replace(/'/g, "\\'")}'`
  if (typeof v === 'number') return String(Math.round(v * 1000) / 1000)
  return String(v)
}

function presetSnippet() {
  const layer = selected.value
  const def = selectedDef.value
  if (!layer || !def) return ''

  // Biçim alanı: 'icerik' grubunda OLMAYAN ve tipi doğası gereği içerik
  // taşımayan alanlar. Tip kontrolü şart — takvimdeki ay başlığı metni
  // 'baslik' grubunda duruyor ama yine de kullanıcının yazdığı bir içerik.
  const CONTENT_TYPES = ['text', 'textarea', 'date', 'phrase', 'stepper']
  const styleKeys = def.settings
    .filter(f => (f.group ?? 'gorunum') !== 'icerik'
      && !CONTENT_TYPES.includes(f.type)
      && !f.layerLevel)
    .map(f => f.key)

  const entries = styleKeys
    .filter(k => layer.props[k] !== undefined)
    .map(k => `    ${k}: ${formatValue(layer.props[k])},`)

  return [
    `  // ${def.label} — widgetPresets.js içindeki '${def.id}' listesine ekle`,
    `  preset('yeni', 'Yeni', {`,
    ...entries,
    `  }),`,
  ].join('\n')
}

async function copyPreset() {
  const text = presetSnippet()
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    // Pano reddedilirse (izin/güvenli bağlam) en azından konsola bırak.
    console.log(text)
  }
  copied.value = true
  setTimeout(() => { copied.value = false }, 1600)
}

// Kısayol: katman seçiliyken Ctrl/Cmd + Shift + C.
function onKey(e) {
  if (!isDev || !selected.value) return
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === 'KeyC') {
    e.preventDefault()
    copyPreset()
  }
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))

// Preset uygulanınca yazı tipi değişiyor olabilir; kalınlık o fontta
// bulunan en yakın değere çekilir, yoksa tarayıcı sahte kalın çiziyor.
function applyPreset(p) {
  const layer = selected.value
  if (!layer) return
  const patch = { ...p.props }
  for (const key of Object.keys(patch)) {
    if (!key.toLowerCase().endsWith('font')) continue
    const weightKey = key === 'font' ? 'weight' : key.replace(/Font$/, 'Weight')
    if (weightKey in patch) patch[weightKey] = nearestWeight(patch[key], patch[weightKey])
    if (!getFont(patch[key]).italic) {
      const italicKey = key === 'font' ? 'italic' : key.replace(/Font$/, 'Italic')
      if (italicKey in layer.props) patch[italicKey] = false
    }
  }
  patch.__preset = p.id
  editor.updateProps(layer.id, patch)
}

// Hangi ön tanım seçili: uygulandığında işaretlenir, sonradan bir ayara
// dokununca işaret düşer — görünüm artık o ön tanım değil.
const activePreset = computed(() => selected.value?.props.__preset ?? null)

function fieldValue(field) {
  if (field.layerLevel) return selected.value?.opacity ?? 1
  return selected.value?.props[field.key]
}

function writeField(field, val) {
  if (field.layerLevel) editor.updateLayer(selected.value.id, { opacity: val })
  else updateProp(field.key, val)
}

// Zemin dolgusu seçenekleri. 'vakit' açılış görünümü: tabandan yükselen
// o anki vakit rengi.
const fillStyles = [
  { value: 'vakit',   label: 'Vakit' },
  { value: 'duz',     label: 'Düz renk' },
  { value: 'gradyan', label: 'Gradyan' },
  { value: 'mesh',    label: 'Mesh' },
]

// 'auto' = o anki vakit rengi; zemin için koyu tonlar da hazır dursun.
const BG_SWATCHES = ['auto', '#000000', '#ffffff', '#0b1020', '#1a1a1a', '#f2f0e6']

const fillColor1Label = computed(() =>
  state.background.fill.style === 'duz' ? 'Renk' : 'Ana renk'
)

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
          <button
            class="ghost toggle"
            :class="{ on: state.snap }"
            :aria-pressed="state.snap"
            title="Taşırken diğer katmanlara ve tuval merkezine hizala"
            @click="editor.toggleSnap()"
          >Hizala</button>
          <span class="head-sep" aria-hidden="true"></span>
          <button class="ghost" @click="editor.sendToBack(selected.id)">Arkaya</button>
          <button class="ghost" @click="editor.bringToFront(selected.id)">Öne</button>
          <button class="ghost" @click="editor.duplicateLayer(selected.id)">Çoğalt</button>
          <button class="ghost" @click="editor.resetProps(selected.id)">Sıfırla</button>
          <!-- Yalnızca geliştirmede: görünümü ön tanım satırı olarak kopyalar. -->
          <button
            v-if="isDev"
            class="ghost dev"
            title="Ön tanım olarak kopyala (Ctrl/Cmd + Shift + C)"
            @click="copyPreset"
          >{{ copied ? 'Kopyalandı' : 'Preset' }}</button>
          <button class="ghost primary" @click="editor.select(null)">Bitti</button>
        </div>
      </header>

      <div class="sheet-body fields">
        <!-- Ön tanımlar: tek dokunuşla tutarlı bir görünüm. Yalnızca biçim
             değişir, girdiğin içerik olduğu gibi kalır. -->
        <section v-if="selectedDef.presets?.length" class="group presets">
          <div class="group-label static">
            <span>Ön tanım</span>
            <span class="group-rule" aria-hidden="true"></span>
          </div>
          <div class="preset-strip">
            <button
              v-for="p in selectedDef.presets"
              :key="p.id"
              class="preset-chip"
              :class="{ active: activePreset === p.id }"
              @click="applyPreset(p)"
            >{{ p.label }}</button>
          </div>
        </section>

        <section
          v-for="group in groupedFields"
          :key="group.id"
          class="group"
          :class="{ closed: isCollapsed(group.id) }"
        >
          <button
            class="group-label"
            :aria-expanded="!isCollapsed(group.id)"
            @click="toggleGroup(group.id)"
          >
            <span>{{ group.label }}</span>
            <span class="group-rule" aria-hidden="true"></span>
            <span class="group-count">{{ group.fields.length }}</span>
          </button>

          <div v-show="!isCollapsed(group.id)" class="group-fields">
            <SettingControl
              v-for="field in group.fields"
              :key="field.key"
              :field="field"
              :accent="editor.snapshot.primary"
              :model-value="fieldValue(field)"
              @update:model-value="writeField(field, $event)"
            />
          </div>
        </section>
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

        <!-- Fotoğraf yokken tuvalin zemini: vakit gradyanı varsayılan,
             düz renk / gradyan / mesh de seçilebilir. -->
        <section v-if="!hasPhoto" class="group">
          <h3 class="group-label">Zemin</h3>
          <SettingControl
            :field="{ type: 'select', label: 'Dolgu', options: fillStyles }"
            :model-value="state.background.fill.style"
            @update:model-value="editor.setFill({ style: $event })"
          />
          <SettingControl
            :field="{ type: 'color', label: fillColor1Label, swatches: BG_SWATCHES }"
            :accent="editor.snapshot.primary"
            :model-value="state.background.fill.color1"
            @update:model-value="editor.setFill({ color1: $event })"
          />
          <SettingControl
            v-if="state.background.fill.style !== 'duz'"
            :field="{ type: 'color', label: 'İkinci renk', swatches: BG_SWATCHES }"
            :accent="editor.snapshot.primary"
            :model-value="state.background.fill.color2"
            @update:model-value="editor.setFill({ color2: $event })"
          />
          <SettingControl
            v-if="state.background.fill.style !== 'duz'"
            :field="{ type: 'range', label: 'Yayılma', min: 30, max: 120, step: 2, unit: 'pct' }"
            :model-value="state.background.fill.softness"
            @update:model-value="editor.setFill({ softness: $event })"
          />
          <SettingControl
            v-if="state.background.fill.style === 'gradyan' || state.background.fill.style === 'mesh'"
            :field="{ type: 'range', label: 'Açı', min: 0, max: 360, step: 5, unit: '°' }"
            :model-value="state.background.fill.angle"
            @update:model-value="editor.setFill({ angle: $event })"
          />
        </section>

        <section class="group">
          <h3 class="group-label">Ayar</h3>
          <template v-if="hasPhoto">
            <SettingControl
              :field="{ type: 'range', label: 'Yakınlaştır', min: 1, max: 4, step: 0.05, unit: '×' }"
              :model-value="state.background.zoom"
              @update:model-value="editor.zoomPhoto($event)"
            />
            <SettingControl
              :field="{ type: 'range', label: 'Bulanıklık', min: 0, max: 60, step: 2, unit: 'px' }"
              :model-value="state.background.blur"
              @update:model-value="editor.setBackground({ blur: $event })"
            />
          </template>

          <SettingControl
            :field="{ type: 'range', label: 'Karartma', min: 0, max: 0.8, step: 0.05, unit: '%' }"
            :model-value="state.background.dim"
            @update:model-value="editor.setBackground({ dim: $event })"
          />
          <SettingControl
            :field="{ type: 'toggle', label: 'Site adresi' }"
            :model-value="state.brand"
            @update:model-value="state.brand = $event"
          />
        </section>
        <!-- Film grain: arka planın üstünde, grid ve widget'ların altında -->
        <section class="group">
          <h3 class="group-label">Doku</h3>
          <SettingControl
            :field="{ type: 'toggle', label: 'Gren doku' }"
            :model-value="state.grain.on"
            @update:model-value="editor.setGrain({ on: $event })"
          />

          <template v-if="state.grain.on">
            <SettingControl
              :field="{ type: 'range', label: 'Yoğunluk', min: 0.05, max: 1, step: 0.05, unit: '%' }"
              :model-value="state.grain.opacity"
              @update:model-value="editor.setGrain({ opacity: $event })"
            />
            <SettingControl
              :field="{ type: 'range', label: 'Kabalık', min: 120, max: 900, step: 20, unit: 'px' }"
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
        </section>

        <!-- Swiss ızgara: tuvalin tamamına yayılan hatlar, widget'ların altında -->
        <section class="group">
          <h3 class="group-label">Izgara</h3>
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
              :field="{ type: 'range', label: 'Kenar boşluğu', min: 0, max: 200, step: 8, unit: 'px' }"
              :model-value="state.grid.margin"
              @update:model-value="editor.setGrid({ margin: $event })"
            />
            <SettingControl
              :field="{ type: 'range', label: 'Kalınlık', min: 1, max: 10, step: 1, unit: 'px' }"
              :model-value="state.grid.thickness"
              @update:model-value="editor.setGrid({ thickness: $event })"
            />
            <SettingControl
              :field="{ type: 'range', label: 'Belirginlik', min: 0.05, max: 1, step: 0.05, unit: '%' }"
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
              :field="{ type: 'toggle', label: 'Çerçeve' }"
              :model-value="state.grid.frame"
              @update:model-value="editor.setGrid({ frame: $event })"
            />
          </template>
        </section>
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
/* Swiss düzen: dik açılar, dolgu yerine ince çizgi, ağırlık ve boşlukla
   hiyerarşi. Etiketler tek bir kolonda hizalanır (--label-col). */
.panel {
  --label-col: 7rem;
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
  padding: 0 1rem calc(0.5rem + env(safe-area-inset-bottom));
  margin: 0 1em;
    border-radius: 18px 18px 0 0;
}


/* Editör mobil önceliklidir; geniş ekranda panel tuvalle aynı sütunda kalır. */
.panel > * {
  max-width: 34rem;
  margin-inline: auto;
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
  padding: 0.45rem 0 0.3rem;
  cursor: pointer;
}

.grab-bar {
  display: block;
  width: 2rem;
  height: 2px;
  margin: 0 auto;
  background: var(--text-dim);
}

/* ── Seçili katman başlığı ── */
.panel-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border);
      flex-wrap: wrap;
}

.title {
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.head-actions {
  display: flex;
  gap: 0.75rem;
}

.ghost {
  border: 0;
  background: transparent;
  color: var(--text-muted);
  font-family: inherit;
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 0;
  cursor: pointer;
}

.ghost:hover { color: var(--text); }
.ghost.primary { color: var(--accent-ui); }

/* Hizalama katman değil editör ayarı; açık/kapalı olduğu okunabilsin diye
   diğer eylemlerden ince bir çizgiyle ayrılıyor. */
.ghost.toggle { color: var(--text-dim); }

.ghost.toggle.on {
  color: var(--bg);
  background: var(--text);
  padding: 0.1rem 0.3rem;
  margin: -0.1rem -0.3rem;
}

.head-sep {
  width: 1px;
  align-self: stretch;
  background: var(--border);
}

.fields {
  max-height: 34vh;
  overflow-y: auto;
  /* Sayısal okumalar kaydırma çubuğuna değmesin. */
  padding-right: 0.5rem;
}

/* ── Ayar grubu ── */
.group-label.static { cursor: default; }

.ghost.dev { color: var(--accent-ui); }

.preset-strip {
  display: flex;
  gap: 0.4rem;
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: 0.1rem;
}

.preset-strip::-webkit-scrollbar { display: none; }

.preset-chip {
  flex-shrink: 0;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  font-family: inherit;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  padding: 0.35rem 0.7rem;
  cursor: pointer;
}

.preset-chip:hover { border-color: var(--text-muted); color: var(--text); }

.preset-chip.active {
  background: var(--accent-ui);
  border-color: var(--accent-ui);
  color: var(--bg);
}

/* Gruplar arasında ayrı bir ayraç çizgisi YOK: başlığın yanından uzanan
   `.group-rule` zaten ayracı görevi görüyor. İkisi birlikte olunca, özellikle
   gruplar kapalıyken, birkaç piksel arayla üst üste çizgiler çıkıyordu. */
.group {
  padding: 0 0 1.6rem;
}

.group:last-child { padding-bottom: 0.5rem; }

/* Kapalıyken içerik yok; boşluğu yine de koru ki başlıklar yapışmasın. */
.group.closed { padding-bottom: 1.1rem; }

/* Başlık solda, ince çizgi sağa doğru uzanır — klasik Swiss ayraç.
   Tamamı tıklanabilir: uzun listelerde grup kapatılabiliyor. */
.group-label {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  margin: 0 0 0.7rem;
  padding: 0.15rem 0;
  border: 0;
  background: transparent;
  font-family: inherit;
  font-size: 0.5625rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--text-dim);
  cursor: pointer;
  text-align: left;
}

.group-label:hover { color: var(--text-muted); }

.group.closed .group-label { margin-bottom: 0; }

.group-rule {
  flex: 1;
  height: 1px;
  background: var(--border);
}

/* Kapalı grupta kaç ayar olduğu görünsün. */
.group-count {
  font-size: 0.5625rem;
  letter-spacing: 0.08em;
  color: var(--text-dim);
  opacity: 0;
}

.group.closed .group-count { opacity: 1; }

.group-fields {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

/* ── Sekmeler ── */
.tabs {
  display: flex;
  gap: 1.25rem;
  border-bottom: 1px solid var(--border);
}

.tabs button {
  position: relative;
  border: 0;
  background: transparent;
  color: var(--text-dim);
  font-family: inherit;
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  padding: 0.4rem 0 0.5rem;
  cursor: pointer;
}

.tabs button.active { color: var(--text); }

.tabs button.active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 2px;
  background: var(--text);
}

/* ── Yatay şerit ── */
.strip {
  display: flex;
  gap: 0.375rem;
  overflow-x: auto;
  padding: 0.6rem 0 0.35rem;
  scrollbar-width: none;
}

.strip::-webkit-scrollbar { display: none; }

.strip.sheet-body { max-height: 8rem; }

.chip {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.1rem;
  min-width: 6rem;
  padding: 0.5rem 0.6rem;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text);
  font-family: inherit;
  cursor: pointer;
  text-align: left;
  border-radius: 6px;
}

.chip.active {
  background: var(--text);
  border-color: var(--text);
  color: var(--bg);
}

.chip-label {
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.chip-hint {
  font-size: 0.5625rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-dim);
}

.chip.active .chip-hint { color: inherit; opacity: 0.7; }

/* Arka plan sekmesi grid ayarlarıyla uzayabiliyor. */
.bg-tab {
  max-height: 30vh;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.ratio {
  align-items: center;
  min-width: 4.5rem;
  gap: 0.3rem;
}

.ratio-box {
  width: 1.5rem;
  border: 1px solid currentColor;
  opacity: 0.5;
}

.file { display: none; }
</style>
