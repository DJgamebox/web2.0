const fs = require('fs');
const path = require('path');

// 获取命令行参数中的游戏ID
const targetGameId = process.argv[2];

if (!targetGameId) {
  console.error('请提供游戏ID，例如: node generate-single-game.js 1991');
  process.exit(1);
}

console.log(`正在生成游戏 ${targetGameId} 的详情页...`);

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

// 查找指定游戏
const game = games.find(g => String(g.id) === String(targetGameId));

if (!game) {
  console.error(`未找到游戏 ID: ${targetGameId}`);
  process.exit(1);
}

console.log(`找到游戏: ${game.name}`);

// 读取模板
const templatePath = path.join(__dirname, 'game-template.html');
const template = fs.readFileSync(templatePath, 'utf-8');

// 确保 games 目录存在
const gamesDir = path.join(__dirname, 'games');
if (!fs.existsSync(gamesDir)) {
  fs.mkdirSync(gamesDir, { recursive: true });
}

// 生成游戏页面
const gameId = game.id;
const outputPath = path.join(gamesDir, `${gameId}.html`);

const gameName = game.name || '未命名游戏';
const gameNameEn = game.nameEn || '';
const gameCategory = game.category || '其他';
const gameSize = game.size || '未知';
const gameCover = game.cover || '';
const gameDesc = game.description || `${gameName}是一款${gameCategory}游戏。本站提供${gameName}百度网盘、迅雷云盘高速下载，绿色免安装中文版，解压即可玩。`;
const baiduLink1 = game.baiduLink1 || '';
const baiduLink2 = game.baiduLink2 || '';
const baiduLink3 = game.baiduLink3 || '';
const thunderLink = game.thunderLink || '';
// 格式化时间戳
function formatDate(timestamp) {
  if (!timestamp) return new Date().toLocaleDateString('zh-CN');
  
  // 如果已经是格式化的日期字符串（如 2026/4/16），直接返回
  if (typeof timestamp === 'string' && timestamp.includes('/')) {
    return timestamp;
  }
  
  // 处理字符串时间戳
  if (typeof timestamp === 'string') {
    timestamp = parseInt(timestamp);
  }
  
  // 如果是秒级时间戳（10位），转换为毫秒
  if (timestamp < 10000000000) {
    timestamp = timestamp * 1000;
  }
  
  return new Date(timestamp).toLocaleDateString('zh-CN');
}

const dateAdded = formatDate(game.dateAdded) || new Date().toLocaleDateString('zh-CN');
const updateTime = formatDate(game.updateTime);

// 替换模板中的内容
let html = template;

// 1. 替换标题和 meta 信息
html = html.replace(/<title>.*?<\/title>/, `<title>${gameName}下载_${gameNameEn || gameName}_百度网盘_迅雷云盘_免费下载 - 游戏盒子</title>`);
html = html.replace(/<meta name="description" content=".*?">/, `<meta name="description" content="${gameName}免费下载，提供百度网盘、迅雷云盘高速下载链接，${gameCategory}游戏，绿色免安装中文版，游戏盒子提供最新最全的单机游戏资源下载。">`);
html = html.replace(/<meta name="keywords" content=".*?">/, `<meta name="keywords" content="${gameName}下载,${gameName}网盘,${gameName}百度云,${gameCategory}游戏下载,单机游戏网盘,游戏盒子">`);
html = html.replace(/<link rel="canonical" href=".*?">/, `<link rel="canonical" href="https://djgamebox.com/games/${gameId}.html">`);

// 2. 替换面包屑导航 - 使用更精确的选择器
html = html.replace(/<a href="\.\.\/#.*?"[^>]*>.*?<\/a>\s*<span[^>]*>.*?<\/span>/, `<a href="../#${gameCategory}">${gameCategory}</a> <span>${gameName}</span>`);

