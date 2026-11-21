<script setup>
import { ref, computed } from 'vue'
import { useHatimStore } from '@/stores/hatim'
import { PAGE_COUNT, juzOfPage, surahOfPage } from '@/utils/mushaf'
import HatimRing from './HatimRing.vue'
import HatimCalendar from './HatimCalendar.vue'

/**
 * Hatim listesi ve yeni hatim başlatma.
 *
 * Liste "kaç sayfa kaldı" demiyor, NİYETİ gösteriyor: hatim bir sayaç
 * değil bir söz.
 *
 * Önce etkin hatim için ayrı bir üst blok vardı (halka + şerit + kaldığın
 * yer) ve altta bir de liste. İki sakıncası ölçüldü: aynı hatim ekranda
 * iki kez duruyordu, ve okuyucuya girip çıkınca üstteki blok başka bir
 * hatme geçiyordu — hangisine baktığın kayıyordu. Şimdi tek bir liste
 * var ve HER SATIR kendi görselleştirmesini taşıyor; açık olan satır
 * şeridini ve kaldığın yeri gösterir.
 */
const emit = defineEmits(['read'])
const hatim = useHatimStore()

const niyet = ref('')
const opening = ref(false)
/** Açık satır: başlangıçta en son okunan (etkin) hatim. */
const open = ref(hatim.activeId)

function create() {
  const text = niyet.value.trim()
  if (!text) return
  const h = hatim.start(text)
  niyet.value = ''
  opening.value = false
  emit('read', h.id, 1)
}

const toggle = (id) => { open.value = open.value === id ? null : id }

const dateText = (iso) => {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
}

const confirmId = ref(null)

/**
 * En üstteki genel çizelge: bütün hatimlerin TOPLAMI.
 *
 * Tek tek hatimler aşağıda kendi şeritlerini taşıyor; buradaki şerit
 * "bugün hiç okudum mu" ve "bu ay nasıl gitti" sorularının cevabı —
 * hangi hatme yazıldığına bakmaksızın. Hatim bitip yenisi başladığında
 * da süreklilik burada görünür.
 */
const totals = computed(() => ({
  pages: hatim.totalPages(),
  hatims: hatim.list.length,
  done: hatim.list.filter((h) => h.finishedAt).length,
  byDay: hatim.allByDay(),
}))
</script>

<template>
  <div class="hatim">
    <section v-if="hatim.list.length" class="totals">
      <div class="totals-head">
        <span class="totals-num">{{ totals.pages }}</span>
        <span class="totals-unit">sayfa</span>
        <span class="totals-sub">
          {{ totals.hatims }} hatim<template v-if="totals.done"> · {{ totals.done }} tamamlandı</template>
        </span>
      </div>
      <HatimCalendar :by-day="totals.byDay" />
    </section>

    <section class="new">
      <button v-if="!opening" class="new-btn" @click="opening = true">+ Yeni hatim</button>
      <form v-else class="new-form" @submit.prevent="create">
        <label class="field">
          <span class="field-label">Niyet</span>
          <input
            v-model="niyet"
            class="input"
            type="text"
            maxlength="80"
            placeholder="Kimin için, neye niyetle"
            autofocus
          />
        </label>
        <div class="form-actions">
          <button type="submit" class="primary" :disabled="!niyet.trim()">Başlat</button>
          <button type="button" class="ghost" @click="opening = false; niyet = ''">Vazgeç</button>
        </div>
      </form>
    </section>

    <section v-if="hatim.list.length" class="list">
      <ul class="rows">
        <li v-for="h in hatim.list" :key="h.id" class="card" :class="{ open: open === h.id }">
          <div class="card-head">
            <button class="card-open" @click="toggle(h.id)">
              <HatimRing :ratio="hatim.ratio(h)" :size="open === h.id ? 76 : 48" />
              <span class="card-text">
                <span class="card-niyet">{{ h.niyet }}</span>
                <span class="card-sub">
                  {{ hatim.readCount(h) }} / {{ PAGE_COUNT }} sayfa ·
                  {{ h.finishedAt ? dateText(h.finishedAt) + '’de tamamlandı' : dateText(h.startedAt) + '’de başladı' }}
                </span>
              </span>
            </button>

            <!-- Silme, okuma düğmesinin yanında durmaz: ikisi yan yanayken
                 yanlış olana basmak bir dokunuş uzaklıkta. Satırın öbür
                 ucunda, yalnızca açık kartta. -->
            <button
              v-if="open === h.id"
              class="del"
              :class="{ armed: confirmId === h.id }"
              @click="confirmId === h.id ? (hatim.remove(h.id), confirmId = null) : (confirmId = h.id)"
            >{{ confirmId === h.id ? 'Emin misin?' : 'Sil' }}</button>
          </div>

          <div v-if="open === h.id" class="card-body">
            <HatimCalendar :by-day="hatim.byDay(h)" />

            <button class="resume" @click="emit('read', h.id, hatim.nextPage(h))">
              {{ hatim.readCount(h) ? 'Kaldığın yerden oku' : 'Okumaya başla' }}
              <span class="resume-page">
                s. {{ hatim.nextPage(h) }} · {{ surahOfPage(hatim.nextPage(h))?.name }}
                · {{ juzOfPage(hatim.nextPage(h)) }}. cüz
              </span>
            </button>
          </div>
        </li>
      </ul>
    </section>

    <p v-else class="empty">
      Bir niyetle hatme başla; okuduğun sayfalar burada birikir.
    </p>
  </div>
