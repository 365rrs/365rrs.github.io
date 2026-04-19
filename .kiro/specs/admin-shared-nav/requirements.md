# 需求文档

## 介绍

将管理面板（`/admin/` 目录下 5 个独立 HTML 页面）中重复内联的左侧导航 HTML（顶部 `admin-navbar` + 左侧 `admin-sidebar`）提取为一个公共 JS 组件，通过 JavaScript 动态注入到每个页面。后续新增或修改菜单项只需修改一处，所有页面自动同步。

项目约束：纯静态 HTML/CSS/JS，无构建系统，使用 jQuery 1.11.1 + Bootstrap 3.x + ES5，不引入任何新的构建工具或模板引擎。

## 词汇表

- **Nav_Injector**：负责将公共导航 HTML 注入页面并初始化激活状态的 JS 模块（`assets/js/admin-nav.js`）
- **Admin_Page**：`/admin/` 目录下的任意一个管理面板 HTML 页面（bookmarks.html、categories.html、import-export.html、oss-config.html、sync.html）
- **Sidebar**：页面左侧的标签页导航区域（`.admin-sidebar` + `.admin-tabs`）
- **Navbar**：页面顶部固定导航栏（`.admin-navbar`）
- **Active_Item**：Sidebar 中与当前页面 URL 匹配、带有 `active` CSS 类的菜单项
- **Nav_Config**：Nav_Injector 内部维护的菜单项数组，每项包含 `href`、`label` 字段

---

## 需求

### 需求 1：公共导航组件文件

**用户故事：** 作为开发者，我希望将导航 HTML 集中定义在一个 JS 文件中，以便后续只修改一处即可同步所有页面。

#### 验收标准

1. THE Nav_Injector SHALL 在 `assets/js/admin-nav.js` 文件中以 ES5 风格定义，不依赖任何构建工具。
2. THE Nav_Injector SHALL 将 Nav_Config（菜单项数组）集中维护在文件内的单一位置，每个菜单项包含 `href` 和 `label` 字段。
3. THE Nav_Injector SHALL 根据 Nav_Config 动态生成 Navbar HTML 和 Sidebar HTML 字符串。
4. WHEN 开发者在 Nav_Config 中新增、删除或修改一个菜单项，THE Nav_Injector SHALL 使所有 Admin_Page 在下次加载时自动反映该变更，无需单独修改各页面。

---

### 需求 2：导航 HTML 自动注入

**用户故事：** 作为开发者，我希望每个 Admin_Page 在加载时自动获得完整的导航结构，以便无需在每个 HTML 文件中手动维护重复的导航代码。

#### 验收标准

1. WHEN 一个 Admin_Page 的 DOM 加载完成，THE Nav_Injector SHALL 将生成的 Navbar HTML 注入到 `<body>` 的最顶部。
2. WHEN 一个 Admin_Page 的 DOM 加载完成，THE Nav_Injector SHALL 将生成的 Sidebar HTML 注入到 `.admin-container` 元素内部的最前面。
3. THE Nav_Injector SHALL 在注入完成后，使页面的视觉布局与注入前（硬编码导航时）保持一致，不引入额外的布局偏移。
4. IF 页面中不存在 `.admin-container` 元素，THEN THE Nav_Injector SHALL 跳过 Sidebar 注入并在浏览器控制台输出一条警告信息。

---

### 需求 3：当前页面激活状态自动判断

**用户故事：** 作为用户，我希望左侧菜单中当前所在页面的菜单项高亮显示，以便清楚地知道自己在哪个页面。

#### 验收标准

1. WHEN Nav_Injector 完成 Sidebar 注入，THE Nav_Injector SHALL 读取 `window.location.pathname` 以确定当前页面路径。
2. WHEN 当前页面路径与某个菜单项的 `href` 文件名部分匹配，THE Nav_Injector SHALL 为该菜单项的 `<li>` 元素添加 `active` CSS 类。
3. THE Nav_Injector SHALL 保证在任意一个 Admin_Page 上，有且仅有一个菜单项处于 `active` 状态。
4. IF 当前页面路径与所有菜单项均不匹配，THEN THE Nav_Injector SHALL 不为任何菜单项添加 `active` 类，且不抛出 JS 错误。

---

### 需求 4：移除各页面内联导航代码

**用户故事：** 作为开发者，我希望各 Admin_Page 的 HTML 文件中不再包含重复的导航代码，以便文件更简洁、维护更容易。

#### 验收标准

1. THE Admin_Page SHALL 在 HTML 文件中移除内联的 Navbar HTML（`<nav class="admin-navbar">...</nav>`）。
2. THE Admin_Page SHALL 在 HTML 文件中移除内联的 Sidebar HTML（`<div class="admin-sidebar">...</div>`）。
3. THE Admin_Page SHALL 在 `<head>` 中引入 `../assets/js/admin-nav.js`，且引入位置在 jQuery 之后、其他业务脚本之前。
4. WHEN 移除内联导航代码后，THE Admin_Page SHALL 保持其原有的业务功能（书签管理、分类管理等）完全正常，不受影响。

---

### 需求 5：脚本加载时序兼容性

**用户故事：** 作为开发者，我希望公共导航脚本能在现有脚本加载顺序下正确运行，以便不破坏现有页面的初始化逻辑。

#### 验收标准

1. THE Nav_Injector SHALL 使用 jQuery 的 `$(document).ready()` 或等效机制确保在 DOM 就绪后执行注入，兼容 jQuery 1.11.1。
2. THE Nav_Injector SHALL 以 ES5 语法编写，不使用 `let`、`const`、箭头函数、模板字符串等 ES6+ 特性，以兼容项目现有技术栈。
3. WHERE 某个 Admin_Page 需要在 `$(document).ready()` 中执行业务初始化逻辑，THE Nav_Injector SHALL 不干扰该页面的业务初始化执行顺序。
4. THE Nav_Injector SHALL 不依赖除 jQuery 1.11.1 之外的任何第三方库。
