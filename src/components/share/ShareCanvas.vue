<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useShareEditor } from '@/composables/useShareEditor'
import CanvasLayer from './CanvasLayer.vue'
import GridOverlay from './GridOverlay.vue'
import GrainOverlay from './GrainOverlay.vue'

const editor = useShareEditor()
const { state, ratio } = editor

const frameRef = ref(null)   // ölçülen alan
const canvasRef = ref(null)  // gerçek boyutlu tuval (export bunu alır)

defineExpose({ canvasRef })

// Tuval gerçek çıktı pikselinde (1080×N) yaşar; ekrana sığması için
// saran katmana transform: scale() uygulanır. Böylece export her zaman
// 1x rasterdir — ölçekli foreignObject rasterizasyonunun bozulma riski yok.
function measure() {
  const el = frameRef.value
  if (!el) return
  const { width, height } = el.getBoundingClientRect()
  if (!width || !height) return
  state.viewScale = Math.min(width / ratio.value.width, height / ratio.value.height)
}

let observer = null
onMounted(() => {
  measure()
  observer = new ResizeObserver(measure)
  observer.observe(frameRef.value)
})
onUnmounted(() => observer?.disconnect())

const scaledSize = computed(() => ({
  width: `${ratio.value.width * state.viewScale}px`,
  height: `${ratio.value.height * state.viewScale}px`,
}))

const canvasStyle = computed(() => ({
  width: `${ratio.value.width}px`,
  height: `${ratio.value.height}px`,
  '--accent': editor.snapshot.primary,
}))

// Bulanıklık kenarlarda saydam hale getirir; fotoğrafı bulanıklık kadar
// taşırarak çerçevenin dört yanını dolu tutuyoruz.
const photoStyle = computed(() => {
  const bg = state.background
  const pad = (bg.blur || 0) * 2
  return {
    inset: `${-pad}px`,
    width: `calc(100% + ${pad * 2}px)`,
    height: `calc(100% + ${pad * 2}px)`,
    filter: bg.blur ? `blur(${bg.blur}px)` : 'none',
    transform: `translate(${bg.x}px, ${bg.y}px) scale(${bg.zoom})`,
  }
})

const sorted = computed(() => [...state.layers].sort((a, b) => a.z - b.z))

const bgInteractive = computed(() =>
  state.bgEditing && state.background.kind === 'photo' && state.background.photo && !state.exporting
)

// ── Arka plan jestleri: sürükle kaydırır, pinch yakınlaştırır ──
const pointers = new Map()
let bgGesture = null

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)

function baseline() {
  const [a, b] = [...pointers.values()]
  bgGesture = {
    last: a,
    dist0: b ? dist(a, b) : 0,
    zoom0: state.background.zoom,
  }
}

function onBgDown(e) {
  e.currentTarget.setPointerCapture?.(e.pointerId)
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
  baseline()
}

function onBgMove(e) {
  if (!pointers.has(e.pointerId) || !bgGesture) return
  e.preventDefault()
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
  const pts = [...pointers.values()]
  const k = state.viewScale || 1

  if (pts.length >= 2 && bgGesture.dist0) {
    editor.zoomPhoto(bgGesture.zoom0 * (dist(pts[0], pts[1]) / bgGesture.dist0))
  } else {
    const p = pts[0]
    editor.panPhoto(
      state.background.x + (p.x - bgGesture.last.x) / k,
      state.background.y + (p.y - bgGesture.last.y) / k,
    )
    bgGesture.last = { ...p }
  }
}

function onBgUp(e) {
  pointers.delete(e.pointerId)
  if (pointers.size) baseline()
  else bgGesture = null
}
</script>

