const fs = require('fs');
const path = require('path');

// ==================== 高搜索量游戏清单（带类型和特色）====================
const topGames = [
  { keywords: ['黑神话','悟空'], type: '动作角色扮演', feature: '国产3A大作，西游记题材，画面精美，战斗爽快', tag: '国产之光' },
  { keywords: ['GTA5','侠盗猎车手5','GTA\s*5'], type: '开放世界动作', feature: '自由度极高，剧情精彩，线上模式丰富', tag: '经典神作' },
  { keywords: ['艾尔登法环','老头环'], type: '开放世界魂类', feature: '魂系巅峰之作，辽阔世界探索，Boss战极具挑战', tag: '年度游戏' },
  { keywords: ['赛博朋克2077'], type: '开放世界RPG', feature: '未来科幻世界，剧情分支丰富，夜之城沉浸体验', tag: '科幻巨作' },
  { keywords: ['荒野大镖客','救赎2'], type: '开放世界动作', feature: '西部牛仔世界，画面极致真实，剧情堪比电影', tag: '满分神作' },
  { keywords: ['生化危机4','重制版'], type: '恐怖生存', feature: '经典重制，画面全面升级，恐怖氛围拉满', tag: '恐怖经典' },
  { keywords: ['刺客信条','影'], type: '动作潜行', feature: '日本战国背景，忍者暗杀玩法，开放世界探索', tag: '暗杀神作' },
  { keywords: ['巫师3','狂猎'], type: '开放世界RPG', feature: '剧情选择影响结局，猎魔人世界观宏大，DLC质量极高', tag: '剧情神作' },
  { keywords: ['只狼','影逝二度'], type: '动作冒险', feature: '硬核战斗，弹反机制爽快，日本战国背景', tag: '硬核挑战' },
  { keywords: ['双人成行'], type: '合作冒险', feature: '必须双人合作，创意玩法不断，感情升温神器', tag: '情侣必玩' },
  { keywords: ['怪物猎人','世界'], type: '动作共斗', feature: '与好友一起狩猎巨兽，武器种类丰富，装备系统深度', tag: '共斗神作' },
  { keywords: ['最终幻想7','重生'], type: '日式RPG', feature: '经典重制续作，画面震撼，战斗系统革新', tag: 'JRPG巅峰' },
  { keywords: ['龙之信条2'], type: '开放世界动作', feature: '随从AI智能，战斗系统深度，奇幻世界探索', tag: '动作RPG' },
  { keywords: ['使命召唤','现代战争'], type: '第一人称射击', feature: '电影级战役，多人对战爽快，枪械手感真实', tag: 'FPS王者' },
  { keywords: ['战地2042'], type: '大战场射击', feature: '64v64大战场，破坏效果震撼，载具战斗刺激', tag: '大战场' },
  { keywords: ['孤岛惊魂6'], type: '开放世界射击', feature: '热带岛屿冒险，反派魅力十足，武器改装丰富', tag: '射击冒险' },
  { keywords: ['看门狗','军团'], type: '开放世界黑客', feature: '伦敦黑客题材，可招募任何NPC，科技感十足', tag: '黑客题材' },
  { keywords: ['毁灭战士','永恒'], type: '第一人称射击', feature: '快节奏射击，重金属配乐，恶魔屠杀爽快', tag: '爽快射击' },
  { keywords: ['英灵神殿'], type: '生存建造', feature: '维京题材生存，建造自由度高，Boss战有挑战性', tag: '维京生存' },
  { keywords: ['森林之子'], type: '恐怖生存', feature: '开放世界恐怖生存，建造基地，探索神秘岛屿', tag: '恐怖生存' },
  { keywords: ['僵尸毁灭工程'], type: '生存模拟', feature: '硬核丧尸生存，真实生存机制，建造避难所', tag: '硬核丧尸' },
  { keywords: ['饥荒'], type: '生存冒险', feature: '哥特画风独特，生存难度高，联机乐趣多', tag: '独特画风' },
  { keywords: ['泰拉瑞亚'], type: '沙盒冒险', feature: '2D版我的世界，Boss战丰富，挖掘建造自由', tag: '2D神作' },
  { keywords: ['星露谷物语'], type: '模拟经营', feature: '田园生活模拟，钓鱼挖矿恋爱，治愈放松', tag: '治愈神作' },
  { keywords: ['恐鬼症'], type: '恐怖合作', feature: '4人合作抓鬼，语音互动真实，恐怖氛围拉满', tag: '联机恐怖' },
  { keywords: ['逃生2'], type: '恐怖生存', feature: '第一人称恐怖，剧情黑暗压抑，无武器纯逃跑', tag: '极度恐怖' },
  { keywords: ['真人快打1'], type: '格斗', feature: '血腥终结技，剧情模式精彩，连招爽快', tag: '格斗王者' },
  { keywords: ['鬼泣5'], type: '动作', feature: '华丽连招系统，三位主角切换，打击感顶级', tag: '动作巅峰' }
];

