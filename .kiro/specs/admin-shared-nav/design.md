# 设计文档：admin-shared-nav

## 概述

本功能将 `/admin/` 目录下 5 个独立 HTML 页面中重复内联的导航代码（顶部 Navbar + 左侧 Sidebar）提取为单一 JS 文件 `assets/js/admin-nav.js`，通过 JavaScript 动态注入到每个页面。

**核心目标**：改一处，同步所有页面。后续新增或修改菜单项只需编辑 `admin-nav.js` 中的 `NAV_CONFIG` 数组，无需逐一修改 5 个 HTML 文件。

**技术约束**：
- 纯静态项目，无构建系统
- ES5 语法，兼容 jQuery 1.11.1 + Bootstrap 3.x
- 不引入任何新的第三方库或构建工具

---

## 架构

整体采用"集中配置 + 运行时注入"模式：

```
┌─────────────────────────────────────────────────────┐
│  assets/js/admin-nav.js                             │
│                                                     │
│  NAV_CONFIG[]          ← 菜单项集中定义（单一位置）  │
│       │                                             │
│       ▼                                             │
│  AdminNav._buildNavbarHtml()  → Navbar HTML 字符串  │
│  AdminNav._buildSidebarHtml() → Sidebar HTML 字符串 │
│       │                                             │
│       ▼                                             │
│  AdminNav._inject()    ← $(document).ready() 触发   │
│       │                                             │
│       ├─ $('body').prepend(navbarHtml)              │
│       ├─ $('.admin-container').prepend(sidebarHtml) │
│       └─ AdminNav._setActive()                      │
│               │                                     │
│               └─ window.location.pathname 匹配      │
└─────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  Admin Pages（bookmarks / categories / ...）         │
│                                                      │
│  <head>                                              │
│    <script src="../assets/js/jquery-1.11.1.min.js"> │
│    <script src="../assets/js/admin-nav.js">  ← 新增 │
│  </head>                                             │
│  <body class="admin-body">                           │
│    <!-- 移除内联 navbar + sidebar -->                │
│    <div class="admin-container">                     │
│      <!-- 移除内联 .admin-sidebar -->                │
│      <div class="admin-content">...</div>            │
│    </div>                                            │
│  </body>                                             │
└──────────────────────────────────────────────────────┘
```

**设计决策**：

1. **为何选择 JS 注入而非服务端 include**：项目是纯静态托管，无服务端能力，JS 注入是唯一可行的运行时方案。
2. **为何在 `<head>` 中引入而非 `</body>` 前**：`admin-nav.js` 内部使用 `$(document).ready()` 等待 DOM 就绪，因此在 `<head>` 中引入不会阻塞页面渲染，同时确保在业务脚本之前完成注入，避免业务脚本依赖导航 DOM 时出现竞态。
3. **为何使用 `prepend` 而非 `append`**：Navbar 需要位于 `<body>` 最顶部，Sidebar 需要位于 `.admin-container` 最前面，`prepend` 语义最直接。

---

## 组件与接口

### `AdminNav` 对象（`assets/js/admin-nav.js`）

对外暴露为全局对象 `window.AdminNav`，内部结构如下：

```javascript
var AdminNav = (function ($) {

    // ── 公共配置（唯一维护位置）──────────────────────────
    var NAV_CONFIG = [
        { href: './bookmarks.html',    label: '&#128278; 书签管理' },
        { href: './categories.html',   label: '&#128218; 分类管理' },
        { href: './import-export.html',label: '&#128230; 导入/导出' },
        { href: './oss-config.html',   label: '&#9729;&#65039; OSS 配置' },
        { href: './sync.html',         label: '&#128260; 同步状态' }
    ];

    // ── 私有方法 ─────────────────────────────────────────

    // 生成 Navbar HTML 字符串
    function _buildNavbarHtml() { ... }

    // 生成 Sidebar HTML 字符串（含所有菜单项 <li>）
    function _buildSidebarHtml() { ... }

    // 根据 window.location.pathname 为匹配菜单项添加 active 类
    function _setActive() { ... }

    // 执行注入（在 $(document).ready 中调用）
    function _inject() { ... }

    // ── 初始化 ───────────────────────────────────────────
    $(document).ready(function () {
        _inject();
    });

    // 暴露供测试使用
    return {
        NAV_CONFIG: NAV_CONFIG,
        _buildNavbarHtml: _buildNavbarHtml,
        _buildSidebarHtml: _buildSidebarHtml,
        _setActive: _setActive
    };

}(jQuery));
```

