#!/usr/bin/env python3
"""
生成 assets/data/logos-list.json
列出 assets/images/logos/ 目录下所有 PNG 文件，供管理面板 Logo 选择器使用。

使用方法：
    python scripts/gen_logos_list.py

每次向 assets/images/logos/ 添加新图片后重新运行即可。
"""
import os
import json

LOGOS_DIR = os.path.join(os.path.dirname(__file__), '..', 'assets', 'images', 'logos')
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), '..', 'assets', 'data', 'logos-list.json')

def main():
    print('=' * 60)
    print('开始生成 logos-list.json')
    print('=' * 60)
    
    logos_dir = os.path.normpath(LOGOS_DIR)
    output_file = os.path.normpath(OUTPUT_FILE)
    
    print(f'\n[1/4] 检查目录...')
    print(f'      源目录: {logos_dir}')
    print(f'      输出文件: {output_file}')

    if not os.path.isdir(logos_dir):
        print(f'\n❌ 错误：目录不存在 {logos_dir}')
        return

    print(f'      ✓ 目录存在')
    
    print(f'\n[2/4] 扫描 PNG 文件...')
    all_files = os.listdir(logos_dir)
    print(f'      目录中共有 {len(all_files)} 个文件')
    
    files = sorted([
        f for f in all_files
        if f.lower().endswith('.png')
    ])
    
    print(f'      ✓ 找到 {len(files)} 个 PNG 文件')
    
    if len(files) > 0:
        print(f'      前 5 个文件: {", ".join(files[:5])}')
        if len(files) > 5:
            print(f'      ...')
            print(f'      后 5 个文件: {", ".join(files[-5:])}')

    print(f'\n[3/4] 生成 JSON 文件...')
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    with open(output_file, 'w', encoding='utf-8') as fp:
        json.dump(files, fp, ensure_ascii=False, indent=2)
    
    file_size = os.path.getsize(output_file)
    print(f'      ✓ 文件已写入')
    print(f'      文件大小: {file_size:,} 字节')

    print(f'\n[4/4] 完成！')
    print(f'      ✓ 已生成 {output_file}')
    print(f'      ✓ 共收录 {len(files)} 个 logo')
    print('\n' + '=' * 60)

if __name__ == '__main__':
    main()
