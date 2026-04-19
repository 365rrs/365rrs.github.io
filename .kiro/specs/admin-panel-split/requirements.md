# 需求文档

## 简介

将现有的单页管理面板（`admin.html`）拆分为 5 个独立的 HTML 页面，统一放置在 `/admin/` 目录下。每个页面对应一个功能模块，所有页面共享统一的左侧导航栏，导航栏高亮当前所在页面。拆分后原 `admin.html` 保持兼容性重定向。

项目技术约束：纯静态 HTML/CSS/JS，无构建系统，使用 jQuery 1.11.1、Bootstrap 3.x、ES5 语法。

## 术语表

- **Admin_Pages**：`/admin/` 目录下的 5 个独立管理页面的统称
- **Shared_Nav**：所有管理页面共用的左侧导航栏组件（通过公共 HTML 片段或内联方式实现）
- **Active_Page**：用户当前正在访问的管理页面
- **Bookmark_Page**：`/admin/bookmarks.html`，书签管理页
- **Category_Page**：`/admin/categories.html`，分类管理页
- **ImportExport_Page**：`/admin/import-export.html`，导入/导出页
- **OSSConfig_Page**：`/admin/oss-config.html`，OSS 配置页
- **Sync_Page**：`/admin/sync.html`，同步状态页
- **Asset_Path**：相对于 `/admin/` 目录的资源路径，需使用 `../assets/` 前缀

---

## 需求

### 需求 1：页面拆分与目录结构

**用户故事：** 作为管理员，我希望每个功能模块有独立的 URL，以便直接通过书签或链接访问特定功能页面。

#### 验收标准

1. THE Admin_Pages SHALL 包含以下 5 个独立 HTML 文件：`/admin/bookmarks.html`、`/admin/categories.html`、`/admin/import-export.html`、`/admin/oss-config.html`、`/admin/sync.html`
2. THE Admin_Pages SHALL 各自引用正确的 Asset_Path（`../assets/` 前缀），确保 CSS、JS、图片资源正常加载
3. THE Admin_Pages SHALL 各自包含完整的 HTML 文档结构（`<!DOCTYPE html>`、`<head>`、`<body>`），可独立在浏览器中打开
4. WHEN 用户访问 `admin.html`，THE System SHALL 通过 `<meta http-equiv="refresh">` 或 JavaScript 重定向至 `/admin/bookmarks.html`

---

### 需求 2：统一左侧导航栏

**用户故事：** 作为管理员，我希望所有管理页面都有一致的左侧导航栏，以便在不同功能模块之间快速切换。

#### 验收标准

1. THE Shared_Nav SHALL 在所有 5 个 Admin_Pages 中以相同的 HTML 结构和样式呈现
2. THE Shared_Nav SHALL 包含指向全部 5 个页面的导航链接，链接使用相对路径（如 `./bookmarks.html`）
3. WHEN 用户访问某个 Admin_Page，THE Shared_Nav SHALL 将对应导航项标记为激活状态（`active` CSS 类）
4. THE Shared_Nav SHALL 包含顶部导航栏（logo、标题、返回主页链接），与现有 `admin.html` 视觉风格保持一致
5. THE Shared_Nav SHALL 在移动端（视口宽度 ≤ 767px）自动切换为顶部横向滚动导航，与现有响应式行为一致

---

### 需求 3：书签管理页（Bookmark_Page）

**用户故事：** 作为管理员，我希望在独立页面中管理书签，以便专注于书签的增删改操作。

#### 验收标准

1. THE Bookmark_Page SHALL 包含现有 `admin.html` 中 `#panel-bookmark` 面板的全部 HTML 结构和功能
2. THE Bookmark_Page SHALL 加载并初始化 `BookmarkManager` 模块（来自 `../assets/js/admin.js`）
3. THE Bookmark_Page SHALL 包含快速添加书签区域（`#quick-add-block`）、数据源切换工具栏、书签列表容器（`#bookmark-list`）
4. THE Bookmark_Page SHALL 包含添加/编辑书签 Modal（`#modal-bookmark`）和 Logo 选择器 Modal（`#modal-logo-picker`）
5. WHEN 页面加载完成，THE Bookmark_Page SHALL 自动调用 `BookmarkManager.render()` 和 `BookmarkManager._bindEvents()` 渲染书签列表

---

### 需求 4：分类管理页（Category_Page）

**用户故事：** 作为管理员，我希望在独立页面中管理分类，以便专注于分类结构的维护。

#### 验收标准

