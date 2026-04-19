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
| aliyun-oss-sdk | 6.18.1 | CDN（`gosspublic.alicdn.com`） | OSS 云端同步（仅 admin.html 使用） |
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
- **`DataSourceManager`** — 管理默认/私有双数据源，读写 `localStorage`
- **`Searcher`** — 搜索过滤，支持中文、拼音全拼、拼音首字母
- **`SyncManager`** — 阿里云 OSS 自动同步（版本比较、下载、定时器）

`APP_VERSION` 常量（格式 `vYYYYMMDD`）用于 `localStorage` key 隔离，每次发布需更新。

## 自定义 CSS（`assets/css/nav.css`）

- `.box2` — 书签卡片基础样式（高度 56px、圆角、边框）
- `.box2:hover` — 悬浮上移 + 阴影效果
- `.overflowClip_1` / `.overflowClip_2` — 单行/双行文本溢出省略
- `#search-input` — 顶部搜索框样式

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
