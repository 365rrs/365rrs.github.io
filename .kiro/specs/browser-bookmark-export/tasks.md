# Implementation Plan: 导出书签到浏览器

## Overview

本实现计划将"导出书签到浏览器"功能集成到 WebStack 管理面板中。该功能允许用户将书签数据导出为 Netscape Bookmark File Format (HTML 格式),支持选择性导出分类和书签,并能够导入到 Chrome、Firefox、Edge、Safari 等主流浏览器中。

**技术栈**: JavaScript (ES5) + jQuery 1.11.1 + Bootstrap 3.x

**实现方式**: 纯前端,无后端依赖,所有逻辑在浏览器端完成

## Tasks

- [x] 1. 在 admin/import-export.html 添加"导出到浏览器"区块 HTML 结构
  - 添加区块容器 `.ie-block`
  - 添加数据源选择行 `.be-source-row`
  - 添加操作按钮行 `.be-action-row` (全选、取消全选、导出按钮)
  - 添加分类树容器 `.be-tree-container`
  - 添加结果提示区域 `#be-result`
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 2. 在 assets/css/admin.css 添加导出到浏览器功能的 CSS 样式
  - 添加数据源选择行样式 `.be-source-row`
  - 添加操作按钮行样式 `.be-action-row`
  - 添加分类树容器样式 `.be-tree-container`
  - 添加分类行样式 `.be-category-row` (一级、二级)
  - 添加书签行样式 `.be-site-row`
  - 添加复选框、图标、计数徽章等细节样式
  - 使用 flexbox 布局,兼容 `-webkit-` 前缀
  - _Requirements: 8.3_

- [ ] 3. 在 assets/js/admin.js 创建 BrowserExportManager 模块骨架
  - [x] 3.1 创建 BrowserExportManager 全局对象
    - 定义公共接口: `init()`, `render()`, `exportToFile()`
    - 定义内部状态对象: `categoryStates`, `siteStates`, `expandedStates`
    - _Requirements: 1.1, 5.5_
  
  - [x] 3.2 实现 `init()` 方法
    - 调用 `_bindEvents()` 绑定事件监听器
    - 调用 `render()` 渲染初始界面
    - 确保幂等性(可重复调用)
    - _Requirements: 5.1, 5.2_
  
  - [x] 3.3 实现 `_bindEvents()` 方法
    - 绑定数据源切换按钮点击事件
    - 绑定全选/取消全选按钮点击事件
    - 绑定导出按钮点击事件
    - 使用事件委托绑定分类复选框变化事件
    - 使用事件委托绑定书签复选框变化事件
    - 使用事件委托绑定分类展开/折叠事件
    - 确保幂等性(使用 `.off().on()` 模式)
    - _Requirements: 3.1, 3.7, 3.8, 4.1, 5.2, 5.3_

- [ ] 4. 实现数据加载和界面渲染逻辑
  - [x] 4.1 实现 `render()` 方法
    - 从 `DataSourceManager.getActive()` 获取当前数据源
    - 更新数据源名称显示 (`#be-source-name`)
    - 调用 `DataSourceManager.load()` 加载数据
    - 处理加载成功: 调用 `_buildCategoryTree()` 构建分类树 HTML
    - 处理加载失败: 显示错误提示
    - 处理空数据: 显示"暂无数据"提示
    - _Requirements: 5.1, 5.4, 7.2_
  
  - [x] 4.2 实现 `_buildCategoryTree()` 方法
    - 遍历 `categories` 数组
    - 为每个一级分类调用 `_buildCategoryRow()`
    - 拼接所有分类行 HTML
    - 返回完整 HTML 字符串
    - _Requirements: 2.1, 2.3_
  
  - [x] 4.3 实现 `_buildCategoryRow()` 方法
    - 构建一级分类行 HTML (复选框、图标、名称、计数徽章、展开图标)
    - 计算书签总数(包含所有子分类)
    - 如果有 `children` 数组,遍历子分类调用 `_buildSiteList()`
    - 如果有 `sites` 数组,直接调用 `_buildSiteList()`
    - 返回分类行 HTML 字符串
    - _Requirements: 2.1, 2.2, 3.1, 3.2_
  
  - [x] 4.4 实现 `_buildSiteList()` 方法
    - 遍历 `sites` 数组
    - 为每个书签构建行 HTML (复选框、logo、名称、URL)
    - 使用 `normalizeLogo()` 处理 logo 路径
    - 使用 `_escapeHtml()` 转义文本内容
    - 返回书签列表 HTML 字符串
    - _Requirements: 4.1, 4.2_
  
  - [x] 4.5 实现 `_switchSource()` 方法
    - 切换数据源 (`default` ↔ `private`)
    - 更新 `localStorage` 中的 `active_source`
    - 调用 `render()` 重新渲染界面
    - _Requirements: 5.3, 5.4_

