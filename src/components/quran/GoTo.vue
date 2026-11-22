<script setup>
import { ref, computed, nextTick } from 'vue'
import { SURAHS } from '@/data/kuranMeta'
import { pageOfVerse, pageOfSurah, pageOfJuz, clampPage, PAGE_COUNT, juzOfPage } from '@/utils/mushaf'

/**
 * Tek kutuyla gitme.
 *
 * Önce dört ayrı açılır liste vardı (sure / cüz / sayfa / meal) ve bir
 * ayete gitmenin yolu yoktu: önce sureyi seç, sonra sayfayı tahmin et.
 * Burada tek bir alan var ve ne yazıldığını kendisi anlıyor:
 *
 *   bakara 255   2:255   2/255   2 255     → ayet
 *   bakara       yasin                     → surenin başı
 *   42           s42     sayfa 42    → sayfa
 *   c5           cüz 5               → cüz
 *
 * Çok anlamlı girdilerde (örn. "30") seçenekler ALT ALTA listelenir —
 * tahmin etmek yerine sormak, yanlış yere gitmekten iyidir.
 */
const emit = defineEmits(['go'])

const text = ref('')
const openList = ref(false)
const cursor = ref(0)
const input = ref(null)

/** Türkçe duyarsız karşılaştırma: "İhlas" ile "ihlas" aynı sayılmalı. */
const fold = (s) => s
  .toLocaleLowerCase('tr-TR')
  .replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g')
  .replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c')
  .replace(/[^a-z0-9]/g, '')

const SURAH_INDEX = SURAHS.map((s) => ({ ...s, folded: fold(s.name) }))

const verseLabel = (s, v) => `${s.name} ${v}`

function suggest(raw) {
  const q = raw.trim()
  if (!q) return []
  const out = []
  const push = (o) => { if (out.length < 8 && !out.some((x) => x.page === o.page && x.label === o.label)) out.push(o) }

  // 2:255 · 2.255 · 2/255 · 2 255 · 2-255
  const pair = q.match(/^(\d{1,3})(?:\s*[:.\/-]\s*|\s+)(\d{1,3})$/)
  if (pair) {
    const s = SURAHS.find((x) => x.id === Number(pair[1]))
    const v = Number(pair[2])
    if (s && v >= 1 && v <= s.verses)
      push({ label: verseLabel(s, v), hint: `sayfa ${pageOfVerse(s.id, v)}`, page: pageOfVerse(s.id, v), verse: { surah: s.id, verse: v } })
  }

  // Ön ekli yazım önce bakılır: "s42" bir sure adı araması değil, sayfa.
  const pref = q.match(/^(s|sayfa|c|cüz|cuz|cz)\s*(\d{1,3})$/i)
  if (pref) {
    const n = Number(pref[2])
    const isPage = /^s/i.test(pref[1])
    if (isPage && n <= PAGE_COUNT) push({ label: `Sayfa ${n}`, hint: `${juzOfPage(n)}. cüz`, page: n })
    if (!isPage && n >= 1 && n <= 30) push({ label: `${n}. cüz`, hint: `sayfa ${pageOfJuz(n)}`, page: pageOfJuz(n) })
  }

  // "bakara 255" · "yasin" · "ihl"
  // Ön ek veya iki sayı yakalandıysa ad araması yapılmaz; yoksa "s42"
  // bütün S'li surelerin 42. ayetini listeliyor ve asıl istenen kayboluyor.
  const named = (pref || pair) ? null : q.match(/^(.+?)\s*(\d{1,3})?$/)
  if (named) {
    const key = fold(named[1])
    const num = named[2] ? Number(named[2]) : null
    // Tek harf ad araması işe yaramıyor (yarısı eşleşiyor); iki harften
    // başlar. Sayı verilmişse tek harf de anlamlı olabilir ("c5" zaten
    // yukarıda yakalandı), orada da iki harf aranır.
    if (key.length >= 2) {
      for (const s of SURAH_INDEX) {
        if (!s.folded.startsWith(key) && !s.folded.includes(key)) continue
        if (num && num >= 1 && num <= s.verses) {
          const page = pageOfVerse(s.id, num)
          push({ label: verseLabel(s, num), hint: `sayfa ${page}`, page, verse: { surah: s.id, verse: num } })
        } else if (!num) {
          const page = pageOfSurah(s.id)
          // Sure hedefi İLK AYETİNİ de taşır: sure sayfanın ortasında
          // başlıyor olabiliyor (Kehf 293'te) ve yalnızca sayfa
          // verilirse hem vurgu hem kıraat sayfanın başındaki ÖNCEKİ
          // sureden başlıyordu.
          push({
            label: `${s.id}. ${s.name}`,
            hint: `sayfa ${page} · ${juzOfPage(page)}. cüz`,
            page,
            verse: { surah: s.id, verse: 1 },
          })
        }
      }
    }
  }

  // Yalın sayı: sayfa / sure / cüz — hepsi seçenek olarak sunulur
  const bare = q.match(/^(\d{1,3})$/)
  if (bare) {
    const n = Number(bare[1])
    if (n >= 1 && n <= PAGE_COUNT) push({ label: `Sayfa ${n}`, hint: `${juzOfPage(n)}. cüz`, page: n })
    const s = SURAHS.find((x) => x.id === n)
    if (s) push({
      label: `${s.id}. ${s.name}`,
      hint: `sayfa ${pageOfSurah(s.id)}`,
      page: pageOfSurah(s.id),
      verse: { surah: s.id, verse: 1 },
    })
    if (n >= 1 && n <= 30) push({ label: `${n}. cüz`, hint: `sayfa ${pageOfJuz(n)}`, page: pageOfJuz(n) })
  }

  return out
}

