
require("babel-register")({
	presets: ["es2015", "react"]
  });

  const GenerateSitemap = require("react-router-sitemap-maker").default;
  const Routes = require("./routes.jsx").default;
  
async function main (){

	const sitemapData = await GenerateSitemap(Routes(), {
		baseUrl: "https://alaturkavakitler.com",
		hashrouting: false,
		changeFrequency: "monthly"
	});

	console.log(sitemapData)
	
	sitemapData.toFile("./public/sitemap.xml");
}

main()
