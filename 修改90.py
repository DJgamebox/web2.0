# -*- coding: utf-8 -*-
import os
import re

# 只修改90.html作为测试
target_file = r'C:\Users\86973\Desktop\网页版盒子\web-next-v2\games\90.html'

print("正在修改90.html...")

with open(target_file, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. 在header-left开头添加返回链接
old_header = '''<div class="header-left">
            <img src="../favicon.png" alt="游戏盒子">'''
new_header = '''<div class="header-left">
            <a href="/" class="back-link" id="backLink"><i class="fas fa-arrow-left"></i>返回游戏列表</a>
            <img src="../favicon.png" alt="游戏盒子">'''

content = content.replace(old_header, new_header)

# 2. 删除底部的返回链接（如果有）
content = re.sub(r'\s*<a href="/" class="back-link" id="backLink"><i class="fas fa-arrow-left"></i>返回游戏列表</a>\s*', '\n    ', content)

# 3. 添加CSS样式
old_css = '''.header a {
            color: var(--text-primary);
            text-decoration: none;
            font-size: 20px;
            font-weight: 600;
        }
        .theme-toggle'''

new_css = '''.header a {
            color: var(--text-primary);
            text-decoration: none;
            font-size: 20px;
            font-weight: 600;
        }
        .header .back-link {
            color: var(--accent-blue) !important;
            font-size: 14px;
            font-weight: 500;
            display: inline-flex;
            align-items: center;
            gap: 5px;
        }
        .header .back-link:hover {
            text-decoration: underline;
        }
        .theme-toggle'''

content = content.replace(old_css, new_css)

with open(target_file, 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ 90.html 修改完成！")
print("请刷新页面查看效果。")
input("\n按回车键退出...")
