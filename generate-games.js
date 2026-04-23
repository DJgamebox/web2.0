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

console.log(`找到 ${games.length} 个游戏`);

// 读取模板
const templatePath = path.join(__dirname, 'game-template.html');
const template = fs.readFileSync(templatePath, 'utf-8');

// 确保 games 目录存在
const gamesDir = path.join(__dirname, 'games');
if (!fs.existsSync(gamesDir)) {
  fs.mkdirSync(gamesDir, { recursive: true });
}

// 统计新增和更新的游戏
let newCount = 0;
let updateCount = 0;

// 生成每个游戏页面
games.forEach((game, index) => {
  const gameId = game.id;
  const outputPath = path.join(gamesDir, `${gameId}.html`);
  
  // 检查是否已存在
  const exists = fs.existsSync(outputPath);
  
  const gameName = game.name || '未命名游戏';
  const gameNameEn = game.nameEn || '';
  const gameCategory = game.category || '其他';
  const gameSize = game.size || '未知';
  const gameCover = game.cover || '';
  const gameDesc = game.description || `${gameName}是一款${gameCategory}游戏。本站提供${gameName}百度网盘、迅雷云盘高速下载，绿色免安装中文版，解压即可玩。`;
  const baiduLink1 = game.baiduLink1 || '';
  const baiduLink2 = game.baiduLink2 || '';
  const thunderLink = game.thunderLink || '';
  
  // 格式化日期
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
  
  const dateAdded = formatDate(game.dateAdded);
  
  // 替换模板中的内容 - 使用新的替换逻辑
  let html = template;
  
  // 1. 替换标题和 meta 信息
  html = html.replace(/生化危机9：安魂曲下载_Resident Evil Requiem/g, `${gameName}下载_${gameNameEn}`);
  html = html.replace(/生化危机9：安魂曲免费下载/g, `${gameName}免费下载`);
  html = html.replace(/生化危机9：安魂曲下载,生化危机9：安魂曲网盘,生化危机9：安魂曲百度云/g, `${gameName}下载,${gameName}网盘,${gameName}百度云`);
  html = html.replace(/恐怖惊悚游戏下载/g, `${gameCategory}游戏下载`);
  
  // 2. 替换 canonical URL
  html = html.replace(/games\/120\.html/g, `games/${gameId}.html`);
  
  // 3. 替换面包屑导航
  html = html.replace(/<a href="\.\.\/#恐怖惊悚">恐怖惊悚<\/a>/g, `<a href="../#${gameCategory}">${gameCategory}</a>`);
  html = html.replace(/<span>生化危机9：安魂曲<\/span>/g, `<span>${gameName}</span>`);
  
  // 4. 替换游戏封面
  html = html.replace(/https:\/\/api\.djgamebox\.com\/api\/covers\/covers\/120\.jpg/g, gameCover);
  html = html.replace(/alt="生化危机9：安魂曲"/g, `alt="${gameName}"`);
  
  // 5. 替换游戏标题
  html = html.replace(/<h1 class="game-title">生化危机9：安魂曲<\/h1>/g, `<h1 class="game-title">${gameName}</h1>`);
  html = html.replace(/<div class="game-title-en" style="display: block;">Resident Evil Requiem<\/div>/g, 
    gameNameEn ? `<div class="game-title-en" style="display: block;">${gameNameEn}</div>` : `<div class="game-title-en" style="display: none;"></div>`);
  
  // 6. 替换游戏类型
  html = html.replace(/<span class="meta-value">恐怖惊悚<\/span>/g, `<span class="meta-value">${gameCategory}</span>`);
  
  // 7. 替换游戏大小
  html = html.replace(/<span class="meta-value" id="gameSize">未知<\/span>/g, `<span class="meta-value" id="gameSize">${gameSize}</span>`);
  
  // 8. 替换更新时间
  html = html.replace(/<span class="meta-value">2026\/04\/11<\/span>/g, `<span class="meta-value">${dateAdded}</span>`);
  
  // 9. 替换下载链接
  let downloadButtonsHtml = '';
  if (baiduLink1) {
    downloadButtonsHtml += `<a href="${baiduLink1}" target="_blank" class="download-btn baidu"><img src="../images/baidu-logo.jpg" alt="百度网盘" style="width:20px;height:20px;margin-right:8px;border-radius:4px;object-fit:cover;">百度网盘下载</a>`;
  }
  if (baiduLink2) {
    downloadButtonsHtml += `<a href="${baiduLink2}" target="_blank" class="download-btn baidu"><img src="../images/baidu-logo.jpg" alt="百度网盘" style="width:20px;height:20px;margin-right:8px;border-radius:4px;object-fit:cover;">百度网盘备用</a>`;
  }
  if (thunderLink) {
    downloadButtonsHtml += `<a href="${thunderLink}" target="_blank" class="download-btn thunder"><img src="../images/xunlei-logo.jpg" alt="迅雷网盘" style="width:20px;height:20px;margin-right:8px;border-radius:4px;object-fit:cover;">迅雷网盘下载</a>`;
  }
  if (!downloadButtonsHtml) {
    downloadButtonsHtml = '<p style="color: var(--text-secondary);">暂无下载链接</p>';
  }
  
  html = html.replace(/<div class="download-buttons" id="downloadButtons">[\s\S]*?<\/div>/g, 
    `<div class="download-buttons" id="downloadButtons">${downloadButtonsHtml}</div>`);
  
  // 10. 替换游戏描述
  html = html.replace(/<p id="gameDesc">生化危机9：安魂曲是一款恐怖惊悚游戏。本站提供生化危机9：安魂曲百度网盘、迅雷云盘高速下载，绿色免安装中文版，解压即可玩。<\/p>/g, 
    `<p id="gameDesc">${gameDesc}</p>`);
  
  // 11. 替换游戏ID（用于收藏功能）
  html = html.replace(/const gameId = '120';/g, `const gameId = '${gameId}';`);
  
  // 保存文件
  fs.writeFileSync(outputPath, html, 'utf-8');
  
  if (exists) {
    updateCount++;
  } else {
    newCount++;
  }
  
  if ((index + 1) % 100 === 0) {
    console.log(`已处理 ${index + 1} / ${games.length} 个游戏`);
  }
});

console.log(`\n✅ 完成！`);
console.log(`新增: ${newCount} 个游戏页面`);
console.log(`更新: ${updateCount} 个游戏页面`);
console.log(`总计: ${games.length} 个游戏页面`);
console.log(`输出目录: ${gamesDir}`);
