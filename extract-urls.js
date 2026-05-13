const fs = require('fs');
const data = fs.readFileSync('data-embed.js', 'utf8');

// 提取所有 id 字段
const idMatches = data.match(/"id":\s*(\d+)/g);
if (idMatches) {
  const ids = idMatches.map(m => {
    const match = m.match(/(\d+)/);
    return match ? match[1] : null;
  }).filter(id => id !== null);
  
  // 去重
  const uniqueIds = [...new Set(ids)];
  
  // 生成 URL
  const urls = uniqueIds.map(id => 'https://www.djgamebox.com/games/' + id + '.html');
  
  fs.writeFileSync('game-urls.txt', urls.join('\n'));
  console.log('Total games: ' + uniqueIds.length);
  console.log('First 5 URLs:');
  console.log(urls.slice(0, 5).join('\n'));
}
