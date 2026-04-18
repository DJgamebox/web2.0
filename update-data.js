const fs = require('fs');
const path = require('path');

// 读取 API 数据
const apiDataPath = path.join(__dirname, 'new-games-data.json');
const apiData = JSON.parse(fs.readFileSync(apiDataPath, 'utf-8'));

// 转换 API 数据格式为网页版格式
const games = apiData.games.map(game => ({
  id: game.id,
  name: game.cn || game.name || '',
  nameEn: game.en || game.nameEn || '',
  cover: game.cover || '',
  category: game.type || game.category || '',
  size: game.size || '',
  description: game.desc || game.description || '',
  baiduLink1: game.link1 || game.baiduLink1 || '',
  baiduLink2: game.link2 || game.baiduLink2 || '',
  thunderLink: game.link3 || game.thunderLink || '',
  favorite: game.favorite || false,
  dateAdded: game.update ? new Date(game.update).toLocaleDateString('zh-CN') : '',
  isDrm: game.isDrm || false,
  downloadsWeb: game.downloadsWeb || 0,
  downloadsApp: game.downloadsApp || 0,
  hot: game.hot || 0
}));

// 生成 data-embed.js 内容
const dataContent = `// 游戏数据 - 由后台管理系统自动生成
// 生成时间: ${new Date().toLocaleString('zh-CN')}
// 游戏数量: ${games.length}

const importedGames = ${JSON.stringify(games, null, 2)};

// 导出数据（用于 Node.js 脚本）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { importedGames };
}
`;

// 保存到 data-embed.js
fs.writeFileSync(path.join(__dirname, 'data-embed.js'), dataContent, 'utf-8');
console.log(`✅ 已更新 data-embed.js，包含 ${games.length} 个游戏`);

// 统计 ID 类型
const idTypes = games.reduce((acc, game) => {
  const idStr = String(game.id);
  const type = idStr.length > 10 ? 'timestamp' : 'number';
  acc[type] = (acc[type] || 0) + 1;
  return acc;
}, {});

console.log('ID 类型统计:', idTypes);
