# 批量更新游戏详情页的客户端下载代码 - 简化版
$gamesDir = Join-Path $PSScriptRoot "games"
$files = Get-ChildItem -Path $gamesDir -File -Filter "*.html"

$total = $files.Count
$updated = 0

Write-Host "开始更新 $total 个游戏详情页..." -ForegroundColor Green

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # 检查是否包含旧版本代码
    if ($content -match "1\.1\.3") {
        # 替换版本号
        $content = $content -replace "1\.1\.3", "1.1.7"
        
        # 替换文件路径
        $content = $content -replace "游戏盒子 Setup 1\.1\.7\.exe", "GameBox 1.1.7 安装版.exe"
        $content = $content -replace "'\.\./downloads/游戏盒子 Setup", "'../downloads/GameBox"
        
        # 保存文件
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $updated++
        
        if ($updated % 100 -eq 0) {
            Write-Host "已更新 $updated / $total" -ForegroundColor Yellow
        }
    }
}

Write-Host "`n更新完成! 已更新: $updated / $total" -ForegroundColor Green
