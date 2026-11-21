<script setup>
import { ref, computed } from 'vue'

/**
 * Günlük ilerleme — haftalara bölünmüş yatay şerit.
 *
 * Her kutucuk bir gün, bugün en SAĞDA ve şerit sola doğru geriye gider;
 * parmakla sola kaydırarak geçmişe bakılır. Dikey bir ay takvimi de
 * denenebilirdi ama hatim bir alışkanlık: önemli olan "bugün okudum mu"
 * ve "son günlerde ne yaptım", ay görünümü değil.
 *
 * Kutucuklar HAFTA HAFTA gruplanır (pazartesi–pazar) ve okunan sayfa
 * sayısı kutunun İÇİNDE yazar. Önce ince çubuklardı ve sayı yalnızca
 * üzerine gelince çıkan ipucundaydı; dokunmatikte öyle bir ipucu yok,
 * dolayısıyla "hangi gün kaç sayfa" hiç görünmüyordu.
 *
 * Dolgu mutlak değil, o dönemin en yüksek gününe göre ölçeklenir: günde
 * iki sayfa okuyan biri için de şerit okunur kalsın diye.
 */
const props = defineProps({
  byDay: { type: Object, required: true },
  /**
   * Gün → o gün okunup SONRADAN geri alınan sayfa sayısı.
   *
   * Dolu bir kutu olarak çizilmez: hatmin sayacında o sayfa okunmamış
   * sayılıyor. Kesikli bir çerçeveyle işaretlenir — "burada bir şey
   * oldu ama sayılmadı". Gün tamamen silinseydi "dün üç sayfa
   * okumuştum" diye bakan biri bomboş bir kutu görürdü.
   */
  undoneByDay: { type: Object, default: () => ({}) },
  weeks: { type: Number, default: 10 },
})

const MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

/** Haftalar: her biri pazartesiden başlayan 7 gün, sonuncusu bugünü taşır. */
const list = computed(() => {
  const max = Math.max(1, ...Object.values(props.byDay))
  const now = new Date()
  now.setHours(12, 0, 0, 0)
  // Bugünün haftasının pazartesisi
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))

  const out = []
  for (let w = props.weeks - 1; w >= 0; w--) {
    const days = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday)
      d.setDate(monday.getDate() - w * 7 + i)
      const key = iso(d)
      const count = props.byDay[key] ?? 0
      const undone = props.undoneByDay[key] ?? 0
      const date = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })
      days.push({
        key,
        count,
        undone,
        level: count ? 0.25 + 0.75 * (count / max) : 0,
        today: key === iso(now),
        future: d > now,
        label: undone
          ? `${date} — ${count} sayfa (${undone} geri alındı)`
          : `${date} — ${count} sayfa`,
        text: `${d.getDate()} ${MONTHS[d.getMonth()]}`,
      })
    }
    // Hafta başlığı: haftanın içinde ayın biri varsa ayın adı, yoksa gün
    const first = days.find((x) => x.key.endsWith('-01'))
    out.push({ days, tick: first ? MONTHS[Number(first.key.slice(5, 7)) - 1] : '' })
  }
  return out
})

const picked = ref(null)
const detail = computed(() => {
  const all = list.value.flatMap((w) => w.days)
  return picked.value
    ? all.find((d) => d.key === picked.value) ?? null
    : all.find((d) => d.today) ?? null
})

const pick = (d) => { picked.value = picked.value === d.key ? null : d.key }
</script>

<template>
  <div class="cal">
    <div class="strip">
      <div class="track">
        <div v-for="(w, i) in list" :key="i" class="week">
          <span
            v-for="d in w.days"
            :key="d.key"
            class="day"
            :class="{ today: d.today, future: d.future, on: picked === d.key, undone: d.undone && !d.count }"
            :style="{ '--level': d.level }"
            :title="d.label"
            @click.stop="pick(d)"
          >{{ d.count || (d.undone ? '·' : '') }}</span>
          <span v-if="w.tick" class="tick">{{ w.tick }}</span>
        </div>
      </div>
    </div>

    <p v-if="detail" class="detail">
      <span class="detail-day">{{ detail.text }}</span>
      <span class="detail-count">{{ detail.count ? `${detail.count} sayfa` : 'okunmadı' }}</span>
      <span v-if="detail.undone" class="detail-undone">{{ detail.undone }} geri alındı</span>
    </p>
  </div>
</template>

<style scoped>
/* Şerit ekran kenarlarına taşar: kaydırılacak bir şey olduğu kenardan
   kesilmesiyle anlaşılır. */
.strip {
  margin: 0 -1.25rem;
  padding: 0 1.25rem;
  overflow-x: auto;
  scrollbar-width: none;
  /* Bugün sağda; kaydırma başlangıcı da orada olsun. */
  direction: rtl;
}

.strip::-webkit-scrollbar { display: none; }

.track {
  direction: ltr;
  display: flex;
  gap: 0.5rem;
  min-width: min-content;
  padding: 0.75rem 0 1.1rem;
}

/* Hafta: yedi gün bir arada, araları haftalar arasından dar. */
.week {
  position: relative;
  display: flex;
  gap: 2px;
  flex: 0 0 auto;
}

.day {
  flex: 0 0 auto;
  width: 20px;
  height: 30px;
  border-radius: 3px;
  background: color-mix(in srgb, var(--accent-ui) calc(var(--level) * 100%), transparent);
  box-shadow: inset 0 0 0 1px var(--border);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  color: var(--bg);
  user-select: none;
}

/* Dolu olmayan günde sayı yok; dolu olanda kutunun zıttı okunur. */
.day:not(.today):hover { box-shadow: inset 0 0 0 1px var(--text-muted); }
.day.today { box-shadow: inset 0 0 0 1.5px var(--text); }
.day.on { box-shadow: inset 0 0 0 2px var(--text); }
.day.future { opacity: 0.35; }

/* Geri alınmış gün: dolgu YOK (o sayfalar hatme yazılmıyor), kesikli
   çerçeve var. Dolu bir kutuyla aynı görünseydi oranla çelişirdi. */
.day.undone {
  background: transparent;
  box-shadow: none;
  border: 1px dashed color-mix(in srgb, var(--accent-ui) 55%, transparent);
  color: var(--text-muted);
}

.detail-undone {
  font-size: 0.62rem;
  letter-spacing: 0.06em;
  color: var(--accent-ui);
}

.tick {
  position: absolute;
  top: calc(100% + 2px);
  left: 0;
  font-size: 0.5rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-muted);
  white-space: nowrap;
}

.detail {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  font-size: 0.72rem;
  color: var(--text-muted);
}

.detail-day { color: var(--text); }

@media (min-width: 900px) {
  .day { width: 24px; height: 34px; font-size: 0.65rem; }
}
</style>
