// v-click-outside="handler"
// Elementin dışına (mousedown/touchstart) tıklanınca handler'ı çağırır.
export const clickOutside = {
  mounted(el, binding) {
    el._clickOutside = (event) => {
      if (!el.contains(event.target)) {
        binding.value(event)
      }
    }
    document.addEventListener('mousedown', el._clickOutside, true)
    document.addEventListener('touchstart', el._clickOutside, true)
  },
  unmounted(el) {
    document.removeEventListener('mousedown', el._clickOutside, true)
    document.removeEventListener('touchstart', el._clickOutside, true)
    delete el._clickOutside
  },
}