</template>

<style scoped>
.hatim { display: flex; flex-direction: column; gap: 1.5rem; padding-top: 1rem; }

.totals-head {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.totals-num {
  font-size: 2.1rem;
  font-weight: 500;
  letter-spacing: -0.03em;
  line-height: 1;
}

.totals-unit {
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.totals-sub {
  flex: 1;
  text-align: right;
  font-size: 0.68rem;
  color: var(--text-muted);
}

.new-btn, .primary, .ghost {
  font: inherit;
  font-size: 0.8rem;
  padding: 0.5rem 0.9rem;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-muted);
}

.new-btn:hover, .ghost:hover { color: var(--text); border-color: var(--text); }

.primary {
  background: var(--accent-ui);
  border-color: var(--accent-ui);
  color: #fff;
}

.primary:disabled { opacity: 0.4; cursor: default; }

.new-form { display: flex; flex-direction: column; gap: 0.75rem; }
.field { display: flex; flex-direction: column; gap: 0.35rem; }

.field-label {
  font-size: 0.6rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.input {
  font: inherit;
  font-size: 0.95rem;
  padding: 0.55rem 0.7rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: transparent;
  color: var(--text);
  width: 100%;
  max-width: 26rem;
}

.input:focus-visible { outline: 2px solid var(--accent-ui); outline-offset: 1px; }
.form-actions { display: flex; gap: 0.5rem; }

/* Satırlar birbirine çok yakındı ve hangi niyetin hangi tarihe ait
   olduğu karışıyordu: kartlar arasına boşluk kondu ve ayırıcı çizgi
   yerini kartın kendi kenarlığına bıraktı. Kapalı kart sade kalır —
   zemin yalnızca AÇIK olanda var, "şu an buna bakıyorum" demek için. */
.rows {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.card {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0 0.75rem;
  transition: background-color 0.14s;
}

/* Açık kart: mat zemin (`--surface` bazı paletlerde saydam) + solda
   aksan çubuğu. Kalınlaşan niyet yazısı tek başına yetmiyordu. */
.card.open {
  background-color: var(--bg);
  background-image: linear-gradient(var(--surface), var(--surface));
  border-color: color-mix(in srgb, var(--accent-ui) 45%, var(--border));
  box-shadow: inset 3px 0 0 var(--accent-ui);
}

.card-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-open {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.05rem 0;
  background: transparent;
  border: none;
  color: var(--text);
  font: inherit;
  cursor: pointer;
  text-align: left;
}

.card-text { display: flex; flex-direction: column; gap: 0.25rem; min-width: 0; }

.card-niyet {
  font-size: 0.95rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card.open .card-niyet { font-size: 1.15rem; font-weight: 500; letter-spacing: -0.01em; }
.card-sub { font-size: 0.66rem; line-height: 1.45; color: var(--text-muted); }
.card-body { padding-bottom: 1rem; display: flex; flex-direction: column; gap: 0.9rem; }

.resume {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.15rem;
  padding: 0.5rem 0.85rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: transparent;
  color: var(--text);
  font: inherit;
  font-size: 0.82rem;
  cursor: pointer;
  text-align: left;
}

.resume:hover { border-color: var(--text); }
.resume-page { font-size: 0.65rem; color: var(--text-muted); }

.del {
  flex: 0 0 auto;
  align-self: flex-start;
  margin-top: 1.05rem;
  font: inherit;
  font-size: 0.65rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-muted);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
}

.del.armed { color: var(--primary); }
.empty { font-size: 0.85rem; color: var(--text-muted); line-height: 1.6; }

@media (min-width: 900px) {
  .card.open .card-niyet { font-size: 1.3rem; }
}
</style>
