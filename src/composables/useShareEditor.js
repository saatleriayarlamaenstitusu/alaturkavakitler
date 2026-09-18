import { reactive, computed, watch, provide, inject } from 'vue'
import { getRatio, DEFAULT_RATIO } from '@/data/shareRatios'
import { getWidget } from '@/components/share/widgets/registry'
import { extractPalette } from '@/utils/palette'

const KEY = Symbol('shareEditor')
const STORAGE_KEY = 'shareEditor'

let idSeq = 0
const nextId = () => `l${++idSeq}`

const defaultBackground = () => ({ kind: 'palette', photo: null, dim: 0, blur: 0, zoom: 1, x: 0, y: 0 })
const defaultGrain = () => ({ on: false, opacity: 0.35, size: 400, blend: 'overlay' })
const defaultGrid = () => ({
  on: false, cols: 3, rows: 3, margin: 72,
  thickness: 2, opacity: 0.35, color: '#ffffff', frame: true,
})

// Kalıcılık: yalnızca kullanıcının kurduğu düzen saklanır (katmanlar, arka plan,
// grid, oran). Seçim ve sürükleme gibi anlık durumlar saklanmaz.
function loadSaved() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    if (!data || !Array.isArray(data.layers)) return null
    // Kayıt tablosu değişmiş olabilir; tanınmayan widget tipleri atılır.
    data.layers = data.layers.filter(l => l && getWidget(l.type))
    return data
  } catch {
    return null
  }
}

