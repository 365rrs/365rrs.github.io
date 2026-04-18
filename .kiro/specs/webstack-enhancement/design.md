# 技术设计文档：WebStack 二次开发

## 概述

本次改造将 WebStack 从"硬编码 HTML 导航站"升级为"数据驱动的可管理导航站"。核心思路是：

- **数据与视图分离**：所有书签/分类数据从 HTML 中提取为 JSON，由 JS 模块动态渲染
- **双数据源架构**：Default_Source（静态 JSON 文件）+ Private_Source（localStorage 主存储，OSS 远端备份）
- **零构建约束**：全程保持纯 HTML/CSS/JS，无 npm、无打包，直接编辑文件部署
- **渐进增强**：新增功能（搜索、管理面板、OSS 同步）不破坏原有视觉风格

改造后的文件入口：
- `cn/index.html` — 唯一的导航主页（移除英文版）
- `cn/admin.html` — 管理面板（新增）
- `assets/data/default.json` — 默认数据源（新增）
- `assets/js/app.js` — 核心应用逻辑（新增）
- `assets/js/admin.js` — 管理面板逻辑（新增）

---

## 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                        cn/index.html                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │ Renderer │  │ Searcher │  │DataSource│  │SyncManager│  │
│  │          │  │          │  │ Manager  │  │(auto sync)│  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └─────┬─────┘  │
└───────┼─────────────┼─────────────┼───────────────┼────────┘
        │             │             │               │
        ▼             ▼             ▼               ▼
   DOM 渲染      关键词过滤    数据源切换        版本检查
                              ┌────────────────────────────┐
                              │  Default_Source             │
                              │  assets/data/default.json  │
                              ├────────────────────────────┤
                              │  Private_Source             │
                              │  localStorage (主存储)      │
                              │  OSS (远端备份)             │
                              └────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                       cn/admin.html                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │ Category │  │ Bookmark │  │  Sorter  │  │SyncManager│  │
│  │ Manager  │  │ Manager  │  │          │  │(手动同步) │  │
│  └──────────┘  └──────────┘  └──────────┘  └───────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              ImportExport / OSSConfig                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 模块职责

| 模块 | 文件 | 职责 |
|------|------|------|
| Renderer | `assets/js/app.js` | 读取数据源，生成侧边栏菜单和卡片列表 DOM |
| Searcher | `assets/js/app.js` | 实时关键词过滤，控制卡片/分类区块的显示隐藏 |
| DataSourceManager | `assets/js/app.js` | 管理数据源切换，读写 localStorage 中的激活状态 |
| SyncManager | `assets/js/app.js` + `assets/js/admin.js` | OSS 版本检查、上传、下载；自动同步调度 |
| CategoryManager | `assets/js/admin.js` | 分类的增删改，维护分类树结构 |
| BookmarkManager | `assets/js/admin.js` | 书签的增删改，挂载到正确的分类节点 |
| Sorter | `assets/js/admin.js` | 分类和书签的上移/下移排序，持久化至 localStorage |
| ImportExport | `assets/js/admin.js` | JSON 文件下载/上传、剪贴板复制/粘贴 |
| OSSConfig | `assets/js/admin.js` | OSS 配置的读写、加密存储、连接测试 |

---

## 数据结构设计

### 书签（Site）