const items = computed(() => suggest(text.value))

function choose(item) {
  if (!item) return
  emit('go', clampPage(item.page), item.verse ?? null)
  text.value = ''
  openList.value = false
  input.value?.blur()
}

function onKey(e) {
  if (!items.value.length) return
  if (e.key === 'ArrowDown') { cursor.value = (cursor.value + 1) % items.value.length; e.preventDefault() }
  else if (e.key === 'ArrowUp') { cursor.value = (cursor.value - 1 + items.value.length) % items.value.length; e.preventDefault() }
  else if (e.key === 'Enter') { choose(items.value[cursor.value]); e.preventDefault() }
  else if (e.key === 'Escape') { openList.value = false }
}

function onInput() {
  cursor.value = 0
  openList.value = true
}

// Seçenek listesi tıklamayla kapanmasın diye blur geciktirilir.
const onBlur = () => setTimeout(() => { openList.value = false }, 120)
const onFocus = () => { if (items.value.length) openList.value = true }
</script>

<template>
  <div class="goto">
    <!-- Büyüteç: kutu bir arama kutusu olduğunu yer tutucu metninden
         söylüyordu ve o metin daraldıkça kırpılıyordu. -->
    <svg class="goto-icon" viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
      <path d="M10.5 3a7.5 7.5 0 1 0 4.55 13.46l4.24 4.25 1.42-1.42-4.25-4.24A7.5 7.5 0 0 0 10.5 3zm0 2a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11z" />
    </svg>
    <input
      ref="input"
      v-model="text"
      class="goto-input"
      type="text"
      inputmode="text"
      placeholder="bakara 255 · 2:255 · s42 · c5"
      autocomplete="off"
      spellcheck="false"
      @input="onInput"
      @keydown="onKey"
      @focus="onFocus"
      @blur="onBlur"
    />

    <ul v-if="openList && items.length" class="goto-list">
      <li v-for="(it, i) in items" :key="it.label + it.page">
        <button
          class="goto-item"
          :class="{ on: i === cursor }"
          @mousedown.prevent="choose(it)"
          @mouseenter="cursor = i"
        >
          <span class="goto-label">{{ it.label }}</span>
          <span class="goto-hint">{{ it.hint }}</span>
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
/* Dar ekranda arama kutusu KÜÇÜLÜR, komşuları değil: yer tutucu metni
   kırpılsa da kutunun ne olduğu büyüteçten okunuyor, oysa yanındaki
   meal düğmesinde kırpılan şey mütercimin adı. */
.goto { position: relative; flex: 1 1 8rem; min-width: 7rem; }

/* İkon kutunun İÇİNDE durur (ayrı bir eleman olarak yanında değil):
   yanında olsaydı şeritte kendi yerini isterdi ve arama kutusu o kadar
   daralırdı. */
.goto-icon {
  position: absolute;
  left: 0.55rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.goto-input {
  width: 100%;
  font: inherit;
  font-size: 0.85rem;
  padding: 0.5rem 0.7rem 0.5rem 1.9rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: transparent;
  color: var(--text);
}

.goto-input::placeholder { color: var(--text-muted); }
.goto-input:focus-visible { outline: 2px solid var(--accent-ui); outline-offset: 1px; }

/* Liste tuvalin değil sayfanın üstünde: tam genişlikte, kutuya yapışık. */
.goto-list {
  position: absolute;
  z-index: 5;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  margin: 0;
  padding: 0.25rem;
  list-style: none;
  border: 1px solid var(--border);
  border-radius: 8px;
  /* Mat zemin: `--surface` her palette opak değil, altındaki metin
     okunuyordu (bkz. CLAUDE.md). */
  background-color: var(--bg);
  background-image: linear-gradient(var(--surface), var(--surface));
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.18);
  max-height: 16rem;
  overflow-y: auto;
}

.goto-item {
  width: 100%;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.45rem 0.55rem;
  border: none;
  border-radius: 5px;
  background: transparent;
  color: var(--text);
  font: inherit;
  font-size: 0.82rem;
  cursor: pointer;
  text-align: left;
}

.goto-item.on { background: var(--accent-ui); color: #fff; }
.goto-hint { font-size: 0.65rem; color: var(--text-muted); white-space: nowrap; }
.goto-item.on .goto-hint { color: #fff; opacity: 0.75; }
</style>
