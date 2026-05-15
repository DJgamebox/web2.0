const fs = require('fs');
const path = require('path');

// 读取游戏数据
const dataPath = path.join(__dirname, '..', '..', '游戏盒子后台管理器', '1.2.8', 'src', 'data-embed.js');
let gamesData = [];

try {
  const content = fs.readFileSync(dataPath, 'utf8');
  const match = content.match(/const\s+importedGames\s*=\s*(\[.*?\]);/s);
  if (match) {
    gamesData = eval(match[1]);
  }
} catch (error) {
  console.error('读取游戏数据失败:', error);
  process.exit(1);
}

console.log(`📊 共加载 ${gamesData.length} 个游戏，开始生成差异化描述...`);

// 为每种游戏类型准备多个不同的描述段落（避免模板化）
const typeParagraphs = {
  '动作': [
    '这款游戏的操作手感非常出色，每一次按键都能得到精准的反馈。战斗系统设计得很有深度，玩家可以通过不同的连招组合打出华丽的攻击。',
    '游戏的动作设计流畅自然，角色的每一个动作都经过精心打磨。无论是普通攻击还是技能释放，都能给玩家带来爽快的打击感。',
    '作为一款动作游戏，它在战斗节奏上把握得很好。紧张刺激的战斗场面让人热血沸腾，同时又不失策略性。',
    '游戏中的Boss战设计得很有挑战性，每个Boss都有独特的攻击模式和弱点。玩家需要不断尝试才能找到最佳的击败方法。'
  ],
  '射击': [
    '枪械手感真实，每一把武器都有独特的后坐力和射击节奏。玩家可以根据自己的喜好选择适合的武器。',
    '游戏的射击机制设计得很到位，弹道物理效果逼真。无论是近距离交火还是远距离狙击，都能给玩家带来沉浸式的体验。',
    '多样化的武器系统是这款游戏的一大亮点。从手枪到狙击枪，从冲锋枪到霰弹枪，每种武器都有其适用场景。',
    '战斗场景宏大，敌人AI设计得很智能。玩家需要灵活运用掩体和战术才能在与敌人的对抗中占据优势。'
  ],
  '角色扮演': [
    '游戏的剧情设计引人入胜，充满了意想不到的转折。玩家的每一个选择都可能影响故事的走向和结局。',
    '角色养成系统非常丰富，玩家可以通过升级、装备、技能等多种方式打造属于自己的独特角色。',
    '游戏世界构建得很完整，每个NPC都有自己的故事和背景。玩家可以与他们互动，了解这个世界的历史和秘密。',
    '支线任务设计得很有诚意，不是简单的打怪收集。每个支线任务都有独立的故事线，完成后能获得丰厚的奖励。'
  ],
  '冒险': [
    '探索元素丰富，游戏世界中隐藏着大量的秘密等待玩家发现。每个角落都可能有意想不到的惊喜。',
    '谜题设计巧妙，既不会过于简单让人失去兴趣，也不会过于困难让人产生挫败感。解开谜题的成就感十足。',
    '游戏的场景设计精美，从神秘的古代遗迹到危险的丛林深处，每个场景都有其独特的氛围和挑战。',
    '故事情节扣人心弦，主角的冒险旅程充满了未知和危险。玩家将跟随主角一起成长，经历各种考验。'
  ],
  '策略': [
    '游戏的策略深度令人印象深刻，玩家需要考虑资源管理、兵种搭配、地形利用等多个因素才能取得胜利。',
    '每一场战斗都是一次智力的较量，敌人的AI很聪明，会根据玩家的行动做出相应的调整。',
    '游戏提供了多种不同的策略路线，玩家可以选择正面硬刚，也可以选择迂回包抄，甚至可以采用经济压制的战术。',
    '地图设计多样化，不同的地形对战斗有着不同的影响。合理利用地形优势是取得胜利的关键。'
  ],
  '体育': [
    '游戏对真实运动的还原度很高，无论是球员的动作还是比赛的规则都力求真实。',
    '操作手感流畅，玩家可以轻松地控制球员完成各种技术动作。新手也能快速上手，享受比赛的乐趣。',
    '游戏模式丰富，除了常规的比赛模式外，还有生涯模式、经理模式等多种玩法可供选择。',
    '画面表现力出色，球场的细节、观众的表情、天气的变化都呈现得很到位，营造出真实的比赛氛围。'
  ],
  '竞速': [
    '驾驶体验真实，每辆车都有独特的操控手感。玩家可以感受到不同车型在加速、转弯、刹车时的差异。',
    '赛道设计多样化，从城市街道到山间公路，从沙漠戈壁到冰雪赛道，每条赛道都有其独特的挑战。',
    '物理引擎表现出色，车辆的碰撞、漂移、飞跃都很真实。玩家需要掌握一定的驾驶技巧才能在比赛中取得好成绩。',
    '改装系统丰富，玩家可以对车辆的引擎、轮胎、悬挂等部件进行升级，打造属于自己的专属座驾。'
  ],
  '模拟': [
    '游戏的模拟程度很高，玩家需要像现实中一样考虑各种因素。这种真实感是游戏最大的魅力所在。',
    '系统复杂但不难上手，游戏提供了详细的新手教程，帮助玩家逐步了解游戏的各项机制。',
    '自由度很高，玩家可以按照自己的意愿来发展。没有固定的目标，每个人都可以有不同的游戏体验。',
    '细节处理到位，游戏中的各种小元素都经过精心设计。这些细节共同构成了一个生动的游戏世界。'
  ],
  '恐怖': [
    '游戏的恐怖氛围营造得很到位，通过音效、光影、场景设计等多种手段让玩家时刻保持紧张感。',
    '敌人设计令人印象深刻，它们不仅外形恐怖，行为模式也很诡异。玩家需要时刻保持警惕才能生存下来。',
    '剧情充满悬疑，随着游戏的推进，真相逐渐浮出水面。这种逐步揭开谜底的过程让人欲罢不能。',
    '资源管理是游戏的重要元素，弹药和补给都很有限。玩家需要谨慎使用每一份资源才能在危机中存活。'
  ],
  '格斗': [
    '格斗系统设计得很深度，每个角色都有独特的招式和连招。掌握一个角色需要花费不少时间练习。',
    '打击感出色，每一次命中都能给玩家带来满足感。特效和音效的配合让战斗场面更加震撼。',
    '角色平衡性做得很好，没有绝对强势的角色。胜负主要取决于玩家的技术和对角色的理解。',
    '游戏提供了丰富的训练模式，帮助玩家熟悉各个角色的招式和连招。新手可以通过训练模式快速提升自己。'
  ]
};

