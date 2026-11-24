<script setup>
import { computed, nextTick, onBeforeUnmount, ref, useId } from 'vue'
import { useRouter } from 'vue-router'
import { authorById, surahById } from '@/data/kuranMeta'
import { useSavedVersesStore } from '@/stores/savedVerses'
import { verseRef } from '@/utils/kuran'

const props = defineProps({ ayah: { type: Object, required: true } })
const panelId = useId()
const trigger = ref(null)
const panel = ref(null)
const open = ref(false)
const native = typeof HTMLElement.prototype.showPopover === 'function'
const router = useRouter()
const saved = useSavedVersesStore()
const copyButton = ref(null)
const feedback = ref('')
const manualText = ref('')

const title = computed(() => {
  const { name, surah, verse } = props.ayah
  return verseRef(name || surahById(surah)?.name || '', surah, verse)
})
const isSaved = computed(() => saved.has(props.ayah.surah, props.ayah.verse))
const shareText = computed(() => [
  props.ayah.ar,
  ...Object.entries(props.ayah.trs ?? {})
    .filter(([, translation]) => translation)
    .map(([id, translation]) => [translation, authorById(id)?.name].filter(Boolean).join(' — ')),
  title.value,
].join('\n\n'))

// Aynı konum hesabı yerel popover ve eski tarayıcı yolu için kullanılır.
function position() {
  const rect = trigger.value.getBoundingClientRect()
  const { offsetHeight: height, offsetWidth: width } = panel.value
  const edge = 8
  const gap = 4
  const below = rect.bottom + gap
  const top = below + height + edge <= window.innerHeight ? below : rect.top - gap - height
  panel.value.style.top = `${Math.max(edge, top)}px`
  panel.value.style.left = `${Math.max(edge, Math.min(rect.left, window.innerWidth - width - edge))}px`
}

function dismissOutside(event) {
  if (!panel.value?.contains(event.target) && !trigger.value?.contains(event.target)) close()
}

function onScroll(event) {
  if (!panel.value?.contains(event.target)) close()
}

function close(restoreFocus = false) {
  open.value = false
  window.removeEventListener('resize', position)
  window.removeEventListener('scroll', onScroll, true)
  document.removeEventListener('pointerdown', dismissOutside)
  if (restoreFocus) trigger.value?.focus({ preventScroll: true })
}
onBeforeUnmount(() => close())

async function toggleMenu() {
  if (open.value) return close(true)
  feedback.value = ''
  manualText.value = ''
  open.value = true
  await nextTick()
  if (!panel.value) return
  if (native) panel.value.showPopover({ source: trigger.value })
  position()
  window.addEventListener('resize', position)
  window.addEventListener('scroll', onScroll, true)
  if (!native) document.addEventListener('pointerdown', dismissOutside)
  copyButton.value?.focus({ preventScroll: true })
}

function onToggle(event) {
  if (event.newState === 'closed' && event.target === panel.value) close()
}

async function copy(value, message) {
  manualText.value = ''
  try {
    await navigator.clipboard.writeText(value)
    feedback.value = message
  } catch {
    feedback.value = 'Panoya kopyalanamadı. Metni seçip kopyalayabilirsiniz.'
    manualText.value = value
  }
  await nextTick()
  if (panel.value) position()
}

async function share() {
  const { surah, verse } = props.ayah
  const { href } = router.resolve({ path: '/kuran', query: { a: `${surah}:${verse}` } })
  const url = new URL(href, window.location.origin).href
  const data = { title: title.value, text: shareText.value, url }
  feedback.value = ''
  manualText.value = ''
  if (navigator.share && (navigator.canShare?.(data) ?? true)) {
    try {
      await navigator.share(data)
      close(true)
      return
    } catch (error) {
      if (error.name === 'AbortError') return
    }
  }
  await copy(`${data.text}\n\n${url}`, 'Ayet ve bağlantısı kopyalandı.')
}

async function toggleSave() {
  feedback.value = saved.toggle(props.ayah) ? 'Ayet kaydedildi.' : 'Ayet kayıtlardan çıkarıldı.'
  await nextTick()
  if (panel.value) position()
}
</script>

<template>
  <div class="verse-tools">
    <svg v-if="isSaved" class="bookmark" viewBox="0 0 24 24" width="13" height="13" fill="currentColor" role="img" aria-label="Kaydedildi">
      <path d="M6 3h12v18l-6-4-6 4z" />
    </svg>
    <button
      ref="trigger"
      type="button"
      class="verse-more"
      :aria-label="`${title} ayet işlemleri`"
      :aria-expanded="open"
      :aria-controls="open ? panelId : undefined"
      @click="toggleMenu"
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
        <circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" />
      </svg>
    </button>
    <Teleport to="body" :disabled="native">
      <div
        v-if="open"
        :id="panelId"
        ref="panel"
        class="actions"
        :popover="native ? 'auto' : undefined"
        role="group"
        :aria-label="title"
        @toggle="onToggle"
        @keydown.esc.stop.prevent="close(true)"
      >
        <button ref="copyButton" type="button" @click="copy(ayah.ar, 'Ayet kopyalandı.')">
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 5V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h1" /></svg>
          Ayeti kopyala
        </button>
        <button type="button" @click="share">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V3m-4 4 4-4 4 4M6 10H4v11h16V10h-2" /></svg>
          Paylaş
        </button>
        <button type="button" @click="toggleSave">
          <svg viewBox="0 0 24 24" :class="{ filled: isSaved }" aria-hidden="true"><path d="M6 4h12v16l-6-4-6 4z" /></svg>
          {{ isSaved ? 'Kayıtlardan çıkar' : 'Kaydet' }}
        </button>
        <p class="feedback" role="status">{{ feedback }}</p>
        <textarea v-if="manualText" :value="manualText" readonly aria-label="Kopyalanacak ayet" rows="4" />
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.verse-tools { position: relative; display: flex; align-items: center; justify-content: end; min-width: 2.8rem; }
.bookmark { position: absolute; inset-inline-start: 0; color: var(--accent-ui); }
.verse-more {
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}
.verse-more:hover, .verse-more:focus-visible, .verse-more[aria-expanded="true"] { background: var(--surface); }
.actions {
  position: fixed;
  inset: auto;
  z-index: 75;
  width: min(11.5rem, calc(100vw - 16px));
  max-height: calc(100dvh - 16px);
  overflow: auto;
  box-sizing: border-box;
  padding: 0.25rem;
  margin: 0;
  border: 1px solid var(--border);
  border-radius: 9px;
  background-color: var(--bg);
  background-image: linear-gradient(var(--surface), var(--surface));
  color: var(--text);
  box-shadow: 0 6px 20px rgb(0 0 0 / 0.18);
}
.actions button {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  width: 100%;
  min-height: 2.25rem;
  padding: 0.4rem 0.5rem;
  text-align: start;
  font: inherit;
  font-size: 0.8rem;
  color: inherit;
  background: transparent;
  border: 0;
  border-radius: 5px;
  cursor: pointer;
}
.actions button:hover, .actions button:focus-visible { background: var(--surface); }
.actions button svg {
  flex: none;
  width: 15px;
  height: 15px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.actions button svg.filled { fill: currentColor; color: var(--accent-ui); }
.feedback { margin: 0; color: var(--text-muted); font-size: 0.72rem; }
.feedback:not(:empty) { margin: 0.35rem 0.5rem; }
textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 0.35rem;
  font: inherit;
  font-size: 0.8rem;
  color: var(--text);
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 5px;
}
</style>
