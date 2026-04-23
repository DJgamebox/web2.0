const fs = require('fs');
const https = require('https');

const API_URL = 'https://api.djgamebox.com/api/games';

console.log('Fetching game data from cloud API...');

https.get(API_URL, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const apiData = JSON.parse(data);
      const games = apiData.games || [];
      
      // 转换数据格式
      const importedGames = games.map(game => ({
        id: game.id,
        name: game.cn || game.name || '',
        nameEn: game.en || game.nameEn || '',
        cover: game.cover || '',
        screenshots: game.screenshots || [],
        category: game.type || game.category || '',
        size: game.size || '',
        description: game.desc || game.description || '',
        baiduLink1: game.link1 || game.baiduLink1 || '',
        baiduLink2: game.link2 || game.baiduLink2 || '',
        baiduLink3: game.link4 || game.baiduLink3 || '',
        thunderLink: game.link3 || game.thunderLink || '',
        favorite: game.favorite || false,
        dateAdded: game.dateAdded || game.update || new Date().toLocaleDateString('zh-CN'),
        isDrm: game.isDrm || false,
        downloadsWeb: game.downloadsWeb || 0,
        downloadsApp: game.downloadsApp || 0,
        updateTime: game.updateTime || Date.now()
      }));
      
      const output = `// 游戏数据 - 由 GitHub Actions 从云端 API 自动生成
// 生成时间: ${new Date().toLocaleString('zh-CN')}
// 游戏数量: ${importedGames.length}

const importedGames = ${JSON.stringify(importedGames, null, 2)};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { importedGames };
}
`;
      
      fs.writeFileSync('data-embed.js', output);
      console.log('data-embed.js updated with', importedGames.length, 'games from cloud API');
    } catch (error) {
      console.error('Error processing API data:', error);
      process.exit(1);
    }
  });
}).on('error', (error) => {
  console.error('Error fetching API data:', error);
  process.exit(1);
});
