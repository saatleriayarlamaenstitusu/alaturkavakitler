<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { FONT_GROUPS, fontsByGroup, getFont } from '@/data/shareFonts'
import { ensureFontGroup } from '@/composables/useShareFonts'
import { phraseList } from '@/data/phraseSets'
import { useShareEditor } from '@/composables/useShareEditor'

const props = defineProps({
  field: { type: Object, required: true },
  modelValue: { required: true },
  accent: { type: String, default: '#ae002e' },
})

const emit = defineEmits(['update:modelValue'])

const value = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const editor = useShareEditor()

// Çok satırlı metin alanı içeriği kadar uzar; Enter'a basınca yazdığın satırı
// görmeden devam etmek zorunda kalmayasın diye.
const textareaEl = ref(null)
function fitTextarea() {
  const el = textareaEl.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}
const autoGrow = () => nextTick(fitTextarea)
onMounted(fitTextarea)
watch(() => props.modelValue, () => nextTick(fitTextarea))

// 'auto' vakit rengini, 'tint' metin renginin soluk tonunu temsil eder.
const swatchColor = (sw) => {
  if (sw === 'auto') return props.accent
  if (sw === 'tint') return 'color-mix(in srgb, var(--text) 30%, transparent)'
  return sw
}

// Renk seçici üç kümeden oluşur: alanın sabit renkleri, arka plan
// fotoğrafından çıkarılan palet ve kullanıcının eklediği renkler.
const colorGroups = computed(() => [
  { id: 'sabit', label: null, colors: props.field.swatches ?? [] },
  { id: 'palet', label: 'Görselden', colors: editor.state.photoPalette },
  { id: 'kendi', label: 'Kendi', colors: editor.state.customColors, removable: true },
].filter(g => g.colors.length))

// ── Font seçici ──
// 70 font tek şeritte okunmuyor; gruplar sekmeye ayrıldı. Açılışta seçili
// fontun sekmesi gelir, sekme değişince o grubun CSS'i indirilir.
const fontTab = ref(getFont(props.modelValue).group)

watch(
  () => props.field.type === 'font' && props.modelValue,
  (id) => { if (id) fontTab.value = getFont(id).group },
)

watch(fontTab, (g) => ensureFontGroup(g), { immediate: true })

const tabFonts = computed(() => fontsByGroup(fontTab.value))

// Seçili font şeridin görünmeyen kısmında kalabiliyor (bir grupta 18 font
// var); sekme açılınca ya da seçim değişince görünür alana kaydırılır.
const stripRef = ref(null)

function revealActive() {
  requestAnimationFrame(() => {
    stripRef.value?.querySelector('.font-chip.active')
      ?.scrollIntoView({ block: 'nearest', inline: 'center' })
  })
}

watch([fontTab, () => props.modelValue], revealActive)
onMounted(() => { if (props.field.type === 'font') revealActive() })

function pickCustom(e) {
  const hex = e.target.value
  editor.addCustomColor(hex)
  value.value = hex
}

// Sürgülerin yanında sayısal okuma: Swiss düzende değer görünür olmalı,
// kullanıcı tahmin etmemeli.
const readout = computed(() => {
  const v = Number(value.value)
  if (!Number.isFinite(v)) return ''
  switch (props.field.unit) {
    case '%': return `${Math.round(v * 100)}%`
    case 'em': return v.toFixed(2)
    case '×': return `${v.toFixed(2)}×`
    case 'px': return `${Math.round(v)}`
    default: return String(Math.round(v * 100) / 100)
  }
})

// Etiket + denetim aynı ızgarada; textarea ve şeritler tam genişlik ister.
const fullWidth = computed(() =>
  ['textarea', 'font', 'phrase'].includes(props.field.type)
)
</script>

