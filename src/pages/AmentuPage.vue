<template>
  <div class="amentu-page blog-details">
    <img src="/img/ismetozel.jpg" alt="İsmet Özel" />

    <h1 class="page-title">amentü</h1>
    <h2>İsmet Özel</h2>
    <span class="year">1974</span>

    <div class="audio-player" :class="{ playing }">
      <audio ref="audioEl" @timeupdate="onTime" @loadedmetadata="onMeta" @play="onPlay" @pause="onPause" preload="metadata" src="https://cdn.alaturkavakitler.com/amentu.mp3"></audio>
      <button class="play-btn" @click="toggle" :aria-label="playing ? 'Duraklat' : 'Oynat'">
        <svg v-if="!playing" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="6,3 20,12 6,21"/></svg>
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
      </button>
      <div class="player-body">
        <div class="track-row">
          <div class="track-info">
            <span class="track-title">Amentü</span>
            <span class="artist">İsmet Özel</span>
          </div>
          <a href="https://www.youtube.com/watch?v=DacHvLiUcck" target="_blank" rel="noopener" class="source-side" aria-label="YouTube'da aç">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6a3 3 0 0 0-2.1 2.1C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.5 15.5V8.5l6.3 3.5-6.3 3.5z"/>
            </svg>
            <span class="source-label">Deus ex Machina</span>
          </a>
        </div>
        <div class="progress-track" ref="progressTrack" @click="seek">
          <div class="progress-fill" :style="{ width: progress + '%' }"></div>
          <div class="progress-thumb" :style="{ left: progress + '%' }"></div>
        </div>
        <div class="time-info">
          <span>{{ formatTime(current) }}</span>
          <span>{{ formatTime(total) }}</span>
        </div>
      </div>
    </div>

    <div class="detail">
      <p>İnsan </p>
      <p>eşref-i mahlûkattır derdi babam </p>
      <p>bu sözün sözler içinde bir yeri vardı </p>
      <p>ama bir eylül günü bilek damarlarımı kestiğim zaman </p>
      <p>bu söz asıl anlamını kavradı </p>
      <p>geçti çıvgınların, çıbanların, reklamların arasından </p>
      <p>geçti tarih denilen tamahkâr tüccarı </p>
      <p>kararmış rakamların yarıklarından sızarak </p>
      <p>bu söz yüreğime kadar alçaldı </p>
      <p>damar kesildi, kandır akacak </p>
      <p>ama kan kesilince damardan sıcak </p>
      <p>sımsıcak kelimeler boşandı </p>
      <p>aşk için karnıma ve göğsüme </p>
      <p>ölüm için yüreğime sürdüğüm ecza uçtu birden </p>
      <p>aşk ve ölüm bana yeniden </p>
      <p>su ve ateş ve toprak </p>
      <p>yeniden yorumlandı.</p>
      <p><br /></p>
      <p>Dilce susup </p>
      <p>bedence konuşulan bir çağda </p>
      <p>biliyorum kolay anlaşılmayacak </p>
      <p>kanatları kara fücur çiçekleri açmış olan dünyanın </p>
      <p>yanık yağda boğulan yapıların arasında </p>
      <p>delirmek hakkını elde bulundurmak </p>
      <p>rahma çağdaş terimlerle yanaşmak için </p>
      <p>bana deha değil </p>
      <p>belgeler gerekli </p>
      <p>kanıtlar, ifadeler, resmi mühür ve imza </p>
      <p>gençken </p>
      <p>peşpeşe kaç gece yıllarca </p>
      <p>acıyan, yumuşak yerlerime yaslanıp uçardım </p>
      <p><b id="hakkinda">bilmezdim neden bazı saatler </b></p>
      <p><b>alaturka vakitlere ayarlı </b></p>
      <p>neden karpuz sergilerinde lüküs yanar </p>
      <p>yazgı desem </p>
      <p>kötü bir şey dokunmuş olurdu sanki dudaklarıma </p>
      <p>Tokat </p>
      <p>aklıma bile gelmezdi </p>
      <p>babam onbeşli olmasa.</p>
      <p><br /></p>
      <p>Meyan kökü kazarmış babam kırlarda </p>
      <p>ben o yaşta koltuğumda kitaplar </p>
      <p>işaret parmağımda zincir, cebimde sedef çakı </p>
      <p>cebimde kırlangıçlar, çılgınlık sayfaları </p>
      <p>kafamda yasak düşünceler, Gide mesela. </p>
      <p>Kar yağarken kirlenen bir şeydi benim yüzüm </p>
      <p>her sevinç nöbetinde kusmak sunuldu bana </p>
      <p>gecenin anlamı tıkansın diye ıslık çalar </p>
      <p>resimli bir kitaptan çalardım hayatımı </p>
      <p>oysa hergün </p>
      <p>merkep kiralayıp da kazılan kökleri </p>
      <p>Forbes firmasına satan babamdı.</p>
      <p><br /></p>
      <p>Budur </p>
      <p>işte bir daha korkmamak için korkmaz görünen korku </p>
      <p>işte şehirleri bayındır gösteren yalan </p>
      <p>işte mevsimlerin değiştiği yerde buharlaşan </p>
      <p>kelepçeler, sürgünler, gençlik acılarıyla </p>
      <p>güç bela kurduğum cümle işte bu; </p>
      <p>ten kaygusu yüklü ağır bir haç taşımaktan </p>
      <p>tenimin olanca ağırlığı yok oldu. </p>
      <p>Solgun evler, ölü bir dağ, iyice solmuş dudak </p>
      <p>bile bir bir çınlayan </p>
      <p>ihtilal haberidir </p>
      <p>ve gecenin gümüş ipliklerden işlenmiş oluşu </p>
      <p>nisan ayları gelince vücudu hafifletir </p>
      <p>şahlanan grevler içinde kahkahalarım küstah </p>
      <p>bakışlarım beyaz bulutlara karşı obur </p>
      <p>marşlara ayarlanmak hevesindeki sesim </p>
      <p>gider şehre ve şaraba yaltaklanarak </p>
      <p>biraz ağlayabilmek için </p>
      <p>fotoğraflar çektirir </p>
      <p>babam </p>
      <p>seferberlikte mekk&acirc;redir.</p>
      <p><br /></p>
      <p>İnsanın </p>
      <p>gölgesiyle tanımlandığı bir çağda </p>
      <p>marşlara düşer belki birkaç şey açıklamak </p>
      <p>belki ruhların gölgesi </p>
      <p>düşer de marşlara </p>
      <p>mümkün olur babamı </p>
      <p>varlık sancısıyla çağırmak: </p>
      <p><br /></p>
      <p>Ezan sesi duyulmuyor </p>
      <p>Haç dikilmiş minbere </p>
      <p>Kâfir Yunan bayrak asmış </p>
      <p>Camilere, her yere</p>
      <p><br /></p>
      <p>Öyle ise gel kardeşim </p>
      <p>Hep verelim elele </p>
      <p>Patlatalım bombaları </p>
      <p>Çanlar sussun her yerde</p>
      <p><br /></p>
      <p>Çanlar sustu ve fakat </p>
      <p>binlerce yılın yabancısı bir ses </p>
      <p>değdi minarelere:</p>
      <p>Tanrı uludur Tanrı uludur </p>
      <p><br /></p>
      <p>Polistir babam </p>
      <p>Cumhuriyetin bir kuludur </p>
      <p>bense </p>
      <p>anlamış değilim böyle maceralardan </p>
      <p>ne Godiva geçer yoldan, ne bir kimse kör olur </p>
      <p>yalnız </p>
      <p>coşkunluğu karşısında içlendiğim şadırvan </p>
      <p>nüfus cüzdanımda tuhaf </p>
      <p>ekmek damgası durur </p>
      <p>benim işim bulutlar arşınlamak gün boyu </p>
      <p>etin ıslak tadına doğru </p>
      <p>yavaş yavaş uyanmak </p>
      <p>çocuk kemiklerinden yelkenler yapıp </p>
      <p>hırsız cenazelerine bine bine </p>
      <p>temiz döşeklerin ürpertisinden çeşme </p>
      <p>korkak dualarından cibinlikler kurarak </p>
      <p>dokunduğum banknotlardan tiksinmeyi itiraz </p>
      <p>nakışsız yaşamakları </p>
      <p>silâhlanmak sanarak </p>
      <p>çıkardım </p>
      <p>boğaza tıkanan lokmanın hartasını </p>
      <p>çıkınımda güneşler halka dağıtmak için </p>
      <p>halkı suvarmak saçlarımda bin ırmak </p>
      <p>ıhtırdım caddeleri meğer ki mezarlarmış </p>
      <p>hazırmış zaten duvar sıkılmış bir yumruğa </p>
      <p>fly Pan-Am </p>
      <p>drink Coca-Cola</p>
      <p><br /></p>
      <p>Tutun ve yüzleştirin hayatları </p>
      <p>biri kör batakların çırpınışında kutsal </p>
      <p>biri serkeş ama oldukça da haklı. </p>
      <p><br /></p>
      <p>Ölümler </p>
      <p>ölümlere ulanmakta ustadır </p>
      <p>hayatsa bir başka hayata karşı.</p>
      <p><br /></p>
      <p>Orada </p>
      <p>aşk ve çocuk </p>
      <p>birbirine katışmaz </p>
      <p>nasıl katışmıyorsa başaklara ağustos sıcağı </p>
      <p>kendi tehlikesi peşinden gider insan </p>
      <p>putların dahi damarından </p>
      <p>aktığı güne kadar </p>
      <p>sürdürür yorucu kovalamacayı.</p>
      <p><br /></p>
      <p>Hanidir görkli dünya dünyalar içre doğan? </p>
      <p>Nerde, hangi yöremizde zihnin </p>
      <p>tunç surlardan berkitilmiş ülkesi </p>
      <p>ağzı bayat suyla çalkanmış çocuğa rahim olan </p>
      <p>parti broşürleri yoksa kafiyeler mi? </p>
      <p>Hangi cisimdir açıkça bilmek isterim </p>
      <p>takvim yapraklarının arasını dolduran </p>
      <p>nedir o katı şey </p>
      <p>ki gücü </p>
      <p>gönlün dağdağasını durultacak? </p>
      <p><br /></p>
      <p>Hayat </p>
      <p>dört şeyle kaimdir, derdi babam </p>
      <p>su </p>
      <p>ve ateş </p>
      <p>ve toprak. </p>
      <p>Ve rüzgar. </p>
      <p><br /></p>
      <p>Ona kendimi sonradan ben ekledim </p>
      <p>pişirilmiş çamurun zifiri korkusunu </p>
      <p>ham yüreğin pütürlerini geçtim </p>
      <p>gövdemi alemlere zerkederek </p>
      <p>varoldum kayrasıyla Varedenin </p>
      <p>eşref-i mahlûkat </p>
      <p>nedir bildim.</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const audioEl = ref(null)
