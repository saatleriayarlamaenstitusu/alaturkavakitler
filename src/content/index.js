import saatuzerine from './saatuzerine.json'

// Sayfa adı → içerik listesi. Yeni koleksiyonlar (yenilikler vb.) buraya eklenir.
const content = {
  saatuzerine,
  yenilikler: [],
}

export function getList(page) {
  return content[page] ?? []
}

export function getItem(page, id) {
  return (content[page] ?? []).find((item) => item.id === id) ?? null
}
