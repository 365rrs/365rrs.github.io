# 技术设计文档：Tab Copy 导入功能

## 概述

本功能在 `admin/bookmarks.html` 书签管理页面新增 **Tab Copy 导入**区块，允许用户将 Tab Copy 浏览器插件复制的 JSON 数组（格式：`[{"title":"...","url":"..."}]`）粘贴后解析预览，选择目标分类后批量导入为书签，追加到私有数据源对应分类的 `sites` 数组。

功能仅在私有数据源激活时可用；默认数据源（只读）时整个导入区域禁用并显示提示。

---

## 架构

本功能完全遵循现有管理面板的纯静态架构：

- 无构建系统、无依赖安装
- ES5 风格，兼容 jQuery 1.11.1 + Bootstrap 3.x
- 新增 `TabCopyImporter` 模块，风格与 `BookmarkManager`、`QuickAdd` 保持一致
- 数据读写通过 `DataSourceManager.getPrivateData()` / `savePrivateData()` 完成
- 数据源状态通过 `DataSourceManager.getActive()` 判断

```
admin/bookmarks.html          ← 新增 #tab-copy-block HTML 区块
assets/js/admin.js            ← 新增 TabCopyImporter 模块
assets/css/admin.css          ← 新增少量样式（复用 ie-block 等现有类）
```

---

## 组件与接口

### TabCopyImporter 模块

```
TabCopyImporter
├── init()                    ← 绑定事件，根据数据源状态更新 UI
├── _updateReadonlyState()    ← 根据当前数据源启用/禁用导入区域
├── _parse()                  ← 解析输入框内容，展示预览列表
├── _parseItems(arr)          ← 将 Tab Copy 数组转换为 Bookmark 数组
├── _renderPreview(items)     ← 渲染预览列表 HTML
├── _fillCategorySelect()     ← 填充目标分类下拉框（叶子节点）
├── _doImport()               ← 执行导入，追加到目标分类 sites
├── _showResult(ok, msg)      ← 显示成功/错误提示
└── _escHtml(str)             ← HTML 转义工具函数
```

### 与现有模块的交互

| 调用 | 说明 |
|------|------|
| `DataSourceManager.getActive()` | 判断当前数据源是否为只读 |
| `DataSourceManager.getPrivateData()` | 读取私有数据，填充分类下拉 |
| `DataSourceManager.savePrivateData(data)` | 导入后保存更新的数据 |
| `BookmarkManager.render()` | 导入完成后刷新书签列表 |

---

## 数据模型

### 输入：Tab Copy JSON 元素

```json
{
  "title": "Dribbble - Discover the World's Top Designers",
  "url": "https://dribbble.com/"
}
```

### 输出：Bookmark 对象

```json
{
  "name": "Dribbble - Discover the World's Top Designers",
  "url": "https://dribbble.com/",
  "logo": ""
}
```

### 字段映射规则

| Tab Copy 字段 | Bookmark 字段 | 规则 |
|--------------|--------------|------|
| `title` | `name` | 若 `title` 为空或缺失，使用 `url` 值代替 |
| `url` | `url` | 若 `url` 为空或缺失，跳过该元素 |
| —（无对应） | `logo` | 始终初始化为空字符串 `""` |

### 分类下拉值格式

与 `QuickAdd._fillCategorySelect()` 保持一致：

- 一级分类（直接含 `sites`）：`value = catId`，显示 `分类名`
- 二级子分类：`value = parentId + '::' + subId`，显示 `父分类名 / 子分类名`

---

## HTML 结构

在 `admin/bookmarks.html` 的 `#quick-add-block` 之后插入：

```html
<!-- Tab Copy 导入区块 -->
<div class="ie-block" id="tab-copy-block">
    <div class="ie-block-title">📋 Tab Copy 批量导入</div>
    <p class="ie-block-desc">粘贴 Tab Copy 插件复制的 JSON 数据，批量导入标签页为书签</p>

    <!-- 只读提示（默认数据源时显示） -->
    <div id="tab-copy-readonly-tip" class="alert alert-warning" style="display:none;margin-bottom:10px;">
        <i class="fa fa-lock" style="margin-right:6px;"></i>
        当前为默认数据源（只读），请先切换至私有数据源
    </div>

    <!-- 输入区域 -->
    <textarea id="tab-copy-textarea" class="ie-textarea" rows="5"
        placeholder='粘贴 Tab Copy JSON，例如：[{"title":"Dribbble","url":"https://dribbble.com/"}]'></textarea>

    <div style="margin-bottom:10px;">
        <button class="btn btn-default" id="tab-copy-parse-btn">
            <i class="fa fa-search"></i> 解析
        </button>
    </div>

    <!-- 预览区（解析成功后显示） -->
    <div id="tab-copy-preview" style="display:none;">
        <div id="tab-copy-preview-list" class="tab-copy-preview-list"></div>

        <div class="tab-copy-import-row">
            <label style="font-size:13px;color:#5a6a7a;margin-right:8px;white-space:nowrap;">导入到：</label>
            <select id="tab-copy-category" class="form-control" style="flex:1;"></select>
            <button class="btn btn-primary" id="tab-copy-import-btn" style="margin-left:8px;white-space:nowrap;">
                <i class="fa fa-download"></i> 确认导入
            </button>
        </div>
    </div>

    <!-- 结果提示 -->
    <div id="tab-copy-result" class="ie-result" style="display:none;margin-top:8px;"></div>
</div>
```