const progressTrack = ref(null)
const playing = ref(false)
const current = ref(0)
const total = ref(0)
const progress = ref(0)

function toggle() {
  const a = audioEl.value
  if (!a) return
  if (a.paused) { a.play() } else { a.pause() }
}

function onPlay() { playing.value = true }
function onPause() { playing.value = false }

function seek(e) {
  const a = audioEl.value
  if (!a || !progressTrack.value) return
  const rect = progressTrack.value.getBoundingClientRect()
  const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  a.currentTime = pct * a.duration
}

function onTime() {
  const a = audioEl.value
  if (!a) return
  current.value = a.currentTime
  progress.value = a.duration > 0 ? (a.currentTime / a.duration) * 100 : 0
}

function onMeta() {
  const a = audioEl.value
  if (a) total.value = a.duration
}

function formatTime(t) {
  if (!t || !isFinite(t)) return '0:00'
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.amentu-page {
  padding: 1em;
  padding-top: 4em;
  color: white;
  font-family: var(--font2);
}

.amentu-page img {
  border-radius: 0.5em;
  width: 100%;
  object-fit: cover;
}

h2 {
  font-size: 18px;
  font-weight: 800;
  display: block;
}

.year {
  display: block;
  margin-bottom: 1em;
  font-style: italic;
  opacity: 0.5;
  font-size: 0.8em;
}

.page-title {
  margin: 1.5em 0 0.75em;
  line-height: 0;
}

h2 {
  font-size: 18px;
  font-weight: 800;
  display: block;
  margin-top: 0.5em;
}

.year {
  display: block;
  margin-bottom: 1em;
  font-style: italic;
  opacity: 0.5;
  font-size: 0.8em;
}

.audio-player {
  display: flex;
  align-items: center;
  gap: 0.75em;
  max-width: 480px;
  margin: 1.5em auto;
  padding: 0.65em 0.75em;
  background: rgb(255 255 255 / 0.04);
  border: 1px solid rgb(255 255 255 / 0.06);
  border-radius: 0.5em;
  transition: background 0.2s;
}

.audio-player.playing {
  background: rgb(255 255 255 / 0.07);
}

.play-btn {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid rgb(255 255 255 / 0.15);
  background: transparent;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, border-color 0.15s;
}

.play-btn:hover {
  background: rgb(255 255 255 / 0.1);
  border-color: rgb(255 255 255 / 0.3);
}

.player-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25em;
}