<template>
  <div class="field" :class="[`type-${field.type}`, { full: fullWidth }]">
    <label class="field-label">{{ field.label }}</label>

    <div class="field-control">
      <div v-if="field.type === 'color'" class="swatches">
        <template v-for="group in colorGroups" :key="group.id">
          <span v-if="group.label" class="swatch-label">{{ group.label }}</span>
          <button
            v-for="sw in group.colors"
            :key="group.id + sw"
            class="swatch"
            :class="{ active: value === sw }"
            :style="{ background: swatchColor(sw) }"
            :aria-label="sw === 'auto' ? 'Vakit rengi' : sw === 'tint' ? 'Soluk ton' : sw"
            :title="group.removable ? 'Uzun bas: kaldır' : null"
            @click="value = sw"
            @contextmenu.prevent="group.removable && editor.removeCustomColor(sw)"
          ></button>
        </template>

        <label class="swatch add" title="Renk ekle">
          <span aria-hidden="true">+</span>
          <input type="color" class="color-input" @input="pickCustom" />
        </label>
      </div>

      <div v-else-if="field.type === 'font'" class="font-picker">
        <div class="font-tabs">
          <button
            v-for="group in FONT_GROUPS"
            :key="group.id"
            class="font-tab"
            :class="{ active: fontTab === group.id, holds: getFont(value).group === group.id }"
            @click="fontTab = group.id"
          >{{ group.label }}</button>
        </div>

        <div ref="stripRef" class="fonts">
          <button
            v-for="f in tabFonts"
            :key="f.id"
            class="font-chip"
            :class="{ active: value === f.id }"
            :style="{ fontFamily: f.family }"
            @click="value = f.id"
          >{{ f.label }}</button>
        </div>
      </div>

      <div v-else-if="field.type === 'phrase'" class="phrases">
        <button
          v-for="p in phraseList(field.source)"
          :key="p.id"
          class="phrase-chip"
          :class="{ active: value === p.id }"
          :title="p.meal"
          @click="value = p.id"
        >
          <span class="phrase-ar" dir="rtl">{{ p.ar }}</span>
          <span class="phrase-tr">{{ p.tr }}</span>
        </button>
      </div>

      <select
        v-else-if="field.type === 'select' && field.compact"
        class="compact-select"
        :value="value"
        @change="value = field.options.find(o => String(o.value) === $event.target.value)?.value"
      >
        <option v-for="opt in field.options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>

      <div v-else-if="field.type === 'select'" class="segments">
        <button
          v-for="opt in field.options"
          :key="opt.value"
          class="segment"
          :class="{ active: value === opt.value }"
          @click="value = opt.value"
        >{{ opt.label }}</button>
      </div>

      <button
        v-else-if="field.type === 'toggle'"
        class="switch"
        :class="{ on: value }"
        role="switch"
        :aria-checked="value"
        @click="value = !value"
      ><span class="knob"></span></button>

      <div v-else-if="field.type === 'stepper'" class="stepper">
        <button
          class="step"
          :disabled="field.min != null && value <= field.min"
          aria-label="Azalt"
          @click="value = Number(value) - (field.step || 1)"
        >−</button>
        <output class="step-value">{{ field.format ? field.format(value) : value }}</output>
        <button
          class="step"
          :disabled="field.max != null && value >= field.max"
          aria-label="Artır"
          @click="value = Number(value) + (field.step || 1)"
        >+</button>
      </div>

      <template v-else-if="field.type === 'range'">
        <input
          class="range"
          type="range"
          :min="field.min" :max="field.max" :step="field.step"
          :value="value"
          @input="value = Number($event.target.value)"
        />
        <output class="readout">{{ readout }}</output>
      </template>

      <!-- v-model (:value + @input değil): Vue'nun vModelText direktifi IME
           bestesi sürerken DOM değerine dokunmuyor. Arapça klavye, mobil
           tahmin ve yapıştırma sırasında imlecin sona atlamasının sebebi
           buydu. dir="auto" ise alanın yönünü metne göre belirliyor;
           LTR bir alanda RTL metin düzenlemek imleci okunmaz kılıyordu. -->
      <!-- Tek satırlık <input> Enter alamıyor. Serbest metin alanları bu yüzden
           tek satır yüksekliğinde başlayıp içerikle uzayan bir textarea:
           görünüm aynı, ama satır sonu girilebiliyor. Saat gibi biçimi sabit
           alanlar `singleLine` ile bunun dışında tutulur. -->
      <input
        v-else-if="field.type === 'text' && field.singleLine"
        class="text-input"
        type="text"
        dir="auto"
        v-model="value"
        :placeholder="field.label"
      />

      <textarea
        v-else-if="field.type === 'text'"
        ref="textareaEl"
        class="text-input as-textarea"
        dir="auto"
        rows="1"
        v-model="value"
        :placeholder="field.label"
        @input="autoGrow"
      ></textarea>

      <textarea
        v-else-if="field.type === 'textarea'"
        ref="textareaEl"
        class="textarea"
        dir="auto"
        rows="2"
        v-model="value"
        @input="autoGrow"
      ></textarea>
    </div>
  </div>