- [ ] 5. 实现复选框状态管理和同步逻辑
  - [x] 5.1 实现 `_handleCategoryCheckbox()` 方法
    - 获取分类复选框的选中状态
    - 更新内部状态对象 `categoryStates`
    - 同步该分类下所有子分类的复选框状态
    - 同步该分类下所有书签的复选框状态
    - _Requirements: 3.3, 3.4, 4.3, 4.4_
  
  - [x] 5.2 实现 `_handleSiteCheckbox()` 方法
    - 获取书签复选框的选中状态
    - 更新内部状态对象 `siteStates`
    - 调用 `_updateCategoryCheckboxState()` 更新父分类复选框状态
    - _Requirements: 4.5_
  
  - [x] 5.3 实现 `_updateCategoryCheckboxState()` 方法
    - 统计该分类下所有书签的选中数量
    - 如果全部选中: 设置分类复选框为 `checked`, `indeterminate = false`
    - 如果部分选中: 设置分类复选框 `indeterminate = true`
    - 如果全部未选中: 设置分类复选框为 `unchecked`, `indeterminate = false`
    - 更新内部状态对象 `categoryStates`
    - _Requirements: 4.6, 4.7_
  
  - [x] 5.4 实现 `_selectAll()` 方法
    - 遍历所有分类和书签复选框
    - 设置所有复选框为 `checked`
    - 更新内部状态对象
    - _Requirements: 3.7_
  
  - [x] 5.5 实现 `_deselectAll()` 方法
    - 遍历所有分类和书签复选框
    - 设置所有复选框为 `unchecked`
    - 清空内部状态对象
    - _Requirements: 3.8_

- [ ] 6. 实现 HTML 生成和文件下载逻辑
  - [x] 6.1 实现 `_collectSelectedData()` 方法
    - 遍历所有选中的分类复选框
    - 收集每个分类下选中的书签数据
    - 构建数据结构: `{ categories: [...], totalSites: number }`
    - 保持分类和书签的原始顺序
    - _Requirements: 2.3, 2.4_
  
  - [x] 6.2 实现 `_generateHTML()` 方法
    - 生成 DOCTYPE 声明: `<!DOCTYPE NETSCAPE-Bookmark-file-1>`
    - 生成 META 标签: `<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">`
    - 生成 TITLE 和 H1 标签
    - 遍历选中的分类,调用 `_generateCategoryHTML()`
    - 拼接完整 HTML 字符串
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [x] 6.3 实现 `_generateCategoryHTML()` 方法 (递归)
    - 生成分类 H3 标签,包含 `ADD_DATE` 属性
    - 使用 `Math.floor(Date.now() / 1000)` 生成 Unix 时间戳
    - 生成 `<DL><p>` 开始标签
    - 遍历书签,调用 `_generateSiteHTML()`
    - 如果有子分类,递归调用 `_generateCategoryHTML()`
    - 生成 `</DL><p>` 结束标签
    - 使用 `_escapeHtml()` 转义分类名称
    - _Requirements: 1.4, 1.5, 1.6, 2.1, 2.2_
  
  - [x] 6.4 实现 `_generateSiteHTML()` 方法
    - 生成 `<DT><A HREF="..." ADD_DATE="...">...</A>` 标签
    - 使用 `_escapeHtml()` 转义书签名称和 URL
    - 使用 Unix 时间戳作为 `ADD_DATE` 属性值
    - _Requirements: 1.4, 1.6_
  
  - [x] 6.5 实现 `_escapeHtml()` 方法
    - 转义 `&` → `&amp;`
    - 转义 `<` → `&lt;`
    - 转义 `>` → `&gt;`
    - 转义 `"` → `&quot;`
    - 转义 `'` → `&#39;`
    - _Requirements: 9.5_
  
  - [x] 6.6 实现 `_downloadFile()` 方法
    - 使用 `new Blob([content], { type: 'text/html;charset=utf-8' })` 创建 Blob 对象
    - 使用 `URL.createObjectURL(blob)` 生成临时 URL
    - 创建隐藏的 `<a>` 标签,设置 `href` 和 `download` 属性
    - 触发 `<a>` 标签的 `click()` 事件
    - 使用 `setTimeout()` 延迟清理临时 URL
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  
  - [x] 6.7 实现 `exportToFile()` 方法
    - 调用 `_collectSelectedData()` 收集选中数据
    - 验证至少选择了一个书签,否则显示错误提示
    - 调用 `_generateHTML()` 生成 HTML 内容
    - 生成文件名: `webstack-bookmarks-YYYYMMDD_HHMMSS.html`
    - 调用 `_downloadFile()` 触发下载
    - 显示成功提示: "已导出 N 个书签到 M 个分类"
    - 2.5 秒后自动隐藏提示
    - 使用 `try-catch` 包裹,捕获异常并显示错误提示
    - _Requirements: 6.7, 7.1, 7.3, 7.4, 7.5_

