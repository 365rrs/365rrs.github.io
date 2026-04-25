---
inclusion: always
---

# Product: WebStack

WebStack（webstack.cc）是一个面向设计师的静态网址导航/书签目录站点，收录 UI 设计资源、灵感画廊、设计工具、字体、Mockup、教程及 UED 团队博客等优质链接。

## 核心特性

- **纯前端架构**：无后端、无数据库，部署在静态托管平台（GitHub Pages）
- **数据驱动渲染**：书签数据存储在 `assets/data/default.json`，通过 `app.js` 动态渲染页面
- **双数据源系统**：
  - 默认数据源：只读 JSON 文件（`default.json`）
  - 私有数据源：存储在 `localStorage`，支持个人定制
- **完整管理面板**：
  - 书签管理：按分类展示，支持编辑、删除、快速添加
  - 分类管理：树形结构，支持增删改、图标选择
  - 导入/导出：JSON、Tab Copy、导出到浏览器书签
  - 默认 Logo 配置：设置无 logo 书签的默认图标
  - OSS 云端同步：阿里云 OSS 备份与多端同步
  - 缓存管理：查看、清理、导出浏览器缓存数据
- **智能搜索**：支持中文名称、拼音全拼、拼音首字母匹配（依赖 `pinyin-pro` 库）
- **灵活布局**：支持 4列/6列/12列切换，配置保存在本地
- **懒加载优化**：图片懒加载（lozad.js），提升首屏加载速度
- **响应式设计**：基于 Bootstrap 3 栅格系统，适配桌面和移动端

## 目标用户

UI/UX 设计师、产品经理、前端开发者，寻找精选设计资源和开发工具。

## 页面清单

### 前台页面

| 文件 | 说明 |
|------|------|
| `index.html` | 主导航页（中文），动态渲染书签卡片，支持搜索、数据源切换、列数切换 |
| `about.html` | 关于页，介绍站点和站长 |
| `404.html` | 自定义 404 页 |

### 管理面板（admin/）

| 文件 | 说明 |
|------|------|
| `admin.html` | 管理面板入口（重定向到 bookmarks.html） |
| `admin/bookmarks.html` | 书签管理：按分类展示，支持编辑、删除、快速添加 |
| `admin/categories.html` | 分类管理：树形结构，支持增删改、图标选择 |
| `admin/default-logo.html` | 默认 Logo 配置：设置无 logo 书签的默认图标 |
| `admin/import-export.html` | 导入/导出：JSON、Tab Copy、导出到浏览器书签 |
| `admin/oss-config.html` | OSS 配置：阿里云 OSS 连接信息 |
| `admin/sync.html` | 数据同步：上传/下载、自动同步配置 |
| `admin/cache.html` | 缓存管理：查看、清理、导出浏览器缓存数据 |

### 工具页面（assets/html/）

| 文件 | 说明 |
|------|------|
| `json-formatter.html` | JSON 格式化工具 |
| `loghttp.html` | HTTP 日志工具 |
| `mybatis-sql-parser.html` | MyBatis SQL 解析工具 |
| `sqltool.html` | SQL 工具 |
| `utf8mb4Detector.html` | UTF8MB4 检测工具 |

## 缓存管理功能

### 功能概览

缓存管理面板（`admin/cache.html`）提供完整的浏览器 localStorage 数据管理功能：

- **缓存概览**：显示缓存项总数、WebStack 数据数量、其他数据数量、预估大小
- **缓存详情**：列出所有 WebStack 相关缓存项（`ws_` 前缀），显示 key、描述、大小、预览
- **单项删除**：点击删除按钮可删除单个缓存项
- **批量清理**：
  - 清理 WebStack 数据：删除所有 `ws_` 前缀的缓存项
  - 清空所有缓存：删除浏览器中的所有 localStorage 数据（危险操作）
- **导出备份**：将所有缓存数据导出为 JSON 文件，文件名格式：`webstack-cache-backup-YYYYMMdd-HHmmss.json`

### 缓存项说明

| Key | 说明 |
|-----|------|
| `ws_private_data` | 私有书签数据（完整的分类和书签列表） |
| `ws_active_source` | 当前激活的数据源（default 或 private） |
| `ws_columns` | 每行显示的列数配置（4/6/12） |
| `ws_default_logo` | 用户设置的默认 Logo 路径 |
| `ws_app_version` | 应用版本号 |
| `ws_private_version` | 私有数据版本号（用于云端同步） |
| `ws_sync_config` | 自动同步配置（页面加载时同步、定时同步） |
| `ws_oss_config` | OSS 配置信息（已加密） |
| `ws_last_download_at` | 最后一次从 OSS 下载的时间 |
| `ws_last_download_version` | 最后一次下载的数据版本号 |
| `ws_last_upload_at` | 最后一次上传到 OSS 的时间 |
| `ws_last_upload_version` | 最后一次上传的数据版本号 |

