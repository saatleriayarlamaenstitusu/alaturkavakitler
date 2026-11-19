import { SHARE_FONTS, getFont } from '@/data/shareFonts'

// Fontlar grup grup yüklenir. Hepsi birden ~96kB CSS eder; sayfa açılışında
// yalnızca kullanımdaki fontların grubu, sonra da seçicide açılan sekmenin
// grubu indirilir. Font DOSYALARI zaten yalnızca gerçekten uygulanan
// ailelerde iner — buradaki maliyet sadece stylesheet.
const loaded = new Set()

function injectGroup(groupId) {
  if (loaded.has(groupId)) return
  loaded.add(groupId)

  const families = SHARE_FONTS
    .filter(f => f.group === groupId)
    .map(f => `family=${f.google}`)
    .join('&')
  if (!families) return

  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.dataset.fontGroup = groupId
  link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`
  document.head.appendChild(link)
}

export function ensureFontGroup(groupId) {
  injectGroup(groupId)
}

/**
 * Tek bir aileyi yükler.
 *
 * Kuran sayfası gibi tek font kullanan yerler için: grubun tamamını
 * indirmek (arapça grubunda 16 aile) boşuna stylesheet demek.
 */
export function ensureFont(fontId) {
  const key = `one:${fontId}`
  if (loaded.has(key)) return
  loaded.add(key)
  const font = getFont(fontId)
  if (!font) return
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.dataset.font = fontId
  link.href = `https://fonts.googleapis.com/css2?family=${font.google}&display=swap`
  document.head.appendChild(link)
}

// Kullanımdaki fontların grupları — kayıtlı bir düzen geri geldiğinde
// o fontlar sekmeye dokunulmadan da doğru render edilsin diye.
export function ensureFontsFor(fontIds) {
  const groups = new Set(fontIds.filter(Boolean).map(id => getFont(id).group))
  groups.forEach(injectGroup)
}
