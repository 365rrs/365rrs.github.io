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
    logos_dir = os.path.normpath(LOGOS_DIR)
    output_file = os.path.normpath(OUTPUT_FILE)

    if not os.path.isdir(logos_dir):
        print(f'错误：目录不存在 {logos_dir}')
        return

    files = sorted([
        f for f in os.listdir(logos_dir)
        if f.lower().endswith('.png')
    ])

    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    with open(output_file, 'w', encoding='utf-8') as fp:
        json.dump(files, fp, ensure_ascii=False, indent=2)

    print(f'✓ 已生成 {output_file}，共 {len(files)} 个 logo')

if __name__ == '__main__':
    main()
