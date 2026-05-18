const https = require('https');

https.get('https://raw.githubusercontent.com/DJgamebox/web2.0/master/index.html', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    // 提取 sortGames 函数
    const sortGamesMatch = data.match(/function sortGames\(\)[\s\S]*?\n    \}/);
    if (sortGamesMatch) {
      console.log('GitHub 上的 sortGames 函数:');
      console.log(sortGamesMatch[0]);
    } else {
      console.log('未找到 sortGames 函数');
    }
  });
}).on('error', err => console.error(err));