1. THE Category_Page SHALL 包含现有 `admin.html` 中 `#panel-category` 面板的全部 HTML 结构和功能
2. THE Category_Page SHALL 加载并初始化 `CategoryManager` 模块（来自 `../assets/js/admin.js`）
3. THE Category_Page SHALL 包含只读提示（`#cat-readonly-tip`）、数据源切换工具栏、分类树容器（`#category-tree`）
4. THE Category_Page SHALL 包含添加/编辑分类 Modal（`#modal-category`）及图标选择器
5. WHEN 页面加载完成，THE Category_Page SHALL 自动调用 `CategoryManager.init()` 渲染分类树

---

### 需求 5：导入/导出页（ImportExport_Page）

**用户故事：** 作为管理员，我希望在独立页面中进行数据导入导出，以便管理书签数据的备份与迁移。

#### 验收标准

1. THE ImportExport_Page SHALL 包含现有 `admin.html` 中 `#panel-import-export` 面板的全部 HTML 结构和功能
2. THE ImportExport_Page SHALL 加载并初始化 `ImportExport` 模块（来自 `../assets/js/admin.js`）
3. THE ImportExport_Page SHALL 包含数据源状态栏、导出数据区块、文件导入区块、复制 JSON 区块、粘贴 JSON 区块
4. WHEN 页面加载完成，THE ImportExport_Page SHALL 自动调用 `ImportExport.init()` 初始化导入导出功能

---

### 需求 6：OSS 配置页（OSSConfig_Page）

**用户故事：** 作为管理员，我希望在独立页面中配置 OSS 参数，以便管理云端同步的连接信息。

#### 验收标准

1. THE OSSConfig_Page SHALL 包含现有 `admin.html` 中 `#panel-oss-config` 面板的全部 HTML 结构和功能
2. THE OSSConfig_Page SHALL 加载阿里云 OSS SDK（`https://gosspublic.alicdn.com/aliyun-oss-sdk-6.18.1.min.js`）和 `OSSConfig` 模块
3. THE OSSConfig_Page SHALL 包含 AccessKeyId、AccessKeySecret、Bucket、Region、基础路径前缀等配置表单字段
4. THE OSSConfig_Page SHALL 包含保存配置、测试连接、导出配置、导入配置等操作按钮
5. WHEN 页面加载完成，THE OSSConfig_Page SHALL 自动调用 `OSSConfig.init()` 加载已保存的配置

---

### 需求 7：同步状态页（Sync_Page）

**用户故事：** 作为管理员，我希望在独立页面中查看和管理同步状态，以便监控数据的云端备份情况。

#### 验收标准

1. THE Sync_Page SHALL 包含现有 `admin.html` 中 `#panel-sync` 面板的全部 HTML 结构和功能
2. THE Sync_Page SHALL 加载阿里云 OSS SDK 和 `SyncManager` 模块
3. THE Sync_Page SHALL 包含同步状态信息区块（最后上传/下载时间、版本号、本地版本、应用版本）
4. THE Sync_Page SHALL 包含手动同步区块（上传至 OSS、从 OSS 下载按钮）和自动同步配置区块
5. WHEN 页面加载完成，THE Sync_Page SHALL 自动调用 `SyncManager.renderStatus()` 和 `SyncManager.init()` 初始化同步状态
6. WHEN 用户点击同步页面中的"OSS 配置"链接，THE Sync_Page SHALL 导航至 `./oss-config.html`

---

### 需求 8：资源路径与脚本加载

**用户故事：** 作为开发者，我希望所有页面的资源引用路径正确，以便页面在 `/admin/` 子目录下正常运行。

#### 验收标准

1. THE Admin_Pages SHALL 使用 `../assets/` 前缀引用所有本地 CSS 和 JS 资源
2. THE Admin_Pages SHALL 按照以下顺序加载脚本：jQuery → Bootstrap → `../assets/js/app.js` → `../assets/js/admin.js`
3. WHERE OSS 功能被使用，THE Admin_Pages SHALL 在 jQuery 之后、`app.js` 之前加载阿里云 OSS SDK
4. THE Admin_Pages SHALL 在 `<head>` 中引用 `../assets/css/admin.css` 和 `../assets/css/bootstrap.css` 及所需图标字体 CSS

---

### 需求 9：原 admin.html 兼容性重定向

**用户故事：** 作为用户，我希望访问原有的 `admin.html` 链接时能自动跳转到新的管理面板，以便不破坏已有书签或链接。

#### 验收标准

1. WHEN 用户访问根目录下的 `admin.html`，THE System SHALL 在 1 秒内将用户重定向至 `/admin/bookmarks.html`
2. THE admin.html SHALL 保留原有文件，仅替换内容为包含重定向逻辑的最小化 HTML
3. IF 浏览器不支持 JavaScript，THEN THE admin.html SHALL 通过 `<meta http-equiv="refresh" content="0;url=./admin/bookmarks.html">` 实现重定向
