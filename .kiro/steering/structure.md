---
inclusion: always
---

# Project Structure

```
/
├── index.html              # 主导航页（中文），动态渲染书签卡片
├── about.html              # 关于页
├── admin.html              # 管理面板入口（重定向到 admin/bookmarks.html）
├── 404.html                # 自定义 404 页
├── CNAME                   # GitHub Pages 自定义域名配置
├── _run_gen.py             # 辅助脚本（非构建流程）
│
├── admin/                  # 管理面板页面
│   ├── bookmarks.html      # 书签管理
│   ├── categories.html     # 分类管理
│   ├── default-logo.html   # 默认 Logo 配置
│   ├── import-export.html  # 导入/导出
│   ├── oss-config.html     # OSS 配置
│   ├── sync.html           # 数据同步
│   └── cache.html          # 缓存管理
│
└── assets/
    ├── css/
    │   ├── bootstrap.css
    │   ├── nav.css                  # 项目自定义样式（卡片、悬浮效果、搜索框、文本溢出、删除按钮）
    │   ├── admin.css                # 管理面板专用样式（完整的后台 UI）
    │   ├── xenon-core.css           # Xenon 主题基础
    │   ├── xenon-components.css
    │   ├── xenon-skins.css
    │   ├── xenon-forms.css
    │   ├── xenon.css
    │   └── fonts/                   # 图标字体（fontawesome、linecons、elusive、meteocons、glyphicons）
    ├── js/
    │   ├── jquery-1.11.1.min.js
    │   ├── bootstrap.min.js
    │   ├── TweenMax.min.js
    │   ├── lozad.js                 # 图片懒加载（必须最后加载）
    │   ├── app.js                   # 核心应用逻辑（Renderer / ColumnsManager / DataSourceManager / Searcher / SyncManager）
    │   ├── admin.js                 # 管理面板逻辑（未在文件树中看到，可能内联在各 admin/*.html 中）
    │   ├── xenon-api.js
    │   ├── xenon-custom.js          # Xenon 主题 JS（侧边栏、菜单、Widget）
    │   ├── xenon-toggles.js
    │   ├── resizeable.js
    │   └── joinable.js
    ├── data/
    │   ├── default.json             # 默认书签数据（categories 数组，支持两级分类）
    │   └── logos-list.json          # Logo 文件列表（管理面板 Logo 选择器使用）
    ├── html/
    │   ├── json-formatter.html      # 工具页：JSON 格式化
    │   ├── loghttp.html             # 工具页：HTTP 日志
    │   ├── mybatis-sql-parser.html  # 工具页：MyBatis SQL 解析
    │   ├── sqltool.html             # 工具页：SQL 工具
    │   └── utf8mb4Detector.html     # 工具页：UTF8MB4 检测
    └── images/
        ├── logos/                   # 站点 Logo 图标（PNG，约 274 个）
        ├── flags/                   # 语言旗帜图标（flag-cn.png、flag-us.png）
        └── *.png / *.gif            # 品牌图、预览图、favicon 等
```

## 开发约定

### 添加新书签卡片

在 `assets/data/default.json` 对应分类的 `sites` 数组中追加：

```json
{
  "name": "站点名称",
  "url": "https://example.com/",
  "logo": "./assets/images/logos/example.png"
}
```

Logo 图片放入 `assets/images/logos/`，建议尺寸 120×120px PNG。

### 书签卡片 HTML 结构（`Renderer._buildCard` 生成）

```html
<div class="col-sm-3">  <!-- 或 col-sm-2、col-sm-1、col-custom-8、col-custom-10，取决于列数配置 -->
  <div class="xe-widget xe-conversations box2 label-info bookmark-card"
       onclick="window.open('https://...', '_blank')"
       data-toggle="tooltip" data-placement="bottom"
       title="" data-original-title="https://...">
    <!-- 删除按钮（仅私有数据源显示） -->
    <span class="bookmark-delete-btn" 
          onclick="Renderer.deleteBookmark(event, 'cat-id', 'https://...')"
          data-category-id="cat-id" data-site-url="https://..."
          title="删除此书签">&times;</span>
    <div class="xe-comment-entry">
      <span class="xe-user-img">
        <img data-src="./assets/images/logos/xxx.png"
             class="lozad img-circle" width="40" alt="站点名">
      </span>
      <div class="xe-comment">
        <span class="xe-user-name overflowClip_1">
          <strong>站点名称</strong>
        </span>
      </div>
    </div>
  </div>
</div>
```