- [ ] 7. 实现错误处理和用户反馈
  - [x] 7.1 实现 `_showResult()` 方法
    - 接收参数: `success` (boolean), `message` (string)
    - 如果 `success = true`: 添加 `.ie-result-ok` 类,显示绿色成功提示
    - 如果 `success = false`: 添加 `.ie-result-err` 类,显示红色错误提示
    - 更新 `#be-result` 元素的文本内容
    - 显示提示元素
    - _Requirements: 7.3, 7.5_
  
  - [x] 7.2 在 `render()` 方法中添加数据加载失败处理
    - 在 `.fail()` 回调中显示错误提示"数据加载失败,请重试"
    - 禁用导出按钮
    - _Requirements: 7.2_
  
  - [x] 7.3 在 `exportToFile()` 方法中添加异常处理
    - 使用 `try-catch` 包裹所有导出逻辑
    - 在 `catch` 块中记录错误到控制台: `console.error('[BrowserExportManager]', error)`
    - 显示错误提示"导出失败,请重试"
    - _Requirements: 7.5_

- [ ] 8. 集成到导入导出页面并初始化
  - [x] 8.1 在 admin/import-export.html 的 `<script>` 标签中添加初始化代码
    - 在 `$(document).ready()` 中调用 `BrowserExportManager.init()`
    - 确保在 `ImportExport.init()` 之后调用
    - _Requirements: 8.1_
  
  - [x] 8.2 在 admin.html 的 Tab 切换逻辑中添加初始化触发
    - 在 `#admin-tabs` 的点击事件处理中
    - 当切换到 `panel-import-export` 时,调用 `BrowserExportManager.init()`
    - 确保每次切换到该面板时都重新渲染
    - _Requirements: 8.1_

- [x] 9. Checkpoint - 确保所有功能正常工作
  - 在浏览器中打开 `admin/import-export.html`
  - 验证"导出到浏览器"区块正确显示
  - 验证数据源切换功能正常
  - 验证分类和书签列表正确渲染
  - 验证复选框状态同步正常(全选、半选、取消全选)
  - 验证导出功能正常(文件下载、文件名格式、HTML 内容)
  - 验证错误处理正常(未选择书签、数据加载失败)
  - 在 Chrome/Firefox/Edge 中导入导出的 HTML 文件,验证书签和分类结构正确
  - 确保所有测试通过,询问用户是否有问题