```json
{
  "name": "Dribbble",
  "url": "https://dribbble.com/",
  "logo": "../assets/images/logos/dribbble.png",
  "desc": "全球UI设计师作品分享平台。"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | ✓ | 网站名称 |
| url | string | ✓ | 网站链接 |
| logo | string | ✓ | Logo 图片路径（相对路径或绝对 URL） |
| desc | string | | 网站描述（可选，用于搜索匹配和卡片展示） |

### 分类（Category）

**纯一级结构**（书签直接挂在一级分类下）：

```json
{
  "id": "cat-recommend",
  "name": "⭐ 常用推荐",
  "icon": "linecons-star",
  "sites": [
    { "name": "Dribbble", "url": "...", "logo": "..." }
  ]
}
```

**一级 + 二级结构**（书签挂在二级分类下）：

```json
{
  "id": "cat-inspiration",
  "name": "💡 灵感采集",
  "icon": "linecons-lightbulb",
  "children": [
    {
      "id": "cat-product",
      "name": "发现产品",
      "sites": [
        { "name": "Product Hunt", "url": "...", "logo": "..." }
      ]
    },
    {
      "id": "cat-ui",
      "name": "界面灵感",
      "sites": []
    }
  ]
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | ✓ | 唯一标识，用于锚点跳转（如 `#cat-recommend`） |
| name | string | ✓ | 分类名称，支持 emoji |
| icon | string | | 图标类名（linecons/fontawesome），仅一级分类有 |
| children | Category[] | | 二级子分类数组，有此字段时 sites 应为空或不存在 |
| sites | Site[] | | 书签列表，有 children 时此字段无效 |

### 完整数据文件结构（`assets/data/default.json`）

```json
{
  "categories": [
    {
      "id": "cat-recommend",
      "name": "⭐ 常用推荐",
      "icon": "linecons-star",
      "sites": [...]
    },
    {
      "id": "cat-inspiration",
      "name": "💡 灵感采集",
      "icon": "linecons-lightbulb",
      "children": [
        {
          "id": "cat-product",
          "name": "发现产品",
          "sites": [...]
        }
      ]
    }
  ]
}
```

### OSS 版本文件（`{prefix}version.json`）

```json
{
  "version": "20240115143022",
  "updatedAt": "2024-01-15T14:30:22.000Z",
  "description": "WebStack Private Data"
}
```

版本号格式：`YYYYMMDDHHmmss`（时间戳字符串，便于字符串比较大小）

### OSS 数据文件（`{prefix}data-{version}.json`）

内容与 `default.json` 格式完全相同（`{ "categories": [...] }`）。

---

## localStorage 键值设计

| Key | 类型 | 说明 |
|-----|------|------|
| `ws_active_source` | `"default"` \| `"private"` | 当前激活的数据源 |
| `ws_private_data` | JSON string | Private_Source 的完整数据（`{ "categories": [...] }`） |
| `ws_private_version` | string | 本地数据对应的版本号（与 OSS version.json 比对用） |
| `ws_oss_config` | JSON string（加密） | OSS 配置（AK、SK、Bucket、Region、prefix） |
| `ws_sync_config` | JSON string | 自动同步配置（`{ "onLoad": true, "interval": 3600 }`） |
| `ws_last_upload_at` | ISO string | 最后一次成功上传的时间戳 |
| `ws_last_download_at` | ISO string | 最后一次成功下载的时间戳 |
| `ws_last_upload_version` | string | 最后一次成功上传的版本号 |
| `ws_last_download_version` | string | 最后一次成功下载的版本号 |

---

## 文件结构变更

```
/
├── index.html                    # 修改：直接重定向至 cn/index.html（移除语言检测）
├── 404.html                      # 不变
├── CNAME                         # 不变
│
├── cn/
│   ├── index.html                # 重构：移除硬编码数据，添加搜索框、数据源切换入口
│   ├── admin.html                # 新增：管理面板
│   └── about.html                # 不变
│
├── en/                           # 保留目录但 index.html 改为重定向至 cn/index.html
│
└── assets/
    ├── css/
    │   ├── nav.css               # 修改：添加搜索框、管理面板相关样式
    │   └── admin.css             # 新增：管理面板专用样式
    ├── js/
    │   ├── app.js                # 新增：Renderer、Searcher、DataSourceManager、SyncManager（自动）
    │   └── admin.js              # 新增：CategoryManager、BookmarkManager、Sorter、ImportExport、OSSConfig、SyncManager（手动）
    └── data/
        └── default.json          # 新增：默认数据源
```

---

## 关键交互流程

### 流程 1：页面加载与数据渲染

```
cn/index.html 加载
    │
    ├─ 读取 ws_active_source（默认 "default"）
    │
    ├─ [if "default"] fetch("../assets/data/default.json")
    │   └─ 成功 → Renderer.render(data)
    │   └─ 失败 → 显示错误提示
    │
    ├─ [if "private"]
    │   ├─ 读取 localStorage["ws_private_data"]
    │   ├─ [if 存在] Renderer.render(data)
    │   └─ [if 不存在] 显示"请前往管理面板创建私有数据"提示
    │
    ├─ Renderer.render(data):
    │   ├─ 清空 #main-menu 和 .main-content 内容区
    │   ├─ 遍历 categories，生成侧边栏 <li> 菜单项
    │   │   ├─ 纯一级：直接生成 <li><a href="#id">
    │   │   └─ 一级+二级：生成带子菜单的 <li>，子项各自生成 <li><a href="#sub-id">
    │   ├─ 遍历 categories，生成内容区分类区块和卡片
    │   │   ├─ 纯一级：<h4 id="cat-id"> + <div class="row"> 卡片列表
    │   │   └─ 一级+二级：一级标题 + 各二级子标题 + 对应卡片列表
    │   └─ 初始化 lozad（懒加载图片）、Bootstrap tooltip、Xenon 侧边栏
    │
    └─ [if 自动同步已启用] SyncManager.checkAndSync()
```

### 流程 2：站内搜索

```
用户在搜索框输入关键词（keyup 事件）
    │
    ├─ keyword = input.value.trim().toLowerCase()
    │
    ├─ [if keyword === ""] → 显示所有卡片和分类区块，退出
    │
    └─ 遍历所有 .xe-widget 卡片：
        ├─ 提取 name（.xe-user-name strong）和 desc（.xe-comment p）
        ├─ [if name 或 desc 包含 keyword] → 显示该卡片
        └─ [if 不匹配] → 隐藏该卡片
        
    遍历所有分类区块（.category-section）：
        ├─ [if 区块内有可见卡片] → 显示该区块（含标题）
        └─ [if 区块内无可见卡片] → 隐藏该区块
        
    [if 所有卡片均隐藏] → 显示 #no-results 提示
```

### 流程 3：OSS 手动上传

```
用户点击"上传至 OSS"
    │
    ├─ 禁用上传/下载按钮，显示 loading
    ├─ 读取 ws_private_data（Local_Data）
    ├─ 生成版本号：version = new Date().toISOString().replace(/\D/g, '').slice(0, 14)
    │
    ├─ OSS.put("{prefix}data-{version}.json", Local_Data)
    │   └─ 失败 → 显示错误，恢复按钮状态，退出
    │
    ├─ OSS.put("{prefix}version.json", { version, updatedAt: new Date().toISOString() })
    │   └─ 失败 → 显示错误（数据文件已上传但版本文件失败，提示重试）
    │
    ├─ 更新 localStorage：ws_private_version、ws_last_upload_at、ws_last_upload_version
    └─ 显示成功提示（时间戳 + 版本号），恢复按钮状态
```

### 流程 4：OSS 自动同步（页面加载时）

```
页面加载完成，ws_sync_config.onLoad === true
    │
    ├─ [if OSS 配置不完整] → 静默跳过，console.log 提示
    │
    ├─ OSS.get("{prefix}version.json")
    │   └─ 失败 → console.error，静默退出
    │
    ├─ remoteVersion = versionFile.version
    ├─ localVersion = localStorage["ws_private_version"] || "0"
    │
    ├─ [if remoteVersion <= localVersion] → 无需同步，退出
    │
    ├─ OSS.get("{prefix}data-{remoteVersion}.json")
    │   └─ 失败 → console.error，静默退出
    │
    ├─ 更新 localStorage：ws_private_data、ws_private_version、ws_last_download_at
    └─ [if 当前激活 Private_Source] → Renderer.render(newData)（刷新页面卡片）
```

### 流程 5：分类排序（上移/下移）

```
用户点击某分类的"上移"按钮
    │
    ├─ 读取 ws_private_data
    ├─ 定位目标分类在数组中的 index
    ├─ [if index === 0] → 已在顶部，不操作
    │
    ├─ 交换 categories[index] 和 categories[index - 1]
    ├─ 保存至 localStorage["ws_private_data"]
    └─ 刷新管理面板分类列表 DOM
```

### 流程 6：数据导入（文件上传）

```
用户选择 JSON 文件
    │
    ├─ FileReader.readAsText(file)
    ├─ 尝试 JSON.parse(text)
    │   └─ 失败 → 显示解析错误信息，不执行覆盖，退出
    │
    ├─ 验证数据结构（必须包含 categories 数组）
    │   └─ 不合法 → 显示结构错误信息，不执行覆盖，退出
    │
    ├─ localStorage["ws_private_data"] = JSON.stringify(importedData)
    └─ 刷新管理面板
```

---

## 模块接口设计

### Renderer

```javascript
// app.js
var Renderer = {
  // 渲染完整页面（侧边栏 + 内容区）
  render: function(data) { ... },
  // 清空内容区和侧边栏
  clear: function() { ... },
  // 生成单个卡片 HTML
  _buildCard: function(site) { ... },
  // 生成侧边栏菜单项 HTML
  _buildMenuItem: function(category) { ... }
};
```

### Searcher

```javascript
// app.js
var Searcher = {
  // 绑定搜索框事件
  init: function() { ... },
  // 执行过滤（keyword 为空时恢复全部显示）
  filter: function(keyword) { ... }
};
```

### DataSourceManager

```javascript
// app.js
var DataSourceManager = {
  // 获取当前激活数据源标识
  getActive: function() { ... },          // 返回 "default" | "private"
  // 切换数据源并重新渲染
  switchTo: function(source) { ... },
  // 读取数据（返回 Promise）
  load: function(source) { ... },
  // 读取 Private_Source 原始数据对象
  getPrivateData: function() { ... },
  // 保存 Private_Source 数据
  savePrivateData: function(data) { ... }
};
```

### SyncManager

```javascript
// app.js（自动同步） + admin.js（手动同步）
var SyncManager = {
  // 检查 OSS 版本并按需下载（自动同步入口）
  checkAndSync: function() { ... },
  // 手动上传至 OSS
  upload: function(onSuccess, onError) { ... },
  // 手动从 OSS 下载
  download: function(onSuccess, onError) { ... },
  // 启动定时同步
  startTimer: function(intervalSeconds) { ... },
  // 停止定时同步
  stopTimer: function() { ... }
};
```

### Sorter

```javascript
// admin.js
var Sorter = {
  // 移动一级分类（direction: "up" | "down"）
  moveCategory: function(categoryId, direction) { ... },
  // 移动二级分类
  moveSubCategory: function(parentId, subId, direction) { ... },
  // 移动书签
  moveSite: function(categoryId, siteIndex, direction) { ... }
};
```

---

## OSS SDK 集成方案

由于项目无构建系统，OSS SDK 通过 CDN 引入：

```html
<!-- admin.html 中引入 ali-oss SDK -->
<script src="https://gosspublic.alicdn.com/aliyun-oss-sdk-6.18.1.min.js"></script>
```

OSS 客户端初始化：

```javascript
var ossClient = new OSS({
  region: config.region,
  accessKeyId: config.accessKeyId,
  accessKeySecret: config.accessKeySecret,
  bucket: config.bucket
});
```

**安全说明**：AccessKeySecret 存储在 localStorage 中，使用简单的 XOR 混淆（非加密级别安全）。建议用户使用仅有特定 Bucket 读写权限的 RAM 子账号 AK/SK，并在 OSS Bucket 配置 CORS 允许来源域名。

---

## 错误处理策略

| 场景 | 处理方式 |
|------|----------|
| default.json 加载失败 | 主内容区显示错误提示，侧边栏保持空白 |
| Private_Source 不存在 | 显示引导提示，链接至 admin.html |
| JSON 导入格式错误 | 显示具体错误信息，不覆盖现有数据 |
| OSS 操作失败（手动） | 显示具体错误信息（网络/权限/Bucket 不存在等） |
| OSS 操作失败（自动） | 静默记录至 console.error，不打断用户浏览 |
| OSS 配置不完整 | 禁用同步按钮，显示配置提示 |
| 版本文件不存在（首次上传前下载） | 显示"OSS 上暂无数据，请先上传"提示 |

---

## 测试策略

本项目为纯静态前端，无构建系统，测试策略以轻量为主：

### 单元测试（示例测试）

针对纯函数逻辑，可在浏览器控制台或独立 HTML 测试页中验证：

- `Renderer._buildCard(site)` 生成正确的 HTML 结构
- `Searcher.filter("")` 恢复所有卡片显示
- `DataSourceManager.getActive()` 在 localStorage 为空时返回 `"default"`
- OSS 配置不完整时同步按钮被禁用

### 属性测试（Property-Based Testing）

由于项目无构建系统，属性测试通过在独立 HTML 页面中引入 [fast-check](https://fast-check.io/) CDN 实现：

```html
<!-- test/property-tests.html -->
<script src="https://cdn.jsdelivr.net/npm/fast-check/lib/bundle/fast-check.min.js"></script>
```

每个属性测试配置最少 100 次迭代。

### 集成测试

- OSS 连接测试：使用真实 OSS 配置，验证 version.json 读写
- 数据源切换：验证切换后页面内容正确更新

---

## 正确性属性

*属性（Property）是在系统所有合法执行中都应成立的特征或行为——本质上是对系统应做什么的形式化陈述。属性是人类可读规范与机器可验证正确性保证之间的桥梁。*

### 属性 1：数据序列化 Round-Trip

*对任意* 合法的分类/书签数据对象，`JSON.stringify` 后再 `JSON.parse` 应得到与原始对象深度相等的对象。

**验证需求：2.2**

### 属性 2：渲染完整性

*对任意* 合法的数据集（包含若干分类和书签），调用 `Renderer.render(data)` 后，页面中 `.xe-widget` 卡片的数量应等于数据中所有叶子节点书签的总数。

**验证需求：2.3**

### 属性 3：搜索结果正确性

*对任意* 非空关键词和任意数据集，`Searcher.filter(keyword)` 执行后，所有可见卡片的 `name` 或 `desc` 字段（忽略大小写）均应包含该关键词；所有不包含该关键词的卡片均应被隐藏。

**验证需求：3.2、3.3**

### 属性 4：搜索清空恢复

*对任意* 数据集，先执行任意关键词搜索，再调用 `Searcher.filter("")`，页面中可见卡片的数量应恢复为数据中书签的总数。

**验证需求：3.4**

### 属性 5：数据源选择持久化

*对任意* 数据源标识（`"default"` 或 `"private"`），调用 `DataSourceManager.switchTo(source)` 后，再调用 `DataSourceManager.getActive()` 应返回相同的值。

**验证需求：4.4**

### 属性 6：书签增删的数量不变量

*对任意* 包含 N 个书签的 Private_Source：
- 添加一个合法书签后，书签总数应为 N+1，且新书签可在数据中找到
- 删除一个已存在的书签后，书签总数应为 N-1，且该书签不再出现在数据中

**验证需求：5.3、5.5**

### 属性 7：书签编辑幂等性

*对任意* 书签和任意合法的修改值，编辑并保存后，再次读取该书签的对应字段应等于修改后的值；其他书签不受影响。

**验证需求：5.4**

### 属性 8：导入/导出 Round-Trip

*对任意* 合法的 Local_Data，执行导出（序列化为 JSON 字符串）后再导入（解析并写入 localStorage），localStorage 中的数据应与原始 Local_Data 深度相等。

**验证需求：5.7、5.8、5.9**

### 属性 9：非法 JSON 导入不修改数据

*对任意* 非法 JSON 字符串（无法被 `JSON.parse` 解析，或缺少 `categories` 字段），执行导入操作后，localStorage 中的 `ws_private_data` 应与操作前完全相同。

**验证需求：5.11**

### 属性 10：删除分类级联清除

*对任意* 包含子分类和书签的一级分类，删除该一级分类后，其所有子分类 ID 和书签均不应出现在 Private_Source 的任何位置。

**验证需求：6.7、6.8**

### 属性 11：Default_Source 排序不变量

*对任意* 排序操作（对分类或书签执行上移/下移），操作前后 `assets/data/default.json` 的内容（或内存中 Default_Source 的数据对象）应完全不变。

**验证需求：12.6**

### 属性 12：排序边界不变量

*对任意* 分类或书签列表，对位于顶部（index=0）的元素执行"上移"操作，或对位于底部（index=length-1）的元素执行"下移"操作，列表顺序应保持不变。

**验证需求：12.1、12.4**

### 属性 13：OSS 上传/下载 Round-Trip（使用 Mock）

*对任意* 合法的 Local_Data，执行上传至 OSS（mock）后再从 OSS 下载，下载得到的数据应与上传的数据深度相等。

**验证需求：9.1、9.2**

### 属性 14：版本号单调递增

*对任意* 两次连续的上传操作，后一次生成的版本号应大于前一次的版本号（字符串比较）。

**验证需求：9.1**
