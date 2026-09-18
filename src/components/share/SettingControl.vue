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
</script>

<template>
  <div class="field" :class="`type-${field.type}`">
    <label class="field-label">{{ field.label }}</label>

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
        <span class="font-group">{{ group.label }}</span>
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

    <input
      v-else-if="field.type === 'range'"
      class="range"
      type="range"
      :min="field.min" :max="field.max" :step="field.step"
      :value="value"
      @input="value = Number($event.target.value)"
    />

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
</template>

<style scoped>
.field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.5rem 0;
  min-height: 2.75rem;
}

.type-phrase {
  flex-direction: column;
  align-items: stretch;
  gap: 0.4rem;
}

.type-font {
  flex-direction: column;
  align-items: stretch;
  gap: 0.4rem;
}

.type-textarea {
  flex-direction: column;
  align-items: stretch;
  gap: 0.4rem;
}

.field-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-muted);
  flex-shrink: 0;
}

/* ── Renk ── */
.swatches { display: flex; gap: 0.4rem; }

.swatch {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  border: 2px solid rgba(128, 128, 128, 0.4);
  cursor: pointer;
  padding: 0;
}

.swatch.active {
  border-color: var(--text);
  box-shadow: 0 0 0 2px var(--bg), 0 0 0 4px var(--text);
}

/* ── Hazır Arapça metinler ── */
.phrases {
  display: flex;
  gap: 0.4rem;
  overflow-x: auto;
  padding-bottom: 0.2rem;
  scrollbar-width: none;
}

.phrases::-webkit-scrollbar { display: none; }

.phrase-chip {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  padding: 0.45rem 0.8rem;
  border-radius: 0.5rem;
  border: 1px solid var(--border);
  background: color-mix(in srgb, var(--text) 6%, transparent);
  color: var(--text);
  cursor: pointer;
  white-space: nowrap;
}

.phrase-chip.active {
  border-color: var(--accent-ui);
  background: color-mix(in srgb, var(--accent-ui) 18%, transparent);
}

.phrase-ar {
  font-family: 'Amiri', serif;
  font-size: 1.15rem;
  line-height: 1.5;
}

.phrase-tr {
  font-size: 0.625rem;
  color: var(--text-muted);
}

/* ── Font şeridi ── */
.fonts {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  overflow-x: auto;
  padding-bottom: 0.2rem;
  scrollbar-width: none;
}

.fonts::-webkit-scrollbar { display: none; }

.font-chip {
  flex-shrink: 0;
  padding: 0.4rem 0.8rem;
  border-radius: 0.5rem;
  border: 1px solid var(--border);
  background: color-mix(in srgb, var(--text) 6%, transparent);
  color: var(--text);
  font-size: 1rem;
  line-height: 1.3;
  white-space: nowrap;
  cursor: pointer;
}

.font-chip.active {
  border-color: var(--accent-ui);
  background: color-mix(in srgb, var(--accent-ui) 18%, transparent);
}

/* Grup etiketi şeridin içinde akar; yatay kaydırmada ayraç görevi görür. */
.font-group {
  flex-shrink: 0;
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-dim);
  padding: 0 0.15rem 0 0.35rem;
}

.font-group:first-child { padding-left: 0; }

/* ── Segment ── */
.segments {
  display: flex;
  max-width: 70%;
  overflow-x: auto;
  scrollbar-width: none;
  background: color-mix(in srgb, var(--text) 8%, transparent);
  border-radius: 0.5rem;
  padding: 0.125rem;
}

.segments::-webkit-scrollbar { display: none; }

.segment {
  flex-shrink: 0;
  border: 0;
  background: transparent;
  color: var(--text-muted);
  font-size: 0.8125rem;
  font-weight: 600;
  padding: 0.35rem 0.7rem;
  border-radius: 0.4rem;
  cursor: pointer;
  font-family: inherit;
}

.segment.active {
  background: var(--text);
  color: var(--bg);
}

/* Seçenek sayısı fonta göre 1'den 7'ye çıkabildiği için kalınlık, segment
   şeridi yerine yer kaplamayan yerel bir açılır liste kullanır. */
.compact-select {
  max-width: 55%;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: color-mix(in srgb, var(--text) 8%, transparent);
  color: var(--text);
  font-family: inherit;
  font-size: 0.8125rem;
  font-weight: 600;
  padding: 0.35rem 0.6rem;
  cursor: pointer;
}

.compact-select:focus { outline: none; border-color: var(--accent-ui); }

.compact-select option {
  background: var(--surface);
  color: var(--text);
}

/* ── Anahtar ── */
.switch {
  width: 2.75rem;
  height: 1.6rem;
  border-radius: 1rem;
  border: 0;
  background: color-mix(in srgb, var(--text) 18%, transparent);
  padding: 0.18rem;
  cursor: pointer;
  display: flex;
  justify-content: flex-start;
}

.switch.on {
  background: var(--accent-ui);
  justify-content: flex-end;
}

.knob {
  width: 1.24rem;
  height: 1.24rem;
  border-radius: 50%;
  background: #fff;
  display: block;
}

/* ── Kaydırıcı ── */
.range {
  flex: 1;
  max-width: 60%;
  accent-color: var(--accent-ui);
}

.text-input {
  flex: 1;
  min-width: 0;
  max-width: 62%;
  text-align: right;
  border: 0;
  border-bottom: 1px solid var(--border);
  border-radius: 0;
  background: transparent;
  color: var(--text);
  font-family: inherit;
  font-size: 0.9375rem;
  font-weight: 600;
  padding: 0.3rem 0.1rem;
}

.text-input::placeholder {
  color: var(--text-dim);
  font-weight: 400;
}

.text-input:focus {
  outline: none;
  border-bottom-color: var(--accent-ui);
}

.textarea {
  width: 100%;
  resize: none;
  border-radius: 0.5rem;
  border: 1px solid var(--border);
  background: color-mix(in srgb, var(--text) 6%, transparent);
  color: var(--text);
  font-family: inherit;
  font-size: 0.9375rem;
  padding: 0.55rem 0.7rem;
}

.textarea:focus { outline: none; border-color: var(--accent-ui); }
</style>
