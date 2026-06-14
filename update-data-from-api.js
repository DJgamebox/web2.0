const fs = require('fs');
const https = require('https');

const API_URL = 'https://api.djgamebox.com/api/games';

console.log('Fetching game data from cloud API...');

// 读取本地现有的 data-embed.js 以获取已有的 updateTime
let localUpdateTimes = {};
try {
  const localData = fs.readFileSync('data-embed.js', 'utf8');
  // 提取 importedGames 数组
  const match = localData.match(/const importedGames = (\[.*?\]);/s);
  if (match) {
    const localGames = JSON.parse(match[1]);
    localGames.forEach(game => {
      if (game.id && game.updateTime) {
        localUpdateTimes[String(game.id)] = game.updateTime;
      }
    });
    console.log('Loaded', Object.keys(localUpdateTimes).length, 'existing updateTime values from local data-embed.js');
  }
} catch (error) {
  console.log('No existing data-embed.js found or failed to parse, will use API data only');
}

https.get(API_URL, (res) => {
  const chunks = [];
  
  res.on('data', (chunk) => {
    chunks.push(chunk);
  });
  
  res.on('end', () => {
    try {
      const buffer = Buffer.concat(chunks);
      const data = buffer.toString('utf8');
      const apiData = JSON.parse(data);
      const games = apiData.games || [];
      
      // 转换数据格式
      const importedGames = games.map(game => {
        const gameId = String(game.id);
        // 优先使用 API 返回的 updateTime，如果没有则使用本地已有的，最后才用 Date.now()
        const apiUpdateTime = game.updateTime || game.update;
        const localUpdateTime = localUpdateTimes[gameId];
        const finalUpdateTime = apiUpdateTime || localUpdateTime || Date.now();
        
        return {
          id: game.id,
          name: game.cn || game.name || '',
          nameEn: game.en || game.nameEn || '',
          cover: game.cover || '',
          screenshots: game.screenshots || [],
          category: game.type || game.category || '',
          size: game.size || '',
          description: game.desc || game.description || '',
          baiduLink1: game.baiduLink1 || game.link1 || '',
          baiduLink2: game.baiduLink2 || game.link2 || '',
          baiduLink3: game.baiduLink3 || game.link3 || '',
          thunderLink: game.thunderLink || game.link4 || '',
          favorite: game.favorite || false,
          dateAdded: game.dateAdded || game.update || new Date().toLocaleDateString('zh-CN'),
          isDrm: game.isDrm || false,
          downloadsWeb: game.downloadsWeb || 0,
          downloadsApp: game.downloadsApp || 0,
          updateTime: finalUpdateTime
        };
      });
      
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
