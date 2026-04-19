# 实现计划：Tab Copy 导入功能

## 概述

在 `admin/bookmarks.html` 书签管理页面新增 Tab Copy 批量导入区块，实现 JSON 解析、预览、分类选择和批量导入功能。所有代码遵循现有 ES5 + jQuery 1.11.1 风格，无需构建系统。

## 任务

- [x] 1. 新增 CSS 样式
  - 在 `assets/css/admin.css` 末尾追加 Tab Copy 预览列表和分类选择行所需样式
  - 包含 `.tab-copy-preview-list`、`.tab-copy-preview-item`、`.tab-copy-preview-item.skipped`、`.tab-copy-preview-name`、`.tab-copy-preview-url`、`.tab-copy-preview-skip-label`、`.tab-copy-import-row` 类
  - _需求：1.1, 1.3, 2.3_

- [x] 2. 新增 HTML 区块
  - 在 `admin/bookmarks.html` 的 `#quick-add-block` 之后插入 `#tab-copy-block` 区块
  - 包含只读提示 `#tab-copy-readonly-tip`、输入框 `#tab-copy-textarea`、解析按钮 `#tab-copy-parse-btn`、预览区 `#tab-copy-preview`、分类下拉 `#tab-copy-category`、确认导入按钮 `#tab-copy-import-btn`、结果提示 `#tab-copy-result`
  - _需求：1.1, 3.1, 4.1, 5.1_

- [x] 3. 实现 `TabCopyImporter` 核心解析逻辑
  - [x] 3.1 在 `assets/js/admin.js` 中新增 `TabCopyImporter` 模块骨架，包含 `init()`、`_updateReadonlyState()`、`_escHtml()` 方法
    - `init()` 绑定解析按钮和确认导入按钮的点击事件，调用 `_updateReadonlyState()`
    - `_updateReadonlyState()` 通过 `DataSourceManager.getActive()` 判断只读状态，切换输入框/按钮的 `disabled` 属性和只读提示的显示
    - _需求：5.1, 5.2_

  - [x] 3.2 实现 `_validateInput(text)` 方法，处理所有输入校验场景
    - 空字符串 → `{ error: true, message: '请粘贴 Tab Copy JSON 数据' }`
    - 非合法 JSON → `{ error: true, message: 'JSON 格式错误，请检查输入内容' }`
    - 合法 JSON 但非数组 → `{ error: true, message: '数据格式错误，需要 JSON 数组格式' }`
    - 空数组 → `{ error: true, message: '数组为空，没有可导入的书签' }`
    - 合法非空数组 → `{ error: false, data: [...] }`
    - _需求：1.4, 1.5, 1.6, 1.7_

  - [ ]* 3.3 为 `_validateInput` 编写属性测试（属性 3）
    - **属性 3：解析错误处理**
    - **Validates: Requirements 1.5, 1.6**

  - [x] 3.4 实现 `_parseItems(arr)` 方法，将 Tab Copy 数组转换为 Bookmark 数组
    - `title` 为空或缺失时使用 `url` 作为 `name`
    - `url` 为空或缺失时跳过该元素，在返回结果中以 `{ skipped: true, url: '' }` 标记
    - `logo` 始终初始化为空字符串
    - _需求：2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 3.5 为 `_parseItems` 编写属性测试（属性 1、属性 2）
    - **属性 1：字段映射完整性**
    - **属性 2：无效元素过滤**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.5**

- [x] 4. 实现预览渲染与分类填充
  - [x] 4.1 实现 `_renderPreview(items)` 方法，生成预览列表 HTML 并插入 `#tab-copy-preview-list`
    - 有效书签显示 `name` 和 `url`
    - 跳过项使用 `.skipped` 样式并显示"已跳过（缺少 URL）"标注
    - 渲染完成后显示 `#tab-copy-preview`
    - _需求：1.3, 2.3_

  - [x] 4.2 实现 `_fillCategorySelect()` 方法，填充 `#tab-copy-category` 下拉框
    - 遍历私有数据源，提取所有叶子分类（含 `sites` 数组的分类）
    - 一级分类：`value = catId`，显示分类名
    - 二级子分类：`value = parentId + '::' + subId`，显示 `父分类名 / 子分类名`
    - 私有数据源为空时插入提示项"请先创建私有数据源"并禁用确认按钮
    - _需求：3.1, 3.2, 3.3_

  - [ ]* 4.3 为 `_fillCategorySelect` 的路径格式化逻辑提取 `_formatCategoryLabel(parentName, subName)` 方法，并编写属性测试（属性 6）
    - **属性 6：分类路径格式化**
    - **Validates: Requirements 3.3**

  - [x] 4.4 实现 `_parse()` 方法，串联 `_validateInput`、`_parseItems`、`_renderPreview`、`_fillCategorySelect`
    - 校验失败时通过 `_showResult(false, msg)` 显示错误并隐藏预览区
    - 校验成功时渲染预览并填充分类下拉
    - _需求：1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [x] 5. 检查点 — 确保解析与预览功能正常
  - 确保所有测试通过，如有问题请向用户说明。

- [x] 6. 实现导入执行逻辑
  - [x] 6.1 实现 `_appendToCategory(data, catId, parentId, bookmarks)` 方法，将书签追加到目标分类 `sites` 数组末尾
    - `parentId` 为空时在一级分类中查找 `catId`
    - `parentId` 非空时在对应父分类的 `children` 中查找 `catId`
    - 追加时不覆盖已有书签，仅在末尾 push
    - _需求：4.1_

  - [ ]* 6.2 为 `_appendToCategory` 编写属性测试（属性 4）
    - **属性 4：导入追加不覆盖**
    - **Validates: Requirements 4.1**

  - [x] 6.3 实现 `_buildSuccessMessage(n)` 方法，返回格式为 `"成功导入 N 个书签"` 的字符串
    - _需求：4.2_

  - [ ]* 6.4 为 `_buildSuccessMessage` 编写属性测试（属性 5）
    - **属性 5：成功提示数量准确**
    - **Validates: Requirements 4.2**

  - [x] 6.5 实现 `_doImport()` 方法，执行完整导入流程
    - 校验是否已选择分类，未选择时显示"请选择目标分类"并终止
    - 解析 `#tab-copy-category` 的 `value`，拆分 `parentId` 和 `catId`
    - 过滤出有效书签（排除 `skipped` 项）
    - 调用 `DataSourceManager.getPrivateData()` 读取数据，`_appendToCategory` 追加，`DataSourceManager.savePrivateData()` 保存
    - 调用 `_buildSuccessMessage(n)` 并通过 `_showResult(true, msg)` 显示成功提示
    - 清空 `#tab-copy-textarea`，隐藏 `#tab-copy-preview`
    - 调用 `BookmarkManager.render()` 刷新书签列表
    - _需求：3.4, 4.1, 4.2, 4.3, 4.4_

- [x] 7. 在页面初始化中挂载 `TabCopyImporter`
  - 在 `admin/bookmarks.html` 的 `$(document).ready` 回调中追加 `TabCopyImporter.init()`
  - _需求：1.1_

- [x] 8. 最终检查点 — 确保所有测试通过
  - 确保所有测试通过，如有问题请向用户说明。

## 备注

- 标有 `*` 的子任务为可选测试任务，可跳过以加快 MVP 交付
- 属性测试使用 `fast-check` 库（CDN 引入），每个属性运行 100 次迭代
- 所有代码保持 ES5 风格，兼容 jQuery 1.11.1 + Bootstrap 3.x
- `_parseItems` 和 `_validateInput` 设计为纯函数，便于独立测试
