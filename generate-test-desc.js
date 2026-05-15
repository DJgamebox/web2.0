const fs = require('fs');
const path = require('path');

// 战神5：诸神黄昏 专用SEO描述测试
const gameId = 15;
const gameName = '战神5：诸神黄昏';
const gameNameEn = 'God of War Ragnarok';
const gameCategory = '动作';
const gameSize = '106.1G';

// ========== 长描述（800-1000字，用于页面正文 + Schema.org）==========
const longDescription = `《战神5：诸神黄昏破解版》（God of War Ragnarok）是一款史诗级动作冒险游戏，由Santa Monica Studio倾力打造，是2018年备受好评的《战神》正统续作。游戏以北欧神话为背景，讲述了战神奎托斯与儿子阿特柔斯在芬布尔之冬降临后的命运旅程。本站提供战神5诸神黄昏破解版游戏下载，包含全DLC内容和官方中文补丁，PC绿色免安装版，解压即玩。通过百度网盘和迅雷云盘双线路网盘下载，无需复杂安装步骤。

故事发生在前作事件结束数年后，九界迎来了漫长而残酷的芬布尔之冬。奎托斯和阿特柔斯必须穿越危机四伏的神话世界，探索壮丽的九界景观，面对来自北欧诸神和怪物的重重威胁。阿特柔斯渴望了解自己的身份与"洛基"预言的真相，而奎托斯则必须在保护家人与面对过去之间做出艰难抉择。随着诸神黄昏的临近，父子二人将经历前所未有的考验，他们的命运也与整个九界的存亡紧紧相连。想要体验这款战神5诸神黄昏破解版的玩家，千万不要错过这场史诗级PC游戏下载体验。

游戏在战斗系统上进行了全面升级，保留了经典的利维坦之斧与混沌之刃，并新增了德罗普尼尔长矛作为全新武器。玩家可以根据敌人特性自由切换武器，体验斧头的冰霜之力、双刀的烈焰之威以及长矛的狂风之势。战斗节奏紧凑爽快，配合盾反、符文技能与斯巴达之怒，每一场BOSS战都充满挑战性。此外，游戏还融入了丰富的解谜与探索元素，九界中隐藏着大量宝藏、支线任务与秘密等待玩家发掘。全DLC内容已整合，无需额外下载补丁。

战神5诸神黄昏破解版在画面上表现尤为出色，PC版支持真4K分辨率、更高帧率以及21:9和32:9超宽屏显示，配合NVIDIA DLSS 3.7和AMD FSR 3.1技术，带来极致流畅的视觉体验。游戏同时支持DualShock 4、DualSense手柄触觉反馈与自适应扳机，让玩家身临其境地感受北欧九界的震撼。无论是壮丽的光影效果、精致的角色建模，还是宏大的场景设计，都堪称动作游戏的画质标杆。官方中文翻译质量极高，剧情沉浸感十足。

配置方面，游戏最低需要Intel i5-4670k或AMD Ryzen 3 1200处理器、8GB内存以及NVIDIA GTX 1060（6GB）显卡，推荐配置为i5-8600/Ryzen 5 3600、16GB内存和RTX 2060 Super级别显卡。游戏体积约106.1GB，请确保硬盘空间充足。本站提供的资源为绿色免安装中文版，下载完成后直接解压即可运行，无需复杂安装步骤。解压即玩的特性让你省去漫长等待，即刻开启诸神黄昏的冒险。

《战神5：诸神黄昏破解版》适合喜爱硬核动作、史诗剧情与神话冒险的玩家，尤其是战神系列忠实粉丝。无论你是追求爽快连招的战斗爱好者，还是沉浸于父子情深的剧情党，这款战神5破解版都能带来长达数十小时的极致体验。立即点击上方链接，通过百度网盘或迅雷云盘高速下载战神5诸神黄昏破解版，开启属于你的诸神黄昏之旅！`;

// ========== 短描述（150字左右，用于 meta description）==========
const shortDescription = `《战神5：诸神黄昏破解版》PC游戏下载，包含全DLC和官方中文。绿色免安装版，解压即玩。提供百度网盘、迅雷云盘高速网盘下载，立即体验这款史诗级北欧神话动作冒险游戏！`;

// 保存到测试文件
const result = [{
  id: gameId,
  name: gameName,
  description: longDescription,
  shortDescription: shortDescription
}];

const outputPath = path.join(__dirname, 'web-descriptions.json');
fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');

console.log(`✅ 已生成战神5测试描述`);
console.log(`📄 文件: ${outputPath}`);
console.log(`\n📝 长描述字数: ${longDescription.length} 字`);
console.log(`📝 短描述字数: ${shortDescription.length} 字`);
console.log(`\n📋 短描述预览:`);
console.log(shortDescription);
