import { computed } from 'vue'
import { getFont, nearestWeight } from '@/data/shareFonts'

// Widget kökene uygulanacak tipografi stili.
// Alt elemanlar ağırlığı doğrudan yazmaz, `--w` (ana) ve `--w-soft` (ikincil)
// değişkenlerinden okur. Böylece kullanıcı kalınlığı değiştirdiğinde
// tasarımın içindeki ağırlık hiyerarşisi bozulmadan birlikte kayar.
export function useWidgetFont(settings, baseWeight = 700) {
  return computed(() => {
    const s = settings.value ?? {}
    const font = getFont(s.font)
    const weight = nearestWeight(font.id, Number(s.weight) || baseWeight)
    const soft = nearestWeight(font.id, Math.max(200, weight - 200))
    return {
      fontFamily: font.family,
      fontStyle: s.italic && font.italic ? 'italic' : 'normal',
      '--w': weight,
      '--w-soft': soft,
      // Harf aralığı mutlak değil, tasarımdaki değere eklenen bir kaymadır:
      // widget içindeki tracking hiyerarşisi (etiket geniş, rakam sıkı) korunur.
      '--ls': `${Number(s.letterSpacing) || 0}em`,
    }
  })
}