export function createShareEditor(snapshot) {
  const saved = loadSaved()

  const state = reactive({
    ratioId: saved?.ratioId ?? DEFAULT_RATIO,
    layers: saved?.layers ?? [],
    selectedId: null,
    background: { ...defaultBackground(), ...(saved?.background ?? {}) },
    grid: { ...defaultGrid(), ...(saved?.grid ?? {}) },
    grain: { ...defaultGrain(), ...(saved?.grain ?? {}) },
    brand: saved?.brand ?? false,
    // Kullanıcının eklediği renkler kalıcı; fotoğraftan çıkarılan palet
    // fotoğraf değişince yeniden hesaplanır.
    customColors: saved?.customColors ?? [],
    // Hizalama yardımı; kapatınca katman serbest hareket eder.
    snap: saved?.snap ?? true,
    photoPalette: [],
    bgEditing: false,
    panelOpen: true,
    dragging: false,
    // Taşıma sırasında gösterilen hizalama çizgileri: [{ axis, pos }]
    guides: [],
    exporting: false,
    viewScale: 1,
  })

  // Geri yüklenen katmanların id'leriyle çakışmamak için sayaç ileri alınır.
  for (const l of state.layers) {
    const n = Number(String(l.id).replace(/\D/g, ''))
    if (Number.isFinite(n)) idSeq = Math.max(idSeq, n)
  }

  const ratio = computed(() => getRatio(state.ratioId))
  const selected = computed(() => state.layers.find(l => l.id === state.selectedId) || null)
  const topZ = () => state.layers.reduce((m, l) => Math.max(m, l.z), 0)

  // ── Kayıt ──
  let saveTimer = null
  function persist() {
    clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      const data = {
        ratioId: state.ratioId,
        layers: state.layers,
        background: state.background,
        grid: state.grid,
        grain: state.grain,
        brand: state.brand,
        customColors: state.customColors,
        snap: state.snap,
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      } catch {
        // Fotoğraf data URI'si kotayı aşabiliyor — düzeni fotoğrafsız sakla.
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            ...data,
            background: { ...data.background, kind: 'palette', photo: null },
          }))
        } catch {
          // Saklanamıyorsa sessizce vazgeç; editör çalışmaya devam eder.
        }
      }
    }, 400)
  }

  watch(
    () => [state.ratioId, state.layers, state.background, state.grid, state.grain, state.brand, state.customColors, state.snap],
    persist,
    { deep: true },
  )

  function addLayer(typeId) {
    const def = getWidget(typeId)
    if (!def) return null

    // Yeni katman, mevcut en alttakinin altına doğar; tuval dolduysa
    // üstten tekrar başlar. Böylece eklenen widget'lar üst üste binmez.
    const { width, height } = ratio.value
    const gap = height * 0.12
    const top = height * 0.18
    const bottom = height * 0.86
    const lowest = state.layers.reduce((m, l) => Math.max(m, l.y), -Infinity)
    const y = state.layers.length === 0
      ? height * 0.42
      : (lowest + gap > bottom ? top : lowest + gap)

    const layer = {
      id: nextId(),
      type: typeId,
      x: width / 2,
      y,
      scale: 1,
      rotation: 0,
      opacity: 1,
      z: topZ() + 1,
      props: def.defaultProps(snapshot),
    }
    state.layers.push(layer)
    state.selectedId = layer.id
    return layer
  }

  function removeLayer(id) {
    const i = state.layers.findIndex(l => l.id === id)
    if (i === -1) return
    state.layers.splice(i, 1)
    if (state.selectedId === id) state.selectedId = null
  }

  function duplicateLayer(id) {
    const src = state.layers.find(l => l.id === id)
    if (!src) return
    const copy = { ...src, id: nextId(), x: src.x + 40, y: src.y + 40, z: topZ() + 1, props: { ...src.props } }
    state.layers.push(copy)
    state.selectedId = copy.id
  }

  function select(id) {
    state.selectedId = id
  }

  function updateLayer(id, patch) {
    const layer = state.layers.find(l => l.id === id)
    if (layer) Object.assign(layer, patch)
  }

  function updateProps(id, patch) {
    const layer = state.layers.find(l => l.id === id)
    if (layer) Object.assign(layer.props, patch)
  }

  // Katmanın değerlerini editörün açıldığı andaki tarih/saate geri döndürür.
  function resetProps(id) {
    const layer = state.layers.find(l => l.id === id)
    const def = layer && getWidget(layer.type)
    if (def) layer.props = def.defaultProps(snapshot)
  }

  function bringToFront(id) {
    updateLayer(id, { z: topZ() + 1 })
  }

  function sendToBack(id) {
    const min = state.layers.reduce((m, l) => Math.min(m, l.z), 0)
    updateLayer(id, { z: min - 1 })
  }

  // Oran değişince katmanlar oransal olarak yeniden konumlanır,
  // böylece 9:16'da kurduğun düzen 1:1'e geçince dağılmaz.
  function setRatio(id) {
    const from = ratio.value
    const to = getRatio(id)
    const fx = to.width / from.width
    const fy = to.height / from.height
    state.layers.forEach((l) => { l.x *= fx; l.y *= fy })
    state.ratioId = id
  }

  function setBackground(patch) {
    Object.assign(state.background, patch)
    if ('photo' in patch) refreshPhotoPalette()
  }

  async function refreshPhotoPalette() {
    state.photoPalette = await extractPalette(state.background.photo)
  }

  function toggleSnap() {
    state.snap = !state.snap
  }

  function addCustomColor(hex) {
    const value = String(hex).toLowerCase()
    if (!/^#[0-9a-f]{6}$/.test(value)) return
    if (state.customColors.includes(value)) return
    // En yeni başta, liste şeridi taşırmasın diye sınırlı.
    state.customColors = [value, ...state.customColors].slice(0, 12)
  }

  function removeCustomColor(hex) {
    state.customColors = state.customColors.filter(c => c !== hex)
  }

  function setGrid(patch) {
    Object.assign(state.grid, patch)
  }

  function setGrain(patch) {
    Object.assign(state.grain, patch)
  }

  // Fotoğraf cover yerleştiği için 1x'te kaydırılacak alan yoktur;
  // kaydırma sınırı yakınlaştırma oranıyla büyür.
  function panPhoto(x, y) {
    const { width, height } = ratio.value
    const bg = state.background
    const maxX = (width * (bg.zoom - 1)) / 2
    const maxY = (height * (bg.zoom - 1)) / 2
    bg.x = Math.min(Math.max(x, -maxX), maxX)
    bg.y = Math.min(Math.max(y, -maxY), maxY)
  }

  function zoomPhoto(zoom) {
    state.background.zoom = Math.min(Math.max(zoom, 1), 4)
    panPhoto(state.background.x, state.background.y)
  }

  function resetPhoto() {
    Object.assign(state.background, { zoom: 1, x: 0, y: 0, blur: 0, dim: 0.3 })
  }

  // Açılış kompozisyonu: saat üstte, tarih altta.
  function applyDefaultComposition() {
    const clock = addLayer('clock-digital')
    if (clock) clock.y = ratio.value.height * 0.42
    const date = addLayer('date')
    if (date) date.y = ratio.value.height * 0.68
    state.selectedId = null
  }

  // Kayıtlı düzen varsa ona dokunma; yoksa varsayılanı kur.
  function ensureComposition() {
    if (!state.layers.length) applyDefaultComposition()
  }

  function resetAll() {
    state.ratioId = DEFAULT_RATIO
    state.layers = []
    state.selectedId = null
    Object.assign(state.background, defaultBackground())
    Object.assign(state.grid, defaultGrid())
    Object.assign(state.grain, defaultGrain())
    state.brand = false
    applyDefaultComposition()
  }

  const editor = {
    state, ratio, selected,
    addLayer, removeLayer, duplicateLayer, select,
    updateLayer, updateProps, resetProps, bringToFront, sendToBack,
    setRatio, setBackground, setGrid, setGrain, panPhoto, zoomPhoto, resetPhoto,
    refreshPhotoPalette, addCustomColor, removeCustomColor, toggleSnap,
    ensureComposition, resetAll,
    snapshot,
  }

  provide(KEY, editor)
  return editor
}

export function useShareEditor() {
  const editor = inject(KEY)
  if (!editor) throw new Error('useShareEditor: createShareEditor çağrılmamış')
  return editor
}
