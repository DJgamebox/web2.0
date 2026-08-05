const fs = require('fs');
const path = require('path');

// 读取现存游戏数据
const dataPath = path.join(__dirname, 'data-embed.js');
const dataContent = fs.readFileSync(dataPath, 'utf-8');

// 提取 gamesData 数组
const match = dataContent.match(/const importedGames = ([\s\S]*?\]);/);
if (!match) {
  console.error('无法解析游戏数据');
  process.exit(1);
}

let games;
try {
  games = eval(match[1]);
} catch (e) {
  console.error('解析游戏数据失败:', e);
  process.exit(1);
}

// 过滤掉非游戏数据
const validGameIds = new Set(
  games
    .filter(game => game.id !== '_banner_config')
    .map(game => String(game.id))
);

console.log(`✅ 现存游戏数量: ${validGameIds.size}`);

// 读取 games 目录下的所有 HTML 文件
const gamesDir = path.join(__dirname, 'games');
if (!fs.existsSync(gamesDir)) {
  console.log('games 目录不存在');
  process.exit(0);
}

const files = fs.readdirSync(gamesDir);
const htmlFiles = files.filter(f => f.endsWith('.html'));

console.log(`📁 games 目录下 HTML 文件数量: ${htmlFiles.length}`);

// 找出需要删除的文件（文件存在但数据中没有对应游戏）
const filesToDelete = [];
const filesToKeep = [];

for (const file of htmlFiles) {
  // 提取文件名中的ID (例如: 1990.html -> 1990)
  const fileId = path.basename(file, '.html');
  
  if (validGameIds.has(fileId)) {
    filesToKeep.push(file);
  } else {
    filesToDelete.push(file);
  }
}

console.log(`\n📝 分析结果:`);
console.log(`   - 有效的游戏页面: ${filesToKeep.length} 个`);
console.log(`   - 需要删除的孤儿页面: ${filesToDelete.length} 个`);

if (filesToDelete.length === 0) {
  console.log('\n✨ 没有需要清理的页面，所有 HTML 文件都对应现存游戏。');
  process.exit(0);
}

// 显示要删除的文件列表
console.log(`\n⚠️ 以下 ${filesToDelete.length} 个页面将被删除:`);
filesToDelete.forEach((file, index) => {
  const filePath = path.join(gamesDir, file);
  const stats = fs.statSync(filePath);
  const sizeKB = (stats.size / 1024).toFixed(1);
  console.log(`   ${index + 1}. ${file} (${sizeKB} KB)`);
});

// 计算总大小
const totalSize = filesToDelete.reduce((sum, file) => {
  const stats = fs.statSync(path.join(gamesDir, file));
  return sum + stats.size;
}, 0);
console.log(`\n💾 预计释放空间: ${(totalSize / 1024).toFixed(1)} KB`);

// 执行删除（带确认机制）
const args = process.argv.slice(2);
const forceDelete = args.includes('--force');

if (!forceDelete) {
  console.log(`\n⚡ 这是一个预览。要实际删除，请运行:`);
  console.log(`   node clean-deleted-games.js --force`);
  console.log(`\n或者手动删除上面的文件。`);
  process.exit(0);
}

// 实际删除
console.log(`\n🗑️ 开始删除...`);
let deletedCount = 0;
let failedCount = 0;

for (const file of filesToDelete) {
  const filePath = path.join(gamesDir, file);
  try {
    fs.unlinkSync(filePath);
    deletedCount++;
    console.log(`   ✅ 已删除: ${file}`);
  } catch (e) {
    failedCount++;
    console.log(`   ❌ 删除失败: ${file} - ${e.message}`);
  }
}

console.log(`\n✅ 清理完成！`);
console.log(`   - 成功删除: ${deletedCount} 个文件`);
console.log(`   - 删除失败: ${failedCount} 个文件`);
console.log(`   - 剩余有效页面: ${filesToKeep.length} 个`);