---

## 样式设计

复用现有 `ie-block`、`ie-block-title`、`ie-block-desc`、`ie-textarea`、`ie-result` 等类，仅新增以下少量样式到 `assets/css/admin.css`：

```css
/* Tab Copy 导入 — 预览列表 */
.tab-copy-preview-list {
    max-height: 240px;
    overflow-y: auto;
    border: 1px solid #e4ecf3;
    border-radius: 4px;
    margin-bottom: 10px;
    background: #f8fafc;
}

.tab-copy-preview-item {
    display: flex;
    align-items: center;
    padding: 6px 12px;
    border-bottom: 1px solid #f0f4f8;
    font-size: 13px;
}

.tab-copy-preview-item:last-child {
    border-bottom: none;
}

.tab-copy-preview-item.skipped {
    color: #a0aab4;
    font-style: italic;
}

.tab-copy-preview-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #2c3e50;
    margin-right: 8px;
}

.tab-copy-preview-url {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #7a8fa8;
    font-size: 12px;
}

.tab-copy-preview-skip-label {
    color: #e67e22;
    font-size: 11px;
    white-space: nowrap;
    margin-left: 8px;
}

/* Tab Copy 导入 — 分类选择行 */
.tab-copy-import-row {
    display: flex;
    align-items: center;
    margin-top: 8px;
}
```

---

## 正确性属性

*属性是在系统所有有效执行中都应成立的特征或行为——本质上是关于系统应该做什么的形式化陈述。属性是人类可读规范与机器可验证正确性保证之间的桥梁。*

### 属性 1：字段映射完整性

*对任意* 包含 `title` 和 `url` 字段的 Tab Copy 元素数组，`_parseItems` 转换后每个有效元素的 `Bookmark.name` 应等于原 `title`（或在 `title` 为空时等于 `url`），`Bookmark.url` 应等于原 `url`，`Bookmark.logo` 应为空字符串。

**Validates: Requirements 2.1, 2.2, 2.5**

### 属性 2：无效元素过滤

*对任意* Tab Copy 数组，其中缺少 `url` 字段或 `url` 为空字符串的元素，`_parseItems` 的返回结果中不应包含这些元素（即有效书签数量 = 原数组长度 - 无效元素数量）。

**Validates: Requirements 2.3**

### 属性 3：解析错误处理

*对任意* 非合法 JSON 字符串，或合法 JSON 但非数组的值，`_parse` 函数应返回包含明确错误描述的结果，且不展示预览区域。

**Validates: Requirements 1.5, 1.6**

### 属性 4：导入追加不覆盖

*对任意* 目标分类（含任意数量的已有书签）和任意有效书签列表，执行 `_doImport` 后，该分类的 `sites` 数组长度应等于原长度加上有效书签数量，且原有书签保持不变，新书签追加在末尾。

**Validates: Requirements 4.1**

### 属性 5：成功提示数量准确

*对任意* N 个有效书签的导入操作，`_doImport` 完成后显示的成功提示文本中应包含数字 N。

**Validates: Requirements 4.2**

### 属性 6：分类路径格式化

*对任意* 父分类名称 P 和子分类名称 S，`_fillCategorySelect` 生成的对应 `<option>` 文本应为 `"P / S"` 格式。

**Validates: Requirements 3.3**

---

## 错误处理

| 场景 | 处理方式 | 提示文本 |
|------|---------|---------|
| 输入为空字符串 | 终止解析，显示提示 | "请粘贴 Tab Copy JSON 数据" |
| 输入不是合法 JSON | 终止解析，显示错误 | "JSON 格式错误，请检查输入内容" |
| 合法 JSON 但非数组 | 终止解析，显示错误 | "数据格式错误，需要 JSON 数组格式" |
| 数组为空 `[]` | 终止解析，显示提示 | "数组为空，没有可导入的书签" |
| 元素缺少 `url` 或 `url` 为空 | 跳过该元素，预览中标注 | "已跳过（缺少 URL）" |
| 元素缺少 `title` 或 `title` 为空 | 使用 `url` 作为 `name` | — |
| 未选择目标分类 | 阻止导入，显示提示 | "请选择目标分类" |
| 私有数据源为空 | 禁用确认按钮，下拉显示提示 | "请先创建私有数据源" |
| 当前为默认数据源 | 禁用整个导入区域 | "当前为默认数据源（只读），请先切换至私有数据源" |

