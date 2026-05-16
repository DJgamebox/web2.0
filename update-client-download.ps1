# 批量更新游戏详情页的客户端下载代码
# 将 1.1.3 版本更新为 1.1.7，并添加版本选择功能

$gamesDir = Join-Path $PSScriptRoot "games"
$files = Get-ChildItem -Path $gamesDir -File -Filter "*.html"

$total = $files.Count
$updated = 0
$skipped = 0

Write-Host "开始更新 $total 个游戏详情页..." -ForegroundColor Green

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    
    # 检查是否包含旧版本代码
    if ($content -match "游戏盒子 Setup 1\.1\.3") {
        # 替换 downloadClient 函数
        $oldDownloadClient = @'
        // 下载桌面客户端（与主页保持一致）
        async function downloadClient(source = 'detail') {
            // 记录下载统计
            try {
                await fetch('https://api.djgamebox.com/api/client-download', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        source: source,
                        page: window.location.href,
                        timestamp: new Date().toISOString()
                    })
                });
            } catch (error) {
                console.error('记录客户端下载失败:', error);
            }
            
            // 直接下载本地安装包
            const link = document.createElement('a');
            link.href = '../downloads/游戏盒子 Setup 1.1.3.exe';
            link.download = '游戏盒子 Setup 1.1.3.exe';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showDownloadCompleteTip();
        }
