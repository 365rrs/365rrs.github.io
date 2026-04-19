# 实现计划：admin-panel-split

## 概述

将现有单页管理面板 `admin.html` 拆分为 5 个独立 HTML 页面，放置在 `/admin/` 目录下。核心工作包括：修正 `admin.js` 中的资源路径、创建共享导航结构、逐一创建各功能页面、最后将 `admin.html` 替换为重定向页。

## 任务

- [x] 1. 修正 `admin.js` 中的相对路径
  - 将 `admin.js` 中所有 `./assets/data/default.json` 改为 `../assets/data/default.json`
  - 将 `admin.js` 中所有 `./assets/data/logos-list.json` 改为 `../assets/data/logos-list.json`
  - 将 `admin.js` 中所有 `./assets/images/` 前缀的路径改为 `../assets/images/`
  - 确保修改后原 `admin.html`（根目录）仍可正常访问（根目录下 `./assets/` 与 `/admin/` 下 `../assets/` 均指向同一目录）
  - _需求：8.1、8.2_

- [x] 2. 创建 `/admin/` 目录并实现书签管理页（`bookmarks.html`）
  - [x] 2.1 创建 `admin/bookmarks.html`，包含完整 HTML 文档结构（`<!DOCTYPE html>`、`<head>`、`<body>`）
    - `<head>` 中引用 `../assets/css/bootstrap.css`、`../assets/css/admin.css`、linecons 和 fontawesome CSS
    - `<head>` 中加载 `../assets/js/jquery-1.11.1.min.js`
    - 书签管理 `active` 导航项正确标记
    - _需求：1.1、1.2、1.3、2.1、2.2、2.3、8.1、8.4_
  - [x] 2.2 在 `bookmarks.html` 中内联共享导航 HTML（顶部 `admin-navbar` + 左侧 `admin-sidebar`）
    - 导航链接使用相对路径（`./bookmarks.html`、`./categories.html` 等）
    - 书签管理对应的 `<li>` 添加 `active` CSS 类
    - _需求：2.1、2.2、2.3、2.4_
  - [x] 2.3 将 `admin.html` 中 `#panel-bookmark` 面板的完整 HTML 复制到 `bookmarks.html` 内容区
    - 包含 `#quick-add-block`、数据源切换工具栏、`#bookmark-list` 容器
    - 包含 `#modal-bookmark` 和 `#modal-logo-picker` 两个 Modal
    - _需求：3.1、3.3、3.4_
  - [x] 2.4 在 `bookmarks.html` `</body>` 前按顺序加载脚本并添加初始化代码
    - 脚本顺序：`bootstrap.min.js` → `app.js` → `admin.js`
    - 内联脚本调用 `BookmarkManager.render()` 和 `BookmarkManager._bindEvents()`
    - _需求：3.2、3.5、8.2_

- [x] 3. 创建分类管理页（`admin/categories.html`）
  - [x] 3.1 创建 `admin/categories.html`，复用与 `bookmarks.html` 相同的 `<head>` 结构和共享导航
    - 分类管理对应的 `<li>` 添加 `active` CSS 类，其余不加
    - _需求：1.1、1.2、1.3、2.1、2.2、2.3_
  - [x] 3.2 将 `admin.html` 中 `#panel-category` 面板的完整 HTML 复制到内容区
    - 包含 `#cat-readonly-tip`、数据源切换工具栏、`#category-tree` 容器
    - 包含 `#modal-category` Modal（含图标选择器）
    - _需求：4.1、4.3、4.4_
  - [x] 3.3 在 `categories.html` `</body>` 前加载脚本并添加初始化代码
    - 脚本顺序：`bootstrap.min.js` → `app.js` → `admin.js`
    - 内联脚本调用 `CategoryManager.init()`
    - _需求：4.2、4.5、8.2_

- [x] 4. 创建导入/导出页（`admin/import-export.html`）
  - [x] 4.1 创建 `admin/import-export.html`，复用相同 `<head>` 结构和共享导航
    - 导入/导出对应的 `<li>` 添加 `active` CSS 类
    - _需求：1.1、1.2、1.3、2.1、2.2、2.3_
  - [x] 4.2 将 `admin.html` 中 `#panel-import-export` 面板的完整 HTML 复制到内容区
    - 包含数据源状态栏（`#ie-source-name`）、导出区块、文件导入区块、复制 JSON 区块、粘贴 JSON 区块
    - _需求：5.1、5.3_
  - [x] 4.3 在 `import-export.html` `</body>` 前加载脚本并添加初始化代码
    - 脚本顺序：`bootstrap.min.js` → `app.js` → `admin.js`
    - 内联脚本调用 `ImportExport.init()`
    - _需求：5.2、5.4、8.2_

