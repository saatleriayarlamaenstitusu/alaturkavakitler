/**
 * Hazır arka planlar.
 *
 * Görseller Pexels'ten seçilip KENDİ CDN'imize kopyalandı
 * (`cdn.alaturkavakitler.com/gorsel/bg/`): Pexels API anahtarı
 * vermiyor ve her açılışta başkasının sunucusuna gitmek, yeni sekmenin
 * açılış hızını başkasının eline bırakmak demek.
 *
 * Her görselin iki boyu var: tam (2560px) ve seçici için küçük (640px,
 * `-k` ekiyle). `tone` görselin ortalama parlaklığı — açık görsellerde
 * yazının okunması için karartma biraz artırılıyor.
 *
 * Aynı liste sitede de duruyor (`src/data/backgrounds.js`): iki ayrı
 * depo, tek kaynak yok. Biri değişirse öbürü de değişmeli.
 */
export const BG_BASE = 'https://cdn.alaturkavakitler.com/gorsel/bg'

export const BACKGROUNDS = [
  { id: '39618458', label: 'Akşam kızıllığı', tone: 'koyu', mesh: ['#3c281a', '#020305', '#a36b3a', '#070708', '#16100c'] },
  { id: '29524511', label: 'Ağaçlar arasından', tone: 'koyu', mesh: ['#323531', '#0d0c0b', '#89867c', '#191b18', '#111210'] },
  { id: '34794613', label: 'Suda yapraklar', tone: 'koyu', mesh: ['#3f5042', '#091a1a', '#747f6f', '#152824', '#323728'] },
  { id: '35586639', label: 'Karlı akşam', tone: 'koyu', mesh: ['#584643', '#1d2125', '#433432', '#67504b', '#bc9379'] },
  { id: '33797168', label: 'Sahilde akşam', tone: 'orta', mesh: ['#e69a5d', '#081b1d', '#393532', '#7f4e3d', '#153137'] },
  { id: '31968792', label: 'Kır', tone: 'orta', mesh: ['#adb0b9', '#161612', '#797f6f', '#595435', '#383520'] },
  { id: '39258975', label: 'Bulutlar', tone: 'açık', mesh: ['#a9a69b', '#293733', '#909089', '#3e473f', '#6a5b47'] },
  { id: '32382122', label: 'Ahşap sokak', tone: 'açık', mesh: ['#4a5a49', '#131c16', '#889480', '#aeb5a2', '#c8ccc1'] },
  { id: '32801432', label: 'Göl kıyısı', tone: 'açık', mesh: ['#5f9aae', '#40889e', '#93aaae', '#425c58', '#6b8a89'] },
]

/**
 * Görselin kendi renkleriyle mesh gradyan.
 *
 * Renkler ÖNCEDEN çıkarıldı (görsel 80×54'e indirgenip beşe
 * kuantalandı) ve kütüğe yazıldı. Çalışma anında çıkarmak, görseli bir
 * tuvale çizip piksel okumak demek; eklentinin kökeni CDN'in CORS
 * listesinde olmadığı için tuval kirleniyor ve okuma hiç çalışmıyor.
 * Önceden hesaplamak hem bu sorunu hem de her açılışta aynı işi
 * yeniden yapmayı ortadan kaldırıyor.
 */
export const meshOf = (id) => bgById(id)?.mesh ?? null

export const bgUrl = (id, small = false) => `${BG_BASE}/${id}${small ? '-k' : ''}.jpg`

/** Görselin Pexels'teki sayfası — künye için. */
export const bgCredit = (id) => `https://www.pexels.com/photo/${id}/`

export const bgById = (id) => BACKGROUNDS.find((b) => b.id === id) ?? null
