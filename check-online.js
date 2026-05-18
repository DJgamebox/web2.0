const https = require('https');

// 检查线上的 index.html
https.get('https://www.djgamebox.com/index.html', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('=== 线上代码检查 ===\n');
    
    // 检查是否有 update 排序逻辑
    const hasUpdateSort = data.indexOf("sortType === 'update'") !== -1;
    console.log('1. 是否有 update 排序逻辑:', hasUpdateSort);
    
    // 检查 sort-select 选项
    const hasUpdateOption = data.indexOf('value="update"') !== -1;
    console.log('2. 是否有 update 选项:', hasUpdateOption);
    
    // 检查排序方向
    const descMatch = data.match(/return getTime\([ab]\) - getTime\([ab]\)/);
    if (descMatch) {
      console.log('3. 排序方向:', descMatch[0]);
    } else {
      console.log('3. 未找到排序方向代码');
    }
    
    // 检查是否有 sortGames 函数
    const hasSortGames = data.indexOf('function sortGames()') !== -1;
    console.log('4. 是否有 sortGames 函数:', hasSortGames);
    
    // 提取 sortGames 函数片段
    const sortGamesMatch = data.match(/function sortGames\(\)[\s\S]{0,2000}/);
    if (sortGamesMatch && !hasUpdateSort) {
      console.log('\n5. 线上 sortGames 函数（前2000字符）:');
      console.log(sortGamesMatch[0].substring(0, 1500));
    }
  });
}).on('error', err => console.error('错误:', err.message));