- [x] 5. 创建 OSS 配置页（`admin/oss-config.html`）
  - [x] 5.1 创建 `admin/oss-config.html`，复用相同 `<head>` 结构和共享导航
    - OSS 配置对应的 `<li>` 添加 `active` CSS 类
    - _需求：1.1、1.2、1.3、2.1、2.2、2.3_
  - [x] 5.2 将 `admin.html` 中 `#panel-oss-config` 面板的完整 HTML 复制到内容区
    - 包含 AccessKeyId、AccessKeySecret、Bucket、Region、基础路径前缀等表单字段
    - 包含保存配置、测试连接、导出配置、导入配置按钮
    - _需求：6.1、6.3、6.4_
  - [x] 5.3 在 `oss-config.html` `</body>` 前按正确顺序加载脚本并添加初始化代码
    - 脚本顺序：`bootstrap.min.js` → 阿里云 OSS SDK（CDN）→ `app.js` → `admin.js`
    - 内联脚本调用 `OSSConfig.init()`
    - _需求：6.2、6.5、8.2、8.3_

- [x] 6. 创建同步状态页（`admin/sync.html`）
  - [x] 6.1 创建 `admin/sync.html`，复用相同 `<head>` 结构和共享导航
    - 同步状态对应的 `<li>` 添加 `active` CSS 类
    - _需求：1.1、1.2、1.3、2.1、2.2、2.3_
  - [x] 6.2 将 `admin.html` 中 `#panel-sync` 面板的完整 HTML 复制到内容区
    - 包含同步状态信息区块（`#sync-status-block`）、手动同步区块、自动同步配置区块
    - 保留 `#sync-goto-oss-config` 链接元素
    - _需求：7.1、7.3、7.4_
  - [x] 6.3 在 `sync.html` `</body>` 前按正确顺序加载脚本并添加初始化代码
    - 脚本顺序：`bootstrap.min.js` → 阿里云 OSS SDK（CDN）→ `app.js` → `admin.js`
    - 内联脚本调用 `SyncManager.renderStatus()` 和 `SyncManager.init()`
    - 在初始化后覆盖 `#sync-goto-oss-config` 点击事件，改为 `window.location.href = './oss-config.html'`
    - _需求：7.2、7.5、7.6、8.2、8.3_

- [x] 7. 检查点 — 验证 5 个页面基本结构
  - 确认 `/admin/` 目录下 5 个 HTML 文件均已创建
  - 确认每个页面的导航激活状态正确（仅当前页对应项有 `active` 类）
  - 确认每个页面的脚本加载顺序符合设计文档要求
  - 如有问题，请向用户说明后再继续。

- [x] 8. 将根目录 `admin.html` 替换为最小化重定向页
  - 用最小化 HTML 替换 `admin.html` 全部内容
  - 包含 `<meta http-equiv="refresh" content="0;url=./admin/bookmarks.html">` 实现无 JS 重定向
  - 包含 `<script>window.location.replace('./admin/bookmarks.html');</script>` 实现有 JS 立即跳转
  - _需求：1.4、9.1、9.2、9.3_

- [x] 9. 最终检查点 — 确保所有任务完成
  - 确认 `admin.html` 重定向逻辑正确
  - 确认 `admin.js` 中路径修改不影响根目录原有 `admin.html`（已被替换为重定向页，无影响）
  - 确认移动端响应式导航样式（`@media max-width: 767px`）在各页面均可生效
  - 如有问题，请向用户说明后再继续。

## 备注

- 标有 `*` 的子任务为可选项，可跳过以加快 MVP 进度
- 本功能无需属性测试（PBT），所有验收标准均为结构/路径/元素存在性检查
- 任务 1 的路径修改是关键前提：`admin.js` 从 `/admin/` 子目录加载时，`./assets/` 会解析为 `/admin/assets/`（404），必须改为 `../assets/`
- OSS 相关页面（`oss-config.html`、`sync.html`）的 OSS SDK 必须在 `app.js` 之前加载，因为 `app.js` 中的 `SyncManager.checkAndSync()` 依赖全局 `OSS` 构造函数
