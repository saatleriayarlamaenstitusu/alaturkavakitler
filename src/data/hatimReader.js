import { AUTHORS, DEFAULT_AUTHOR } from './kuranMeta'
import { mealFontById } from './mealFonts'
import { quranFontById } from './quranFonts'
import { availableReciters } from './reciters'

export const QURAN_VIEWS = [
  { id: 'mushaf', label: 'Mushaf' },
  { id: 'esnek', label: 'Esnek' },
  { id: 'ayet', label: 'Ayet ayet' },
]

export const HATIM_PRESETS = [
  { id: 'mushaf', label: 'Mushaf hatmi', description: 'Mushaf düzeni, meal kapalı' },
  { id: 'meal', label: 'Meal okuma', description: 'Ayet ayet görünüm, meal açık' },
  { id: 'current', label: 'Serbest okuma ayarlarım', description: 'Mevcut okuma tercihlerimle başla' },
]

// Kopya, hatmin meal dizisini genel ayarlarla veya başka bir hatimle
// paylaşmasını önler. Boş meal dizisi geçerli bir tercihtir.
export function snapshotReader(source = {}, fallback = {}) {
  const value = { ...fallback, ...source }
  const meals = Array.isArray(value.quranMeals) ? new Set(value.quranMeals.map(Number)) : new Set([DEFAULT_AUTHOR])
  const size = Number(value.quranFontSize)
  const quranMeals = AUTHORS.filter(({ id }) => meals.has(id)).map(({ id }) => id)
  return {
    immersive: value.immersive === true,
    quranView: QURAN_VIEWS.some(({ id }) => id === value.quranView) ? value.quranView : 'mushaf',
    quranArabicHidden: quranMeals.length > 0 && value.quranArabicHidden === true,
    quranMeals,
    quranMealFont: mealFontById(value.quranMealFont).id,
    quranFont: quranFontById(value.quranFont).id,
    quranFontSize: Number.isFinite(size) ? Math.min(180, Math.max(70, Math.round(size / 10) * 10)) : 100,
    quranScript: value.quranScript === 'v1' ? 'v1' : 'v2',
    quranTajweed: value.quranTajweed === true,
    quranReciter: availableReciters().some(({ id }) => id === value.quranReciter) ? value.quranReciter : 'toure',
    quranAutoScroll: value.quranAutoScroll !== false,
  }
}

export function presetReader(id, settings) {
  const reader = snapshotReader(settings)
  if (id === 'mushaf') return { ...reader, quranView: 'mushaf', quranArabicHidden: false, quranMeals: [] }
  if (id === 'meal') return {
    ...reader, quranView: 'ayet', quranMeals: reader.quranMeals.length ? reader.quranMeals : [DEFAULT_AUTHOR],
  }
  return reader
}

export function showsArabic(reader) {
  return !reader.quranArabicHidden || !reader.quranMeals.length
    || (reader.quranView !== 'esnek' && reader.quranView !== 'ayet')
}