<template>
  <div
    ref="frameRef"
    class="canvas-frame"
    @pointerdown="editor.select(null)"
    @contextmenu.prevent
  >
    <!-- Ölçekli kutu: tuvalin ekranda kapladığı gerçek alan -->
    <div class="scaled" :style="scaledSize">
      <div class="scaler" :style="{ transform: `scale(${state.viewScale})` }">
        <div ref="canvasRef" class="canvas" :style="canvasStyle">
          <div class="bg" :class="`bg-${state.background.kind}`">
            <img
              v-if="state.background.kind === 'photo' && state.background.photo"
              class="photo"
              :style="photoStyle"
              :src="state.background.photo"
              draggable="false"
              alt=""
            />
            <div
              v-if="state.background.dim > 0"
              class="bg-dim"
              :style="{ opacity: state.background.dim }"
            ></div>
          </div>

          <GrainOverlay v-if="state.grain.on" :grain="state.grain" />

          <GridOverlay
            v-if="state.grid.on"
            :grid="state.grid"
            :width="ratio.width"
            :height="ratio.height"
            :accent="editor.snapshot.primary"
          />

          <CanvasLayer v-for="layer in sorted" :key="layer.id" :layer="layer" />

          <div v-if="state.brand" class="brand">alaturkavakitler.com</div>

          <!-- Hizalama çizgileri: yalnızca taşıma sırasında, katmanların üstünde -->
          <div
            v-for="(g, i) in state.guides"
            :key="`g${i}`"
            class="guide"
            :class="g.axis === 'x' ? 'guide-v' : 'guide-h'"
            :style="g.axis === 'x' ? { left: `${g.pos}px` } : { top: `${g.pos}px` }"
            aria-hidden="true"
          ></div>

          <!-- Arka plan düzenleme modunda katmanların üstünü kapatan jest yüzeyi -->
          <div
            v-if="bgInteractive"
            class="bg-catcher"
            @pointerdown.stop="onBgDown"
            @pointermove="onBgMove"
            @pointerup="onBgUp"
            @pointercancel="onBgUp"
          ></div>
        </div>
      </div>
    </div>

    <p v-if="bgInteractive" class="bg-hint">Fotoğrafı sürükle · iki parmakla yakınlaştır</p>
  </div>
</template>

<style scoped>
.canvas-frame {
  flex: 1;
  min-height: 0;
  display: grid;
  place-items: center;
  overflow: hidden;
  padding: 8px;
  position: relative;
}

.scaled {
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
}

.scaler {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: top left;
}

.canvas {
  position: relative;
  overflow: hidden;
  background: #000;
  font-family: var(--font1);
}

/* Tuvaldeki görseller (ay fazı, arka plan fotoğrafı) uzun basma menüsünü
   tetiklemesin ve jestleri yakalamasın — hareketi katman yönetiyor. */
.canvas :deep(img) {
  -webkit-touch-callout: none;
  -webkit-user-drag: none;
  user-select: none;
  pointer-events: none;
}

.bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.bg-palette {
  background:
    radial-gradient(120% 78% at 50% 104%, var(--accent) 0%,
      color-mix(in srgb, var(--accent) 34%, #000) 46%, #000 100%);
}

.bg-photo { background: #000; }

.photo {
  position: absolute;
  object-fit: cover;
}

.bg-dim {
  position: absolute;
  inset: 0;
  background: #000;
}

.brand {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 44px;
  text-align: center;
  font-size: 24px;
  font-weight: 500;
  letter-spacing: 0.24em;
  color: #fff;
  opacity: 0.45;
  pointer-events: none;
}

.guide {
  position: absolute;
  background: var(--accent);
  pointer-events: none;
  z-index: 9998;
}

.guide-v { top: 0; bottom: 0; width: 2px; margin-left: -1px; }
.guide-h { left: 0; right: 0; height: 2px; margin-top: -1px; }

.bg-catcher {
  position: absolute;
  inset: 0;
  z-index: 9999;
  touch-action: none;
  cursor: grab;
}

.bg-catcher:active { cursor: grabbing; }

.bg-hint {
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
  padding: 0.3rem 0.7rem;
  background: rgba(0, 0, 0, 0.72);
  color: #fff;
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  pointer-events: none;
}
</style>
