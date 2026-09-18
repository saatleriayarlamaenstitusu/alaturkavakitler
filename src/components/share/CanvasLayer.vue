<script setup>
import { computed, ref } from 'vue'
import { useShareEditor } from '@/composables/useShareEditor'
import { getWidget } from './widgets/registry'
import { applySnap, collectTargets } from '@/utils/snap'

const props = defineProps({
  layer: { type: Object, required: true },
})

const editor = useShareEditor()
const { state, ratio } = editor

const def = computed(() => getWidget(props.layer.type))
const isSelected = computed(() => state.selectedId === props.layer.id && !state.exporting)

// Seçim arayüzü katmanın ölçeğinden de önizleme ölçeğinden de etkilenmemeli:
// ekranda her zaman aynı boyutta görünsün diye ters ölçekleniyor.
const chromeScale = computed(() => 1 / Math.max(props.layer.scale * (state.viewScale || 1), 0.001))

const boxStyle = computed(() => ({
  left: `${props.layer.x}px`,
  top: `${props.layer.y}px`,
  zIndex: props.layer.z,
  transform: `translate(-50%, -50%) rotate(${props.layer.rotation}deg) scale(${props.layer.scale})`,
  // Seçim arayüzü ve dokunma payı bu değişkenle ekran birimine sabitlenir.
  '--k': chromeScale.value,
}))

// ── Jestler ───────────────────────────────────────────────────
// Tek işaretçi: taşı. İki işaretçi: pinch ile ölçekle + döndür.
// Ekran pikseli → tuval birimi dönüşümü viewScale ile yapılır.

const pointers = new Map()
const rootRef = ref(null)
let gesture = null

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)
const angle = (a, b) => (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI
const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })

// 0/90/180/270'e ve 45'in katlarına yakın açıları yapıştır — hizalı sonuçlar.
function snapAngle(deg) {
  const norm = ((deg % 360) + 360) % 360
  for (let target = 0; target <= 360; target += 45) {
    if (Math.abs(norm - target) < 4) return target % 360
  }
  return norm
}

// Taşıma başında bir kez toplanır: diğer katmanların tuval birimindeki
// kutuları. Sürükleme boyunca DOM'u tekrar ölçmeye gerek kalmaz.
let snapTargets = null

function measureOthers() {
  const canvas = rootRef.value?.closest('.canvas')
  if (!canvas) return []
  const k = state.viewScale || 1
  const cRect = canvas.getBoundingClientRect()
  return [...canvas.querySelectorAll('.layer')]
    .filter(el => el.dataset.layerId !== props.layer.id)
    .map((el) => {
      const r = el.getBoundingClientRect()
      return {
        x: (r.left + r.width / 2 - cRect.left) / k,
        y: (r.top + r.height / 2 - cRect.top) / k,
        w: r.width / k,
        h: r.height / k,
      }
    })
}

function ownSize() {
  const el = rootRef.value
  if (!el) return { w: 0, h: 0 }
  const s = props.layer.scale || 1
  return { w: el.offsetWidth * s, h: el.offsetHeight * s }
}

function snapped(x, y) {
  if (!snapTargets || !state.snap) return { x, y }
  const res = applySnap({ x, y, size: ownSize(), targets: snapTargets, viewScale: state.viewScale })
  state.guides = res.guides
  return res
}

function clamp(layer) {
  const m = 40
  layer.x = Math.min(Math.max(layer.x, -m), ratio.value.width + m)
  layer.y = Math.min(Math.max(layer.y, -m), ratio.value.height + m)
}

function captureBaseline() {
  const [a, b] = [...pointers.values()]
  gesture = {
    kind: pointers.size >= 2 ? 'pinch' : 'drag',
    last: a,
    dist0: b ? dist(a, b) : 0,
    angle0: b ? angle(a, b) : 0,
    mid0: b ? mid(a, b) : a,
    scale0: props.layer.scale,
    rotation0: props.layer.rotation,
    x0: props.layer.x,
    y0: props.layer.y,
  }
}

function onPointerDown(e) {
  e.stopPropagation()
  editor.select(props.layer.id)
  state.dragging = true
  snapTargets = state.snap ? collectTargets({
    width: ratio.value.width,
    height: ratio.value.height,
    grid: state.grid,
    others: measureOthers(),
  }) : null
  e.currentTarget.setPointerCapture?.(e.pointerId)
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
  captureBaseline()
}

function onPointerMove(e) {
  if (!pointers.has(e.pointerId)) return
  e.preventDefault()
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
  if (!gesture) return

  const k = state.viewScale || 1
  const pts = [...pointers.values()]

  if (gesture.kind === 'pinch' && pts.length >= 2) {
    const [a, b] = pts
    const m = mid(a, b)
    editor.updateLayer(props.layer.id, {
      scale: Math.min(Math.max(gesture.scale0 * (dist(a, b) / gesture.dist0), 0.15), 6),
      rotation: snapAngle(gesture.rotation0 + (angle(a, b) - gesture.angle0)),
      x: gesture.x0 + (m.x - gesture.mid0.x) / k,
      y: gesture.y0 + (m.y - gesture.mid0.y) / k,
    })
  } else {
    const p = pts[0]
    const moved = snapped(
      props.layer.x + (p.x - gesture.last.x) / k,
      props.layer.y + (p.y - gesture.last.y) / k,
    )
    editor.updateLayer(props.layer.id, { x: moved.x, y: moved.y })
    gesture.last = { ...p }
  }

  clamp(props.layer)
}