- 图片必须用 `data-src`（不是 `src`），并加 `class="lozad"` 才能懒加载
- 卡片宽度根据列数配置动态生成：
  - 4列：`col-sm-3`（默认）
  - 6列：`col-sm-2`
  - 12列：`col-sm-1`
- 删除按钮使用内联 `onclick` 调用 `Renderer.deleteBookmark()`，并阻止事件冒泡

### 添加新分类

在 `assets/data/default.json` 的 `categories` 数组中追加分类对象，`icon` 使用 Linecons 类名。

### 侧边栏导航

由 `Renderer._buildMenuItem` 根据 JSON 数据动态生成，无需手动编辑 HTML。
动态渲染后需调用 `Renderer._initSubMenus()` 重新绑定子菜单展开/收起事件。

### 资源路径

- `index.html` 中引用 assets 使用 `./assets/` 相对路径
- JSON 数据中 logo 路径支持多种格式（由 `normalizeLogo()` 统一处理）：
  - 纯文件名：`"dribbble.png"` → `/assets/images/logos/dribbble.png`
  - 相对路径：`"./assets/images/logos/dribbble.png"` → `/assets/images/logos/dribbble.png`
  - 绝对路径：`"/assets/images/logos/dribbble.png"` → 原样返回
  - 外部 URL：`"https://example.com/logo.png"` → 原样返回

### localStorage Key 规范

所有 key 通过 `wsKey(name)` 生成，当前格式为 `ws_<name>`（已移除版本后缀），例如：
- `ws_private_data`
- `ws_active_source`
- `ws_sync_config`
- `ws_oss_config`
- `ws_columns` — 列数配置
- `ws_default_logo` — 用户设置的默认 logo
- `ws_app_version` — 应用版本号
- `ws_private_version` — 私有数据版本号
- `ws_last_download_at` — 最后下载时间
- `ws_last_download_version` — 最后下载版本

注意：代码中 `wsKey()` 函数已注释掉版本后缀逻辑，但保留了兼容旧版本的读取逻辑。

### 管理面板结构

`admin.html` 是入口页，通过 `<meta http-equiv="refresh">` 和 JavaScript 重定向到 `admin/bookmarks.html`。

管理面板采用左侧标签页导航 + 右侧内容区布局：
- 左侧导航：`.admin-sidebar` > `.admin-tabs` > `.admin-tab`
- 右侧内容：`.admin-content` > `.admin-panel`（通过 `.active` 类控制显示）

各管理页面：
- **bookmarks.html** — 书签管理（按分类展示，支持编辑、删除、快速添加）
- **categories.html** — 分类管理（树形结构，支持增删改、图标选择）
- **default-logo.html** — 默认 Logo 配置（设置无 logo 书签的默认图标）
- **import-export.html** — 导入/导出（JSON、Tab Copy、导出到浏览器书签）
- **oss-config.html** — OSS 配置（阿里云 OSS 连接信息）
- **sync.html** — 数据同步（上传/下载、自动同步配置）

### 列数配置功能

顶部导航栏新增"列数切换"按钮（`#columns-btn`），点击可循环切换：
- 4列（默认）
- 6列
- 12列

配置保存在 `localStorage.ws_columns`，页面加载时自动应用。

### 删除书签功能

私有数据源模式下，书签卡片右上角显示删除按钮（`×`），点击后：
1. 弹出确认对话框
2. 从私有数据中删除对应书签
3. 保存到 localStorage
4. 重新渲染页面

删除按钮通过 CSS 控制：默认 `opacity: 0`，悬浮时 `opacity: 1`。
