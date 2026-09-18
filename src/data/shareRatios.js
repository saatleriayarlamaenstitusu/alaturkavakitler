// Paylaşım tuvali oranları.
// Tuval her zaman gerçek çıktı pikselinde yaşar (genişlik sabit 1080),
// önizleme wrapper'a uygulanan transform: scale() ile küçültülür.
// Yeni oran eklemek: buraya bir satır.

export const SHARE_RATIOS = [
  { id: '9:16', label: 'Story', sub: '9:16', width: 1080, height: 1920 },
  { id: '4:5',  label: 'Post',  sub: '4:5',  width: 1080, height: 1350 },
  { id: '1:1',  label: 'Kare',  sub: '1:1',  width: 1080, height: 1080 },
]

export const DEFAULT_RATIO = '9:16'

export function getRatio(id) {
  return SHARE_RATIOS.find(r => r.id === id) || SHARE_RATIOS[0]
}
