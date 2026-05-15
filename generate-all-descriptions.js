const fs = require('fs');
const path = require('path');

// ==================== 游戏类型模板库 ====================
const templates = {
  '动作': {
    feature: '打击感出色，连招系统深度，Boss战极具挑战',
    tags: ['硬核动作', '爽快连招', '打击感顶级'],
    details: ['战斗系统流畅，操作手感一流', 'Boss设计精妙，每场战斗都是考验', '动作元素丰富，战斗体验爽快']
  },
  '射击': {
    feature: '枪械手感真实，战斗节奏紧张刺激',
    tags: ['射击爽游', '枪战巅峰', 'FPS佳作'],
    details: ['武器种类丰富，射击手感出色', '战斗场景宏大，沉浸感极强', '多人对战爽快，枪械改装自由']
  },
  '格斗': {
    feature: '连招系统华丽，打击反馈精准，角色个性鲜明',
    tags: ['格斗王者', '连招爽快', '对战刺激'],
    details: ['格斗系统深度，连招自由度极高', '角色招式华丽，打击感爆棚', '对战平衡性出色，竞技性强']
  },
  '角色扮演': {
    feature: '剧情选择影响结局，角色成长系统丰富，世界观宏大',
    tags: ['剧情神作', '角色扮演巅峰', '沉浸体验'],
    details: ['剧情选择多样，结局分支丰富', '角色培养自由，成长路线多样', '世界观宏大，沉浸感十足']
  },
  '冒险': {
    feature: '探索自由度高，解谜元素丰富，场景设计精妙',
    tags: ['冒险佳作', '探索乐趣', '解谜精彩'],
    details: ['地图设计精巧，探索乐趣无穷', '谜题设计巧妙，动脑又动手', '场景氛围出色，代入感极强']
  },
  '恐怖惊悚': {
    feature: '恐怖氛围拉满，剧情黑暗压抑，音效出色',
    tags: ['恐怖经典', '氛围恐怖', '惊悚佳作'],
    details: ['恐怖氛围营造一流，音效出色', '剧情黑暗引人入胜，心理压迫感强', '恐怖元素丰富，胆量大考验']
  },
  '策略': {
    feature: '策略深度高，战术选择丰富， replay价值高',
    tags: ['策略精品', '烧脑佳作', '战术丰富'],
    details: ['策略系统深度，每一步都关键', '战术选择多样，战场变化万千', 'AI智能出色，挑战性强']
  },
  '模拟经营': {
    feature: '经营要素丰富，自由度极高，耐玩度强',
    tags: ['模拟经营佳作', '耐玩神作', '自由度极高'],
    details: ['经营系统丰富，玩法多样', '自由度极高，打造属于自己的世界', '耐玩度极高，一玩就停不下来']
  },
  '体育竞技': {
    feature: '操作手感真实，比赛氛围出色，竞技性强',
    tags: ['体育佳作', '竞技爽快', '操作真实'],
    details: ['物理引擎出色，操作手感真实', '比赛氛围浓厚，沉浸感强', '竞技模式丰富，对战刺激']
  },
  '赛车': {
    feature: '车辆种类丰富，赛道设计出色，驾驶手感真实',
    tags: ['赛车佳作', '极速体验', '驾驶真实'],
    details: ['车辆建模精细，驾驶手感出色', '赛道设计多样，风景优美', '竞速模式丰富，改装系统深度']
  },
  '生存': {
    feature: '生存机制真实，建造系统丰富，探索要素多',
    tags: ['生存佳作', '建造自由', '探索丰富'],
    details: ['生存机制硬核，真实感强', '建造系统自由，创意无限', '探索要素丰富，每次都有新发现']
  },
  '休闲': {
    feature: '玩法轻松愉快，画风治愈，适合放松',
    tags: ['休闲佳作', '治愈放松', '轻松愉快'],
    details: ['玩法简单易上手，老少皆宜', '画风清新治愈，视觉享受', '节奏舒缓，适合放松心情']
  },
  '其他': {
    feature: '玩法独特创新，体验新颖，值得一试',
    tags: ['独特体验', '创新玩法', '值得一试'],
    details: ['玩法新颖独特，市面上少见', '创意十足，给人惊喜', '体验独特，值得尝试']
  }
};

