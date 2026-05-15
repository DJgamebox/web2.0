const fs = require('fs');

const dataContent = fs.readFileSync('data-embed.js', 'utf-8');
const match = dataContent.match(/const importedGames = ([\s\S]*?\]);/);
const games = eval(match[1]).filter(x => x.id !== '_banner_config');

const keywords = ['黑神话','GTA','艾尔登','赛博朋克','荒野大镖客','生化危机','刺客信条','巫师','只狼','双人成行','怪物猎人','最终幻想','龙之信条','使命召唤','战地','孤岛惊魂','看门狗','毁灭战士','英灵神殿','森林之子','僵尸毁灭','饥荒','泰拉瑞亚','星露谷物语','恐鬼症','逃生','真人快打','鬼泣'];

console.log('=== 找到的游戏匹配 ===\n');
keywords.forEach(k => {
  const found = games.filter(x => x.name.includes(k));
  if (found.length > 0) {
    console.log(`${k}: ${found.slice(0, 3).map(x => x.name).join(', ')}`);
  }
});

console.log('\n=== 统计 ===');
console.log(`总共找到 ${keywords.filter(k => games.some(x => x.name.includes(k))).length} 个关键词匹配`);
console.log(`游戏总数: ${games.length}`);
