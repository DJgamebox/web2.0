const https = require('https');

https.get('https://raw.githubusercontent.com/DJgamebox/web2.0/master/index.html', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    // 查找 update 排序逻辑
    const hasUpdateSort = data.indexOf("sortType === 'update'") !== -1;
    console.log('GitHub 代码是否有 update 排序:', hasUpdateSort);
    
    // 查找 sort-select 的选项
    const hasUpdateOption = data.indexOf('value="update"') !== -1;
    console.log('GitHub 代码是否有 update 选项:', hasUpdateOption);
    
    // 查找 select 元素
    const selectMatch = data.match(/<select[^>]*sort[^>]*>[\s\S]*?<\/select>/i);
    if (selectMatch) {
      console.log('\nGitHub 上的 sort-select HTML:');
      console.log(selectMatch[0].substring(0, 500));
    }
  });
}).on('error', err => console.error(err));
