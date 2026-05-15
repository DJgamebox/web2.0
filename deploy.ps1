# 游戏盒子网站部署脚本
# 用法: 右键点击此文件 -> 使用 PowerShell 运行

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  游戏盒子网站部署脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 切换到项目目录
$projectPath = "C:\Users\86973\Desktop\网页版盒子\web-next-v2"
Set-Location $projectPath

Write-Host "当前目录: $projectPath" -ForegroundColor Yellow
Write-Host ""

# 检查 git 状态
Write-Host "[1/4] 检查 Git 状态..." -ForegroundColor Green
git status
Write-Host ""

# 添加所有更改
Write-Host "[2/4] 添加更改到 Git..." -ForegroundColor Green
git add .
Write-Host "✅ 已添加所有更改" -ForegroundColor Green
Write-Host ""

# 提交更改
Write-Host "[3/4] 提交更改..." -ForegroundColor Green
$commitMessage = "优化游戏详情页加载速度：优先使用嵌入数据，减少API请求"
git commit -m "$commitMessage"
Write-Host "✅ 已提交: $commitMessage" -ForegroundColor Green
Write-Host ""

# 推送到远程
Write-Host "[4/4] 推送到 GitHub..." -ForegroundColor Green
Write-Host "正在推送，请稍候..." -ForegroundColor Yellow

try {
    git push origin master
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✅ 部署成功！" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "GitHub Actions 将自动部署到 Vercel" -ForegroundColor Cyan
    Write-Host "部署进度: https://github.com/DJgamebox/web2.0/actions" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "网站地址: https://www.djgamebox.com" -ForegroundColor Cyan
} catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ❌ 推送失败" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "错误信息: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "可能的原因:" -ForegroundColor Yellow
    Write-Host "  1. 网络连接问题" -ForegroundColor Yellow
    Write-Host "  2. GitHub 认证过期" -ForegroundColor Yellow
    Write-Host "  3. 远程仓库有冲突" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "建议:" -ForegroundColor Yellow
    Write-Host "  - 检查网络连接" -ForegroundColor Yellow
    Write-Host "  - 稍后重试" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "按任意键退出..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