</template>

<style scoped>
/* Swiss ızgara: etiket sabit bir kolonda, denetim ikinci kolonda sola
   dayalı. Böylece panel boyunca kesintisiz bir dikey hiza oluşur. */
.field {
  display: grid;
  grid-template-columns: var(--label-col) 1fr;
  align-items: center;
  gap: 0 1rem;
  min-height: 2.25rem;
}

.field.full {
  grid-template-columns: 1fr;
  align-items: stretch;
  gap: 0.35rem;
  padding: 0.3rem 0;
}

.field-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-muted);
  line-height: 1.2;
}

.field-control {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-width: 0;
}

/* ── Renk ── */
.swatches {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  overflow-x: auto;
  scrollbar-width: none;
}

.swatches::-webkit-scrollbar { display: none; }

.swatch-label {
  flex-shrink: 0;
  font-size: 0.5rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-dim);
  padding: 0 0.1rem 0 0.35rem;
}

.swatch {
  flex-shrink: 0;
  width: 1.375rem;
  height: 1.375rem;
  border: 1px solid var(--border);
  cursor: pointer;
  padding: 0;
}

/* Sistem renk seçicisini açan kare. Şerit uzayıp kaydırılabilir hale
   geldiğinde bile erişilebilir kalsın diye sağa yapışık duruyor. */
.swatch.add {
  display: grid;
  place-items: center;
  color: var(--text-muted);
  font-size: 0.8125rem;
  line-height: 1;
  position: sticky;
  right: 0;
  background-color: var(--bg);
  background-image: linear-gradient(var(--surface), var(--surface));
  box-shadow: -0.5rem 0 0.5rem -0.25rem var(--surface);
}

.color-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
  border: 0;
  padding: 0;
}

.swatch.active {
  box-shadow: inset 0 0 0 2px var(--surface), 0 0 0 1.5px var(--text);
  border-color: var(--text);
}

/* ── Font seçici: sekmeler + şerit ── */
.font-picker {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  width: 100%;
  min-width: 0;
}

.font-tabs {
  display: flex;
  gap: 0.9rem;
  overflow-x: auto;
  scrollbar-width: none;
  border-bottom: 1px solid var(--border);
}

.font-tabs::-webkit-scrollbar { display: none; }

.font-tab {
  position: relative;
  flex-shrink: 0;
  border: 0;
  background: transparent;
  color: var(--text-muted);
  font-family: inherit;
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 0 0 0.3rem;
  cursor: pointer;
}

.font-tab.active { color: var(--text); }

.font-tab.active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 1px;
  background: var(--text);
}

/* Seçili fontun hangi sekmede olduğu, o sekme kapalıyken de belli olsun. */
.font-tab.holds:not(.active)::before {
  content: '';
  position: absolute;
  top: 0.15rem;
  right: -0.3rem;
  width: 3px;
  height: 3px;
  background: var(--accent-ui);
}

.fonts,
.phrases {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  overflow-x: auto;
  padding-bottom: 0.2rem;
  scrollbar-width: none;
  width: 100%;
}

.fonts::-webkit-scrollbar,
.phrases::-webkit-scrollbar { display: none; }

/* Grup etiketi şeridin içinde akar; yatay kaydırmada ayraç görevi görür. */
.strip-label {
  flex-shrink: 0;
  font-size: 0.5625rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--text-dim);
  padding-right: 0.2rem;
}

