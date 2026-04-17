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
  
  const gameName = game.name;
  const gameNameEn = game.nameEn || '';
  const gameCategory = game.category || '';
  const gameSize = game.size || '';
  const gameCover = game.cover || '';
  const gameDesc = game.description || '';
  const baiduLink1 = game.baiduLink1 || '';
  const baiduLink2 = game.baiduLink2 || '';
  const thunderLink = game.thunderLink || '';
  
  // 替换模板中的内容
  let html = template;
  
  // 替换标题和 meta 信息
  html = html.replace(/三国志曹操传/g, gameName);
  html = html.replace(/Sango CCZ/g, gameNameEn);
  html = html.replace(/策略/g, gameCategory);
  html = html.replace(/2\.3G/g, gameSize);
  
  // 替换链接
  html = html.replace(/1\.html/g, `${gameId}.html`);
  
  // 替换封面
  html = html.replace(/https:\/\/api\.djgamebox\.com\/api\/covers\/covers\/1\.jpg/g, gameCover);
  
  // 替换描述
  html = html.replace(/《三国志曹操传》是日本光荣公司出版的英杰传系列游戏。/g, gameDesc);
  
  // 替换下载链接（如果有的话）
  if (baiduLink1) {
    html = html.replace(/href="https:\/\/pan\.baidu\.com\/s\/1xxxxx"/g, `href="${baiduLink1}"`);
  }
  if (thunderLink) {
    html = html.replace(/href="https:\/\/pan\.xunlei\.com\/s\/1xxxxx"/g, `href="${thunderLink}"`);
  }
  
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
