// IndexNow 推送脚本：部署后主动把页面 URL 推送给 Bing / Yandex 等搜索引擎
// 文档：https://www.indexnow.org/documentation
const fs = require('fs');
const path = require('path');

const HOST = 'www.djgamebox.com';
const KEY = fs.readFileSync(path.join(__dirname, 'b2235e0e5140c89a3681c358e0d741f3.txt'), 'utf-8').trim();
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

// 从 sitemap.xml 读取全部 URL（生成 sitemap 的步骤在本脚本之前执行）
const sitemap = fs.readFileSync(path.join(__dirname, 'sitemap.xml'), 'utf-8');
const urls = [...sitemap.matchAll(/<loc>(https:\/\/www\.djgamebox\.com\/[^<]+)<\/loc>/g)].map(m => m[1]);

if (urls.length === 0) {
  console.log('sitemap.xml 中未找到 URL，跳过 IndexNow 推送');
  process.exit(0);
}

// IndexNow 单次最多 10000 个 URL，分块推送
(async () => {
  for (let i = 0; i < urls.length; i += 10000) {
    const chunk = urls.slice(i, i + 10000);
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList: chunk }),
    });
    console.log(`IndexNow 推送 ${chunk.length} 个 URL，响应状态: ${res.status}`);
    if (!res.ok) {
      console.log('响应内容:', await res.text());
    }
  }
})().catch(e => {
  console.warn('IndexNow 推送失败（不影响部署）:', e.message);
});
