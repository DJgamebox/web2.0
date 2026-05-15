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

console.log(`📊 共加载 ${gamesData.length} 个游戏，开始生成SEO描述...`);

// SEO关键词库
const keywords = {
  download: ['下载', '免费下载', '高速下载', '网盘下载', '百度云下载', '迅雷下载'],
  version: ['中文版', '汉化版', '绿色版', '免安装版', '硬盘版', '破解版'],
  platform: ['PC版', '电脑版', 'Windows版', 'Steam版'],
  quality: ['高清', '高画质', '4K', '60帧', '流畅'],
  action: ['立即下载', '点击下载', '免费获取', '马上体验']
};

// 游戏类型描述模板
const typeDescriptions = {
  '动作': ['爽快的战斗体验', '流畅的动作设计', '华丽的连招系统', '激烈的战斗场面'],
  '冒险': ['丰富的探索元素', '精彩的剧情设计', '神秘的未知世界', '惊险的冒险旅程'],
  '角色扮演': ['深度的角色养成', '丰富的剧情分支', '多样的职业选择', '沉浸式的游戏体验'],
  '射击': ['真实的射击手感', '丰富的武器系统', '紧张刺激的战斗', '多样的战术选择'],
  '策略': ['深度的策略玩法', '丰富的战术选择', '考验智慧的决策', '多样的战略组合'],
  '体育': ['真实的运动体验', '流畅的操作手感', '丰富的比赛模式', '精美的画面表现'],
  '竞速': ['极速的驾驶体验', '真实的物理引擎', '丰富的赛车选择', '刺激的赛道设计'],
  '模拟': ['真实的模拟体验', '丰富的经营元素', '自由的游戏玩法', '细腻的细节设计'],
  '休闲': ['轻松的游戏氛围', '简单的操作方式', '丰富的关卡设计', '适合休闲娱乐'],
  '恐怖': ['惊悚的游戏氛围', '紧张的生存体验', '恐怖的场景设计', '刺激的逃生玩法']
};

// 生成SEO描述
function generateSEODescription(game, index) {
  const name = game.name || game.nameEn || '未知游戏';
  const category = game.category || '游戏';
  const size = game.size || '未知大小';
  const id = game.id;
  
  // 随机选择关键词
  const downloadKeyword = keywords.download[index % keywords.download.length];
  const versionKeyword = keywords.version[index % keywords.version.length];
  const platformKeyword = keywords.platform[index % keywords.platform.length];
  const qualityKeyword = keywords.quality[index % keywords.quality.length];
  const actionKeyword = keywords.action[index % keywords.action.length];
  
  // 获取类型描述
  const typeDesc = typeDescriptions[category] || typeDescriptions['动作'];
  const typeDesc1 = typeDesc[index % typeDesc.length];
  const typeDesc2 = typeDesc[(index + 1) % typeDesc.length];
  
  // 生成描述标题
  const title = `【${name}${versionKeyword}】${name}${downloadKeyword} ${platformKeyword} ${qualityKeyword} - 游戏盒子`;
  
  // 生成描述内容（1000字左右）
  const description = `${name}是一款精彩的${category}游戏，${typeDesc1}，${typeDesc2}。游戏大小${size}，支持${platformKeyword}，${qualityKeyword}画面表现。作为${category}游戏的代表作之一，${name}凭借其出色的游戏品质和丰富的内容深受玩家喜爱。

【游戏介绍】
${name}为玩家打造了一个充满挑战和惊喜的游戏世界。游戏中，玩家将体验到${typeDesc1}，感受${typeDesc2}带来的独特魅力。精心设计的游戏机制和丰富的内容让玩家能够长时间沉浸其中，享受游戏带来的乐趣。

【游戏特色】
${name}拥有精美的游戏画面和流畅的操作体验，每一个细节都经过精心打磨。游戏中包含丰富的内容和多样的玩法，让玩家能够自由探索。${typeDesc1}，带来极致的游戏享受。无论是新手玩家还是资深玩家，都能在${name}中找到属于自己的乐趣。

【${downloadKeyword}说明】
本站提供${name}${versionKeyword}${downloadKeyword}，包含完整的游戏内容和全部DLC。${actionKeyword}，体验这款${category}游戏的魅力。游戏经过严格测试，确保无毒无害，可放心${downloadKeyword}。我们提供高速稳定的下载服务，让玩家能够快速获取游戏资源。

【安装说明】
1. ${actionKeyword}游戏压缩包
2. 解压到任意目录（建议SSD硬盘以获得最佳性能）
3. 运行游戏主程序即可开始游戏
4. 如遇到问题，请查看游戏目录下的说明文档

【系统要求】
- 操作系统：Windows 10/11 64位
- 处理器：Intel Core i5 或同等AMD处理器
- 内存：8GB RAM（推荐16GB）
- 显卡：NVIDIA GTX 1060 或同等性能显卡
- 存储空间：${size}可用空间
-  DirectX：版本 11 或更高

【温馨提示】
本游戏资源仅供学习交流使用，请在下载后24小时内删除。支持正版游戏，从你我做起。如需购买正版，请访问Steam或其他正规游戏平台。我们尊重知识产权，倡导玩家支持正版游戏，共同维护良好的游戏生态环境。

【相关推荐】
如果你喜欢${name}，还可以尝试本站其他${category}游戏。我们持续更新最新最热的游戏资源，为玩家提供优质的游戏下载服务。${actionKeyword}，开启你的游戏之旅！我们承诺为玩家提供最新、最全、最安全的游戏资源，让每一位玩家都能享受到优质的游戏体验。`;

  return {
    id: id,
    name: name,
    title: title,
    description: description,
    keywords: `${name},${name}${versionKeyword},${name}${downloadKeyword},${category}游戏,${platformKeyword},${versionKeyword}`
  };
}

// 生成所有游戏的描述
const descriptions = [];
const batchSize = 100;

for (let i = 0; i < gamesData.length; i++) {
  const game = gamesData[i];
  const desc = generateSEODescription(game, i);
  descriptions.push(desc);
  
  if ((i + 1) % batchSize === 0 || i === gamesData.length - 1) {
    console.log(`  已处理 ${i + 1} / ${gamesData.length}...`);
  }
}

// 保存到文件
const outputPath = path.join(__dirname, 'web-descriptions.json');
const adminOutputPath = path.join(__dirname, '..', '..', '游戏盒子后台管理器', '1.2.8', 'src', 'game-descriptions-batch.json');

fs.writeFileSync(outputPath, JSON.stringify(descriptions, null, 2), 'utf8');
fs.writeFileSync(adminOutputPath, JSON.stringify(descriptions, null, 2), 'utf8');

console.log(`\n📁 已保存到: ${outputPath}`);
console.log(`📁 已保存到后台管理系统: ${adminOutputPath}`);
console.log(`\n✅ 生成完成！共生成 ${descriptions.length} 个游戏的SEO描述`);

// 显示样本
const sample = descriptions[0];
console.log(`\n📝 样本预览（${sample.name}）:`);
console.log(`   标题: ${sample.title.substring(0, 80)}...`);
console.log(`   字数: ${sample.description.length}`);
console.log(`   关键词: ${sample.keywords}`);
