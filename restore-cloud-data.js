/**
 * 恢复云端数据 - 将本地 data-embed.js 推送到云端 API
 * 使用方法: node restore-cloud-data.js
 */

const fs = require('fs');
const https = require('https');

const API_URL = 'https://api.djgamebox.com/api/admin/games';
const ADMIN_PASSWORD = 'abc123'; // 管理员密码

// 读取本地游戏数据（从后台管理系统的 data-embed.js）
const dataFilePath = 'C:/Users/86973/Desktop/游戏盒子后台管理器/1.2.8/src/data-embed.js';
const content = fs.readFileSync(dataFilePath, 'utf8');

// 提取游戏数据 - 找到数组开始和结束的位置
const startIdx = content.indexOf('const importedGames = [');
if (startIdx === -1) {
    console.error('无法找到游戏数据开始位置');
    process.exit(1);
}

// 找到数组结束的位置（最后一个 ] ）
let bracketCount = 0;
let arrayStart = -1;
let arrayEnd = -1;

for (let i = startIdx + 'const importedGames = '.length; i < content.length; i++) {
    if (content[i] === '[') {
        if (bracketCount === 0) {
            arrayStart = i;
        }
        bracketCount++;
    } else if (content[i] === ']') {
        bracketCount--;
        if (bracketCount === 0) {
            arrayEnd = i + 1;
            break;
        }
    }
}

if (arrayStart === -1 || arrayEnd === -1) {
    console.error('无法找到游戏数据结束位置');
    process.exit(1);
}

const arrayContent = content.substring(arrayStart, arrayEnd);

let games;
try {
    games = JSON.parse(arrayContent);
} catch (e) {
    console.log('直接解析失败，尝试修复格式...');
    try {
        games = eval(arrayContent);
    } catch (e2) {
        console.error('解析游戏数据失败:', e2.message);
        process.exit(1);
    }
}

console.log(`读取到 ${games.length} 个本地游戏`);

// 英文分类名映射到中文
const englishToChineseMap = {
    'action': '动作',
    'adventure': '冒险',
    'strategy': '策略',
    'shooter': '射击',
    'rpg': '角色扮演',
    'simulation': '模拟经营',
    'sports': '体育竞技',
    'racing': '赛车',
    'horror': '恐怖惊悚',
    'puzzle': '益智解谜',
    'mnb': '骑马与砍杀',
    'tw': '全面战争',
    'rts': '即时战略',
    'fighting': '格斗',
    'arcade': '街机怀旧'
};

// 转换字段名为云端期望的格式
const gamesToSync = games.map(game => ({
    id: game.id,
    cn: game.name || '',
    en: game.nameEn || '',
    cover: game.cover || '',
    type: englishToChineseMap[game.category] || game.category || '',
    size: game.size || '',
    update: game.updateTime || Date.now(),
    updateTime: game.updateTime || Date.now(),
    hot: game.hot || 0,
    isDrm: game.isDrm || false,
    description: game.description || '',
    link1: game.baiduLink1 || '',
    link2: game.baiduLink2 || '',
    link3: game.thunderLink || '',
    link4: game.baiduLink3 || '',
    downloadsWeb: game.downloadsWeb || 0,
    downloadsApp: game.downloadsApp || 0,
    sortOrder: game.sortOrder !== undefined ? game.sortOrder : (game.id + 1000)
}));

console.log(`准备同步 ${gamesToSync.length} 个游戏到云端...`);

// 发送数据到云端
const postData = JSON.stringify({
    games: gamesToSync,
    adminPassword: ADMIN_PASSWORD
});

const options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

const req = https.request(API_URL, options, (res) => {
    const chunks = [];
    
    res.on('data', (chunk) => {
        chunks.push(chunk);
    });
    
    res.on('end', () => {
        try {
            const buffer = Buffer.concat(chunks);
            const data = buffer.toString('utf8');
            const result = JSON.parse(data);
            console.log('同步结果:', result);
            if (res.statusCode === 200) {
                console.log(`✅ 成功同步 ${result.count || gamesToSync.length} 个游戏到云端`);
            } else {
                console.error('❌ 同步失败:', result.error || '未知错误');
            }
        } catch (e) {
            console.error('解析响应失败:', e.message);
            console.log('原始响应:', data);
        }
    });
});

req.on('error', (error) => {
    console.error('请求失败:', error.message);
});

req.write(postData);
req.end();
