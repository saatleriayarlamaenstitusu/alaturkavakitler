// Katman taşınırken hizalama. Eşik ekran pikselinde tanımlıdır; tuval
// birimine çevrilirken önizleme ölçeğine bölünür, böylece yakınlaştırmadan
// bağımsız olarak hep aynı "yapışkanlık" hissi olur.
const THRESHOLD_SCREEN = 7

// Taşınan katmanın hangi noktaları hizalanabilir: merkezi ve iki kenarı.
// `offset`, katman merkezine göre o noktanın konumu.
const anchors = (size) => [
  { offset: 0, kind: 'center' },
  { offset: -size / 2, kind: 'start' },
  { offset: size / 2, kind: 'end' },
]

function bestSnap(center, size, targets, threshold) {
  let best = null
  for (const a of anchors(size)) {
    for (const t of targets) {
      const delta = t - (center + a.offset)
      const dist = Math.abs(delta)
      if (dist > threshold) continue
      if (!best || dist < best.dist) best = { dist, delta, guide: t }
    }
  }
  return best
}

/**
 * @param {object} p
 * @param {number} p.x, p.y      taşınan katmanın merkezi (tuval birimi)
 * @param {object} p.size        { w, h } katmanın kapladığı alan
 * @param {object} p.targets     { x: number[], y: number[] }
 * @param {number} p.viewScale   önizleme ölçeği
 * @returns {{ x, y, guides }}   guides: [{ axis, pos }]
 */
export function applySnap({ x, y, size, targets, viewScale }) {
  const threshold = THRESHOLD_SCREEN / (viewScale || 1)
  const guides = []

  const sx = bestSnap(x, size.w, targets.x, threshold)
  const sy = bestSnap(y, size.h, targets.y, threshold)

  if (sx) guides.push({ axis: 'x', pos: sx.guide })
  if (sy) guides.push({ axis: 'y', pos: sy.guide })

  return {
    x: sx ? x + sx.delta : x,
    y: sy ? y + sy.delta : y,
    guides,
  }
}

/**
 * Hizalanacak noktalar: tuvalin kenar/merkezi, grid kenar boşluğu ve
 * diğer katmanların kenar/merkezleri.
 */
export function collectTargets({ width, height, grid, others }) {
  const x = [0, width / 2, width]
  const y = [0, height / 2, height]

  if (grid?.on && grid.margin > 0) {
    x.push(grid.margin, width - grid.margin)
    y.push(grid.margin, height - grid.margin)
  }

  for (const o of others) {
    x.push(o.x - o.w / 2, o.x, o.x + o.w / 2)
    y.push(o.y - o.h / 2, o.y, o.y + o.h / 2)
  }

  return { x, y }
}
