# 推送到 GitHub 脚本
# 用法: 右键点击此文件 -> 使用 PowerShell 运行

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  推送到 GitHub" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 切换到项目目录
$projectPath = "C:\Users\86973\Desktop\网页版盒子\web-next-v2"
Set-Location $projectPath

Write-Host "当前目录: $projectPath" -ForegroundColor Yellow
Write-Host ""

# 检查 git 状态
Write-Host "[1/3] 检查 Git 状态..." -ForegroundColor Green
git status
Write-Host ""

# 推送
Write-Host "[2/3] 推送到 GitHub..." -ForegroundColor Green
Write-Host "正在推送，请稍候..." -ForegroundColor Yellow

try {
    git push origin master
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✅ 推送成功！" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "GitHub Actions 将自动部署到 Vercel" -ForegroundColor Cyan
    Write-Host "部署进度: https://github.com/DJgamebox/web2.0/actions" -ForegroundColor Cyan
} catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ❌ 推送失败" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "错误信息: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "按任意键退出..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
