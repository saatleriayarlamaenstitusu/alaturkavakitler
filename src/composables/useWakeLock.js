import { watch, onUnmounted } from 'vue'

/**
 * Ekranı açık tut (Screen Wake Lock).
 *
 * Mukabelede ekrana BAKILIYOR ama dokunulmuyor: okunan ayet kendiliğinden
 * kayıyor, parmak sayfaya değmiyor ve telefon bir iki dakika sonra ekranı
 * karartıyor. Takip açıkken ve ses çalarken kilit isteniyor.
 *
 * İki sınır bilinçli:
 *  - Kullanıcı ekranı KENDİ kilitlerse kilit düşer ve geri alınmaz;
 *    "telefonu cebime koydum ama ekran yanıyor" olmaz.
 *  - Sekme arkaya atılınca tarayıcı kilidi bırakır; öne gelince geri
 *    alınır (`visibilitychange`). İstenen durum bir `ref`te tutuluyor,
 *    yoksa geri dönüşte hangi sebeple bırakıldığı bilinemiyor.
 *
 * Desteklemeyen tarayıcıda sessizce hiçbir şey yapmaz — kıraati
 * engellemeye değmez.
 *
 * @param {import('vue').Ref<boolean>} active kilit istensin mi
 */
export function useWakeLock(active) {
  let lock = null
  let want = false

  async function acquire() {
    if (lock || typeof navigator === 'undefined' || !('wakeLock' in navigator)) return
    if (document.visibilityState !== 'visible') return
    try {
      lock = await navigator.wakeLock.request('screen')
      // Tarayıcı kendiliğinden bırakabiliyor (sekme arkaya düşünce);
      // elimizdeki kaydı temizlemezsek bir daha hiç istemeyiz.
      lock.addEventListener?.('release', () => { lock = null })
    } catch {
      lock = null
    }
  }

  function release() {
    try { lock?.release?.() } catch { /* zaten bırakılmış */ }
    lock = null
  }

  watch(active, (on) => {
    want = Boolean(on)
    if (want) acquire()
    else release()
  }, { immediate: true })

  const onVisible = () => { if (want && document.visibilityState === 'visible') acquire() }
  if (typeof document !== 'undefined') document.addEventListener('visibilitychange', onVisible)

  onUnmounted(() => {
    if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', onVisible)
    release()
  })
}