// ==================== 生成模板 ====================
const templates = [
  '《{name}》是一款{feature}的{type}游戏。{detail}。本站提供{name}百度网盘、迅雷云盘高速下载，绿色免安装中文版，解压即可玩，立即体验这款{tag}！',
  '{tag}《{name}》强势来袭！这是一款{type}游戏，{feature}。{detail}。本站提供{name}免费下载，百度网盘迅雷云盘双链接，绿色免安装中文版。',
  '想要体验{tag}？《{name}》不容错过！{type}游戏巅峰之作，{feature}。{detail}。本站提供{name}高速下载，百度网盘迅雷云盘一应俱全。',
  '《{name}》{tag}免费下载！这款{type}游戏{feature}，{detail}。本站提供{name}百度网盘、迅雷云盘高速下载链接，绿色免安装中文版，解压即玩。'
];

const details = [
  '画面精美，沉浸感极强',
  '剧情精彩，代入感十足',
  '玩法丰富，耐玩度极高',
  '优化出色，流畅运行',
  '口碑爆棚，玩家一致好评',
  '自由度极高，探索乐趣无穷',
  '战斗系统深度，操作手感一流',
  '世界观宏大，剧情引人入胜'
];

// ==================== 读取游戏数据 ====================
const dataPath = path.join(__dirname, 'data-embed.js');
const dataContent = fs.readFileSync(dataPath, 'utf-8');

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

games = games.filter(game => game.id !== '_banner_config');
console.log(`📊 共加载 ${games.length} 个游戏`);

// ==================== 智能匹配函数 ====================
function getCoreName(name) {
  // 提取核心名称：去除版本号、DLC、括号内容、特殊符号等
  return name
    .replace(/[（(].*?[）)]/g, '') // 去除括号内容
    .replace(/[_\-：:\/\\]/g, '') // 去除分隔符
    .replace(/\s+/g, '') // 去除空格
    .replace(/\d+$/g, '') // 去除末尾纯数字
    .trim();
}

function matchGame(topGame, games) {
  const keywords = topGame.keywords;

  // 策略1：所有关键词都包含在 name 中（最强匹配）
  for (const game of games) {
    const name = game.name;
    const allMatch = keywords.every(kw => {
      const regex = new RegExp(kw, 'i');
      return regex.test(name);
    });
    if (allMatch) return game;
  }

  // 策略2：任一关键词精确匹配或核心名称包含
  for (const game of games) {
    const coreName = getCoreName(game.name);
    for (const kw of keywords) {
      const cleanKw = kw.replace(/\\s\*/g, '').toLowerCase();
      if (coreName.toLowerCase().includes(cleanKw)) {
        return game;
      }
    }
  }

  // 策略3：name 包含任一关键词（宽松匹配）
  for (const game of games) {
    for (const kw of keywords) {
      const regex = new RegExp(kw, 'i');
      if (regex.test(game.name)) {
        return game;
      }
    }
  }

  return null;
}

// ==================== 生成描述 ====================
let generatedCount = 0;
const results = [];
const usedIds = new Set(); // 防止重复

topGames.forEach((topGame, index) => {
  const game = matchGame(topGame, games);

  if (!game) {
    console.log(`  ❌ 未匹配: ${topGame.keywords.join('/')} `);
    return;
  }

  if (usedIds.has(game.id)) {
    console.log(`  ⚠️ 重复跳过: ${game.name}`);
    return;
  }

  // 注：即使已有描述，也为网页版生成更优质的SEO描述
  // 桌面客户端继续读取 data-embed.js 中的原描述，不受影响

  usedIds.add(game.id);

  // 随机选择模板和详情
  const template = templates[Math.floor(Math.random() * templates.length)];
  const detail = details[Math.floor(Math.random() * details.length)];

  // 生成描述
  const description = template
    .replace(/{name}/g, game.name)
    .replace(/{type}/g, topGame.type)
    .replace(/{feature}/g, topGame.feature)
    .replace(/{detail}/g, detail)
    .replace(/{tag}/g, topGame.tag);

  results.push({
    id: game.id,
    name: game.name,
    description: description
  });

  generatedCount++;
  console.log(`  ✅ ${index + 1}. ${game.name} (ID:${game.id})`);
});

// ==================== 保存结果 ====================
const outputPath = path.join(__dirname, 'web-descriptions.json');
fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');

console.log(`\n✅ 成功生成 ${generatedCount} 个游戏的SEO描述`);
console.log(`📄 文件已保存: ${outputPath}`);

if (results.length > 0) {
  console.log('\n📋 前5个示例:');
  results.slice(0, 5).forEach((item, index) => {
    console.log(`\n${index + 1}. ${item.name}:`);
    console.log(`   ${item.description.substring(0, 80)}...`);
  });
}

console.log('\n💡 使用说明:');
console.log('1. 运行 node generate-games.js 时自动注入描述到网页');
console.log('2. 不修改 data-embed.js，桌面客户端不受影响');
