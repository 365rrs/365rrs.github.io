---
inclusion: always
---

# Project Structure

```
/
├── index.html              # 主导航页（中文），动态渲染书签卡片
├── about.html              # 关于页
├── admin.html              # 管理面板（书签/分类管理、导入导出、OSS 同步）
├── 404.html                # 自定义 404 页
├── CNAME                   # GitHub Pages 自定义域名配置
├── _run_gen.py             # 辅助脚本（非构建流程）
│
└── assets/
    ├── css/
    │   ├── bootstrap.css
    │   ├── nav.css                  # 项目自定义样式（卡片、悬浮效果、搜索框、文本溢出）
    │   ├── admin.css                # 管理面板专用样式
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
    │   ├── app.js                   # 核心应用逻辑（Renderer / DataSourceManager / Searcher / SyncManager）
    │   ├── admin.js                 # 管理面板逻辑
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
        ├── logos/                   # 站点 Logo 图标（PNG，约 258 个）
        ├── flags/                   # 语言旗帜图标（flag-cn.png、flag-us.png）
        └── *.png / *.gif            # 品牌图、预览图、QQ 群二维码等
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
<div class="col-sm-3">
  <div class="xe-widget xe-conversations box2 label-info"
       onclick="window.open('https://...', '_blank')"
       data-toggle="tooltip" data-placement="bottom"
       data-original-title="https://...">
    <div class="xe-comment-entry">
      <a class="xe-user-img">
        <img data-src="./assets/images/logos/xxx.png"
             class="lozad img-circle" width="40" alt="站点名">
      </a>
      <div class="xe-comment">
        <a href="#" class="xe-user-name overflowClip_1">
          <strong>站点名称</strong>
        </a>
      </div>
    </div>
  </div>
</div>
```

- 图片必须用 `data-src`（不是 `src`），并加 `class="lozad"` 才能懒加载
- 卡片宽度为 Bootstrap 栅格 `col-sm-3`（每行 4 个）

### 添加新分类

在 `assets/data/default.json` 的 `categories` 数组中追加分类对象，`icon` 使用 Linecons 类名。

### 侧边栏导航

由 `Renderer._buildMenuItem` 根据 JSON 数据动态生成，无需手动编辑 HTML。

### 资源路径

- `index.html` 中引用 assets 使用 `./assets/` 相对路径
- JSON 数据中 logo 路径使用 `./assets/images/logos/xxx.png`

### localStorage Key 规范

所有 key 通过 `wsKey(name)` 生成，格式为 `ws_<name>_<APP_VERSION>`，例如：
- `ws_private_data_v20260418`
- `ws_active_source_v20260418`
- `ws_sync_config_v20260418`
- `ws_oss_config_v20260418`

更新 `APP_VERSION` 后旧版本数据自动隔离（不会被读取）。
