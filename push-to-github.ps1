# PowerShell 脚本：推送到 GitHub
# 使用方法：右键点击此文件，选择"使用 PowerShell 运行"

Set-Location "C:\Users\86973\Desktop\网页版盒子\web-next-v2"

Write-Host "正在推送到 GitHub..." -ForegroundColor Green

# 配置 Git 使用代理（如果需要）
# git config --global http.proxy http://127.0.0.1:7890
# git config --global https.proxy http://127.0.0.1:7890

# 尝试推送
try {
    git push
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 推送成功！" -ForegroundColor Green
        Write-Host "Vercel 将自动重新部署..." -ForegroundColor Yellow
    } else {
        Write-Host "❌ 推送失败，请检查网络连接" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ 错误: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "按任意键退出..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