**接口说明**：

| 成员 | 类型 | 说明 |
|------|------|------|
| `NAV_CONFIG` | `Array` | 菜单项配置数组，每项含 `href`（字符串）和 `label`（字符串）|
| `_buildNavbarHtml()` | `Function → String` | 返回 Navbar HTML 字符串 |
| `_buildSidebarHtml()` | `Function → String` | 返回 Sidebar HTML 字符串（不含 active 状态）|
| `_setActive()` | `Function → void` | 读取 `window.location.pathname`，为匹配的 `<li>` 添加 `active` 类 |

### 各 Admin Page 的改动

每个 HTML 页面需做以下三处修改：

1. **移除** `<nav class="admin-navbar">...</nav>` 内联代码
2. **移除** `<div class="admin-sidebar">...</div>` 内联代码
3. **在 `<head>` 中** jQuery 之后添加：
   ```html
   <script src="../assets/js/admin-nav.js"></script>
   ```

---

## 数据模型

### `NAV_CONFIG` 菜单项结构

```javascript
// 单个菜单项
{
    href:  String,  // 相对路径，如 './bookmarks.html'
    label: String   // 显示文本，支持 HTML 实体，如 '&#128278; 书签管理'
}
```

### 生成的 Navbar HTML 结构

与现有内联代码保持完全一致，确保 `admin.css` 样式无需修改：

```html
<nav class="admin-navbar">
    <div class="admin-navbar-left">
        <a href="../index.html" class="admin-logo">
            <img src="../assets/images/logo@2x.png" height="28" alt="WebStack">
        </a>
        <span class="admin-title">管理面板</span>
    </div>
    <div class="admin-navbar-right">
        <a href="../index.html" class="admin-back-link">
            <i class="linecons-arrow-left"></i> 返回主页
        </a>
    </div>
</nav>
```

### 生成的 Sidebar HTML 结构

```html
<div class="admin-sidebar">
    <ul class="admin-tabs">
        <li class="admin-tab [active]">
            <a href="{item.href}">{item.label}</a>
        </li>
        <!-- 每个 NAV_CONFIG 项生成一个 <li> -->
    </ul>
</div>
```

`active` 类由 `_setActive()` 在注入后动态添加，`_buildSidebarHtml()` 生成时不包含 `active`。

### 激活状态匹配规则

```
pathname = window.location.pathname
// 例："/admin/bookmarks.html"

对每个菜单项：
  filename = item.href 中最后一个 '/' 之后的部分
  // 例：'./bookmarks.html' → 'bookmarks.html'

  if (pathname 包含 filename) → 该菜单项 active
```

---

## 正确性属性

*属性是在系统所有有效执行中都应成立的特征或行为——本质上是关于系统应该做什么的形式化陈述。属性是人类可读规范与机器可验证正确性保证之间的桥梁。*

### 属性 1：Nav_Config 菜单项结构完整性

*对任意* `NAV_CONFIG` 数组中的菜单项，每个菜单项都应包含非空的 `href` 字段和非空的 `label` 字段。

**验证：需求 1.2**

### 属性 2：生成的 HTML 完整反映 Nav_Config

*对任意* 菜单项配置数组（包含若干 `{href, label}` 项），调用 `_buildSidebarHtml()` 生成的 HTML 字符串应包含每个菜单项的 `href` 值和 `label` 值。

**验证：需求 1.3、1.4**

### 属性 3：激活状态唯一性与正确性

