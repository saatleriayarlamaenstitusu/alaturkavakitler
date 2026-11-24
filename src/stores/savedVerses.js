import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

/**
 * Kaydedilen ayetler.
 *
 * Hatimden ayrı bir liste: hatim "nerede kaldım" sorusunu, bu liste
 * "şu ayete sonra döneyim" sorusunu cevaplıyor. Bir ayeti kaydetmek
 * bir okuma işareti DEĞİLDİR — hatim ilerlemesine yazılmaz.
 *
 * Kimlik `sure:ayet`: aynı ayet iki kez kaydedilemez, ikinci dokunuş
 * listeden çıkarır (düğme o yüzden "Kaydet" / "Kayıtlı" diye değişir).
 *
 * Metin de kayıtta durur (`ar`, `tx`, `trs`): liste ekranı ağa çıkmaz
 * ve ayet sonradan başka bir meal seçilse bile kaydedilen hâliyle
 * okunur. Ayet metni değişmediği için eskime diye bir şey yok.
 */
const KEY = 'kayitliAyetler'

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]')
    if (!Array.isArray(raw)) return []
    return raw.filter((v) => v && Number.isInteger(v.surah) && Number.isInteger(v.verse))
  } catch {
    return []
  }
}

export const useSavedVersesStore = defineStore('savedVerses', () => {
  const list = ref(load())

  const has = (surah, verse) => list.value.some((v) => v.surah === surah && v.verse === verse)

  /** Kaydet; zaten varsa dokunma (sıra ve tarih korunur). */
  function save(v) {
    if (has(v.surah, v.verse)) return false
    list.value.unshift({ ...v, at: Date.now() })
    return true
  }

  function remove(surah, verse) {
    list.value = list.value.filter((v) => !(v.surah === surah && v.verse === verse))
  }

  function toggle(v) {
    if (has(v.surah, v.verse)) { remove(v.surah, v.verse); return false }
    save(v)
    return true
  }

  watch(list, (l) => {
    try { localStorage.setItem(KEY, JSON.stringify(l)) } catch { /* kota */ }
  }, { deep: true })

  return { list, has, save, remove, toggle }
})
