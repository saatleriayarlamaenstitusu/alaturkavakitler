<script setup>
import { onMounted, ref, useId } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { HATIM_PRESETS, QURAN_VIEWS, presetReader, snapshotReader } from '@/data/hatimReader'
import { AUTHORS } from '@/data/kuranMeta'
import { QURAN_FONTS } from '@/data/quranFonts'
import { MEAL_FONTS } from '@/data/mealFonts'
import { availableReciters } from '@/data/reciters'
import { MUSHAF_SCRIPTS } from '@/utils/qpc'

const props = defineProps({ hatim: Object })
const emit = defineEmits(['submit', 'cancel'])
const settings = useSettingsStore()
const id = useId()
const reciters = availableReciters()
const niyet = ref(props.hatim?.niyet ?? '')
const nameInput = ref(null)
onMounted(() => nameInput.value?.focus())
const preset = ref('current')
const reader = ref(snapshotReader(props.hatim?.reader, settings))

function choosePreset() {
  reader.value = presetReader(preset.value, settings)
}

function submit() {
  const name = niyet.value.trim()
  if (name) emit('submit', { niyet: name, reader: snapshotReader(reader.value) })
}
</script>

<template>
  <form class="hatim-form" :aria-label="hatim ? 'Hatmi düzenle' : 'Yeni hatim'" @submit.prevent="submit">
    <div class="field">
      <label :for="`${id}-name`">Hatim adı</label>
      <input :id="`${id}-name`" ref="nameInput" v-model="niyet" type="text" maxlength="80" placeholder="Kimin için, neye niyetle" required />
    </div>

    <fieldset v-if="!hatim" class="presets">
      <legend>Başlangıç ayarları</legend>
      <label v-for="option in HATIM_PRESETS" :key="option.id" class="preset">
        <input v-model="preset" type="radio" :name="`${id}-preset`" :value="option.id" @change="choosePreset" />
        <span>{{ option.label }} <small>{{ option.description }}</small></span>
      </label>
    </fieldset>

    <details :open="Boolean(hatim)" class="details">
      <summary>Okuma ayarları</summary>
      <div class="fields">
        <div class="field">
          <label :for="`${id}-view`">Görünüm</label>
          <select :id="`${id}-view`" v-model="reader.quranView">
            <option v-for="view in QURAN_VIEWS" :key="view.id" :value="view.id">{{ view.label }}</option>
          </select>
        </div>
        <div class="field">
          <label :for="`${id}-reciter`">Kârî</label>
          <select :id="`${id}-reciter`" v-model="reader.quranReciter">
            <option v-for="reciter in reciters" :key="reciter.id" :value="reciter.id">
              {{ reciter.name }}<template v-if="reciter.style"> · {{ reciter.style }}</template>
            </option>
          </select>
        </div>
        <div class="field">
          <label :for="`${id}-script`">Mushaf hattı</label>
          <select :id="`${id}-script`" v-model="reader.quranScript">
            <option v-for="script in MUSHAF_SCRIPTS" :key="script.id" :value="script.id">{{ script.label }}</option>
          </select>
        </div>
        <div class="field">
          <label :for="`${id}-font`">Arapça yazı tipi</label>
          <select :id="`${id}-font`" v-model="reader.quranFont">
            <option v-for="font in QURAN_FONTS" :key="font.id" :value="font.id">{{ font.label }}</option>
          </select>
        </div>
        <div class="field">
          <label :for="`${id}-size`">Arapça yazı boyutu (%)</label>
          <input :id="`${id}-size`" v-model.number="reader.quranFontSize" type="number" min="70" max="180" step="10" required />
        </div>
        <div class="field">
          <label :for="`${id}-meal-font`">Meal yazı tipi</label>
          <select :id="`${id}-meal-font`" v-model="reader.quranMealFont">
            <option v-for="font in MEAL_FONTS" :key="font.id" :value="font.id">{{ font.label }}</option>
          </select>
        </div>
      </div>
      <fieldset class="choices">
        <legend>Okuma seçenekleri</legend>
        <label v-if="reader.quranView !== 'mushaf'">
          <input v-model="reader.quranArabicHidden" type="checkbox" :disabled="!reader.quranMeals.length" />
          Arapça kapalı
        </label>
        <label><input v-model="reader.immersive" type="checkbox" /> Tam ekran</label>
        <label><input v-model="reader.quranTajweed" type="checkbox" /> Renkli tecvit</label>
        <label><input v-model="reader.quranAutoScroll" type="checkbox" /> Okunan ayeti takip et</label>
      </fieldset>
      <fieldset class="choices">
        <legend>Mealler</legend>
        <label v-for="author in AUTHORS" :key="author.id">
          <input v-model="reader.quranMeals" type="checkbox" :value="author.id" />
          {{ author.name }}
        </label>
      </fieldset>
    </details>

    <div class="actions">
      <button type="submit" class="primary" :disabled="!niyet.trim()">{{ hatim ? 'Kaydet' : 'Başlat' }}</button>
      <button type="button" @click="emit('cancel')">Vazgeç</button>
    </div>
  </form>
</template>

<style scoped>
.hatim-form { display: grid; gap: 0.85rem; max-width: 32rem; }
.field { display: grid; gap: 0.35rem; min-width: 0; }
.field > label, legend, small { color: var(--text-muted); font-size: 0.73rem; }
.field input, .field select, .actions button {
  box-sizing: border-box;
  min-width: 0;
  min-height: 2.3rem;
  padding: 0.45rem 0.6rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
  color: var(--text);
  font: inherit;
  font-size: 0.82rem;
}
fieldset { display: grid; gap: 0.4rem; min-width: 0; margin: 0; padding: 0; border: 0; }
legend { margin-bottom: 0.4rem; }
.preset {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.55rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 0.82rem;
}
small { display: block; margin-top: 0.15rem; }
.details { border-top: 1px solid var(--border); padding-top: 0.55rem; font-size: 0.82rem; }
summary { width: fit-content; cursor: pointer; }
.fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 8.75rem), 1fr));
  gap: 0.65rem;
  margin-top: 0.65rem;
}
.choices { margin-top: 0.8rem; }
.choices label { display: flex; gap: 0.4rem; align-items: center; min-height: 1.65rem; }
input[type="radio"], input[type="checkbox"] { accent-color: var(--accent-ui); margin: 0; }
.actions { display: flex; gap: 0.5rem; }
.actions button { cursor: pointer; }
.actions .primary { background: var(--text); color: var(--bg); border-color: var(--text); }
.actions .primary:disabled { opacity: 0.4; cursor: default; }
</style>
