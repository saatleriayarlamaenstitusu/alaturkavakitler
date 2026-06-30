// Renk stilleri (palet + yüzey tarzı).
// Yeni stil eklemek için:
//   1) Buraya bir obje ekle (id + label + swatch + önizleme kartı bg/fg)
//   2) base.css'e `[data-palette="<id>"]` bloklarını ekle (light + dark, 6 vakit)
// Settings UI ve App.vue otomatik olarak bu listeyi kullanır.
//
// bg / fg: ayarlardaki önizleme karesinin arka plan + yazı rengi
// (stilin karakteristik görünümünü temsil eder).

export const COLOR_STYLES = [
  { id: 'klasik', label: 'Klasik', bg: '#0d0d0d', fg: '#ffffff', swatch: ['#0491fb', '#ffd733', '#ff8c33'] },
  { id: 'pastel', label: 'Pastel', bg: '#16151a', fg: '#e8e6ee', swatch: ['#8fbce0', '#ddd08a', '#e8b08a'] },
  { id: 'canli',  label: 'Canlı',  bg: '#ffd500', fg: '#0a0a0a', swatch: ['#0088ff', '#ff6d00', '#5a3dff'] },
  { id: 'mesh',   label: 'Mesh',   bg: '#0a0810', fg: '#ffffff', swatch: ['#2a6fd6', '#d9be24', '#e0662e'] },
  { id: 'mono',   label: 'Mono',   bg: '#fafafa', fg: '#0a0a0a', swatch: ['#0a0a0a', '#888888', '#dddddd'] },
]

export const DEFAULT_COLOR_STYLE = 'klasik'
