# 实现计划：admin-shared-nav

## 概述

将 5 个 admin 页面中重复内联的导航代码（顶部 Navbar + 左侧 Sidebar）提取为单一 JS 文件 `assets/js/admin-nav.js`，通过 JavaScript 动态注入到每个页面，实现"改一处，同步所有页面"的目标。

## 任务

- [x] 1. 创建 `assets/js/admin-nav.js` 核心模块
  - 使用 IIFE 模式定义 `AdminNav` 对象，暴露为 `window.AdminNav`
  - 在文件内单一位置定义 `NAV_CONFIG` 数组，包含 5 个菜单项（`href` + `label`）
  - 实现 `_buildNavbarHtml()` 方法，生成与现有内联代码结构完全一致的 Navbar HTML 字符串
  - 实现 `_buildSidebarHtml()` 方法，遍历 `NAV_CONFIG` 生成 Sidebar HTML 字符串（不含 `active` 状态）
  - 实现 `_setActive()` 方法，读取 `window.location.pathname`，提取文件名后与各菜单项 `href` 匹配，为对应 `<li>` 添加 `active` 类
  - 实现 `_inject()` 方法：将 Navbar 注入 `body` 最顶部，将 Sidebar 注入 `.admin-container` 最前面；若 `.admin-container` 不存在则跳过并 `console.warn()`
  - 使用 `$(document).ready()` 触发 `_inject()`
  - 全程使用 ES5 语法（不使用 `let`/`const`/箭头函数/模板字符串）
  - _需求：1.1、1.2、1.3、2.1、2.2、2.4、3.1、3.2、5.1、5.2、5.4_

- [x] 2. 改造 5 个 Admin 页面 HTML
  - [x] 2.1 改造 `admin/bookmarks.html`
    - 移除内联 `<nav class="admin-navbar">...</nav>` 代码块
    - 移除内联 `<div class="admin-sidebar">...</div>` 代码块
    - 在 `<head>` 中 jQuery `<script>` 标签之后添加 `<script src="../assets/js/admin-nav.js"></script>`
    - _需求：4.1、4.2、4.3、4.4_

  - [x] 2.2 改造 `admin/categories.html`
    - 移除内联 `<nav class="admin-navbar">...</nav>` 代码块
    - 移除内联 `<div class="admin-sidebar">...</div>` 代码块
    - 在 `<head>` 中 jQuery `<script>` 标签之后添加 `<script src="../assets/js/admin-nav.js"></script>`
    - _需求：4.1、4.2、4.3、4.4_

  - [x] 2.3 改造 `admin/import-export.html`
    - 移除内联 `<nav class="admin-navbar">...</nav>` 代码块
    - 移除内联 `<div class="admin-sidebar">...</div>` 代码块
    - 在 `<head>` 中 jQuery `<script>` 标签之后添加 `<script src="../assets/js/admin-nav.js"></script>`
    - _需求：4.1、4.2、4.3、4.4_

  - [x] 2.4 改造 `admin/oss-config.html`
    - 移除内联 `<nav class="admin-navbar">...</nav>` 代码块
    - 移除内联 `<div class="admin-sidebar">...</div>` 代码块
    - 在 `<head>` 中 jQuery `<script>` 标签之后添加 `<script src="../assets/js/admin-nav.js"></script>`
    - _需求：4.1、4.2、4.3、4.4_

  - [x] 2.5 改造 `admin/sync.html`
    - 移除内联 `<nav class="admin-navbar">...</nav>` 代码块
    - 移除内联 `<div class="admin-sidebar">...</div>` 代码块
    - 在 `<head>` 中 jQuery `<script>` 标签之后添加 `<script src="../assets/js/admin-nav.js"></script>`
    - _需求：4.1、4.2、4.3、4.4_

- [x] 3. 检查点 —— 确保所有测试通过
  - 确保所有测试通过，如有疑问请向用户确认。

- [ ] 4. 编写属性测试与单元测试
  - [ ]* 4.1 为属性 1（Nav_Config 菜单项结构完整性）编写属性测试
    - 使用 fast-check，对 `AdminNav.NAV_CONFIG` 中每个菜单项验证 `href` 和 `label` 均为非空字符串
    - **属性 1：Nav_Config 菜单项结构完整性**
    - **验证：需求 1.2**

  - [ ]* 4.2 为属性 2（生成的 HTML 完整反映 Nav_Config）编写属性测试
    - 使用 fast-check，生成随机菜单项数组，验证 `_buildSidebarHtml()` 输出包含所有 `href` 和 `label` 值
    - 需要提取一个可接受外部配置参数的 `buildSidebarHtmlWith(config)` 辅助函数供测试使用
    - **属性 2：生成的 HTML 完整反映 Nav_Config**
    - **验证：需求 1.3、1.4**

  - [ ]* 4.3 为属性 3（激活状态唯一性与正确性）编写属性测试
    - 使用 fast-check，对 `NAV_CONFIG` 中每个菜单项模拟对应 pathname，验证 `active` 类数量为 1 且位置正确
    - 需要模拟 DOM 环境（jsdom 或手动构造 DOM 片段）
    - **属性 3：激活状态唯一性与正确性**
    - **验证：需求 3.2、3.3**

  - [ ]* 4.4 编写单元测试（示例测试）
    - 测试正常注入：`body` 第一个子元素为 `.admin-navbar`，`.admin-container` 第一个子元素为 `.admin-sidebar`
    - 测试无 `.admin-container`：不抛出异常，`body` 中无 `.admin-sidebar`
    - 测试 pathname 不匹配：所有 `<li>` 均无 `active` 类
    - _需求：2.1、2.2、2.3、2.4、3.4_

- [x] 5. 最终检查点 —— 确保所有测试通过
  - 确保所有测试通过，如有疑问请向用户确认。

## 备注

- 标有 `*` 的子任务为可选项，可跳过以加快 MVP 交付
- 每个任务均引用了具体需求条款以保证可追溯性
- 属性测试验证设计文档中定义的三个正确性属性
- 改造 HTML 页面时，业务初始化脚本（`BookmarkManager.render()` 等）保持不变，不受影响
