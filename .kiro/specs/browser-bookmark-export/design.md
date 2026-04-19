# Design Document: 导出书签到浏览器

## Overview

本设计文档定义了 WebStack 管理面板中"导出书签到浏览器"功能的技术实现方案。该功能允许用户将书签数据导出为 Netscape Bookmark File Format（HTML 格式），支持选择性导出分类和书签，并能够导入到 Chrome、Firefox、Edge、Safari 等主流浏览器中。

### 核心目标

1. **标准兼容性**：生成符合 Netscape Bookmark File Format 标准的 HTML 文件
2. **灵活性**：支持分类级别和书签级别的选择性导出
3. **易用性**：提供直观的选择界面和一键导出功能
4. **数据源支持**：支持从默认数据源和私有数据源导出
5. **性能**：快速生成 HTML 文件，即使书签数量较多

### 技术约束

- **纯前端实现**：无后端依赖，所有逻辑在浏览器端完成
- **ES5 语法**：兼容 jQuery 1.11.1，不使用 ES6+ 特性
- **全局命名空间**：使用 `BrowserExportManager` 全局对象
- **现有模块集成**：复用 `DataSourceManager` 进行数据源管理
- **样式一致性**：遵循现有 `admin.css` 样式规范

## Architecture

### 模块结构

```
BrowserExportManager (新增模块)
├── UI 层
│   ├── 数据源选择器
│   ├── 分类树渲染器
│   ├── 书签列表渲染器
│   └── 操作按钮组
├── 数据层
│   ├── 选择状态管理
│   ├── 数据源加载（复用 DataSourceManager）
│   └── 选择验证
└── 导出层
    ├── HTML 生成器
    ├── 文件下载触发器
    └── 错误处理

依赖关系：
BrowserExportManager → DataSourceManager (数据源管理)
BrowserExportManager → jQuery 1.11.1 (DOM 操作)
BrowserExportManager → Bootstrap 3.x (Modal、样式)
```

### 数据流

```
用户操作 → UI 事件 → 状态更新 → 界面刷新
                              ↓
                         验证选择
                              ↓
                      生成 HTML 内容
                              ↓
                      创建 Blob 对象
                              ↓
                      触发浏览器下载
```

## Components and Interfaces

### 1. BrowserExportManager 模块

**职责**：管理导出到浏览器功能的所有逻辑

**公共接口**：

```javascript
var BrowserExportManager = {
    /**
     * 初始化模块（幂等）
     * 绑定事件、渲染初始界面
     */
    init: function () {},

    /**
     * 渲染分类树和书签列表
     * 从当前激活数据源加载数据
     */
    render: function () {},

    /**
     * 执行导出操作
     * 验证选择 → 生成 HTML → 触发下载
     */
    exportToFile: function () {}
};
```

**内部方法**：

```javascript
{
    /**
     * 绑定所有事件监听器（幂等）
     */
    _bindEvents: function () {},

    /**
     * 切换数据源
     * @param {string} target - "default" | "private"
     */
    _switchSource: function (target) {},

    /**
     * 构建分类树 HTML
     * @param {Array} categories - 分类数组
     * @returns {string} HTML 字符串
     */
    _buildCategoryTree: function (categories) {},

    /**
     * 构建单个分类行 HTML
     * @param {Object} category - 分类对象
     * @param {string} parentId - 父分类 ID（空字符串表示一级分类）
     * @returns {string} HTML 字符串
     */
    _buildCategoryRow: function (category, parentId) {},

    /**
     * 构建书签列表 HTML
     * @param {Array} sites - 书签数组
     * @param {string} categoryId - 所属分类 ID
     * @returns {string} HTML 字符串
     */
    _buildSiteList: function (sites, categoryId) {},

    /**
     * 处理分类复选框变化
     * @param {jQuery} $checkbox - 复选框元素
     */
    _handleCategoryCheckbox: function ($checkbox) {},

    /**
     * 处理书签复选框变化
     * @param {jQuery} $checkbox - 复选框元素
     */
    _handleSiteCheckbox: function ($checkbox) {},

    /**
     * 更新分类复选框状态（全选/半选/未选）
     * @param {string} categoryId - 分类 ID
     */
    _updateCategoryCheckboxState: function (categoryId) {},

    /**
     * 全选所有分类和书签
     */
    _selectAll: function () {},

    /**
     * 取消全选
     */
    _deselectAll: function () {},

    /**
     * 收集选中的书签数据
     * @returns {Object} { categories: [...], totalSites: number }
     */
    _collectSelectedData: function () {},

    /**
     * 生成 Netscape Bookmark File Format HTML
     * @param {Object} data - 选中的数据
     * @returns {string} HTML 字符串
     */
    _generateHTML: function (data) {},

    /**
     * 生成分类 HTML 片段（递归）
     * @param {Object} category - 分类对象
     * @param {number} level - 层级（1 或 2）
     * @returns {string} HTML 字符串
     */
    _generateCategoryHTML: function (category, level) {},

    /**
     * 生成书签 HTML 片段
     * @param {Object} site - 书签对象
     * @returns {string} HTML 字符串
     */
    _generateSiteHTML: function (site) {},

    /**
     * HTML 转义
     * @param {string} str - 原始字符串
     * @returns {string} 转义后的字符串
     */
    _escapeHtml: function (str) {},

    /**
     * 触发文件下载
     * @param {string} content - 文件内容
     * @param {string} filename - 文件名
     */
    _downloadFile: function (content, filename) {},

    /**
     * 显示结果提示
     * @param {boolean} success - 是否成功
     * @param {string} message - 提示信息
     */
    _showResult: function (success, message) {}
}
```