.track-info {
  display: flex;
  align-items: baseline;
  gap: 0.5em;
}

.track-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75em;
}

.track-title {
  font-size: 0.85em;
  font-weight: 600;
  color: #fff;
}

.artist {
  font-size: 0.7em;
  opacity: 0.45;
}

.progress-track {
  position: relative;
  height: 3px;
  background: rgb(255 255 255 / 0.1);
  border-radius: 2px;
  cursor: pointer;
  transition: height 0.15s;
}

.progress-track:hover {
  height: 5px;
}

.progress-fill {
  height: 100%;
  background: var(--primary, #ae002e);
  border-radius: 2px;
  transition: width 0.1s linear;
}

.progress-thumb {
  position: absolute;
  top: 50%;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--primary, #ae002e);
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.15s;
}

.progress-track:hover .progress-thumb {
  opacity: 1;
}

.time-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.6em;
  opacity: 0.35;
  letter-spacing: 0.02em;
}

.source-side {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.3em;
  text-decoration: none;
  color: inherit;
  opacity: 0.35;
  transition: opacity 0.15s;
}

.source-side:hover {
  opacity: 0.75;
}

.source-label {
  font-size: 0.6em;
  opacity: 0.3;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.detail {
  margin-top: 2em;
  font-size: 0.9em;
  padding-bottom: 100px;
  line-height: 1.3;
}

.detail p {
  padding-bottom: 0.5em;
  font-weight: 200;
}

.detail b {
  font-weight: 800;
}
</style>
