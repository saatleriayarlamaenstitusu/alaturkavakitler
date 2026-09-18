// Doğu Arapçası rakamları (U+0660–U+0669). Arapça/Osmanlıca tipografiyle
// birlikte kullanılmak üzere; yalnızca 0-9 dönüştürülür, geri kalan
// karakterlere (":", "·", harfler) dokunulmaz.
const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']

export function toArabicNumerals(text) {
  return String(text ?? '').replace(/[0-9]/g, (d) => ARABIC_DIGITS[+d])
}

export function localizeNumerals(text, numerals) {
  return numerals === 'arabic' ? toArabicNumerals(text) : text
}