所有错误提示通过 `#tab-copy-result` 区域显示，使用 `ie-result-err` 或 `ie-result-ok` 样式类。

---

## 测试策略

### 单元测试（example-based）

针对以下具体场景编写示例测试：

- 页面加载后 `#tab-copy-block` 元素存在（需求 1.1）
- 默认数据源时导入区域被禁用、只读提示可见（需求 5.1）
- 私有数据源时导入区域启用、只读提示隐藏（需求 5.2）
- 输入空字符串后点击解析，显示"请粘贴 Tab Copy JSON 数据"（需求 1.4）
- 输入 `"[]"` 后点击解析，显示"数组为空"（需求 1.7）
- 私有数据源为空时，下拉框显示提示项且确认按钮禁用（需求 3.2）
- 未选择分类点击确认，显示"请选择目标分类"（需求 3.4）
- 导入完成后输入框清空、预览区隐藏（需求 4.3）
- 导入完成后 `BookmarkManager.render` 被调用（需求 4.4）

### 属性测试（property-based）

使用 [fast-check](https://github.com/dubzzz/fast-check) 库，每个属性测试运行 100 次迭代。

**属性 1：字段映射完整性**
```
// Feature: tab-copy-import, Property 1: 字段映射完整性
fc.assert(fc.property(
    fc.array(fc.record({ title: fc.string(), url: fc.webUrl() })),
    function(items) {
        var result = TabCopyImporter._parseItems(items);
        return result.every(function(bm, i) {
            var src = items[i];
            return bm.name === (src.title || src.url) &&
                   bm.url === src.url &&
                   bm.logo === '';
        });
    }
), { numRuns: 100 });
```

**属性 2：无效元素过滤**
```
// Feature: tab-copy-import, Property 2: 无效元素过滤
fc.assert(fc.property(
    fc.array(fc.oneof(
        fc.record({ title: fc.string(), url: fc.webUrl() }),
        fc.record({ title: fc.string(), url: fc.constant('') }),
        fc.record({ title: fc.string() })
    )),
    function(items) {
        var validCount = items.filter(function(it) { return it.url && it.url !== ''; }).length;
        var result = TabCopyImporter._parseItems(items);
        return result.length === validCount;
    }
), { numRuns: 100 });
```

**属性 3：解析错误处理**
```
// Feature: tab-copy-import, Property 3: 解析错误处理
fc.assert(fc.property(
    fc.oneof(
        fc.string().filter(function(s) { try { JSON.parse(s); return false; } catch(e) { return true; } }),
        fc.jsonValue().filter(function(v) { return !Array.isArray(v); }).map(JSON.stringify)
    ),
    function(input) {
        var result = TabCopyImporter._validateInput(input);
        return result.error === true && typeof result.message === 'string' && result.message.length > 0;
    }
), { numRuns: 100 });
```

**属性 4：导入追加不覆盖**
```
// Feature: tab-copy-import, Property 4: 导入追加不覆盖
fc.assert(fc.property(
    fc.array(fc.record({ name: fc.string(), url: fc.webUrl(), logo: fc.string() })),
    fc.array(fc.record({ name: fc.string(), url: fc.webUrl(), logo: fc.constant('') })),
    function(existingSites, newBookmarks) {
        var data = { categories: [{ id: 'cat-test', name: 'Test', sites: existingSites.slice() }] };
        TabCopyImporter._appendToCategory(data, 'cat-test', '', newBookmarks);
        var resultSites = data.categories[0].sites;
        return resultSites.length === existingSites.length + newBookmarks.length &&
               existingSites.every(function(s, i) { return resultSites[i] === s; });
    }
), { numRuns: 100 });
```

**属性 5：成功提示数量准确**
```
// Feature: tab-copy-import, Property 5: 成功提示数量准确
fc.assert(fc.property(
    fc.integer({ min: 1, max: 50 }),
    function(n) {
        var msg = TabCopyImporter._buildSuccessMessage(n);
        return msg.indexOf(String(n)) !== -1;
    }
), { numRuns: 100 });
```

**属性 6：分类路径格式化**
```
// Feature: tab-copy-import, Property 6: 分类路径格式化
fc.assert(fc.property(
    fc.string({ minLength: 1 }),
    fc.string({ minLength: 1 }),
    function(parentName, subName) {
        var label = TabCopyImporter._formatCategoryLabel(parentName, subName);
        return label === parentName + ' / ' + subName;
    }
), { numRuns: 100 });
```

### 集成测试

- 完整导入流程：粘贴 → 解析 → 选择分类 → 确认导入 → 验证 `localStorage` 中数据已更新
- 数据源切换后导入区域状态正确更新
