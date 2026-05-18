/**
 * 自动同步游戏描述
 * 从云端API获取描述，更新 web-descriptions.json
 * 使用方法: node sync-descriptions.js
 */

const fs = require('fs');
const https = require('https');

const API_URL = 'https://api.djgamebox.com/api/games';
const WEB_DESC_FILE = './web-descriptions.json';

console.log('正在从云端API同步游戏描述...\n');

// 读取现有的 web-descriptions.json
let existingDescriptions = [];
if (fs.existsSync(WEB_DESC_FILE)) {
  try {
    existingDescriptions = JSON.parse(fs.readFileSync(WEB_DESC_FILE, 'utf-8'));
    console.log(`📁 读取到 ${existingDescriptions.length} 个现有描述`);
  } catch (e) {
    console.warn('⚠️ 读取 web-descriptions.json 失败:', e.message);
  }
}

// 创建现有描述的 Map（用于快速查找）
const existingMap = new Map();
existingDescriptions.forEach(item => {
  existingMap.set(item.id, item);
});

// 从API获取游戏数据
https.get(API_URL, (res) => {
  const chunks = [];
  
  res.on('data', (chunk) => {
    chunks.push(chunk);
  });
  
  res.on('end', () => {
    try {
      const buffer = Buffer.concat(chunks);
      const data = JSON.parse(buffer.toString('utf8'));
      const games = data.games || [];
      
      console.log(`☁️ 从API获取到 ${games.length} 个游戏`);
      
      // 过滤掉非游戏数据（如 banner 配置）
      const validGames = games.filter(game => 
        game.id && 
        game.id !== '_banner_config' && 
        typeof game.id === 'number'
      );
      
      console.log(`🎮 有效游戏数量: ${validGames.length}\n`);
      
      // 同步描述
      let updatedCount = 0;
      let addedCount = 0;
      let unchangedCount = 0;
      
      const newDescriptions = validGames.map(game => {
        const existing = existingMap.get(game.id);
        const apiDescription = game.description || '';
        
        // 如果API中有详细描述，使用API的
        if (apiDescription && apiDescription.length > 100) {
          if (existing) {
            // 更新现有描述
            if (existing.description !== apiDescription) {
              updatedCount++;
              console.log(`🔄 更新: ${game.cn || game.name} (ID: ${game.id})`);
            } else {
              unchangedCount++;
            }
          } else {
            // 新增描述
            addedCount++;
            console.log(`➕ 新增: ${game.cn || game.name} (ID: ${game.id})`);
          }
          
          // 生成短描述（前150字）
          const shortDesc = apiDescription
            .replace(/<[^>]*>/g, '') // 去除HTML标签
            .substring(0, 150) + '...';
          
          return {
            id: game.id,
            name: game.cn || game.name || '',
            description: apiDescription,
            shortDescription: shortDesc
          };
        } else {
          // API中没有详细描述，保留现有的
          if (existing) {
            unchangedCount++;
            return existing;
          } else {
            // API和本地都没有，创建一个默认的
            const defaultDesc = `${game.cn || game.name}是一款${game.type || '精彩'}游戏。本站提供${game.cn || game.name}百度网盘、迅雷云盘高速下载，绿色免安装中文版，解压即可玩。`;
            addedCount++;
            console.log(`📝 创建默认描述: ${game.cn || game.name} (ID: ${game.id})`);
            
            return {
              id: game.id,
              name: game.cn || game.name || '',
              description: defaultDesc,
              shortDescription: defaultDesc
            };
          }
        }
      });
      
      // 保存到文件
      fs.writeFileSync(WEB_DESC_FILE, JSON.stringify(newDescriptions, null, 2));
      
      console.log(`\n✅ 同步完成！`);
      console.log(`   更新: ${updatedCount} 个`);
      console.log(`   新增: ${addedCount} 个`);
      console.log(`   未变: ${unchangedCount} 个`);
      console.log(`   总计: ${newDescriptions.length} 个`);
      console.log(`\n💾 已保存到 ${WEB_DESC_FILE}`);
      
    } catch (error) {
      console.error('❌ 处理失败:', error.message);
      process.exit(1);
    }
  });
}).on('error', (error) => {
  console.error('❌ 获取API数据失败:', error.message);
  process.exit(1);
});