- [ ]* 10. 编写属性测试
  - [ ]* 10.1 编写 Property 1 测试: HTML 格式规范完整性
    - **Property 1: HTML 格式规范完整性**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6**
    - 生成随机书签数据结构
    - 调用 `_generateHTML()` 生成 HTML
    - 验证包含 DOCTYPE 声明
    - 验证包含 UTF-8 META 标签
    - 验证所有 A 标签包含 HREF 和 ADD_DATE 属性
    - 验证所有 H3 标签包含 ADD_DATE 属性
    - 验证所有 ADD_DATE 值为有效的 Unix 时间戳
  
  - [ ]* 10.2 编写 Property 2 测试: 分类层级映射正确性
    - **Property 2: 分类层级映射正确性**
    - **Validates: Requirements 2.1, 2.2, 2.5**
    - 生成包含一级和二级分类的随机数据
    - 调用 `_generateHTML()` 生成 HTML
    - 验证一级分类转换为顶层 H3 标签
    - 验证二级分类转换为嵌套在父分类 DL 中的 H3 标签
    - 验证所有子分类都被正确处理
  
  - [ ]* 10.3 编写 Property 3 测试: 顺序保持不变性
    - **Property 3: 顺序保持不变性**
    - **Validates: Requirements 2.3, 2.4**
    - 生成随机书签数据结构
    - 调用 `_generateHTML()` 生成 HTML
    - 解析 HTML,提取分类和书签的出现顺序
    - 验证顺序与输入数据完全一致
  
  - [ ]* 10.4 编写 Property 4 测试: 分类与子分类状态同步
    - **Property 4: 分类与子分类状态同步**
    - **Validates: Requirements 3.3, 3.4**
    - 生成包含子分类的随机数据
    - 渲染界面
    - 勾选一级分类复选框
    - 验证所有子分类复选框自动勾选
    - 取消勾选一级分类复选框
    - 验证所有子分类复选框自动取消勾选
  
  - [ ]* 10.5 编写 Property 5 测试: 分类与书签状态同步
    - **Property 5: 分类与书签状态同步**
    - **Validates: Requirements 4.3, 4.4**
    - 生成包含书签的随机数据
    - 渲染界面
    - 勾选分类复选框
    - 验证该分类下所有书签复选框自动勾选
    - 取消勾选分类复选框
    - 验证该分类下所有书签复选框自动取消勾选
  
  - [ ]* 10.6 编写 Property 6 测试: 书签全选时分类自动勾选
    - **Property 6: 书签全选时分类自动勾选**
    - **Validates: Requirements 4.6**
    - 生成包含多个书签的随机数据
    - 渲染界面
    - 逐个勾选该分类下的所有书签
    - 验证分类复选框自动变为勾选状态
  
  - [ ]* 10.7 编写 Property 7 测试: 书签部分选中时分类半选状态
    - **Property 7: 书签部分选中时分类半选状态**
    - **Validates: Requirements 4.7**
    - 生成包含多个书签的随机数据
    - 渲染界面
    - 勾选该分类下的部分书签(至少一个但不是全部)
    - 验证分类复选框的 `indeterminate` 属性为 `true`
  
  - [ ]* 10.8 编写 Property 8 测试: 全选和取消全选操作正确性
    - **Property 8: 全选和取消全选操作正确性**
    - **Validates: Requirements 3.7, 3.8**
    - 生成随机书签数据结构
    - 渲染界面
    - 执行全选操作
    - 验证所有分类和书签复选框状态为 `checked`
    - 执行取消全选操作
    - 验证所有复选框状态为 `unchecked`
  
  - [ ]* 10.9 编写 Property 9 测试: HTML 特殊字符转义正确性
    - **Property 9: HTML 特殊字符转义正确性**
    - **Validates: Requirements 9.5**
    - 生成包含特殊字符的随机书签名称和 URL
    - 调用 `_escapeHtml()` 转义
    - 验证 `&` → `&amp;`
    - 验证 `<` → `&lt;`
    - 验证 `>` → `&gt;`
    - 验证 `"` → `&quot;`
    - 验证 `'` → `&#39;`
  
  - [ ]* 10.10 编写 Property 10 测试: 文件名格式正确性
    - **Property 10: 文件名格式正确性**
    - **Validates: Requirements 6.7**
    - 执行导出操作
    - 捕获生成的文件名
    - 验证文件名符合格式 `webstack-bookmarks-YYYYMMDD_HHMMSS.html`
    - 验证日期时间部分为有效的时间戳格式
  
  - [ ]* 10.11 编写 Property 11 测试: 导出成功提示信息准确性
    - **Property 11: 导出成功提示信息准确性**
    - **Validates: Requirements 7.3**
    - 生成随机书签数据结构
    - 选中部分书签
    - 执行导出操作
    - 捕获成功提示信息
    - 验证提示信息中的书签数量与实际选中数量一致
    - 验证提示信息中的分类数量与实际选中数量一致

## Notes

- 任务标记 `*` 的为可选任务(属性测试),可跳过以加快 MVP 开发
- 每个任务都引用了具体的需求编号,确保可追溯性
- Checkpoint 任务确保增量验证,及时发现问题
- 属性测试验证通用正确性属性,补充单元测试和集成测试
- 所有代码使用 ES5 语法,兼容 jQuery 1.11.1,无需构建工具
- 使用全局命名空间 `BrowserExportManager`,与现有模块风格一致
- 复用 `DataSourceManager` 进行数据源管理,无需重复实现
- CSS 样式遵循现有 `admin.css` 规范,使用 flexbox 布局并兼容 `-webkit-` 前缀
