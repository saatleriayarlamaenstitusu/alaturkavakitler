<script setup>
import { computed } from 'vue'
import { FONT_GROUPS, fontsByScript } from '@/data/shareFonts'
import { phraseList } from '@/data/phraseSets'

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

// 'auto' swatch'i vakit rengini temsil eder.
const swatchColor = (sw) => (sw === 'auto' ? props.accent : sw)

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
        <button
          v-for="sw in field.swatches"
          :key="sw"
          class="swatch"
          :class="{ active: value === sw }"
          :style="{ background: swatchColor(sw) }"
          :aria-label="sw === 'auto' ? 'Vakit rengi' : sw"
          @click="value = sw"
        ></button>
      </div>

      <div v-else-if="field.type === 'font'" class="fonts">
        <template v-for="group in FONT_GROUPS" :key="group.id">
          <span class="strip-label">{{ group.label }}</span>
          <button
            v-for="f in fontsByScript(group.id)"
            :key="f.id"
            class="font-chip"
            :class="{ active: value === f.id }"
            :style="{ fontFamily: f.family }"
            @click="value = f.id"
          >{{ f.label }}</button>
        </template>
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

      <input
        v-else-if="field.type === 'text'"
        class="text-input"
        type="text"
        :value="value"
        :placeholder="field.label"
        @input="value = $event.target.value"
      />

      <textarea
        v-else-if="field.type === 'textarea'"
        class="textarea"
        rows="2"
        :value="value"
        @input="value = $event.target.value"
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
.swatches { display: flex; gap: 0.3rem; }

.swatch {
  width: 1.375rem;
  height: 1.375rem;
  border: 1px solid var(--border);
  cursor: pointer;
  padding: 0;
}

.swatch.active {
  box-shadow: inset 0 0 0 2px var(--surface), 0 0 0 1.5px var(--text);
  border-color: var(--text);
}

/* ── Font şeridi ── */
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

.textarea {
  width: 100%;
  resize: none;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text);
  font-family: inherit;
  font-size: 0.875rem;
  padding: 0.45rem 0.6rem;
}

.textarea:focus { outline: none; border-color: var(--accent-ui); }
</style>
