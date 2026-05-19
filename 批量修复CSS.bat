# 批量修复CSS选择器错误
# 将所有 .header .header .back-link 改为 .header .back-link

import os
import re
from pathlib import Path

games_dir = r'C:\Users\86973\Desktop\网页版盒子\web-next-v2\games'

print("="*60)
print("批量修复CSS选择器错误")
print("="*60)
print()

# 统计
fixed_count = 0
error_count = 0

# 遍历所有HTML文件
for filename in os.listdir(games_dir):
    if not filename.endswith('.html'):
        continue
    
    filepath = os.path.join(games_dir, filename)
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 查找并替换错误的选择器
        # 模式：.header (任意空格) .header .back-link
        new_content = re.sub(
            r'\.header\s+\.header\s+\.back-link',
            '.header .back-link',
            content
        )
        
        # 如果内容有变化，写回文件
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            fixed_count += 1
            print(f"✓ 已修复: {filename}")
        
    except Exception as e:
        error_count += 1
        print(f"✗ 错误 {filename}: {e}")

print()
print("="*60)
print(f"修复完成！")
print(f"共修复 {fixed_count} 个文件")
if error_count > 0:
    print(f"失败: {error_count} 个文件")
print("="*60)
print()
print("请刷新网页查看效果！")

input("\n按回车键退出...")
