---
inclusion: always
---

# Tech Stack

## 概述

纯静态 HTML/CSS/JS，无构建系统、无包管理器、无编译步骤。直接编辑 HTML/JS/CSS 文件后推送即可部署。

## 框架与库

| 库 | 版本 | 路径 | 用途 |
|----|------|------|------|
| jQuery | 1.11.1 | `assets/js/jquery-1.11.1.min.js` | DOM 操作、事件处理、AJAX |
| Bootstrap | 3.x | `assets/css/bootstrap.css` / `assets/js/bootstrap.min.js` | 栅格、组件、Modal |
| TweenMax | — | `assets/js/TweenMax.min.js` | 侧边栏展开/收起、滚动动画 |
| lozad.js | — | `assets/js/lozad.js` | 图片懒加载（`data-src` + `class="lozad"`） |
| pinyin-pro | 3.x | CDN（`cdn.jsdelivr.net`） | 中文拼音搜索支持 |
| aliyun-oss-sdk | 6.18.1 | CDN（`gosspublic.alicdn.com`） | OSS 云端同步（管理面板使用） |
| Xenon Theme | — | `xenon-*.css` / `xenon-*.js` | 管理后台 UI 主题（侧边栏、导航栏、卡片组件） |

## Xenon 主题文件

- `assets/css/xenon-core.css` — 主题基础样式
- `assets/css/xenon-components.css` — 组件样式
- `assets/css/xenon-skins.css` — 皮肤/配色
- `assets/css/xenon-forms.css` — 表单样式
- `assets/js/xenon-api.js` — 主题 API
- `assets/js/xenon-custom.js` — 侧边栏、菜单、Widget 初始化
- `assets/js/xenon-toggles.js` — 折叠/展开切换

## 图标字体

- Font Awesome（`assets/css/fonts/fontawesome/`）— 通用图标，类名前缀 `fa-`
- Linecons（`assets/css/fonts/linecons/`）— 线条风格图标，类名前缀 `linecons-`
- Elusive Icons（`assets/css/fonts/elusive/`）
- Meteocons（`assets/css/fonts/meteocons/`）
- Glyphicons（`assets/css/fonts/glyphicons/`）— Bootstrap 内置

## 自定义 JS 模块（`assets/js/app.js`）

ES5 风格，兼容 jQuery 1.11.1，包含以下模块：

- **`Renderer`** — 根据 JSON 数据动态渲染侧边栏菜单和书签卡片
  - `render(data)` — 渲染完整页面
  - `_buildCard(site, categoryId, siteUrl)` — 生成单个书签卡片 HTML
  - `_buildMenuItem(category)` — 生成侧边栏菜单项
  - `_buildSection(category)` — 生成内容区分类区块
  - `deleteBookmark(event, categoryId, siteUrl)` — 删除书签（私有数据源）
  - `clear()` — 清空动态内容

- **`ColumnsManager`** — 管理每行显示数量配置（新增功能）
  - 支持 4列（col-sm-3）、6列（col-sm-2）、12列（col-sm-1）
  - `getColumns()` — 获取当前列数配置
  - `getColumnClass(columns)` — 获取对应的 Bootstrap 栅格类
  - `applyColumns(columns)` — 应用列数配置并重新渲染
  - `toggleColumns()` — 切换到下一个列数配置

- **`DataSourceManager`** — 管理默认/私有双数据源，读写 `localStorage`
  - `getActive()` — 获取当前激活数据源（"default" | "private"）
  - `load(source)` — 读取数据源，返回 jQuery Deferred
  - `switchTo(source)` — 切换数据源并重新渲染
  - `getPrivateData()` — 读取私有数据对象
  - `savePrivateData(data)` — 保存私有数据到 localStorage

- **`Searcher`** — 搜索过滤，支持中文、拼音全拼、拼音首字母
  - `init()` — 绑定搜索框事件（支持中文输入法 composition 事件）
  - `filter(keyword)` — 过滤卡片显示