function onPointerUp(e) {
  pointers.delete(e.pointerId)
  if (!pointers.size) {
    state.dragging = false
    state.guides = []
    snapTargets = null
  }
  // Parmaklardan biri kalkınca kalanla yeni bir taban al — pinch'ten
  // sürüklemeye geçerken katman zıplamasın.
  if (pointers.size) captureBaseline()
  else gesture = null
}

// ── Köşe tutamağı (masaüstü): tek elle ölçek + döndür ─────────
let handleGesture = null

function centerOnScreen() {
  const r = rootRef.value.getBoundingClientRect()
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
}

function onHandleDown(e) {
  e.stopPropagation()
  state.dragging = true
  e.currentTarget.setPointerCapture?.(e.pointerId)
  const c = centerOnScreen()
  const p = { x: e.clientX, y: e.clientY }
  handleGesture = {
    dist0: dist(c, p) || 1,
    angle0: angle(c, p),
    scale0: props.layer.scale,
    rotation0: props.layer.rotation,
  }
}

function onHandleMove(e) {
  if (!handleGesture) return
  e.preventDefault()
  const c = centerOnScreen()
  const p = { x: e.clientX, y: e.clientY }
  editor.updateLayer(props.layer.id, {
    scale: Math.min(Math.max(handleGesture.scale0 * (dist(c, p) / handleGesture.dist0), 0.15), 6),
    rotation: snapAngle(handleGesture.rotation0 + (angle(c, p) - handleGesture.angle0)),
  })
}

function onHandleUp() {
  handleGesture = null
  state.dragging = false
}
</script>

<template>
  <div
    ref="rootRef"
    :data-layer-id="layer.id"
    class="layer"
    :class="{ selected: isSelected }"
    :style="boxStyle"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
    @contextmenu.prevent
    @dragstart.prevent
  >
    <!-- Saydamlık yalnızca içeriğe uygulanır; katmanın tamamına verilseydi
         yığın bağlamı oluşup seçim tutamakları da soluklaşırdı. -->
    <div class="content" :style="{ opacity: layer.opacity ?? 1 }">
      <component
        :is="def.component"
        v-if="def"
        :settings="layer.props"
        :accent="editor.snapshot.primary"
      />
    </div>

    <template v-if="isSelected">
      <div class="chrome">
        <div class="frame" aria-hidden="true"></div>
        <button
          class="handle"
          aria-label="Ölçekle ve döndür"
          @pointerdown="onHandleDown"
          @pointermove="onHandleMove"
          @pointerup="onHandleUp"
          @pointercancel="onHandleUp"
        ></button>
        <button class="remove" aria-label="Katmanı sil" @pointerdown.stop @click.stop="editor.removeLayer(layer.id)">
          ✕
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.layer {
  position: absolute;
  transform-origin: center center;
  touch-action: none;
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
  /* Mobilde uzun basınca çıkan "resmi kaydet / yeni sekmede aç" menüsünü
     engeller; o menü açılınca sürükleme de yarıda kesiliyordu. */
  -webkit-touch-callout: none;
}

/* Görünmez dokunma payı: küçültülmüş bir widget da parmakla tutulabilsin diye
   tutma alanı her zaman en az ~44px ekran genişliğinde kalır. */
.layer::before {
  content: '';
  position: absolute;
  inset: calc(-22px * var(--k));
}

.layer:active { cursor: grabbing; }

/* Seçim arayüzü ekran biriminde çizilir: --k, katman ve önizleme
   ölçeklerini geri alarak tutamakların her zaman aynı büyüklükte
   görünmesini sağlar. */
.chrome {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.frame {
  position: absolute;
  inset: calc(-10px * var(--k));
  border: calc(2px * var(--k)) dashed rgba(255, 255, 255, 0.9);
  border-radius: calc(8px * var(--k));
}

.handle,
.remove {
  position: absolute;
  width: calc(32px * var(--k));
  height: calc(32px * var(--k));
  border-radius: 50%;
  border: calc(2px * var(--k)) solid rgba(0, 0, 0, 0.25);
  background: #fff;
  color: #000;
  font-size: calc(14px * var(--k));
  line-height: 1;
  display: grid;
  place-items: center;
  padding: 0;
  cursor: pointer;
  touch-action: none;
  pointer-events: auto;
  box-shadow: 0 calc(2px * var(--k)) calc(8px * var(--k)) rgba(0, 0, 0, 0.3);
}

.handle {
  right: calc(-22px * var(--k));
  bottom: calc(-22px * var(--k));
  cursor: nwse-resize;
  background:
    radial-gradient(circle at 50% 50%, #111 0 calc(4.5px * var(--k)), transparent calc(5px * var(--k))),
    #fff;
}

.remove {
  left: calc(-22px * var(--k));
  top: calc(-22px * var(--k));
}
</style>