### 2. UI 组件结构

**HTML 结构**（添加到 `admin/import-export.html`）：

```html
<!-- 区块：导出到浏览器 -->
<div class="ie-block">
    <div class="ie-block-title">导出到浏览器</div>
    <p class="ie-block-desc">将书签导出为 HTML 格式，可导入到 Chrome/Firefox/Edge/Safari 等浏览器</p>
    
    <!-- 数据源选择 -->
    <div class="be-source-row">
        <span>当前数据源：<strong id="be-source-name">默认数据源</strong></span>
        <button class="btn btn-xs btn-default" id="be-switch-source-btn">
            <i class="fa fa-exchange"></i> 切换数据源
        </button>
    </div>
    
    <!-- 操作按钮行 -->
    <div class="be-action-row">
        <button class="btn btn-xs btn-default" id="be-select-all-btn">
            <i class="fa fa-check-square-o"></i> 全选
        </button>
        <button class="btn btn-xs btn-default" id="be-deselect-all-btn">
            <i class="fa fa-square-o"></i> 取消全选
        </button>
        <button class="btn btn-primary" id="be-export-btn">
            <i class="fa fa-download"></i> 导出选中书签
        </button>
    </div>
    
    <!-- 分类和书签选择树 -->
    <div class="be-tree-container" id="be-tree-container">
        <div class="be-loading">加载中...</div>
    </div>
    
    <!-- 结果提示 -->
    <div id="be-result" class="ie-result" style="display:none;"></div>
</div>
```

**CSS 样式**（添加到 `assets/css/admin.css`）：

```css
/* 导出到浏览器 — 数据源选择行 */
.be-source-row {
    display: -webkit-flex;
    display: flex;
    -webkit-align-items: center;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    background: #f8fafc;
    border-radius: 4px;
    margin-bottom: 12px;
    font-size: 13px;
}

.be-source-row strong {
    color: #2c3e50;
}

/* 操作按钮行 */
.be-action-row {
    display: -webkit-flex;
    display: flex;
    -webkit-flex-wrap: wrap;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
}

/* 分类树容器 */
.be-tree-container {
    max-height: 500px;
    overflow-y: auto;
    border: 1px solid #e4ecf3;
    border-radius: 4px;
    background: #fff;
    padding: 8px;
}

.be-loading,
.be-empty {
    padding: 40px;
    text-align: center;
    color: #a0aab4;
    font-size: 13px;
}

/* 分类行 */
.be-category-row {
    display: -webkit-flex;
    display: flex;
    -webkit-align-items: center;
    align-items: center;
    padding: 6px 8px;
    border-radius: 4px;
    margin-bottom: 4px;
    -webkit-transition: background 0.15s;
    transition: background 0.15s;
}

.be-category-row:hover {
    background: #f8fafc;
}

.be-category-row.be-level-1 {
    font-weight: 600;
    color: #2c3e50;
}

.be-category-row.be-level-2 {
    padding-left: 28px;
    font-size: 13px;
    color: #4a5a6a;
}

.be-category-checkbox {
    margin-right: 8px;
    cursor: pointer;
}

.be-category-name {
    -webkit-flex: 1;
    flex: 1;
    cursor: pointer;
}

.be-category-count {
    font-size: 11px;
    color: #7a8fa8;
    background: #eef2f7;
    padding: 2px 6px;
    border-radius: 10px;
    margin-right: 8px;
}

.be-toggle-icon {
    margin-right: 6px;
    font-size: 10px;
    color: #7a8fa8;
    cursor: pointer;
    -webkit-transition: -webkit-transform 0.15s;
    transition: transform 0.15s;
}

.be-toggle-icon.collapsed {
    -webkit-transform: rotate(-90deg);
    transform: rotate(-90deg);
}

/* 书签列表 */
.be-site-list {
    padding-left: 48px;
    margin-top: 4px;
    margin-bottom: 8px;
}

.be-site-row {
    display: -webkit-flex;
    display: flex;
    -webkit-align-items: center;
    align-items: center;
    padding: 4px 8px;
    border-radius: 4px;
    margin-bottom: 2px;
    font-size: 12px;
    -webkit-transition: background 0.15s;
    transition: background 0.15s;
}

.be-site-row:hover {
    background: #f8fafc;
}

.be-site-checkbox {
    margin-right: 8px;
    cursor: pointer;
}

.be-site-logo {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    object-fit: cover;
    margin-right: 8px;
    background: #f0f4f8;
}

.be-site-name {
    -webkit-flex: 1;
    flex: 1;
    color: #2c3e50;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.be-site-url {
    max-width: 200px;
    color: #7a8fa8;
    font-size: 11px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-left: 8px;
}
```