.strip-label:not(:first-child) { padding-left: 0.5rem; }

.font-chip {
  flex-shrink: 0;
  padding: 0.35rem 0.6rem;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text);
  font-size: 0.9375rem;
  line-height: 1.3;
  white-space: nowrap;
  cursor: pointer;
}

.font-chip.active,
.phrase-chip.active {
  background: var(--text);
  color: var(--bg);
  border-color: var(--text);
}

.phrase-chip {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
  padding: 0.35rem 0.6rem;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text);
  cursor: pointer;
  white-space: nowrap;
}

.phrase-ar {
  font-family: 'Amiri', serif;
  font-size: 1.05rem;
  line-height: 1.5;
}

.phrase-tr {
  font-size: 0.5625rem;
  letter-spacing: 0.04em;
  opacity: 0.7;
}

.phrase-chip.active .phrase-tr { opacity: 0.85; }

/* ── Segment ── */
.segments {
  display: flex;
  border: 1px solid var(--border);
}

.segment {
  flex-shrink: 0;
  border: 0;
  border-right: 1px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.3rem 0.6rem;
  cursor: pointer;
  font-family: inherit;
}

.segment:last-child { border-right: 0; }

.segment.active {
  background: var(--text);
  color: var(--bg);
}

.compact-select {
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text);
  font-family: inherit;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.3rem 0.5rem;
  cursor: pointer;
}

.compact-select:focus { outline: none; border-color: var(--accent-ui); }
.compact-select option { background: var(--surface); color: var(--text); }

/* ── Anahtar ── */
.switch {
  width: 2.25rem;
  height: 1.25rem;
  border: 1px solid var(--border);
  background: transparent;
  padding: 0.125rem;
  cursor: pointer;
  display: flex;
  justify-content: flex-start;
}

.switch.on {
  background: var(--accent-ui);
  border-color: var(--accent-ui);
  justify-content: flex-end;
}

.knob {
  width: 0.875rem;
  height: 100%;
  background: var(--text-dim);
  display: block;
}

.switch.on .knob { background: var(--bg); }

/* ── Adımlı sayı (ay / yıl gibi) ── */
.stepper {
  display: flex;
  align-items: stretch;
  border: 1px solid var(--border);
}

.step {
  width: 1.75rem;
  border: 0;
  background: transparent;
  color: var(--text);
  font-family: inherit;
  font-size: 0.9375rem;
  line-height: 1;
  cursor: pointer;
  padding: 0.2rem 0;
}

.step:disabled { color: var(--text-dim); cursor: default; }

.step-value {
  min-width: 5.5rem;
  padding: 0.25rem 0.4rem;
  text-align: center;
  border-inline: 1px solid var(--border);
  font-size: 0.75rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

/* ── Kaydırıcı + sayısal okuma ── */
.range {
  flex: 1;
  min-width: 0;
  accent-color: var(--accent-ui);
}

.readout {
  flex-shrink: 0;
  min-width: 2.75rem;
  text-align: right;
  font-size: 0.75rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--text);
}

/* ── Metin ── */
.text-input {
  flex: 1;
  min-width: 0;
  border: 0;
  border-bottom: 1px solid var(--border);
  background: transparent;
  color: var(--text);
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.25rem 0;
}

.text-input::placeholder { color: var(--text-dim); font-weight: 400; }
.text-input:focus { outline: none; border-bottom-color: var(--accent-ui); }

/* Tek satırdan başlayıp uzayan textarea, <input> ile aynı görünsün. */
.text-input.as-textarea {
  resize: none;
  overflow: hidden;
  line-height: 1.45;
  font-family: inherit;
}

.textarea {
  width: 100%;
  resize: none;
  overflow: hidden; /* yükseklik içerikten hesaplanıyor */
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text);
  font-family: inherit;
  font-size: 0.875rem;
  line-height: 1.5;
  padding: 0.45rem 0.6rem;
}

.textarea:focus { outline: none; border-color: var(--accent-ui); }
</style>
