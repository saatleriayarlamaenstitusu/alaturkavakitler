<script setup>
import VerseActions from '@/components/quran/VerseActions.vue'
import { authorById, surahById } from '@/data/kuranMeta'
import { useSavedVersesStore } from '@/stores/savedVerses'
import { pageOfVerse } from '@/utils/mushaf'
import { verseRef } from '@/utils/kuran'

const emit = defineEmits(['open'])
const saved = useSavedVersesStore()

function reference({ name, surah, verse }) {
  return verseRef(name || surahById(surah)?.name || '', surah, verse)
}
</script>

<template>
  <section aria-label="Kaydedilen Ayetler">
    <p v-if="!saved.list.length" class="empty">
      Henüz kaydedilen ayet yok. Ayet ayet görünümünde ayetin ⋯ menüsünden kaydedebilirsiniz.
    </p>
    <ul v-else class="saved-list">
      <li v-for="ayah in saved.list" :key="`${ayah.surah}:${ayah.verse}`" class="saved-verse">
        <div class="verse-head">
          <button
            v-if="pageOfVerse(ayah.surah, ayah.verse)"
            type="button"
            class="reference"
            :aria-label="`${reference(ayah)} ayetini aç`"
            @click="emit('open', { surah: ayah.surah, verse: ayah.verse })"
          >{{ reference(ayah) }} <span aria-hidden="true">›</span></button>
          <span v-else>{{ reference(ayah) }}</span>
          <VerseActions :ayah="ayah" />
        </div>
        <p class="saved-ar" dir="rtl" lang="ar">{{ ayah.ar }}</p>
        <template v-for="(translation, id) in ayah.trs" :key="id">
          <p v-if="translation" class="translation">
            <span class="author">{{ authorById(id)?.name }}</span>
            <span :lang="authorById(id)?.lang">{{ translation }}</span>
          </p>
        </template>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.saved-list { list-style: none; padding: 0; margin: 0; }
.saved-verse { padding: 0.9rem 0; border-bottom: 1px solid var(--border); }
.verse-head { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 0.4rem; }
.reference {
  min-height: 2rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text);
  background: transparent;
  font: inherit;
  font-size: 0.8rem;
  cursor: pointer;
}
.saved-ar { margin: 0.55rem 0; font-family: var(--quran-ar), serif; font-size: 1.5rem; line-height: 1.9; }
.empty, .translation { color: var(--text-muted); font-size: 0.88rem; line-height: 1.6; }
.translation { margin: 0.5rem 0 0; }
.author { display: block; font-size: 0.75rem; }
</style>
