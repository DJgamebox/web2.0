/**
 * 修复云端 updateTime - 使用本地 data-embed.js 中的 updateTime 更新云端
 * 使用方法: node fix-updateTime.js
 */

const fs = require('fs');
const https = require('https');

const API_URL = 'https://api.djgamebox.com/api/admin/games';
const ADMIN_PASSWORD = 'abc123';

// 读取本地游戏数据
const dataFilePath = './data-embed.js';
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

// 先获取云端现有数据
console.log('正在获取云端数据...');

https.get('https://api.djgamebox.com/api/games', (res) => {
    const chunks = [];
    
    res.on('data', (chunk) => {
        chunks.push(chunk);
    });
    
    res.on('end', () => {
        try {
            const buffer = Buffer.concat(chunks);
            const data = buffer.toString('utf8');
            const apiData = JSON.parse(data);
            const cloudGames = apiData.games || [];
            
            console.log(`获取到 ${cloudGames.length} 个云端游戏`);
            
            // 创建本地游戏的 Map（用于快速查找 updateTime）
            const localGamesMap = new Map();
            games.forEach(game => {
                localGamesMap.set(String(game.id), game);
            });
            
            // 更新云端游戏的 updateTime
            let updatedCount = 0;
            const updatedCloudGames = cloudGames.map(cloudGame => {
                const localGame = localGamesMap.get(String(cloudGame.id));
                if (localGame && localGame.updateTime) {
                    // 使用本地的 updateTime
                    if (cloudGame.updateTime !== localGame.updateTime) {
                        updatedCount++;
                    }
                    return {
                        ...cloudGame,
                        updateTime: localGame.updateTime,
                        update: localGame.updateTime  // 同时更新 update 字段
                    };
                }
                return cloudGame;
            });
            
            console.log(`需要更新 ${updatedCount} 个游戏的 updateTime`);
            
            // 发送更新后的数据到云端
            const postData = JSON.stringify({
                games: updatedCloudGames,
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
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    try {
                        const result = JSON.parse(data);
                        console.log('同步结果:', result);
                        if (res.statusCode === 200) {
                            console.log(`✅ 成功更新 ${result.count || updatedCloudGames.length} 个游戏到云端`);
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
            
        } catch (error) {
            console.error('处理失败:', error.message);
        }
    });
}).on('error', (error) => {
    console.error('获取云端数据失败:', error.message);
});