- **`SyncManager`** — 阿里云 OSS 自动同步（版本比较、下载、定时器）
  - `checkAndSync()` — 检查 OSS 版本并按需下载
  - `startTimer(intervalSeconds)` — 启动定时同步
  - `stopTimer()` — 停止定时同步

### 关键函数

- **`normalizeLogo(logo)`** — 规范化 logo 路径，统一转为绝对路径
  - 支持纯文件名、相对路径、绝对路径、外部 URL
  - 无 logo 时读取用户设置的默认 logo（`localStorage.ws_default_logo`）

- **`wsKey(name)`** — 生成带版本后缀的 localStorage key
  - 格式：`ws_<name>_<APP_VERSION>`（当前已改为不带版本后缀：`ws_<name>`）

### 应用版本号

`APP_VERSION` 常量（格式 `vYYYYMMDD`，当前值：`v20260418`）用于 `localStorage` key 隔离，每次发布需更新。

## 自定义 CSS

### `assets/css/nav.css` — 主页样式

- `.box2` — 书签卡片基础样式（高度 64px、圆角 4px、边框）
- `.box2:hover` — 悬浮上移 6px + 阴影效果
- `.bookmark-card` — 书签卡片容器（相对定位）
- `.bookmark-delete-btn` — 删除按钮（默认隐藏，悬浮时显示，仅私有数据源）
- `.overflowClip_1` / `.overflowClip_2` — 单行/双行文本溢出省略
- `#search-input` — 顶部搜索框样式（居中显示，宽度 400px，聚焦时 500px）
- `.xe-comment-entry img` — Logo 图片样式（32px，圆角可配置：0=直角，4px=轻微，50%=圆形）
- `.col-custom-8` / `.col-custom-10` — 自定义栅格类（8列、10列布局）

### `assets/css/admin.css` — 管理面板样式

完整的管理后台 UI 样式，包括：
- 顶部导航栏（`.admin-navbar`）
- 左侧标签页导航（`.admin-sidebar`、`.admin-tabs`）
- 右侧内容区（`.admin-content`、`.admin-panel`）
- 分类管理（`.cat-toolbar`、`.cat-list`、`.cat-item-row`）
- 书签管理（`.bm-block`、`.bm-site-row`）
- 图标选择器（`.icon-picker`、`.icon-option`）
- 导入/导出面板（`.ie-block`、`.ie-textarea`）
- OSS 配置 & 同步（`.oss-btn-row`、`.sync-status-row`）
- Logo 选择器（`.logo-pick-item`）
- Tab Copy 导入预览（`.tab-copy-preview-list`）
- 导出到浏览器（`.be-tree-container`、`.be-category-row`、`.be-site-row`）

## 脚本加载顺序

```html
<!-- <head> 中 -->
<script src="./assets/js/jquery-1.11.1.min.js"></script>

<!-- </body> 前 -->
<script src="./assets/js/bootstrap.min.js"></script>
<script src="./assets/js/TweenMax.min.js"></script>
<script src="./assets/js/resizeable.js"></script>
<script src="./assets/js/joinable.js"></script>
<script src="./assets/js/xenon-api.js"></script>
<script src="./assets/js/xenon-toggles.js"></script>
<script src="./assets/js/xenon-custom.js"></script>
<script src="https://cdn.jsdelivr.net/npm/pinyin-pro@3/dist/index.js"></script>
<script src="./assets/js/app.js"></script>
<script src="./assets/js/lozad.js"></script>  <!-- 必须最后 -->
```

## 统计与广告

- 百度统计：内联脚本（`hm.baidu.com`）
- Google AdSense：内联脚本（`pagead2.googlesyndication.com`）
- 均在 `<head>` 顶部内联，不抽取为外部文件

## 部署

- 静态文件托管（GitHub Pages 或同类平台）
- 无构建命令，直接编辑推送
- `CNAME` 文件配置自定义域名
