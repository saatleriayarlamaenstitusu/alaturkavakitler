import saatuzerine from './saatuzerine.json'
import yenilikler from './yenilikler.json'

// Sayfa adı → içerik listesi. Yeni koleksiyonlar buraya eklenir.
// Yenilikler listesi en yeniden eskiye sıralıdır.
const content = {
  saatuzerine,
  yenilikler,
}

export function getList(page) {
  return content[page] ?? []
}

export function getItem(page, id) {
  return (content[page] ?? []).find((item) => item.id === id) ?? null
}