*对任意* `NAV_CONFIG` 中的菜单项，当 `window.location.pathname` 包含该菜单项的文件名时，调用 `_setActive()` 后，有且仅有该菜单项对应的 `<li>` 元素带有 `active` CSS 类，其余菜单项均不带 `active` 类。

**验证：需求 3.2、3.3**

---

## 错误处理

| 场景 | 处理方式 |
|------|----------|
| `.admin-container` 不存在 | 跳过 Sidebar 注入，通过 `console.warn()` 输出警告，不抛出异常 |
| `window.location.pathname` 与所有菜单项均不匹配 | 不为任何 `<li>` 添加 `active` 类，不抛出异常 |
| jQuery 未加载（`$` 未定义） | 脚本执行失败，但由于 admin-nav.js 在 jQuery 之后引入，正常情况下不会发生；如发生则浏览器控制台显示原生 JS 错误 |

---

## 测试策略

本功能涉及纯函数（HTML 字符串生成）和 DOM 操作（注入 + 激活状态），适合进行属性测试。

### 属性测试（Property-Based Testing）

使用 [fast-check](https://github.com/dubzzz/fast-check) 库（浏览器端可通过 CDN 引入，或在 Node.js 测试环境中使用）。

每个属性测试最少运行 **100 次迭代**。

**属性 1 测试**：`NAV_CONFIG` 结构完整性
```
// Feature: admin-shared-nav, Property 1: Nav_Config 菜单项结构完整性
// 对 NAV_CONFIG 中的每个菜单项，验证 href 和 label 均为非空字符串
fc.assert(fc.property(
    fc.constantFrom(...AdminNav.NAV_CONFIG),
    function(item) {
        return typeof item.href === 'string' && item.href.length > 0
            && typeof item.label === 'string' && item.label.length > 0;
    }
), { numRuns: 100 });
```

**属性 2 测试**：生成 HTML 完整反映配置
```
// Feature: admin-shared-nav, Property 2: 生成的 HTML 完整反映 Nav_Config
// 生成随机菜单项数组，验证 _buildSidebarHtml 的输出包含所有 href 和 label
fc.assert(fc.property(
    fc.array(fc.record({
        href: fc.string({ minLength: 1 }),
        label: fc.string({ minLength: 1 })
    }), { minLength: 1 }),
    function(config) {
        var html = buildSidebarHtmlWith(config); // 使用可注入配置的测试版本
        return config.every(function(item) {
            return html.indexOf(item.href) !== -1
                && html.indexOf(item.label) !== -1;
        });
    }
), { numRuns: 100 });
```

**属性 3 测试**：激活状态唯一性与正确性
```
// Feature: admin-shared-nav, Property 3: 激活状态唯一性与正确性
// 对 NAV_CONFIG 中的每个菜单项，模拟对应 pathname，验证 active 数量为 1 且位置正确
fc.assert(fc.property(
    fc.constantFrom(...AdminNav.NAV_CONFIG),
    function(targetItem) {
        // 模拟 DOM + pathname，调用 _setActive
        var filename = targetItem.href.split('/').pop();
        // 设置 mock pathname 包含 filename
        // 验证：active li 数量 === 1，且 active li 的 href 包含 filename
        return activeCount === 1 && activeHref.indexOf(filename) !== -1;
    }
), { numRuns: 100 });
```

### 单元测试（Example-Based）

| 测试场景 | 验证内容 |
|----------|----------|
| 正常注入 | `body` 第一个子元素为 `.admin-navbar`，`.admin-container` 第一个子元素为 `.admin-sidebar` |
| 无 `.admin-container` | 不抛出异常，`body` 中无 `.admin-sidebar` |
| pathname 不匹配任何菜单项 | 所有 `<li>` 均无 `active` 类 |
| 业务初始化不受干扰 | `$(document).ready()` 中的业务回调在注入后正常执行 |

### 集成测试（手动）

在浏览器中逐一打开 5 个 admin 页面，验证：
- 导航外观与改造前一致
- 当前页面菜单项高亮正确
- 各页面业务功能（书签管理、分类管理、导入导出、OSS 配置、同步状态）完全正常
