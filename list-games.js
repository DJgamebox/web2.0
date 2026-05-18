const https = require('https');

https.get('https://api.djgamebox.com/api/games', (res) => {
  const chunks = [];
  res.on('data', chunk => chunks.push(chunk));
  res.on('end', () => {
    const data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    const games = data.games || [];
    
    // 找到僵尸部队4 (ID: 1993) 的位置
    const sangoIndex = games.findIndex(g => g.id === 1993);
    console.log('僵尸部队4 位置:', sangoIndex);
    
    // 显示接下来的4个游戏
    console.log('\n接下来的4个游戏:');
    games.slice(sangoIndex + 1, sangoIndex + 5).forEach((g, i) => {
      console.log(`${i+1}. ID: ${g.id}, 名称: ${g.cn || g.name}, 类型: ${g.type || '未知'}, 大小: ${g.size || '未知'}`);
    });
  });
}).on('error', err => console.error(err));
