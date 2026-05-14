const fs = require('fs');
const path = require('path');

// 配置
const MAX_SEO_LINKS = 100; // 首页隐藏链接数量
const GAMES_PER_PAGE = 36; // 每页游戏数

// 读取游戏数据
const dataPath = path.join(__dirname, 'data-embed.js');
const dataContent = fs.readFileSync(dataPath, 'utf-8');

// 提取 gamesData 数组
const match = dataContent.match(/const importedGames = ([\s\S]*?\]);/);
if (!match) {
  console.error('无法解析游戏数据');
  process.exit(1);
}

let games;
try {
  games = eval(match[1]);
} catch (e) {
  console.error('解析游戏数据失败:', e);
  process.exit(1);
}

// 过滤掉非游戏数据（如 banner 配置）
games = games.filter(game => game.id !== '_banner_config');

console.log(`找到 ${games.length} 个游戏`);

// ========== 生成首页SEO隐藏链接 ==========
function generateSeoLinks() {
  // 1. 优先选择 seoPriority=true 的游戏
  let seoGames = games.filter(g => g.seoPriority === true);
  console.log(`SEO优先展示游戏: ${seoGames.length} 个`);

  // 2. 如果不足50个，用最新添加的游戏补充
  if (seoGames.length < MAX_SEO_LINKS) {
    // 按 updateTime 或 dateAdded 排序，取最新的
    const remainingGames = games
      .filter(g => !g.seoPriority)
      .sort((a, b) => (b.updateTime || 0) - (a.updateTime || 0))
      .slice(0, MAX_SEO_LINKS - seoGames.length);
    
    seoGames = [...seoGames, ...remainingGames];
  }

  // 3. 如果超过50个，只取前50个
  seoGames = seoGames.slice(0, MAX_SEO_LINKS);

  // 生成HTML
  let linksHtml = seoGames.map(game => {
    const url = `https://www.djgamebox.com/games/${game.id}.html`;
    const name = game.name || '未命名游戏';
    const category = game.category || '其他';
    return `<a href="${url}" title="${name} ${category}游戏下载">${name}</a>`;
  }).join('\n    ');

  return `<!-- SEO隐藏链接 - 给搜索引擎看的游戏列表 -->
<div style="display:none;" id="seo-links" aria-hidden="true">
  <h2>游戏盒子 - 单机游戏下载</h2>
  <nav>
    ${linksHtml}
  </nav>
  <p>提供最新单机游戏百度网盘、迅雷云盘高速下载，绿色免安装中文版。</p>
</div>`;
}

// ========== 生成 Sitemap.xml ==========
function generateSitemap() {
  const today = new Date().toISOString().split('T')[0];
  
  // 首页
  let urls = [`  <url>
    <loc>https://www.djgamebox.com/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`];

  // 所有游戏页面
  games.forEach(game => {
    const url = `https://www.djgamebox.com/games/${game.id}.html`;
    const updateTime = game.updateTime 
      ? new Date(game.updateTime).toISOString().split('T')[0]
      : today;
    const priority = game.seoPriority ? '0.8' : '0.6';
    
    urls.push(`  <url>
    <loc>${url}</loc>
    <lastmod>${updateTime}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`);
  });

  // 分页页面（如果有分页）
  const totalPages = Math.ceil(games.length / GAMES_PER_PAGE);
  for (let i = 2; i <= totalPages; i++) {
    urls.push(`  <url>
    <loc>https://www.djgamebox.com/?page=${i}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.5</priority>
  </url>`);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
}

// ========== 更新 index.html ==========
function updateIndexHtml() {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf-8');

  // 生成SEO链接
  const seoLinks = generateSeoLinks();

  // 检查是否已存在SEO链接区块
  if (html.includes('id="seo-links"')) {
    // 替换现有的
    html = html.replace(/<!-- SEO隐藏链接[\s\S]*?<\/div>/, seoLinks);
    console.log('已更新现有SEO链接');
  } else {
    // 在 </body> 前插入
    html = html.replace('</body>', `${seoLinks}\n</body>`);
    console.log('已插入新的SEO链接');
  }

  fs.writeFileSync(indexPath, html, 'utf-8');
  console.log('index.html 更新完成');
}

// ========== 保存 Sitemap ==========
function saveSitemap() {
  const sitemap = generateSitemap();
  fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemap, 'utf-8');
  console.log(`sitemap.xml 生成完成，包含 ${games.length + 1} 个URL`);
}

// ========== 主程序 ==========
try {
  updateIndexHtml();
  saveSitemap();
  console.log('\n✅ SEO优化完成！');
  console.log(`- 首页隐藏链接: 最多 ${MAX_SEO_LINKS} 个游戏`);
  console.log(`- Sitemap: 包含全部 ${games.length} 个游戏 + 首页 + 分页`);
} catch (error) {
  console.error('生成失败:', error);
  process.exit(1);
}
