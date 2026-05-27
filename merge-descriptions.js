const fs = require('fs');
const path = require('path');

// 读取源文件
const batchPath = path.join(__dirname, '..', '..', '游戏盒子后台管理器', '1.3.0', 'src', 'game-descriptions-batch.json');
const webDescPath = path.join(__dirname, 'web-descriptions.json');

console.log('📖 读取 game-descriptions-batch.json...');
const batchData = JSON.parse(fs.readFileSync(batchPath, 'utf-8'));
console.log(`   找到 ${batchData.length} 个游戏描述`);

console.log('📖 读取 web-descriptions.json...');
const webData = JSON.parse(fs.readFileSync(webDescPath, 'utf-8'));
console.log(`   原有 ${webData.length} 个游戏描述`);

// 创建 web-descriptions 的 ID 映射
const webDescMap = new Map();
webData.forEach(item => {
  webDescMap.set(item.id, item);
});

// 合并/更新数据
let addedCount = 0;
let updatedCount = 0;

batchData.forEach(batchItem => {
  const existingItem = webDescMap.get(batchItem.id);
  
  if (existingItem) {
    // 更新现有条目
    existingItem.description = batchItem.description;
    // 如果 batch 中有 shortDescription 也更新
    if (batchItem.shortDescription) {
      existingItem.shortDescription = batchItem.shortDescription;
    }
    updatedCount++;
    console.log(`🔄 更新: ${batchItem.name} (ID: ${batchItem.id})`);
  } else {
    // 添加新条目
    webData.push({
      id: batchItem.id,
      name: batchItem.name,
      description: batchItem.description,
      shortDescription: batchItem.shortDescription || ''
    });
    addedCount++;
    console.log(`➕ 新增: ${batchItem.name} (ID: ${batchItem.id})`);
  }
});

// 保存更新后的文件
fs.writeFileSync(webDescPath, JSON.stringify(webData, null, 2), 'utf-8');

console.log('\n✅ 合并完成！');
console.log(`   新增: ${addedCount} 个`);
console.log(`   更新: ${updatedCount} 个`);
console.log(`   总计: ${webData.length} 个游戏描述`);