## Data Models

### 选择状态数据结构

```javascript
// 内部状态对象（不持久化）
{
    // 分类选择状态
    // key: categoryId, value: { checked: boolean, indeterminate: boolean }
    categoryStates: {
        'cat-recommend': { checked: true, indeterminate: false },
        'cat-community': { checked: false, indeterminate: true }
    },
    
    // 书签选择状态
    // key: "categoryId:siteIndex", value: boolean
    siteStates: {
        'cat-recommend:0': true,
        'cat-recommend:1': false
    },
    
    // 分类展开状态
    // key: categoryId, value: boolean
    expandedStates: {
        'cat-recommend': true,
        'cat-community': false
    }
}
```

### Netscape Bookmark File Format 结构

```html
<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
    <DT><H3 ADD_DATE="1234567890">一级分类名称</H3>
    <DL><p>
        <DT><A HREF="https://example.com/" ADD_DATE="1234567890">书签名称</A>
        <DT><A HREF="https://example2.com/" ADD_DATE="1234567890">书签名称2</A>
    </DL><p>
    
    <DT><H3 ADD_DATE="1234567890">包含子分类的一级分类</H3>
    <DL><p>
        <DT><H3 ADD_DATE="1234567890">二级分类名称</H3>
        <DL><p>
            <DT><A HREF="https://sub.example.com/" ADD_DATE="1234567890">子分类书签</A>
        </DL><p>
    </DL><p>
</DL><p>
```

**格式规范**：

1. **DOCTYPE 声明**：`<!DOCTYPE NETSCAPE-Bookmark-file-1>`
2. **META 标签**：指定 UTF-8 编码
3. **层级结构**：使用 `<DL>` 和 `<DT>` 标签
4. **分类标签**：`<H3 ADD_DATE="timestamp">分类名</H3>`
5. **书签标签**：`<A HREF="url" ADD_DATE="timestamp">书签名</A>`
6. **时间戳**：Unix 时间戳（秒），使用 `Math.floor(Date.now() / 1000)`
7. **特殊字符**：必须进行 HTML 转义（`&`, `<`, `>`, `"`, `'`）

## Error Handling

### 错误类型和处理策略

| 错误类型 | 触发条件 | 处理方式 |
|---------|---------|---------|
| **数据源加载失败** | `DataSourceManager.load()` 失败 | 显示错误提示"数据加载失败，请重试"，禁用导出按钮 |
| **未选择任何书签** | 用户点击导出但未勾选任何书签 | 显示警告提示"请至少选择一个书签" |
| **HTML 生成异常** | `_generateHTML()` 抛出异常 | 捕获异常，显示错误提示"导出失败，请重试"，记录错误到控制台 |
| **文件下载失败** | Blob API 或 URL.createObjectURL 失败 | 显示错误提示"文件下载失败，请检查浏览器兼容性" |
| **数据格式异常** | 数据源返回的数据结构不符合预期 | 显示错误提示"数据格式错误"，记录详细信息到控制台 |

### 错误处理实现