### 使用场景

1. **清理过期数据**：删除不再使用的缓存项，释放存储空间
2. **故障排查**：查看缓存数据内容，诊断数据异常问题
3. **数据迁移**：导出缓存数据，在其他浏览器或设备上恢复
4. **重置应用**：清空所有 WebStack 数据，恢复初始状态

### 安全提示

- **清理前备份**：建议在清理缓存前先导出备份数据
- **危险操作确认**：清空所有缓存需要二次确认，防止误操作
- **数据不可恢复**：删除操作不可撤销，请谨慎操作

## 数据结构（`assets/data/default.json`）

```json
{
  "categories": [
    {
      "id": "cat-xxx",
      "name": "分类名称",
      "icon": "linecons-star",
      "sites": [
        { 
          "name": "站点名", 
          "url": "https://...", 
          "logo": "./assets/images/logos/xxx.png" 
        }
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
          "sites": [
            { "name": "...", "url": "...", "logo": "..." }
          ]
        }
      ]
    }
  ]
}
```

### 数据结构说明

- **分类支持两级**：
  - 一级分类：直接含 `sites` 数组
  - 二级分类：含 `children` 数组，每个子分类含 `sites` 数组
- **必填字段**：
  - `id`：分类唯一标识（格式：`cat-xxx`）
  - `name`：分类名称
  - `icon`：Linecons 图标类名（如 `linecons-star`、`linecons-doc`）
- **书签字段**：
  - `name`：站点名称
  - `url`：站点 URL
  - `logo`：Logo 图片路径（支持多种格式，由 `normalizeLogo()` 统一处理）

## 私有数据源

### 存储机制

- 存储位置：`localStorage`
- Key 格式：`ws_private_data`（当前版本已移除版本后缀）
- 数据结构：与 `default.json` 相同
- 版本管理：
  - `ws_private_version`：私有数据版本号（格式：YYYYMMDDHHmmss）
  - `ws_app_version`：应用版本号（格式：vYYYYMMDD）

### 功能特性

- **本地编辑**：通过管理面板创建/编辑，实时保存到 localStorage
- **导入/导出**：支持 JSON 格式导入导出
- **Tab Copy 导入**：从浏览器标签页批量导入书签
- **导出到浏览器**：生成浏览器书签 HTML 文件
- **云端同步**：阿里云 OSS 备份与多端同步
  - 版本文件：`version.json`（记录最新版本号）
  - 数据文件：`data-{版本号}.json`（完整书签数据）
  - 自动同步：支持页面加载时同步、定时同步

### 数据源切换

顶部导航栏"数据源切换"按钮（`#datasource-btn`）：
- 默认数据源：只读，展示官方精选书签
- 私有数据源：可编辑，支持个人定制
- 切换时自动重新渲染页面

## 用户交互流程

### 浏览书签

1. 打开 `index.html`
2. 左侧侧边栏显示分类导航
3. 右侧内容区显示书签卡片（默认 4 列布局）
4. 点击卡片在新标签页打开站点
5. 使用顶部搜索框过滤书签（支持中文、拼音）

### 管理书签（私有数据源）

1. 切换到私有数据源（首次需在管理面板初始化）
2. 点击"管理面板"进入后台
3. 书签管理：
   - 查看所有书签（按分类展示）
   - 编辑书签信息（名称、URL、Logo）
   - 删除书签（确认后立即生效）
   - 快速添加书签（输入 URL 自动获取标题）
4. 分类管理：
   - 添加/编辑/删除分类
   - 选择分类图标（Linecons 图标库）
   - 调整分类层级（一级/二级）
5. 导入/导出：
   - 导出 JSON：备份私有数据
   - 导入 JSON：恢复或迁移数据
   - Tab Copy 导入：从浏览器标签页批量导入
   - 导出到浏览器：生成浏览器书签文件
6. 云端同步：
   - 配置 OSS 连接信息
   - 手动上传/下载
   - 开启自动同步（页面加载时/定时）

### 删除书签（前台快捷操作）

1. 切换到私有数据源
2. 悬浮在书签卡片上
3. 点击右上角删除按钮（`×`）
4. 确认删除
5. 页面自动刷新

## 技术亮点

- **纯前端实现**：无需服务器，部署成本低
- **数据驱动**：JSON 数据与 UI 分离，易于维护
- **模块化设计**：Renderer、DataSourceManager、Searcher、SyncManager 职责清晰
- **ES5 兼容**：支持旧版浏览器
- **懒加载优化**：图片按需加载，提升性能
- **中文友好**：拼音搜索，支持中文输入法
- **云端同步**：OSS 备份，多端数据一致
- **响应式布局**：适配桌面和移动端
- **灵活配置**：列数切换、默认 Logo、自动同步等