const commonTemplates = [
  '《{name}》是一款{feature}的{type}游戏。{detail}。本站提供{name}PC游戏下载，包含全DLC内容和官方中文补丁，绿色免安装版，解压即玩。通过百度网盘和迅雷云盘双线路网盘下载，无需复杂安装步骤。',
  '想要体验{tag}？《{name}》不容错过！这款{type}游戏{feature}，{detail}。本站提供{name}破解版下载，PC绿色免安装中文版，解压即玩。百度网盘、迅雷云盘高速下载，全DLC整合。',
  '《{name}》{tag}强势来袭！这是一款{type}游戏，{feature}。{detail}。本站提供{name}PC版下载，包含官方中文和全DLC，绿色免安装，解压即玩。通过网盘下载即可快速体验。',
  '{tag}《{name}》PC版免费下载！这款{type}游戏{feature}，{detail}。本站提供{name}百度网盘、迅雷云盘高速下载链接，绿色免安装中文版，全DLC整合，解压即玩。'
];

const shortTemplates = [
  '《{name}》PC游戏下载，包含全DLC和官方中文。绿色免安装版，解压即玩。提供百度网盘、迅雷云盘高速网盘下载，立即体验这款{type}佳作！',
  '想要体验{name}？本站提供PC破解版下载，绿色免安装中文版，全DLC整合，解压即玩。百度网盘迅雷云盘双线路，立即开启{type}之旅！',
  '《{name}》官方中文破解版下载，PC绿色免安装，全DLC内容，解压即玩。通过网盘高速下载，立即加入这场{type}体验！'
];

// ==================== 辅助函数 ====================
function getTemplate(category) {
  return templates[category] || templates['其他'];
}

function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateLongDesc(game) {
  const name = game.name;
  const category = game.category || '其他';
  const template = getTemplate(category);
  
  const feature = template.feature;
  const tag = randomPick(template.tags);
  const detail = randomPick(template.details);
  
  const tpl = randomPick(commonTemplates);
  
  return tpl
    .replace(/{name}/g, name)
    .replace(/{type}/g, category)
    .replace(/{feature}/g, feature)
    .replace(/{detail}/g, detail)
    .replace(/{tag}/g, tag);
}

function generateShortDesc(game) {
  const name = game.name;
  const category = game.category || '其他';
  const template = getTemplate(category);
  const tag = randomPick(template.tags);
  
  const tpl = randomPick(shortTemplates);
  
  return tpl
    .replace(/{name}/g, name)
    .replace(/{type}/g, category)
    .replace(/{tag}/g, tag);
}

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
console.log(`📊 共加载 ${games.length} 个游戏，开始生成描述...`);

// ==================== 批量生成描述 ====================
const results = [];
let generated = 0;
let skipped = 0;

games.forEach((game, index) => {
  // 如果已有较长描述（>=50字），保留原有描述
  if (game.description && game.description.length >= 50) {
    skipped++;
    return;
  }
  
  const longDesc = generateLongDesc(game);
  const shortDesc = generateShortDesc(game);
  
  results.push({
    id: game.id,
    name: game.name,
    description: longDesc,
    shortDescription: shortDesc
  });
  
  generated++;
  
  if ((index + 1) % 500 === 0) {
    console.log(`  已处理 ${index + 1} / ${games.length}...`);
  }
});

// ==================== 保存文件 ====================
// 1. 保存到 web 目录（用于网页构建）
const webOutputPath = path.join(__dirname, 'web-descriptions.json');
fs.writeFileSync(webOutputPath, JSON.stringify(results, null, 2), 'utf-8');

// 2. 保存到后台管理系统目录（用于一键加载）
const adminDir = path.join('C:', 'Users', '86973', 'Desktop', '游戏盒子后台管理器', '1.2.8', 'src');
const adminOutputPath = path.join(adminDir, 'game-descriptions-batch.json');

// 确保目录存在
if (!fs.existsSync(adminDir)) {
  console.error(`❌ 后台管理系统目录不存在: ${adminDir}`);
  console.log('💡 文件已保存到 web 目录: ' + webOutputPath);
} else {
  fs.writeFileSync(adminOutputPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`\n📁 已保存到后台管理系统: ${adminOutputPath}`);
}

console.log(`\n✅ 生成完成！`);
console.log(`   新生成: ${generated} 个游戏描述`);
console.log(`   跳过已有描述: ${skipped} 个游戏`);
console.log(`   总计: ${games.length} 个游戏`);
console.log(`\n📄 web 文件: ${webOutputPath}`);
console.log(`\n💡 使用说明:`);
console.log('1. 在后台管理系统中点击"一键加载描述"按钮');
console.log('2. 系统会自动将描述写入对应游戏的 desc 字段');
console.log('3. 然后点击"部署网站"即可生效');