'@

        $newDownloadClient = @'
        // 下载桌面客户端（与主页保持一致）
        async function downloadClient(source = 'detail') {
            // 记录下载统计
            try {
                await fetch('https://api.djgamebox.com/api/client-download', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        source: source,
                        page: window.location.href,
                        timestamp: new Date().toISOString()
                    })
                });
            } catch (error) {
                console.error('记录客户端下载失败:', error);
            }
            
            // 显示版本选择弹窗
            showVersionSelectModal();
        }
        
        // 显示版本选择弹窗
        function showVersionSelectModal() {
            // 创建选择弹窗
            const overlay = document.createElement('div');
            overlay.id = 'versionSelectOverlay';
            overlay.className = 'modal-overlay show';
            overlay.style.zIndex = '2000';
            overlay.onclick = function(e) {
                if (e.target === overlay) {
                    document.body.removeChild(overlay);
                }
            };
            
            overlay.innerHTML = `
                <div class="modal" style="max-width: 480px; background: var(--bg-card); border-radius: 12px; border: 1px solid var(--border-color); overflow: hidden;" onclick="event.stopPropagation()">
                    <div style="padding: 24px; text-align: center; border-bottom: 1px solid var(--border-color);">
                        <div style="font-size: 18px; font-weight: 600; color: var(--text-white); margin-bottom: 4px;">选择下载版本</div>
                        <div style="font-size: 13px; color: var(--text-secondary);">请根据您的需求选择合适的版本</div>
                    </div>
                    <div style="padding: 24px;">
                        <div style="display: flex; flex-direction: column; gap: 16px;">
                            <!-- 安装版 -->
                            <div onclick="downloadSpecificVersion('setup')" 
                                 style="display: flex; align-items: center; padding: 16px; background: var(--bg-light); border: 2px solid var(--border-color); border-radius: 10px; cursor: pointer; transition: all 0.2s;"
                                 onmouseover="this.style.borderColor='var(--accent-blue)'; this.style.background='var(--bg-hover)'"
                                 onmouseout="this.style.borderColor='var(--border-color)'; this.style.background='var(--bg-light)'">
                                <div style="width: 48px; height: 48px; background: linear-gradient(135deg, var(--accent-blue) 0%, #4a9fd8 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-right: 16px;">
                                    <i class="fas fa-download" style="font-size: 22px; color: #fff;"></i>
                                </div>
                                <div style="flex: 1;">
                                    <div style="font-size: 15px; font-weight: 600; color: var(--text-white); margin-bottom: 4px;">安装版</div>
                                    <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.5;">GameBox 1.1.7 安装版.exe</div>
                                    <div style="font-size: 11px; color: var(--accent-blue); margin-top: 4px;">推荐：自动创建桌面快捷方式</div>
                                </div>
                                <i class="fas fa-chevron-right" style="color: var(--text-secondary);"></i>
                            </div>
                            
                            <!-- 便携版 -->
                            <div onclick="downloadSpecificVersion('portable')" 
                                 style="display: flex; align-items: center; padding: 16px; background: var(--bg-light); border: 2px solid var(--border-color); border-radius: 10px; cursor: pointer; transition: all 0.2s;"
                                 onmouseover="this.style.borderColor='var(--accent-green)'; this.style.background='var(--bg-hover)'"
                                 onmouseout="this.style.borderColor='var(--border-color)'; this.style.background='var(--bg-light)'">
                                <div style="width: 48px; height: 48px; background: linear-gradient(135deg, var(--accent-green) 0%, #4a6b0f 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-right: 16px;">
                                    <i class="fas fa-usb" style="font-size: 22px; color: #fff;"></i>
                                </div>
                                <div style="flex: 1;">
                                    <div style="font-size: 15px; font-weight: 600; color: var(--text-white); margin-bottom: 4px;">便携版</div>
                                    <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.5;">GameBox 1.1.7 便携版.exe</div>
                                    <div style="font-size: 11px; color: var(--accent-green); margin-top: 4px;">免安装：解压即用，可放U盘携带</div>
                                </div>
                                <i class="fas fa-chevron-right" style="color: var(--text-secondary);"></i>
                            </div>
                        </div>
                        
                        <div style="margin-top: 20px; text-align: center;">
                            <button onclick="document.getElementById('versionSelectOverlay').remove();" 
                                    style="padding: 10px 24px; background: transparent; border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-secondary); font-size: 13px; cursor: pointer; transition: all 0.2s;"
                                    onmouseover="this.style.color='var(--text-white)'; this.style.borderColor='var(--text-white)'"
                                    onmouseout="this.style.color='var(--text-secondary)'; this.style.borderColor='var(--border-color)'">
                                取消
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(overlay);
        }
        
        // 下载指定版本
        function downloadSpecificVersion(type) {
            // 关闭选择弹窗
            const overlay = document.getElementById('versionSelectOverlay');
            if (overlay) {
                document.body.removeChild(overlay);
            }
            
            // 下载对应版本
            const link = document.createElement('a');
            if (type === 'portable') {
                link.href = '../downloads/GameBox 1.1.7 便携版.exe';
                link.download = 'GameBox 1.1.7 便携版.exe';
            } else {
                link.href = '../downloads/GameBox 1.1.7 安装版.exe';
                link.download = 'GameBox 1.1.7 安装版.exe';
            }
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // 显示下载完成提示
            showDownloadCompleteTip(type);
        }
'@
        
        $content = $content -replace [regex]::Escape($oldDownloadClient), $newDownloadClient
        
        # 替换 showDownloadCompleteTip 函数
        $oldShowTip = @'
        // 显示下载完成提示弹窗（与主页保持一致）
        function showDownloadCompleteTip() {
            const overlay = document.createElement('div');
            overlay.id = 'downloadTipOverlay';
            overlay.className = 'modal-overlay show';
            overlay.style.zIndex = '2000';
            overlay.onclick = function(e) {
                if (e.target === overlay) {
                    document.body.removeChild(overlay);
                }
            };
            
            overlay.innerHTML = `
                <div class="modal" style="max-width: 420px; background: var(--bg-card); border-radius: 12px; border: 1px solid var(--border-color); overflow: hidden;" onclick="event.stopPropagation()">
                    <div style="padding: 30px 24px; text-align: center; background: linear-gradient(135deg, var(--accent-green) 0%, #4a6b0f 100%);">
                        <i class="fas fa-check-circle" style="font-size: 56px; color: #fff; margin-bottom: 12px;"></i>
                        <div style="font-size: 20px; font-weight: 600; color: #fff;">下载已开始</div>
                    </div>
                    <div style="padding: 24px;">
                        <div style="font-size: 14px; color: var(--text-secondary); line-height: 1.8; margin-bottom: 20px;">
                            <p style="margin-bottom: 12px;"><strong style="color: var(--text-white);">安装步骤：</strong></p>
                            <ol style="padding-left: 20px; margin: 0;">
                                <li style="margin-bottom: 8px;">等待下载完成（约 82MB）</li>
                                <li style="margin-bottom: 8px;">双击下载的文件运行安装</li>
                                <li>按提示完成安装即可使用</li>
                            </ol>
                        </div>
                        
                        <div style="background: rgba(102, 192, 244, 0.1); border-left: 3px solid var(--accent-blue); padding: 12px 16px; border-radius: 0 4px 4px 0; margin-bottom: 20px;">
                            <i class="fas fa-lightbulb" style="color: var(--accent-blue); margin-right: 8px;"></i>
                            <span style="font-size: 12px; color: var(--text-secondary);">提示：安装完成后桌面会创建快捷方式</span>
                        </div>
'@

        $newShowTip = @'
        // 显示下载完成提示弹窗（与主页保持一致）
        function showDownloadCompleteTip(type = 'setup') {
            const isPortable = type === 'portable';
            
            const overlay = document.createElement('div');
            overlay.id = 'downloadTipOverlay';
            overlay.className = 'modal-overlay show';
            overlay.style.zIndex = '2000';
            overlay.onclick = function(e) {
                if (e.target === overlay) {
                    document.body.removeChild(overlay);
                }
            };
            
            overlay.innerHTML = `
                <div class="modal" style="max-width: 420px; background: var(--bg-card); border-radius: 12px; border: 1px solid var(--border-color); overflow: hidden;" onclick="event.stopPropagation()">
                    <div style="padding: 30px 24px; text-align: center; background: linear-gradient(135deg, ${isPortable ? 'var(--accent-green)' : 'var(--accent-blue)'} 0%, ${isPortable ? '#4a6b0f' : '#4a9fd8'} 100%);">
                        <i class="fas fa-check-circle" style="font-size: 56px; color: #fff; margin-bottom: 12px;"></i>
                        <div style="font-size: 20px; font-weight: 600; color: #fff;">下载已开始</div>
                    </div>
                    <div style="padding: 24px;">
                        <div style="font-size: 14px; color: var(--text-secondary); line-height: 1.8; margin-bottom: 20px;">
                            <p style="margin-bottom: 12px;"><strong style="color: var(--text-white);">${isPortable ? '使用步骤：' : '安装步骤：'}</strong></p>
                            <ol style="padding-left: 20px; margin: 0;">
                                <li style="margin-bottom: 8px;">等待下载完成（约 82MB）</li>
                                ${isPortable ? 
                                    '<li style="margin-bottom: 8px;">双击运行，无需安装</li><li>可放入U盘随身携带</li>' :
                                    '<li style="margin-bottom: 8px;">双击下载的文件运行安装</li><li>按提示完成安装即可使用</li>'
                                }
                            </ol>
                        </div>
                        
                        <div style="background: rgba(102, 192, 244, 0.1); border-left: 3px solid var(--accent-blue); padding: 12px 16px; border-radius: 0 4px 4px 0; margin-bottom: 20px;">
                            <i class="fas fa-lightbulb" style="color: var(--accent-blue); margin-right: 8px;"></i>
                            <span style="font-size: 12px; color: var(--text-secondary);">${isPortable ? '提示：便携版无需安装，解压即用' : '提示：安装完成后桌面会创建快捷方式'}</span>
                        </div>
'@
        
        $content = $content -replace [regex]::Escape($oldShowTip), $newShowTip
        
        # 保存文件
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
        $updated++
        Write-Host "已更新: $($file.Name)" -ForegroundColor Green
    } else {
        $skipped++
    }
}

Write-Host "`n更新完成!" -ForegroundColor Green
Write-Host "总计: $total" -ForegroundColor White
Write-Host "已更新: $updated" -ForegroundColor Green
Write-Host "跳过: $skipped" -ForegroundColor Yellow
