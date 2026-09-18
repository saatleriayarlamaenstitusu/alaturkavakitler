import { ARABIC_PHRASES, DEFAULT_PHRASE } from './arabicPhrases'
import { OTTOMAN_PHRASES, DEFAULT_OTTOMAN_PHRASE } from './ottomanPhrases'

// Hazır metin kümeleri. Aynı widget bileşeni her iki kümeyle de çalışır;
// fark yalnızca seçicinin beslendiği listedir.
export const PHRASE_SETS = {
  arabic: { list: ARABIC_PHRASES, defaultId: DEFAULT_PHRASE },
  ottoman: { list: OTTOMAN_PHRASES, defaultId: DEFAULT_OTTOMAN_PHRASE },
}

export function phraseList(source) {
  return (PHRASE_SETS[source] ?? PHRASE_SETS.arabic).list
}

export function getPhraseFrom(source, id) {
  const set = PHRASE_SETS[source] ?? PHRASE_SETS.arabic
  return set.list.find(p => p.id === id) || set.list[0]
}

export function defaultPhrase(source) {
  const set = PHRASE_SETS[source] ?? PHRASE_SETS.arabic
  return set.list.find(p => p.id === set.defaultId) || set.list[0]
}