```javascript
// 统一错误处理包装器
_safeExecute: function (fn, errorMessage) {
    try {
        fn();
    } catch (e) {
        console.error('[BrowserExportManager]', errorMessage, e);
        BrowserExportManager._showResult(false, errorMessage);
    }
},

// 导出操作错误处理
exportToFile: function () {
    BrowserExportManager._safeExecute(function () {
        // 验证选择
        var data = BrowserExportManager._collectSelectedData();
        if (data.totalSites === 0) {
            BrowserExportManager._showResult(false, '请至少选择一个书签');
            return;
        }
        
        // 生成 HTML
        var html = BrowserExportManager._generateHTML(data);
        
        // 触发下载
        var now = new Date();
        var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
        var dateStr = '' + now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate()) +
                      '_' + pad(now.getHours()) + pad(now.getMinutes()) + pad(now.getSeconds());
        var filename = 'webstack-bookmarks-' + dateStr + '.html';
        
        BrowserExportManager._downloadFile(html, filename);
        
        // 显示成功提示
        var categoryCount = data.categories.length;
        BrowserExportManager._showResult(true, 
            '已导出 ' + data.totalSites + ' 个书签到 ' + categoryCount + ' 个分类');
        
        // 2.5 秒后自动隐藏提示
        setTimeout(function () {
            $('#be-result').fadeOut(300);
        }, 2500);
        
    }, '导出失败，请重试');
}
```

## Testing Strategy

### 单元测试

由于项目使用纯前端技术栈且无构建系统，测试策略采用手动测试为主，辅以浏览器控制台验证。

**测试用例**：

1. **HTML 生成测试**
   - 输入：包含 1 个一级分类、2 个书签的数据
   - 预期：生成符合 Netscape 格式的 HTML，包含正确的 DOCTYPE、META 标签和层级结构
   - 验证方法：在控制台调用 `BrowserExportManager._generateHTML(testData)` 并检查输出

2. **HTML 转义测试**
   - 输入：包含特殊字符的书签名称（`<script>alert("XSS")</script>`）
   - 预期：特殊字符被正确转义为 HTML 实体
   - 验证方法：检查生成的 HTML 中是否包含 `&lt;script&gt;`

3. **层级结构测试**
   - 输入：包含一级分类和二级分类的完整数据结构
   - 预期：生成的 HTML 正确嵌套 `<DL>` 标签
   - 验证方法：导出文件后在浏览器中导入，检查分类层级是否正确

4. **选择状态同步测试**
   - 操作：勾选一级分类复选框
   - 预期：该分类下所有子分类和书签自动勾选
   - 验证方法：检查 DOM 中所有相关复选框的 `checked` 属性

5. **半选状态测试**
   - 操作：勾选分类下的部分书签
   - 预期：分类复选框显示为半选状态（`indeterminate = true`）
   - 验证方法：检查分类复选框的 `indeterminate` 属性

### 集成测试

**浏览器兼容性测试**：

| 浏览器 | 版本 | 测试内容 | 预期结果 |
|--------|------|---------|---------|
| Chrome | 最新版 | 导出并导入书签 | 分类层级正确，书签 URL 可访问 |
| Firefox | 最新版 | 导出并导入书签 | 分类层级正确，书签 URL 可访问 |
| Edge | 最新版 | 导出并导入书签 | 分类层级正确，书签 URL 可访问 |
| Safari | 最新版 | 导出并导入书签 | 分类层级正确，书签 URL 可访问 |

**性能测试**：

| 书签数量 | 预期生成时间 | 测试方法 |
|---------|-------------|---------|
| < 1000 | < 1 秒 | 使用 `console.time()` 测量 `_generateHTML()` 执行时间 |
| 1000-5000 | < 3 秒 | 使用 `console.time()` 测量 `_generateHTML()` 执行时间 |

**端到端测试流程**：

1. 打开 `admin/import-export.html`
2. 切换到"导出到浏览器"区块
3. 验证数据源显示正确
4. 切换数据源，验证分类列表刷新
5. 勾选部分分类和书签
6. 点击"导出选中书签"
7. 验证文件下载触发
8. 在浏览器中导入下载的 HTML 文件
9. 验证书签和分类结构正确

### 边界条件测试

1. **空数据源**：数据源中没有任何分类
   - 预期：显示"暂无数据"提示，禁用导出按钮

2. **空分类**：分类下没有任何书签
   - 预期：该分类不出现在导出文件中