// 通用段落（所有类型可用）
const commonParagraphs = [
  '画面表现力出色，无论是场景的细节还是角色的建模都达到了很高的水准。光影效果和天气系统也为游戏增色不少。',
  '音效设计值得称赞，背景音乐与游戏氛围完美契合，音效反馈及时准确，为玩家带来沉浸式的游戏体验。',
  '优化做得很好，即使在配置较低的电脑上也能流畅运行。同时高配置玩家可以开启更高的画质选项享受视觉盛宴。',
  '游戏的重复可玩性很高，即使通关后依然有很多内容值得探索。不同的选择会带来不同的体验。',
  '社区活跃，开发者也很重视玩家的反馈。游戏会定期更新，不断加入新的内容和优化。',
  '性价比很高，游戏内容丰富，游玩时长充足。以这个价位来说，绝对物超所值。'
];

// 下载相关段落（随机选择）
const downloadParagraphs = [
  '本站提供的游戏资源经过严格测试，确保无毒无害。下载速度快，让玩家能够快速开始游戏。',
  '游戏安装包已经过优化，体积合理。下载完成后按照说明文档的步骤即可轻松安装。',
  '我们提供多个下载链接，玩家可以根据自己的网络情况选择最合适的方式获取游戏。',
  '游戏资源包含全部DLC和更新补丁，玩家下载后即可体验到完整的游戏内容。'
];

