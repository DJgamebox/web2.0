const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');

// 配置
const CONFIG = {
  site: 'https://www.djgamebox.com',
  token: '1MMvNno3FJA1snA5',
  liveSitemapUrl: 'https://www.djgamebox.com/sitemap.xml', // 优先抓线上，部署后即刻最新
  sitemapFile: 'sitemap.xml', // 兜底1：本地仓库副本
  urlsFile: 'game-urls.txt', // 兜底2：静态列表
  pushedFile: 'pushed-urls.json', // 记录已推送的 URL
  batchSize: 10 // 每天最多推送数量（根据配额调整）
};

// 从 sitemap 文本中提取 URL
function parseSitemap(data) {
  return [...data.matchAll(/<loc>(https:\/\/www\.djgamebox\.com\/[^<]+)<\/loc>/g)].map(m => m[1]);
}

// 抓取线上 sitemap（10 秒超时）
function fetchLiveSitemap() {
  return new Promise((resolve) => {
    const req = https.get(CONFIG.liveSitemapUrl, { timeout: 10000 }, (res) => {
      if (res.statusCode !== 200) { resolve(null); res.resume(); return; }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
  });
}

// 读取 URL 列表：线上 sitemap 优先（新增游戏自动纳入、已删游戏自动剔除），本地文件兜底
async function readUrls() {
  const live = await fetchLiveSitemap();
  if (live) {
    const urls = parseSitemap(live);
    if (urls.length > 0) {
      console.log('🌐 使用线上 sitemap.xml（实时最新）');
      return urls;
    }
  }
  if (fs.existsSync(CONFIG.sitemapFile)) {
    const urls = parseSitemap(fs.readFileSync(CONFIG.sitemapFile, 'utf8'));
    if (urls.length > 0) {
      console.log('📁 线上抓取失败，使用本地 sitemap.xml');
      return urls;
    }
  }
  console.log('📁 使用静态列表 game-urls.txt');
  const data = fs.readFileSync(CONFIG.urlsFile, 'utf8');
  return data.split('\n').filter(url => url.trim() !== '');
}

// 读取已推送的 URL 列表
function readPushedUrls() {
  if (!fs.existsSync(CONFIG.pushedFile)) {
    return [];
  }
  try {
    const data = fs.readFileSync(CONFIG.pushedFile, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

// 保存已推送的 URL 列表
function savePushedUrls(urls) {
  fs.writeFileSync(CONFIG.pushedFile, JSON.stringify(urls, null, 2));
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
  // 读取所有 URL
  const allUrls = await readUrls();
  console.log(`📊 总共 ${allUrls.length} 个 URL`);

  // 读取已推送的 URL，并剔除已从网站删除的页面（保持记录干净）
  const allUrlSet = new Set(allUrls);
  const pushedUrls = readPushedUrls().filter(url => allUrlSet.has(url));
  console.log(`✅ 已推送 ${pushedUrls.length} 个 URL`);

  // 找出未推送的 URL
  const remainingUrls = allUrls.filter(url => !pushedUrls.includes(url));
  console.log(`📌 剩余 ${remainingUrls.length} 个 URL 待推送`);

  if (remainingUrls.length === 0) {
    console.log('\n🎉 所有 URL 已推送完成！');
    return;
  }

  // 取今天需要推送的 URL（最多 batchSize 个）
  const todayUrls = remainingUrls.slice(0, CONFIG.batchSize);
  console.log(`\n🚀 今天准备推送 ${todayUrls.length} 个 URL...\n`);

  try {
    const result = await pushUrls(todayUrls);
    
    if (result.success) {
      console.log(`✅ 成功推送：${result.success} 个`);
      
      // 记录已推送的 URL
      pushedUrls.push(...todayUrls);
      savePushedUrls(pushedUrls);
      console.log(`💾 已保存推送记录`);
    }
    
    if (result.remain !== undefined) {
      console.log(`📌 今日剩余配额：${result.remain} 个`);
    }
    
    if (result.error) {
      console.log(`❌ 错误：${result.message || JSON.stringify(result)}`);
    }
    
  } catch (error) {
    console.log(`❌ 请求失败：${error.message}`);
  }

  // 显示进度
  const totalPushed = pushedUrls.length;
  const progress = ((totalPushed / allUrls.length) * 100).toFixed(2);
  console.log(`\n📊 推送进度：${totalPushed}/${allUrls.length} (${progress}%)`);
  console.log(`⏳ 预计还需 ${Math.ceil((allUrls.length - totalPushed) / CONFIG.batchSize)} 天完成`);
}

// 运行
main().catch(console.error);
