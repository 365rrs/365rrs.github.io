import os, json
d = 'assets/images/logos'
files = sorted([f for f in os.listdir(d) if f.lower().endswith('.png')])
with open('assets/data/logos-list.json', 'w', encoding='utf-8') as fp:
    json.dump(files, fp, ensure_ascii=False, indent=2)
print('Generated', len(files), 'logos')
