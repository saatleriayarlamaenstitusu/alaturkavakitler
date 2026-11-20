/**
 * Bir elemanı KENDİ kaydırma kutusunun ortasına getir.
 *
 * `scrollIntoView` kullanılmıyor ve sebebi ölçülmüş bir tuzaktır
 * (bkz. CLAUDE.md, görsel oluşturucu): çağrıldığında yoldaki BÜTÜN
 * kaydırma kutularını birden kaydırıyor. Kur'an sayfasında sayfa
 * kutusu, tam ekran kipindeki kabuk ve belgenin kendisi iç içe duruyor;
 * biri kayarken öbürünün yerinden oynaması okuyanı kaybediyor.
 *
 * Burada yalnızca elemanın bağlı olduğu ilk kaydırılabilir ata
 * kaydırılır ve hedef ortadır: okunan ayet ekranın ortasında kalır,
 * dibe yapışıp bir sonrakine geçerken gözden kaçmaz.
 */
const SCROLLY = new Set(['auto', 'scroll', 'overlay'])

function scrollerOf(el) {
  let node = el.parentElement
  while (node && node !== document.body) {
    const oy = getComputedStyle(node).overflowY
    if (SCROLLY.has(oy) && node.scrollHeight > node.clientHeight + 4) return node
    node = node.parentElement
  }
  return document.scrollingElement
}

export function centerInScroller(el, { smooth = true } = {}) {
  if (!el) return
  const box = scrollerOf(el)
  if (!box) return
  const r = el.getBoundingClientRect()
  const b = box === document.scrollingElement
    ? { top: 0, height: window.innerHeight }
    : box.getBoundingClientRect()
  const top = r.top - b.top + box.scrollTop - (b.height - r.height) / 2
  const max = box.scrollHeight - box.clientHeight
  box.scrollTo({ top: Math.max(0, Math.min(top, max)), behavior: smooth ? 'smooth' : 'auto' })
}