3. **特殊字符**：书签名称和 URL 包含 `&`, `<`, `>`, `"`, `'`
   - 预期：正确转义，导入后显示正常

4. **超长 URL**：书签 URL 长度超过 2000 字符
   - 预期：完整保留，不截断

5. **中文字符**：书签名称和分类名称包含中文
   - 预期：使用 UTF-8 编码，导入后显示正常

## Correctness Properties

*属性（Property）是指在系统所有有效执行中都应该成立的特征或行为——本质上是对系统应该做什么的形式化陈述。属性是人类可读规范和机器可验证正确性保证之间的桥梁。*

### 属性测试适用性评估

本功能**部分适合**属性测试（Property-Based Testing）：

**适合 PBT 的部分**：
- **HTML 生成逻辑**：将 JSON 数据转换为 Netscape Bookmark File Format 是纯函数转换，适合测试格式规范、顺序保持、特殊字符转义等通用属性
- **状态管理逻辑**：复选框状态同步、全选/取消全选等状态转换逻辑适合测试状态一致性属性

**不适合 PBT 的部分**：
- **UI 渲染**：分类树、复选框列表的渲染应使用快照测试或示例测试
- **文件下载**：触发浏览器下载是副作用操作，应使用 mock 测试
- **浏览器兼容性**：测试外部系统（浏览器）的行为，应使用集成测试

### Property 1: HTML 格式规范完整性

*对于任意*有效的书签数据结构，生成的 HTML 应该符合 Netscape Bookmark File Format 规范，包含必需的 DOCTYPE 声明、UTF-8 META 标签、正确嵌套的 DL/DT 标签、每个书签的 A 标签包含 HREF 和 ADD_DATE 属性、每个分类的 H3 标签包含 ADD_DATE 属性、所有 ADD_DATE 值为有效的 Unix 时间戳（秒）

**Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6**

### Property 2: 分类层级映射正确性

*对于任意*包含一级和二级分类的书签数据，生成的 HTML 应该正确映射分类层级：一级分类转换为顶层 H3 标签，二级分类转换为嵌套在父分类 DL 中的 H3 标签，且所有子分类都被正确处理

**Validates: Requirements 2.1, 2.2, 2.5**

### Property 3: 顺序保持不变性

*对于任意*书签数据结构，生成的 HTML 中分类和书签的出现顺序应该与输入数据中的顺序完全一致

**Validates: Requirements 2.3, 2.4**

### Property 4: 分类与子分类状态同步

*对于任意*包含子分类的一级分类，当勾选或取消勾选该一级分类的复选框时，所有子分类的复选框状态应该自动同步为相同状态

**Validates: Requirements 3.3, 3.4**

### Property 5: 分类与书签状态同步

*对于任意*包含书签的分类，当勾选或取消勾选该分类的复选框时，该分类下所有书签的复选框状态应该自动同步为相同状态

**Validates: Requirements 4.3, 4.4**

### Property 6: 书签全选时分类自动勾选

*对于任意*包含多个书签的分类，当该分类下的所有书签都被勾选时，该分类的复选框应该自动变为勾选状态

**Validates: Requirements 4.6**

### Property 7: 书签部分选中时分类半选状态

*对于任意*包含多个书签的分类，当该分类下的部分书签（至少一个但不是全部）被勾选时，该分类的复选框应该显示为半选状态（indeterminate 属性为 true）

**Validates: Requirements 4.7**

### Property 8: 全选和取消全选操作正确性

*对于任意*书签数据结构，执行全选操作后所有分类和书签的复选框状态应该为 checked，执行取消全选操作后所有复选框状态应该为 unchecked

**Validates: Requirements 3.7, 3.8**

### Property 9: HTML 特殊字符转义正确性

*对于任意*包含特殊字符（`&`, `<`, `>`, `"`, `'`）的书签名称或 URL，生成的 HTML 中这些字符应该被正确转义为对应的 HTML 实体（`&amp;`, `&lt;`, `&gt;`, `&quot;`, `&#39;`）

**Validates: Requirements 9.5**

### Property 10: 文件名格式正确性

*对于任意*导出操作，生成的文件名应该符合格式 `webstack-bookmarks-YYYYMMDD_HHMMSS.html`，其中日期时间部分为有效的时间戳格式

**Validates: Requirements 6.7**

### Property 11: 导出成功提示信息准确性

*对于任意*选中的书签数据，导出成功后显示的提示信息中的书签数量和分类数量应该与实际选中的数量完全一致

**Validates: Requirements 7.3**

