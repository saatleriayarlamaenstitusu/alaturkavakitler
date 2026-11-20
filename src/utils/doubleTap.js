/**
 * Çift dokunuş algılama.
 *
 * `dblclick` olayına güvenilmiyor: dokunmatikte her tarayıcıda
 * tetiklenmiyor ve tetiklendiğinde de gecikmeli geliyor. Burada
 * dokunuşlar elle sayılıyor.
 *
 * Anahtar, neye dokunulduğudur (ayet için `"2:255"`): art arda İKİ
 * dokunuşun aynı şeye olması gerekir. Olmazsa sayfada hızlıca iki
 * farklı ayete dokunmak "çift dokunuş" sayılırdı.
 *
 * 320 ms, ortalama çift dokunuş aralığının biraz üstü: altında kalınca
 * yavaş parmaklar ıskalıyor, üstüne çıkınca ayrı iki dokunuş birleşiyor.
 */
export function createDoubleTap(delay = 320) {
  let key = null
  let at = 0
  return (next, fire) => {
    const now = Date.now()
    if (next === key && now - at < delay) {
      key = null
      at = 0
      fire()
      return true
    }
    key = next
    at = now
    return false
  }
}
