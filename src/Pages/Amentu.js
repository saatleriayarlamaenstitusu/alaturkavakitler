import { React, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const Amentu = (props) => {
	useEffect(() => {
		if (window.location.hash) {
			setTimeout(() => {
				document.querySelector(window.location.hash).scrollIntoView();
			}, 1000);
		}
	});

	return (
		<div className={`blogDetails amentu`}>
			<img
				src={`${process.env.PUBLIC_URL}/img/ismetozel.jpg`}
				alt="ismet özel"
			></img>
			<h1 className="topTitle">{props.topTitle} </h1>

			<h2
				className="block"
				style={{ fontSize: "18px", fontWeight: 800, marginBottom: "1em" }}
			>
				İsmet Özel
			</h2>

			<div className="detail">
				<p>İnsan&nbsp;</p>
				<p>eşref-i mahl&ucirc;kattır derdi babam&nbsp;</p>
				<p>bu s&ouml;z&uuml;n s&ouml;zler i&ccedil;inde bir yeri vardı&nbsp;</p>
				<p>
					ama bir eyl&uuml;l g&uuml;n&uuml; bilek damarlarımı kestiğim
					zaman&nbsp;
				</p>
				<p>bu s&ouml;z asıl anlamını kavradı&nbsp;</p>
				<p>
					ge&ccedil;ti &ccedil;ıvgınların, &ccedil;ıbanların, reklamların
					arasından&nbsp;
				</p>
				<p>ge&ccedil;ti tarih denilen tamahk&acirc;r t&uuml;ccarı&nbsp;</p>
				<p>kararmış rakamların yarıklarından sızarak&nbsp;</p>
				<p>bu s&ouml;z y&uuml;reğime kadar al&ccedil;aldı&nbsp;</p>
				<p>damar kesildi, kandır akacak&nbsp;</p>
				<p>ama kan kesilince damardan sıcak&nbsp;</p>
				<p>sımsıcak kelimeler boşandı&nbsp;</p>
				<p>aşk i&ccedil;in karnıma ve g&ouml;ğs&uuml;me&nbsp;</p>
				<p>
					&ouml;l&uuml;m i&ccedil;in y&uuml;reğime s&uuml;rd&uuml;ğ&uuml;m ecza
					u&ccedil;tu birden&nbsp;
				</p>
				<p>aşk ve &ouml;l&uuml;m bana yeniden&nbsp;</p>
				<p>su ve ateş ve toprak&nbsp;</p>
				<p>yeniden yorumlandı.</p>
				<p>
					<br />
				</p>
				<p>Dilce susup&nbsp;</p>
				<p>bedence konuşulan bir &ccedil;ağda&nbsp;</p>
				<p>biliyorum kolay anlaşılmayacak&nbsp;</p>
				<p>
					kanatları kara f&uuml;cur &ccedil;i&ccedil;ekleri a&ccedil;mış olan
					d&uuml;nyanın&nbsp;
				</p>
				<p>yanık yağda boğulan yapıların arasında&nbsp;</p>
				<p>delirmek hakkını elde bulundurmak&nbsp;</p>
				<p>rahma &ccedil;ağdaş terimlerle yanaşmak i&ccedil;in&nbsp;</p>
				<p>bana deha değil&nbsp;</p>
				<p>belgeler gerekli&nbsp;</p>
				<p>kanıtlar, ifadeler, resmi m&uuml;h&uuml;r ve imza&nbsp;</p>
				<p>gen&ccedil;ken&nbsp;</p>
				<p>peşpeşe ka&ccedil; gece yıllarca&nbsp;</p>
				<p>acıyan, yumuşak yerlerime yaslanıp u&ccedil;ardım&nbsp;</p>

				<p>
					<b id="hakkinda">bilmezdim neden bazı saatler&nbsp;</b>
				</p>
				<p>
					<b>alaturka vakitlere ayarlı&nbsp;</b>
				</p>

				<p>neden karpuz sergilerinde l&uuml;k&uuml;s yanar&nbsp;</p>
				<p>yazgı desem&nbsp;</p>
				<p>k&ouml;t&uuml; bir şey dokunmuş olurdu sanki dudaklarıma&nbsp;</p>
				<p>Tokat&nbsp;</p>
				<p>aklıma bile gelmezdi&nbsp;</p>
				<p>babam onbeşli olmasa.</p>
				<p>
					<br />
				</p>
				<p>Meyan k&ouml;k&uuml; kazarmış babam kırlarda&nbsp;</p>
				<p>ben o yaşta koltuğumda kitaplar&nbsp;</p>
				<p>işaret parmağımda zincir, cebimde sedef &ccedil;akı&nbsp;</p>
				<p>cebimde kırlangı&ccedil;lar, &ccedil;ılgınlık sayfaları&nbsp;</p>
				<p>kafamda yasak d&uuml;ş&uuml;nceler, Gide mesela.&nbsp;</p>
				<p>Kar yağarken kirlenen bir şeydi benim y&uuml;z&uuml;m&nbsp;</p>
				<p>her sevin&ccedil; n&ouml;betinde kusmak sunuldu bana&nbsp;</p>
				<p>gecenin anlamı tıkansın diye ıslık &ccedil;alar&nbsp;</p>
				<p>resimli bir kitaptan &ccedil;alardım hayatımı&nbsp;</p>
				<p>oysa herg&uuml;n&nbsp;</p>
				<p>merkep kiralayıp da kazılan k&ouml;kleri&nbsp;</p>
				<p>Forbes firmasına satan babamdı.</p>
				<p>
					<br />
				</p>
				<p>Budur&nbsp;</p>
				<p>
					işte bir daha korkmamak i&ccedil;in korkmaz g&ouml;r&uuml;nen
					korku&nbsp;
				</p>
				<p>işte şehirleri bayındır g&ouml;steren yalan&nbsp;</p>
				<p>işte mevsimlerin değiştiği yerde buharlaşan&nbsp;</p>
				<p>
					kelep&ccedil;eler, s&uuml;rg&uuml;nler, gen&ccedil;lik
					acılarıyla&nbsp;
				</p>
				<p>g&uuml;&ccedil; bela kurduğum c&uuml;mle işte bu;&nbsp;</p>
				<p>ten kaygusu y&uuml;kl&uuml; ağır bir ha&ccedil; taşımaktan&nbsp;</p>
				<p>tenimin olanca ağırlığı yok oldu.&nbsp;</p>
				<p>Solgun evler, &ouml;l&uuml; bir dağ, iyice solmuş dudak&nbsp;</p>
				<p>bile bir bir &ccedil;ınlayan&nbsp;</p>
				<p>ihtilal haberidir&nbsp;</p>
				<p>ve gecenin g&uuml;m&uuml;ş ipliklerden işlenmiş oluşu&nbsp;</p>
				<p>nisan ayları gelince v&uuml;cudu hafifletir&nbsp;</p>
				<p>şahlanan grevler i&ccedil;inde kahkahalarım k&uuml;stah&nbsp;</p>
				<p>bakışlarım beyaz bulutlara karşı obur&nbsp;</p>
				<p>marşlara ayarlanmak hevesindeki sesim&nbsp;</p>
				<p>gider şehre ve şaraba yaltaklanarak&nbsp;</p>
				<p>biraz ağlayabilmek i&ccedil;in&nbsp;</p>
				<p>fotoğraflar &ccedil;ektirir&nbsp;</p>
				<p>babam&nbsp;</p>
				<p>seferberlikte mekk&acirc;redir.</p>
				<p>
					<br />
				</p>
				<p>İnsanın&nbsp;</p>
				<p>g&ouml;lgesiyle tanımlandığı bir &ccedil;ağda&nbsp;</p>
				<p>
					marşlara d&uuml;şer belki birka&ccedil; şey a&ccedil;ıklamak&nbsp;
				</p>
				<p>belki ruhların g&ouml;lgesi&nbsp;</p>
				<p>d&uuml;şer de marşlara&nbsp;</p>
				<p>m&uuml;mk&uuml;n olur babamı&nbsp;</p>
				<p>varlık sancısıyla &ccedil;ağırmak:&nbsp;</p>
				<p>
					<br />
				</p>
				<p>Ezan sesi duyulmuyor&nbsp;</p>
				<p>Ha&ccedil; dikilmiş minbere&nbsp;</p>
				<p>K&acirc;fir Yunan bayrak asmış&nbsp;</p>
				<p>Camilere, her yere</p>
				<p>
					<br />
				</p>
				<p>&Ouml;yle ise gel kardeşim&nbsp;</p>
				<p>Hep verelim elele&nbsp;</p>
				<p>Patlatalım bombaları&nbsp;</p>
				<p>&Ccedil;anlar sussun her yerde</p>
				<p>
					<br />
				</p>
				<p>&Ccedil;anlar sustu ve fakat&nbsp;</p>
				<p>binlerce yılın yabancısı bir ses&nbsp;</p>
				<p>değdi minarelere:</p>
				<p>Tanrı uludur Tanrı uludur&nbsp;</p>
				<p>
					<br />
				</p>
				<p>Polistir babam&nbsp;</p>
				<p>Cumhuriyetin bir kuludur&nbsp;</p>
				<p>bense&nbsp;</p>
				<p>anlamış değilim b&ouml;yle maceralardan&nbsp;</p>
				<p>ne Godiva ge&ccedil;er yoldan, ne bir kimse k&ouml;r olur&nbsp;</p>
				<p>yalnız&nbsp;</p>
				<p>coşkunluğu karşısında i&ccedil;lendiğim şadırvan&nbsp;</p>
				<p>n&uuml;fus c&uuml;zdanımda tuhaf&nbsp;</p>
				<p>ekmek damgası durur&nbsp;</p>
				<p>benim işim bulutlar arşınlamak g&uuml;n boyu&nbsp;</p>
				<p>etin ıslak tadına doğru&nbsp;</p>
				<p>yavaş yavaş uyanmak&nbsp;</p>
				<p>&ccedil;ocuk kemiklerinden yelkenler yapıp&nbsp;</p>
				<p>hırsız cenazelerine bine bine&nbsp;</p>
				<p>temiz d&ouml;şeklerin &uuml;rpertisinden &ccedil;eşme&nbsp;</p>
				<p>korkak dualarından cibinlikler kurarak&nbsp;</p>
				<p>dokunduğum banknotlardan tiksinmeyi itiraz&nbsp;</p>
				<p>nakışsız yaşamakları&nbsp;</p>
				<p>sil&acirc;hlanmak sanarak&nbsp;</p>
				<p>&ccedil;ıkardım&nbsp;</p>
				<p>boğaza tıkanan lokmanın hartasını&nbsp;</p>
				<p>&ccedil;ıkınımda g&uuml;neşler halka dağıtmak i&ccedil;in&nbsp;</p>
				<p>halkı suvarmak sa&ccedil;larımda bin ırmak&nbsp;</p>
				<p>ıhtırdım caddeleri meğer ki mezarlarmış&nbsp;</p>
				<p>hazırmış zaten duvar sıkılmış bir yumruğa&nbsp;</p>
				<p>fly Pan-Am&nbsp;</p>
				<p>drink Coca-Cola</p>
				<p>
					<br />
				</p>
				<p>Tutun ve y&uuml;zleştirin hayatları&nbsp;</p>
				<p>biri k&ouml;r batakların &ccedil;ırpınışında kutsal&nbsp;</p>
				<p>biri serkeş ama olduk&ccedil;a da haklı.&nbsp;</p>
				<p>
					<br />
				</p>
				<p>&Ouml;l&uuml;mler&nbsp;</p>
				<p>&ouml;l&uuml;mlere ulanmakta ustadır&nbsp;</p>
				<p>hayatsa bir başka hayata karşı.</p>
				<p>
					<br />
				</p>
				<p>Orada&nbsp;</p>
				<p>aşk ve &ccedil;ocuk&nbsp;</p>
				<p>birbirine katışmaz&nbsp;</p>
				<p>nasıl katışmıyorsa başaklara ağustos sıcağı&nbsp;</p>
				<p>kendi tehlikesi peşinden gider insan&nbsp;</p>
				<p>putların dahi damarından&nbsp;</p>
				<p>aktığı g&uuml;ne kadar&nbsp;</p>
				<p>s&uuml;rd&uuml;r&uuml;r yorucu kovalamacayı.</p>
				<p>
					<br />
				</p>
				<p>
					Hanidir g&ouml;rkl&uuml; d&uuml;nya d&uuml;nyalar i&ccedil;re
					doğan?&nbsp;
				</p>
				<p>Nerde, hangi y&ouml;remizde zihnin&nbsp;</p>
				<p>tun&ccedil; surlardan berkitilmiş &uuml;lkesi&nbsp;</p>
				<p>ağzı bayat suyla &ccedil;alkanmış &ccedil;ocuğa rahim olan&nbsp;</p>
				<p>parti broş&uuml;rleri yoksa kafiyeler mi?&nbsp;</p>
				<p>Hangi cisimdir a&ccedil;ık&ccedil;a bilmek isterim&nbsp;</p>
				<p>takvim yapraklarının arasını dolduran&nbsp;</p>
				<p>nedir o katı şey&nbsp;</p>
				<p>ki g&uuml;c&uuml;&nbsp;</p>
				<p>g&ouml;nl&uuml;n dağdağasını durultacak?&nbsp;</p>
				<p>
					<br />
				</p>
				<p>Hayat&nbsp;</p>
				<p>d&ouml;rt şeyle kaimdir, derdi babam&nbsp;</p>
				<p>su&nbsp;</p>
				<p>ve ateş&nbsp;</p>
				<p>ve toprak.&nbsp;</p>
				<p>Ve r&uuml;zgar.&nbsp;</p>
				<p>
					<br />
				</p>
				<p>Ona kendimi sonradan ben ekledim&nbsp;</p>
				<p>pişirilmiş &ccedil;amurun zifiri korkusunu&nbsp;</p>
				<p>ham y&uuml;reğin p&uuml;t&uuml;rlerini ge&ccedil;tim&nbsp;</p>
				<p>g&ouml;vdemi alemlere zerkederek&nbsp;</p>
				<p>varoldum kayrasıyla Varedenin&nbsp;</p>
				<p>eşref-i mahl&ucirc;kat&nbsp;</p>
				<p>nedir bildim.</p>
			</div>
		</div>
	);
};

export default Amentu;
