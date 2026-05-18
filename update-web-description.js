const fs = require('fs');
const https = require('https');

const API_URL = 'https://api.djgamebox.com/api/games';

// 获取命令行参数中的游戏ID
const targetGameId = process.argv[2];

if (!targetGameId) {
  console.error('请提供游戏ID，例如: node update-web-description.js 1993');
  process.exit(1);
}

console.log(`正在从 API 获取游戏 ${targetGameId} 的描述...`);

https.get(API_URL, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const apiData = JSON.parse(data);
      const games = apiData.games || [];
      
      // 查找指定游戏
      const game = games.find(g => String(g.id) === String(targetGameId));
      
      if (!game) {
        console.error(`未找到游戏 ID: ${targetGameId}`);
        process.exit(1);
      }
      
      // 获取描述（优先使用 desc，其次是 description）
      const description = game.desc || game.description || '';
      
      if (!description) {
        console.log(`游戏 ${targetGameId} 没有描述，跳过更新`);
        process.exit(0);
      }
      
      console.log(`找到游戏: ${game.cn || game.name}`);
      console.log(`描述长度: ${description.length} 字符`);
      
      // 读取现有的 web-descriptions.json
      const webDescPath = 'web-descriptions.json';
      let webDescriptions = [];
      
      if (fs.existsSync(webDescPath)) {
        try {
          webDescriptions = JSON.parse(fs.readFileSync(webDescPath, 'utf-8'));
        } catch (e) {
          console.warn('读取 web-descriptions.json 失败，将创建新文件');
        }
      }
      
      // 查找是否已存在该游戏的描述
      const existingIndex = webDescriptions.findIndex(item => String(item.id) === String(targetGameId));
      
      const newEntry = {
        id: targetGameId,
        name: game.cn || game.name || '',
        description: description,
        shortDescription: description.length > 150 ? description.substring(0, 150) + '...' : description
      };
      
      if (existingIndex >= 0) {
        // 更新现有条目
        webDescriptions[existingIndex] = newEntry;
        console.log(`已更新游戏 ${targetGameId} 的描述`);
      } else {
        // 添加新条目
        webDescriptions.push(newEntry);
        console.log(`已添加游戏 ${targetGameId} 的描述`);
      }
      
      // 保存文件
      fs.writeFileSync(webDescPath, JSON.stringify(webDescriptions, null, 2));
      console.log('web-descriptions.json 更新完成');
      
    } catch (error) {
      console.error('处理 API 数据失败:', error);
      process.exit(1);
    }
  });
}).on('error', (error) => {
  console.error('获取 API 数据失败:', error);
  process.exit(1);
});