// 3. 替换游戏封面（支持多种格式）
html = html.replace(/<img src="https:\/\/api\.djgamebox\.com\/api\/covers\/covers\/\d+\.jpg" alt="[^"]*"[^>]*onerror="[^"]*"[^>]*>/, `<img src="${gameCover}" alt="${gameName}" onerror="this.style.display='none'">`);
// 同时替换可能存在的 id="gameCover" 格式
html = html.replace(/<img src=".*?" alt=".*?" id="gameCover"[^>]*>/, `<img src="${gameCover}" alt="${gameName}" id="gameCover" onerror="this.style.display='none'">`);

// 4. 替换游戏标题
html = html.replace(/<h1 class="game-title">.*?<\/h1>/, `<h1 class="game-title">${gameName}</h1>`);
html = html.replace(/<div class="game-title-en" style="display: block;">.*?<\/div>/, 
  gameNameEn ? `<div class="game-title-en" style="display: block;">${gameNameEn}</div>` : `<div class="game-title-en" style="display: none;"></div>`);

// 5. 替换游戏类型
html = html.replace(/<span class="meta-value" id="gameCategory">.*?<\/span>/, `<span class="meta-value" id="gameCategory">${gameCategory}</span>`);

// 6. 替换游戏大小
html = html.replace(/<span class="meta-value" id="gameSize">.*?<\/span>/, `<span class="meta-value" id="gameSize">${gameSize}</span>`);

// 7. 替换更新时间
html = html.replace(/<span class="meta-value" id="gameDate">.*?<\/span>/, `<span class="meta-value" id="gameDate">${dateAdded}</span>`);

// 8. 替换下载链接
let downloadButtonsHtml = '';
if (baiduLink1) {
  downloadButtonsHtml += `<a href="javascript:void(0)" onclick="recordGameDownload(${gameId}, '${baiduLink1}')" class="download-btn baidu"><img src="../images/baidu-icon-v2.png" alt="百度网盘" style="width:20px;height:20px;vertical-align:middle;margin-right:6px;">百度网盘下载</a>`;
}
if (baiduLink2) {
  downloadButtonsHtml += `<a href="javascript:void(0)" onclick="recordGameDownload(${gameId}, '${baiduLink2}')" class="download-btn baidu"><img src="../images/baidu-icon-v2.png" alt="百度网盘" style="width:20px;height:20px;vertical-align:middle;margin-right:6px;">百度网盘备用</a>`;
}
if (baiduLink3) {
  downloadButtonsHtml += `<a href="javascript:void(0)" onclick="recordGameDownload(${gameId}, '${baiduLink3}')" class="download-btn baidu"><img src="../images/baidu-icon-v2.png" alt="百度网盘" style="width:20px;height:20px;vertical-align:middle;margin-right:6px;">百度网盘3</a>`;
}
if (thunderLink) {
  downloadButtonsHtml += `<a href="javascript:void(0)" onclick="recordGameDownload(${gameId}, '${thunderLink}')" class="download-btn thunder"><img src="../images/xunlei-icon-v2.png" alt="迅雷" style="width:20px;height:20px;vertical-align:middle;margin-right:6px;">迅雷下载</a>`;
}

// 替换下载按钮 - 使用更精确的选择器
const downloadButtonsPattern = /<div class="download-buttons" id="downloadButtons">[\s\S]*?<\/div>/;
const downloadButtonsMatch = html.match(downloadButtonsPattern);
if (downloadButtonsMatch) {
  // 找到最后一个匹配（应该是 HTML 中的那个，不是 CSS）
  const lastMatch = downloadButtonsMatch[downloadButtonsMatch.length - 1];
  html = html.replace(lastMatch, `<div class="download-buttons" id="downloadButtons">${downloadButtonsHtml}</div>`);
}

// 9. 替换游戏描述
html = html.replace(/<div class="game-desc" id="gameDesc">[\s\S]*?<\/div>/, 
  `<div class="game-desc" id="gameDesc">${gameDesc.replace(/\n/g, '<br>')}</div>`);

// 10. 替换游戏ID（用于JS动态加载）
html = html.replace(/const gameId = \d+;/, `const gameId = ${gameId};`);

// 写入文件
fs.writeFileSync(outputPath, html);
console.log(`已生成游戏页面: ${outputPath}`);
console.log('完成！');
