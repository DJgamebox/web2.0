const fs = require('fs');
const path = require('path');

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

// 读取网页专用描述（优先使用，不影响桌面客户端）
const webDescPath = path.join(__dirname, 'web-descriptions.json');
let webDescMap = {};
if (fs.existsSync(webDescPath)) {
  try {
    const webDescList = JSON.parse(fs.readFileSync(webDescPath, 'utf-8'));
    webDescList.forEach(item => {
      webDescMap[item.id] = item.description;
    });
    console.log(`📝 加载 ${webDescList.length} 个网页专用描述`);
  } catch (e) {
    console.warn('加载 web-descriptions.json 失败:', e.message);
  }
}

console.log(`找到 ${games.length} 个游戏`);

// 读取模板
const templatePath = path.join(__dirname, 'game-template.html');
const template = fs.readFileSync(templatePath, 'utf-8');

// 确保 games 目录存在
const gamesDir = path.join(__dirname, 'games');
if (!fs.existsSync(gamesDir)) {
  fs.mkdirSync(gamesDir, { recursive: true });
}

// 生成每个游戏页面
games.forEach((game, index) => {
  const gameId = game.id;
  const gameName = game.name;
  const gameNameEn = game.nameEn || '';
  const gameCategory = game.category || '';
  const gameSize = game.size || '';
  const gameCover = game.cover || '';
  // 优先使用网页专用描述（SEO优化版），不影响桌面客户端
  const gameDesc = webDescMap[game.id] || game.description || '';
  const baiduLink1 = game.baiduLink1 || '';
  const baiduLink2 = game.baiduLink2 || '';
  const baiduLink3 = game.baiduLink3 || '';
  const thunderLink = game.thunderLink || '';

  // 替换模板中的内容
  let html = template;

  // 替换标题和 meta 信息（模板中硬编码的是"生化危机9：安魂曲"）
  html = html.replace(/生化危机9：安魂曲/g, gameName);
  html = html.replace(/Resident Evil Requiem/g, gameNameEn);
  html = html.replace(/恐怖惊悚/g, gameCategory);
  html = html.replace(/77\.2G/g, gameSize);

  // 替换游戏ID（模板中硬编码的是120）
  html = html.replace(/游戏盒子 - 生化危机9：安魂曲下载/g, `游戏盒子 - ${gameName}下载`);

  // 替换链接
  html = html.replace(/120\.html/g, `${gameId}.html`);
  html = html.replace(/gameId = '120'/g, `gameId = '${gameId}'`);

  // 替换封面
  html = html.replace(/https:\/\/api\.djgamebox\.com\/api\/covers\/covers\/120\.jpg/g, gameCover);

  // 替换描述（匹配通用描述格式）
  html = html.replace(/生化危机9：安魂曲是一款恐怖惊悚游戏。本站提供生化危机9：安魂曲百度网盘、迅雷云盘高速下载，绿色免安装中文版，解压即可玩。/g, gameDesc);

  // 替换游戏大小（模板中硬编码的是"未知"，用于SEO）
  html = html.replace(/id="gameSize">未知</g, `id="gameSize">${gameSize || '未知'}<`);

  // 替换 Schema 结构化数据
  html = html.replace(/"name": "生化危机9：安魂曲"/g, `"name": "${gameName}"`);
  html = html.replace(/"alternateName": "Resident Evil Requiem"/g, `"alternateName": "${gameNameEn}"`);
  html = html.replace(/"description": "生化危机9：安魂曲是一款恐怖惊悚游戏。本站提供生化危机9：安魂曲百度网盘、迅雷云盘高速下载，绿色免安装中文版，解压即可玩。"/g, `"description": "${gameDesc.replace(/"/g, '\\"')}"`);
  html = html.replace(/"genre": "恐怖惊悚"/g, `"genre": "${gameCategory}"`);
  html = html.replace(/"image": "https:\/\/api\.djgamebox\.com\/api\/covers\/covers\/120\.jpg"/g, `"image": "${gameCover}"`);
  html = html.replace(/"url": "https:\/\/www\.djgamebox\.com\/games\/120\.html"/g, `"url": "https://www.djgamebox.com/games/${gameId}.html"`);

  // 替换下载链接
  html = html.replace(/href="\.\.\/"/g, 'href="/"');
  html = html.replace(/href="\.\.\/games\//g, 'href="/games/');

  // 动态生成下载按钮HTML（只生成有链接的按钮）
  let downloadButtonsHtml = '';
  if (baiduLink1) {
    downloadButtonsHtml += `<a href="${baiduLink1}" target="_blank" class="download-btn baidu"><img src="../images/baidu-icon-v2.png" alt="百度网盘" style="width:20px;height:20px;margin-right:8px;border-radius:4px;">百度网盘下载</a>`;
  }
  if (baiduLink2) {
    downloadButtonsHtml += `<a href="${baiduLink2}" target="_blank" class="download-btn baidu"><img src="../images/baidu-icon-v2.png" alt="百度网盘" style="width:20px;height:20px;margin-right:8px;border-radius:4px;">百度网盘备用</a>`;
  }
  if (baiduLink3) {
    downloadButtonsHtml += `<a href="${baiduLink3}" target="_blank" class="download-btn baidu"><img src="../images/baidu-icon-v2.png" alt="百度网盘" style="width:20px;height:20px;margin-right:8px;border-radius:4px;">百度网盘备用2</a>`;
  }
  if (thunderLink) {
    downloadButtonsHtml += `<a href="${thunderLink}" target="_blank" class="download-btn thunder"><img src="../images/xunlei-icon-v2.png" alt="迅雷" style="width:20px;height:20px;margin-right:8px;border-radius:4px;">迅雷下载</a>`;
  }
  
  // 替换模板中的下载按钮区域
  html = html.replace(/<div class="download-buttons" id="downloadButtons">[\s\S]*?<\/div>/, `<div class="download-buttons" id="downloadButtons">${downloadButtonsHtml}</div>`);
  
  // 保存文件
  const outputPath = path.join(gamesDir, `${gameId}.html`);
  fs.writeFileSync(outputPath, html, 'utf-8');
  
  if ((index + 1) % 100 === 0) {
    console.log(`已生成 ${index + 1} / ${games.length} 个游戏页面`);
  }
});

console.log(`\n✅ 完成！共生成 ${games.length} 个游戏详情页`);
console.log(`输出目录: ${gamesDir}`);
