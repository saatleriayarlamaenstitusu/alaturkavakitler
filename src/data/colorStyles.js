// Renk stilleri (palet + yüzey tarzı).
// Yeni stil eklemek için:
//   1) Buraya bir obje ekle (id + label + 3 renklik önizleme swatch'i)
//   2) base.css'e `[data-palette="<id>"]` bloklarını ekle (light + dark, 6 vakit)
// Settings UI ve App.vue otomatik olarak bu listeyi kullanır.

export const COLOR_STYLES = [
  { id: 'klasik', label: 'Klasik', swatch: ['#0491fb', '#ffd733', '#ff8c33'] },
  { id: 'pastel', label: 'Pastel', swatch: ['#8fbce0', '#ddd08a', '#e8b08a'] },
  { id: 'canli',  label: 'Canlı',  swatch: ['#0088ff', '#ffd500', '#ff6d00'] },
  { id: 'mesh',   label: 'Mesh',   swatch: ['#2a6fd6', '#d9be24', '#e0662e'] },
]

export const DEFAULT_COLOR_STYLE = 'klasik'
