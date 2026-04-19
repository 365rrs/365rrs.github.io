---
inclusion: always
---

# Product: WebStack

WebStack（webstack.cc）是一个面向设计师的静态网址导航/书签目录站点，收录 UI 设计资源、灵感画廊、设计工具、字体、Mockup、教程及 UED 团队博客等优质链接。

## 核心特性

- 纯前端、无后端，部署在静态托管平台（GitHub Pages）
- 数据驱动：书签数据存储在 `assets/data/default.json`，通过 `app.js` 动态渲染页面
- 双数据源：默认数据源（只读 JSON 文件）+ 私有数据源（存储在 `localStorage`）
- 管理面板（`admin.html`）：支持书签/分类的增删改、导入/导出 JSON、阿里云 OSS 云端同步
- 搜索功能：支持中文名称、拼音全拼、拼音首字母匹配（依赖 `pinyin-pro` 库）

## 目标用户

UI/UX 设计师、产品经理，寻找精选设计资源。

## 页面清单

| 文件 | 说明 |
|------|------|
| `index.html` | 主导航页（中文），动态渲染书签卡片 |
| `about.html` | 关于页，介绍站点和站长 |
| `admin.html` | 管理面板，书签/分类管理、导入导出、OSS 同步 |
| `404.html` | 自定义 404 页 |

## 数据结构（`assets/data/default.json`）

```json
{
  "categories": [
    {
      "id": "cat-xxx",
      "name": "分类名称",
      "icon": "linecons-star",
      "sites": [
        { "name": "站点名", "url": "https://...", "logo": "./assets/images/logos/xxx.png" }
      ]
    },
    {
      "id": "cat-yyy",
      "name": "父分类",
      "icon": "linecons-lightbulb",
      "children": [
        {
          "id": "cat-yyy-sub",
          "name": "子分类",
          "sites": [...]
        }
      ]
    }
  ]
}
```

- 分类支持两级：一级直接含 `sites`，或含 `children`（子分类数组，每个子分类含 `sites`）
- `icon` 字段使用 Linecons 图标类名（如 `linecons-star`、`linecons-doc`）

## 私有数据源

- 存储在 `localStorage`，key 格式：`ws_private_data_<APP_VERSION>`
- 通过管理面板创建/编辑，支持导入/导出 JSON
- 支持阿里云 OSS 云端备份与多端同步（version.json + data-{版本号}.json）
