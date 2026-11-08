const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.ui95.dev"
const KEY = "cd87efb58de8e2d495c0179183971f81"

const sitemap = await fetch(`${SITE_URL}/sitemap.xml`).then((response) => response.text())
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])
urlList.push(`${SITE_URL}/llms.txt`, `${SITE_URL}/llms-full.txt`)

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: new URL(SITE_URL).host,
    key: KEY,
    keyLocation: `${SITE_URL}/${KEY}.txt`,
    urlList,
  }),
})

console.log(`indexnow: ${response.status} ${response.statusText} for ${urlList.length} URLs`)
if (!response.ok) {
  console.error(await response.text())
  process.exit(1)
}
