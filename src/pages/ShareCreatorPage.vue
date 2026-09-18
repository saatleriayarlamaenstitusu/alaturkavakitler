<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useSeo } from '@/composables/useSeo'
import { createShareEditor } from '@/composables/useShareEditor'
import { createSnapshot } from '@/utils/shareSnapshot'
import {
  warmupExport, renderCanvasToBlob, buildFileName,
  downloadBlob, canShareFiles, shareBlob,
} from '@/utils/shareExport'
import { ensureShareFonts } from '@/composables/useShareFonts'
import ShareCanvas from '@/components/share/ShareCanvas.vue'
import EditorPanel from '@/components/share/EditorPanel.vue'

const router = useRouter()
const appStore = useAppStore()

useSeo({
  title: 'Görsel Oluştur',
  description: 'Alaturka saati, namaz vakitlerini ve hicri tarihi kendi fotoğrafınla birleştirip paylaşılabilir bir görsel oluştur.',
  path: '/gorsel-olustur',
})

// Görsel tek bir ana aittir: editör açılırken saat/tarih dondurulur.
const snapshot = createSnapshot({
  city: appStore.city,
  vakitler: appStore.vakitler,
  currentVakit: appStore.currentVakit,
})

const editor = createShareEditor(snapshot)
const { state } = editor

const canvasComp = ref(null)
const busy = ref(false)
const error = ref('')

const canvasEl = () => canvasComp.value?.canvasRef ?? null

onMounted(async () => {
  ensureShareFonts()
  // Kayıtlı bir düzen varsa o geri gelir; yoksa varsayılan kompozisyon kurulur.
  editor.ensureComposition()

  await nextTick()
  warmupExport(canvasEl())
})

// Sıfırlama geri alınamıyor: ilk dokunuş onay ister, ikincisi uygular.
const confirmingReset = ref(false)
let resetTimer = null

function askReset() {
  if (confirmingReset.value) {
    clearTimeout(resetTimer)
    confirmingReset.value = false
    editor.resetAll()
    return
  }
  confirmingReset.value = true
  resetTimer = setTimeout(() => { confirmingReset.value = false }, 3000)
}

async function render() {
  const el = canvasEl()
  if (!el) throw new Error('Tuval bulunamadı')
  editor.select(null)
  state.exporting = true
  await nextTick()
  try {
    return await renderCanvasToBlob(el, state.viewScale)
  } finally {
    state.exporting = false
  }
}

async function run(action) {
  if (busy.value) return
  busy.value = true
  error.value = ''
  try {
    const blob = await render()
    const name = buildFileName(snapshot)
    if (action === 'share' && canShareFiles(blob, name)) {
      await shareBlob(blob, name)
    } else {
      downloadBlob(blob, name)
    }
  } catch (e) {
    if (e?.name !== 'AbortError') error.value = e?.message || 'Görsel oluşturulamadı'
  } finally {
    busy.value = false
  }
}

const shareSupported = computed(() => Boolean(navigator.share))
</script>

<template>
  <div class="creator">
    <header class="bar">
      <div class="bar-left">
        <button class="icon" aria-label="Kapat" @click="router.back()">✕</button>
        <button
          class="reset"
          :class="{ confirming: confirmingReset }"
          @click="askReset"
        >{{ confirmingReset ? 'Emin misin?' : 'Sıfırla' }}</button>
      </div>
      <span class="bar-title">Görsel Oluştur</span>
      <div class="bar-actions">
        <button class="action" :disabled="busy" @click="run('download')">
          {{ busy ? '…' : 'İndir' }}
        </button>
        <button v-if="shareSupported" class="action solid" :disabled="busy" @click="run('share')">
          Paylaş
        </button>
      </div>
    </header>

    <!-- Tuval ve panel aynı katmanda: panel üste biner, tuvali itmez. -->
    <div class="stage">
      <ShareCanvas ref="canvasComp" />
      <p v-if="error" class="error">{{ error }}</p>
      <EditorPanel />
    </div>
  </div>
</template>

<style scoped>
.creator {
  position: fixed;
  inset: 0;
  /* base.css'teki uygulama greni (body::after) z-index: 50 ile sabit duruyor;
     tam ekran editör onun da üstünde kalmalı. */
  z-index: 60;
  display: flex;
  flex-direction: column;
  background: var(--bg);
}

/* Tuval alanı her zaman panelin KATLANMIŞ yüksekliğine göre ölçülür;
   panel açılıp kapandıkça tuval ölçeği değişmez. */
.stage {
  flex: 1;
  min-height: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  padding-bottom: 4.5rem;
}

.bar {
  flex-shrink: 0;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 0.75rem;
  padding: calc(0.6rem + env(safe-area-inset-top)) 0.75rem 0.55rem;
  border-bottom: 1px solid var(--border);
}

.bar-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.bar-title {
  text-align: center;
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--text-muted);
  white-space: nowrap;
}

.reset {
  border: 0;
  background: transparent;
  color: var(--text-muted);
  font-family: inherit;
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 0.4rem 0.3rem;
  cursor: pointer;
  white-space: nowrap;
}

.reset.confirming {
  background: var(--accent-ui);
  color: var(--bg);
  padding-inline: 0.5rem;
}

.icon {
  width: 1.875rem;
  height: 1.875rem;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text);
  font-size: 0.8125rem;
  cursor: pointer;
}

.icon:hover { border-color: var(--text); }

.bar-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.4rem;
}

.action {
  border: 1px solid var(--text);
  background: transparent;
  color: var(--text);
  font-family: inherit;
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 0.45rem 0.8rem;
  cursor: pointer;
}

.action.solid {
  background: var(--accent-ui);
  border-color: var(--accent-ui);
  color: var(--bg);
}

.action:disabled { opacity: 0.5; cursor: default; }

.error {
  position: absolute;
  left: 1rem;
  right: 1rem;
  bottom: 5rem;
  z-index: 4;
  margin: 0;
  font-size: 0.8125rem;
  color: #ff6b6b;
}
</style>
