const https = require('https');

// 检查 GitHub 上的 index.html
https.get('https://raw.githubusercontent.com/DJgamebox/web2.0/master/index.html', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('=== GitHub 代码检查 ===\n');
    
    // 检查是否有 update 选项
    const hasUpdateOption = data.indexOf('value="update"') !== -1;
    console.log('1. 是否有 update 选项:', hasUpdateOption);
    
    // 检查是否有 update 排序逻辑
    const hasUpdateSort = data.indexOf("sortType === 'update'") !== -1;
    console.log('2. 是否有 update 排序逻辑:', hasUpdateSort);
    
    // 检查 sortGames 函数中的 update 分支
    const updateSortMatch = data.match(/sortType === 'update'[\s\S]{0,500}/);
    if (updateSortMatch) {
      console.log('\n3. update 排序逻辑片段:');
      console.log(updateSortMatch[0].substring(0, 400));
    }
    
    // 检查 return 语句
    const returnMatch = data.match(/return getTime\([ab]\) - getTime\([ab]\)/);
    if (returnMatch) {
      console.log('\n4. 排序方向:', returnMatch[0]);
      if (returnMatch[0] === 'return getTime(b) - getTime(a)') {
        console.log('   → 降序（最新的在前）✓');
      } else if (returnMatch[0] === 'return getTime(a) - getTime(b)') {
        console.log('   → 升序（最旧的在前）✗');
      }
    }
  });
}).on('error', err => console.error('错误:', err.message));
