<script setup>
import { computed, ref, watch } from 'vue'
import { SURAHS, AUTHORS, surahById } from '@/data/kuranMeta'
import { fetchVerse, fetchRange, verseRef, eastern } from '@/utils/kuran'

/**
 * Ayet seçici — sure, ayet ve meal seçimi tek bir denetimde.
 *
 * Neden tek parça: üçü birbirine bağlı. Sure değişince ayet sınırı değişir,
 * meal eklenince yeni metin çekilmesi gerekir. Üç ayrı alan olsaydı her
 * birinin diğerlerinin durumunu bilmesi gerekirdi.
 *
 * Seçici metni ÇEKER ve katmanın ayarlarına yazar; widget ağa çıkmaz.
 * Sebebi dışa aktarım: tuval DOM'dan rasterize ediliyor, o sırada bekleyen
 * bir istek görsele "yükleniyor" olarak geçerdi. Yazılan metin sonrasında
 * elle düzenlenebilir — paylaşım parçalarının genel kuralı.
 */
const props = defineProps({
  modelValue: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['update:modelValue'])

// Tanınmış ayetler. Sure/ayet numarasını hatırlamak zorunda kalmadan
// başlanabilsin diye; liste bilinçli kısa tutuldu, arama değil kısayol.
const QUICK = [
  { label: 'Ayetel Kürsi', s: 2, v: 255 },
  { label: 'Amenerrasulü', s: 2, v: 285 },
  { label: 'Nur ayeti', s: 24, v: 35 },
  { label: 'İhlas', s: 112, v: 1 },
  { label: 'Felak', s: 113, v: 1 },
  { label: 'Nas', s: 114, v: 1 },
  { label: 'Rahman', s: 55, v: 13 },
  { label: 'İnşirah', s: 94, v: 5 },
]

const state = ref('idle')      // idle | loading | error
const errorText = ref('')

const current = computed(() => {
  const m = props.modelValue ?? {}
  const from = m.verse ?? 255
  return {
    surah: m.surah ?? 2,
    verse: from,
    // `to` yoksa tek ayet demektir. Ayrı bir "aralık mı" bayrağı yerine
    // son ayetin kendisi bayrak: iki alan birbiriyle çelişemez.
    to: m.to && m.to > from ? m.to : from,
    authors: m.authors?.length ? m.authors : [11],
    numbers: m.numbers !== false,
    // 'birlesik' | 'satir' | 'ayri' — eski kayıtlarda `stacked` boolean'ı
    // vardı, okunurken karşılığına çevriliyor.
    layout: m.layout ?? (m.stacked ? 'satir' : 'birlesik'),
  }
})

const LAYOUTS = [
  { id: 'birlesik', label: 'Birleşik', hint: 'Ayetler tek paragraf' },
  { id: 'satir', label: 'Satır satır', hint: 'Her ayet kendi satırında, mealler ayrı blokta' },
  { id: 'ayri', label: 'Ayet ayet', hint: 'Her ayetin Arapçası ve mealleri birlikte' },
]

/** Aralıkta en çok kaç ayet alınabilir — vekildeki sınırla aynı. */
const MAX_RANGE = 20

const maxVerse = computed(() => surahById(current.value.surah)?.verses ?? 7)

async function apply(patch) {
  const c = current.value
  const sel = {
    surah: patch.surah ?? c.surah,
    verse: patch.verse ?? c.verse,
    to: patch.to ?? c.to,
    authors: patch.authors ?? c.authors,
    numbers: patch.numbers ?? c.numbers,
    layout: patch.layout ?? c.layout,
  }

  // Sure değişince eski numaralar taşabilir.
  const max = surahById(sel.surah)?.verses ?? 1
  const clamp = (n) => Math.min(Math.max(1, Number(n) || 1), max)
  sel.verse = clamp(sel.verse)
  sel.to = clamp(sel.to)
  // İlk ayet sona geçerse aralığı ters çevirmek yerine tek ayete düşür:
  // kullanıcı ilk alanı ileri taşıyorsa niyeti genelde başlangıcı
  // kaydırmaktır, aralığı ters çevirmek değil.
  if (sel.to < sel.verse) sel.to = sel.verse
  if (sel.to - sel.verse + 1 > MAX_RANGE) sel.to = sel.verse + MAX_RANGE - 1

  if (!sel.authors.length) sel.authors = [11]

  state.value = 'loading'
  errorText.value = ''
  try {
    const meta = surahById(sel.surah)
    const single = sel.to === sel.verse
    const named = (id) => AUTHORS.find((a) => a.id === id)?.name ?? ''

    let payload
    if (single) {
      const d = await fetchVerse(sel.surah, sel.verse, sel.authors)
      payload = {
        ar: d.ar,
        tx: d.tx,
        meals: sel.authors.map((id) => ({ id, name: named(id), text: d.trs[id] ?? '' })),
        verses: [{
          n: sel.verse,
          ar: d.ar,
          tx: d.tx,
          meals: sel.authors.map((id) => ({ id, name: named(id), text: d.trs[id] ?? '' })),
        }],
      }
    } else {
      const d = await fetchRange(sel.surah, sel.verse, sel.to, sel.authors)
      const n = (i) => sel.verse + i
      // Arapça'da numara ayetin SONUNDA, süslü parantez içinde ve doğu
      // rakamlarıyla — mushaf dizgisinin yerleşik biçimi. Latin metinde
      // başta ve normal rakamla, Türkçe meal yayınlarındaki gibi.
      const markAr = (t, i) => (sel.numbers ? `${t} ﴿${eastern(n(i))}﴾` : t)
      const markLatin = (t, i) => (sel.numbers ? `(${n(i)}) ${t}` : t)
      // 'ayri' kipinde her ayet zaten kendi bloğunda; araya ayırıcı
      // koymanın anlamı yok, blokların kendisi ayırıcı.
      const sep = sel.layout === 'satir' ? '\n' : ' '

      payload = {
        ar: d.ar.map(markAr).join(sep),
        tx: d.tx.map(markLatin).join(sep),
        meals: sel.authors.map((id) => ({
          id,
          name: named(id),
          text: (d.trs[id] ?? []).map(markLatin).join(sep),
        })),
        // Yapılı hâli 'ayri' kipi için; birleşik metinle birlikte
        // yazılıyor ki kip değiştirince yeniden istek gerekmesin.
        verses: d.ar.map((ar, i) => ({
          n: n(i),
          ar: markAr(ar, i),
          tx: d.tx[i] ?? '',
          meals: sel.authors.map((id) => ({
            id, name: named(id), text: (d.trs[id] ?? [])[i] ?? '',
          })),
        })),
      }
    }

    state.value = 'idle'
    emit('update:modelValue', {
      ayet: sel,
      ...payload,
      ref: verseRef(meta?.name ?? '', sel.surah, sel.verse, sel.to),
    })
  } catch (e) {
    state.value = 'error'
    errorText.value = e.retryAfter
      ? `Sınır doldu, ${e.retryAfter} sn sonra deneyin`
      : (e.message ?? 'Ayet alınamadı')
  }
}

function toggleAuthor(id) {
  const list = current.value.authors
  const next = list.includes(id) ? list.filter((a) => a !== id) : [...list, id]
  if (!next.length) return   // En az bir meal açık kalmalı
  apply({ authors: next })
}

const byLang = (lang) => AUTHORS.filter((a) => a.lang === lang)

// Katman eklendiğinde metin zaten ön tanımlı geliyor; ilk açılışta
// kendiliğinden istek atılmaz.
watch(() => props.modelValue?.surah, () => { state.value = 'idle' })
</script>

<template>
  <div class="ayet-picker">
    <div class="row">
      <select
        class="surah"
        :value="current.surah"
        @change="apply({ surah: Number($event.target.value), verse: 1, to: 1 })"
      >
        <option v-for="s in SURAHS" :key="s.id" :value="s.id">
          {{ s.id }}. {{ s.name }}
        </option>
      </select>
      <input
        class="verse"
        type="number"
        min="1"
        :max="maxVerse"
        :value="current.verse"
        title="İlk ayet"
        @change="apply({ verse: Number($event.target.value) })"
      />
      <span class="dash">–</span>
      <input
        class="verse"
        type="number"
        :min="current.verse"
        :max="maxVerse"
        :value="current.to"
        title="Son ayet (aynıysa tek ayet)"
        @change="apply({ to: Number($event.target.value) })"
      />
      <span class="of">/ {{ maxVerse }}</span>
    </div>

    <!-- Aralık dışında ikisinin de anlamı yok: tek ayette numaralandıracak
         bir şey, alt alta dizecek bir şey yok. -->
    <template v-if="current.to > current.verse">
      <label class="opt">
        <input
          type="checkbox"
          :checked="current.numbers"
          @change="apply({ numbers: $event.target.checked })"
        />
        Ayet numaralarını metne ekle
      </label>
      <div class="layouts">
        <button
          v-for="l in LAYOUTS"
          :key="l.id"
          class="chip"
          :class="{ active: current.layout === l.id }"
          :title="l.hint"
          @click="apply({ layout: l.id })"
        >{{ l.label }}</button>
      </div>
    </template>

    <div class="quick">
      <button
        v-for="q in QUICK"
        :key="q.label"
        class="chip"
        :class="{ active: current.surah === q.s && current.verse === q.v }"
        @click="apply({ surah: q.s, verse: q.v, to: q.v })"
      >{{ q.label }}</button>
    </div>

    <div class="meals">
      <span class="lang">Türkçe</span>
      <button
        v-for="a in byLang('tr')"
        :key="a.id"
        class="chip"
        :class="{ active: current.authors.includes(a.id) }"
        @click="toggleAuthor(a.id)"
      >{{ a.name }}</button>
      <span class="lang">İngilizce</span>
      <button
        v-for="a in byLang('en')"
        :key="a.id"
        class="chip"
        :class="{ active: current.authors.includes(a.id) }"
        @click="toggleAuthor(a.id)"
      >{{ a.name }}</button>
    </div>

    <p v-if="state === 'loading'" class="status">Ayet getiriliyor…</p>
    <p v-else-if="state === 'error'" class="status error">{{ errorText }}</p>
  </div>
</template>

<style scoped>
.ayet-picker {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.row {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Açılır listenin koyu modda okunmaması burada değil, base.css'te
   çözüldü: varsayılan `:root` bloğunda `color-scheme: dark` eksikti ve
   sorun uygulamadaki her yerel denetimi etkiliyordu. */
.surah,
.verse {
  background: color-mix(in srgb, var(--text) 7%, transparent);
  border: 1px solid color-mix(in srgb, var(--text) 12%, transparent);
  border-radius: 6px;
  color: var(--text);
  font: inherit;
  font-size: 12px;
  padding: 5px 7px;
}

.surah { flex: 1; min-width: 0; }
.verse { width: 54px; }

.of {
  font-size: 10px;
  opacity: 0.45;
}

.dash {
  font-size: 11px;
  opacity: 0.5;
}

.opt {
  align-items: center;
  cursor: pointer;
  display: flex;
  font-size: 10.5px;
  gap: 6px;
  opacity: 0.8;
}

.opt input {
  accent-color: var(--accent-ui);
  margin: 0;
}

.quick,
.meals,
.layouts {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

/* Şerit sarılır, yatay kaydırılmaz: farede tekerlek dikey kaydırıyor ve
   şeridin sonundaki öğeler fark edilmiyordu (bkz. CLAUDE.md). */
.chip {
  background: color-mix(in srgb, var(--text) 6%, transparent);
  border: 1px solid transparent;
  border-radius: 5px;
  color: var(--text);
  cursor: pointer;
  font-size: 10.5px;
  letter-spacing: 0.2px;
  padding: 4px 7px;
}

.chip:hover { background: color-mix(in srgb, var(--text) 12%, transparent); }

.chip.active {
  background: color-mix(in srgb, var(--accent-ui) 22%, transparent);
  border-color: var(--accent-ui);
}

.lang {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.9px;
  opacity: 0.45;
  width: 100%;
  margin-top: 2px;
}

.status {
  font-size: 10.5px;
  margin: 0;
  opacity: 0.6;
}

.status.error {
  color: var(--accent-ui);
  opacity: 1;
}
</style>
