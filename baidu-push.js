const fs = require('fs');
const http = require('http');
const readline = require('readline');

// 配置
const CONFIG = {
  site: 'https://www.djgamebox.com',
  token: '1MMvNno3FJA1snA5', // 百度站长平台 token
  urlsFile: 'game-urls.txt',
  batchSize: 2000, // 百度每次最多 2000 条
  delay: 1000 // 每次请求间隔 1 秒
};

// 读取 URL 列表
function readUrls() {
  const data = fs.readFileSync(CONFIG.urlsFile, 'utf8');
  return data.split('\n').filter(url => url.trim() !== '');
}

// 推送 URL 到百度
function pushUrls(urls) {
  return new Promise((resolve, reject) => {
    const postData = urls.join('\n');
    
    const options = {
      hostname: 'data.zz.baidu.com',
      port: 80,
      path: `/urls?site=${CONFIG.site}&token=${CONFIG.token}`,
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (e) {
          resolve({ raw: data });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

// 主函数
async function main() {
  // 检查 token
  if (!CONFIG.token) {
    console.log('❌ 请先设置百度站长平台的 token');
    console.log('1. 登录 https://ziyuan.baidu.com/');
    console.log('2. 进入 资源提交 → API 提交');
    console.log('3. 复制 token 填入 CONFIG.token');
    return;
  }

  // 读取 URL（只取前9个，因为配额限制）
  const allUrls = readUrls();
  const urls = allUrls.slice(0, 9);
  console.log(`📊 共读取 ${allUrls.length} 个 URL，本次推送 ${urls.length} 个（配额限制）`);

  // 分批推送
  const batches = [];
  for (let i = 0; i < urls.length; i += CONFIG.batchSize) {
    batches.push(urls.slice(i, i + CONFIG.batchSize));
  }

  console.log(`📦 分成 ${batches.length} 批推送\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`🚀 正在推送第 ${i + 1}/${batches.length} 批，共 ${batch.length} 个 URL...`);
    
    try {
      const result = await pushUrls(batch);
      
      if (result.success) {
        console.log(`✅ 成功：${result.success} 个`);
        successCount += result.success;
      }
      
      if (result.remain) {
        console.log(`📌 今日剩余配额：${result.remain} 个`);
      }
      
      if (result.error) {
        console.log(`❌ 错误：${result.message || JSON.stringify(result)}`);
        failCount += batch.length;
      }
      
    } catch (error) {
      console.log(`❌ 请求失败：${error.message}`);
      failCount += batch.length;
    }

    // 延迟避免请求过快
    if (i < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, CONFIG.delay));
    }
    
    console.log('');
  }

  console.log('📊 推送完成统计：');
  console.log(`✅ 成功：${successCount} 个`);
  console.log(`❌ 失败：${failCount} 个`);
  console.log(`📈 成功率：${((successCount / urls.length) * 100).toFixed(2)}%`);
}

// 运行
main().catch(console.error);