// 随机选择数组中的元素
function randomPick(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// 生成差异化描述
function generateUniqueDescription(game, index) {
  const name = game.name || game.nameEn || '未知游戏';
  const category = game.category || '游戏';
  const size = game.size || '未知大小';
  const id = game.id;
  
  // 获取该类型的段落，如果没有则使用通用段落
  const typeSpecificParagraphs = typeParagraphs[category] || commonParagraphs;
  
  // 随机选择2-3个类型相关段落
  const selectedTypeParagraphs = randomPick(typeSpecificParagraphs, 2 + (index % 2));
  
  // 随机选择1个通用段落
  const selectedCommonParagraph = randomPick(commonParagraphs, 1)[0];
  
  // 随机选择1个下载段落
  const selectedDownloadParagraph = randomPick(downloadParagraphs, 1)[0];
  
  // 随机选择版本关键词
  const versions = ['中文版', '汉化版', '绿色版', '免安装版', '硬盘版'];
  const version = versions[index % versions.length];
  
  // 随机选择下载关键词
  const downloads = ['下载', '免费下载', '高速下载', '网盘下载'];
  const download = downloads[index % downloads.length];
  
  // 构建描述（非模板化结构）
  const paragraphs = [];
  
  // 开头段落（变化多样）
  const openings = [
    `${name}是一款精彩的${category}游戏，游戏大小${size}。`,
    `如果你喜欢${category}游戏，那么${name}绝对不容错过。这款游戏大小为${size}，`,
    `${name}作为${category}游戏的代表作之一，游戏大小${size}，`,
    `今天要给大家介绍的是${name}，这是一款${category}游戏，大小为${size}，`
  ];
  const opening = openings[index % openings.length];
  
  // 组合描述
  let description = opening;
  
  // 随机添加类型相关段落
  selectedTypeParagraphs.forEach((para, i) => {
    if (i === 0) {
      description += para;
    } else {
      description += '\n\n' + para;
    }
  });
  
  // 添加通用段落
  description += '\n\n' + selectedCommonParagraph;
  
  // 添加下载信息
  description += '\n\n【下载说明】\n';
  description += `${name}${version}${download}，包含完整的游戏内容和全部DLC。`;
  description += selectedDownloadParagraph;
  
  // 添加安装说明（简短版）
  description += '\n\n【安装信息】\n';
  description += '1. 下载游戏压缩包\n';
  description += '2. 解压到任意目录\n';
  description += '3. 运行游戏主程序开始游戏\n';
  description += `4. 需要 ${size} 可用空间`;
  
  // 添加配置要求
  description += '\n\n【配置要求】\n';
  description += '- 系统：Windows 10/11 64位\n';
  description += '- CPU：Intel Core i5 或同等AMD处理器\n';
  description += '- 内存：8GB RAM（推荐16GB）\n';
  description += '- 显卡：NVIDIA GTX 1060 或同等性能显卡\n';
  description += `- 存储：${size}可用空间`;
  
  // 生成标题（多样化）
  const titlePatterns = [
    `【${name}${version}】${name}${download} PC版 - 游戏盒子`,
    `${name}${version}${download} | ${category}游戏 | 游戏盒子`,
    `【${name}】${category}游戏${download} | ${version} | 游戏盒子`,
    `${name} - ${category}游戏${version}${download} - 游戏盒子`
  ];
  const title = titlePatterns[index % titlePatterns.length];
  
  // 生成关键词
  const keywords = `${name},${name}${version},${name}${download},${category}游戏,PC游戏下载`;
  
  return {
    id: id,
    name: name,
    title: title,
    description: description,
    keywords: keywords,
    wordCount: description.length
  };
}

// 生成所有游戏的描述
const descriptions = [];
const batchSize = 100;

for (let i = 0; i < gamesData.length; i++) {
  const game = gamesData[i];
  const desc = generateUniqueDescription(game, i);
  descriptions.push(desc);
  
  if ((i + 1) % batchSize === 0 || i === gamesData.length - 1) {
    console.log(`  已处理 ${i + 1} / ${gamesData.length}...`);
  }
}

// 保存到文件
const outputPath = path.join(__dirname, 'web-descriptions-unique.json');
const adminOutputPath = path.join(__dirname, '..', '..', '游戏盒子后台管理器', '1.2.8', 'src', 'game-descriptions-batch.json');

fs.writeFileSync(outputPath, JSON.stringify(descriptions, null, 2), 'utf8');
fs.writeFileSync(adminOutputPath, JSON.stringify(descriptions, null, 2), 'utf8');

console.log(`\n📁 已保存到: ${outputPath}`);
console.log(`📁 已保存到后台管理系统: ${adminOutputPath}`);
console.log(`\n✅ 生成完成！共生成 ${descriptions.length} 个游戏的差异化描述`);

// 显示样本
const sample = descriptions[0];
console.log(`\n📝 样本预览（${sample.name}）:`);
console.log(`   标题: ${sample.title}`);
console.log(`   字数: ${sample.wordCount}`);
console.log(`   关键词: ${sample.keywords}`);
console.log(`\n📊 字数统计:`);
console.log(`   平均: ${Math.round(descriptions.reduce((sum, d) => sum + d.wordCount, 0) / descriptions.length)} 字`);
console.log(`   最少: ${Math.min(...descriptions.map(d => d.wordCount))} 字`);
console.log(`   最多: ${Math.max(...descriptions.map(d => d.wordCount))} 字`);
