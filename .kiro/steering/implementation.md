---
inclusion: always
---

# Implementation Details

本文档记录 WebStack 项目的关键实现细节和代码约定。

## 核心模块实现

### Renderer 模块

#### 渲染流程

```javascript
Renderer.render(data)
  ↓
1. Renderer.clear() — 清空现有内容
2. 遍历 categories 数组
3. 生成侧边栏菜单 HTML（_buildMenuItem）
4. 生成内容区 HTML（_buildSection）
5. 插入 DOM
6. 初始化懒加载（lozad）
7. 初始化 tooltip（Bootstrap）
8. 重新绑定子菜单事件（_initSubMenus）
```

#### 卡片生成逻辑

```javascript
Renderer._buildCard(site, categoryId, siteUrl)
```

- 使用 `ColumnsManager.getColumnClass()` 获取当前列数对应的栅格类
- 私有数据源时添加删除按钮（内联 onclick）
- Logo 路径通过 `normalizeLogo()` 规范化
- 使用 `data-src` + `class="lozad"` 实现懒加载
- 卡片点击事件：`onclick="window.open(url, '_blank')"`
- 删除按钮点击事件：`onclick="Renderer.deleteBookmark(event, categoryId, siteUrl)"`（阻止冒泡）

#### 删除书签流程

```javascript
Renderer.deleteBookmark(event, categoryId, siteUrl)
  ↓
1. 阻止事件冒泡（event.stopPropagation()）
2. 弹出确认对话框
3. 从私有数据中删除书签（_deleteSiteFromData）
4. 保存到 localStorage（DataSourceManager.savePrivateData）
5. 重新渲染页面（Renderer.render）
6. 重新初始化搜索（Searcher.init）
```

### ColumnsManager 模块

#### 列数配置

```javascript
configs: [
  { columns: 4, class: 'col-sm-3', label: '4列' },
  { columns: 6, class: 'col-sm-2', label: '6列' },
  { columns: 12, class: 'col-sm-1', label: '12列' }
]
```

- Bootstrap 栅格系统：12 列总宽度
- `col-sm-3` = 12/4 = 每行 4 个卡片
- `col-sm-2` = 12/6 = 每行 6 个卡片
- `col-sm-1` = 12/12 = 每行 12 个卡片

#### 切换流程

```javascript
ColumnsManager.toggleColumns()
  ↓
1. 获取当前列数（getColumns）
2. 找到当前配置索引
3. 切换到下一个配置（循环）
4. 应用新配置（applyColumns）
  ↓
  4.1 保存到 localStorage
  4.2 更新按钮标签
  4.3 重新加载数据源
  4.4 重新渲染页面
  4.5 重新初始化搜索
```

### DataSourceManager 模块

#### 数据源加载

```javascript
DataSourceManager.load(source)
  ↓
返回 jQuery Deferred 对象

- source === 'private':
  1. 读取 localStorage.ws_private_data
  2. 兼容旧版本（无后缀）
  3. JSON.parse() 解析
  4. resolve(data) 或 reject(error)

- source === 'default':
  1. $.getJSON('./assets/data/default.json')
  2. resolve(data) 或 reject(error)
```

#### 数据源切换

```javascript
DataSourceManager.switchTo(source)
  ↓
1. 检查私有数据源是否存在
2. 保存到 localStorage.ws_active_source
3. 更新顶部标签（_updateLabel）
4. 加载数据源（load）
5. 渲染页面（Renderer.render）
6. 初始化搜索（Searcher.init）
```

#### 私有数据保存

```javascript
DataSourceManager.savePrivateData(data)
  ↓
1. 注入应用版本号（data.appVersion = APP_VERSION）
2. JSON.stringify(data)
3. 保存到 localStorage.ws_private_data
4. 保存版本号到 localStorage.ws_app_version
```

### Searcher 模块

#### 搜索初始化

```javascript
Searcher.init()
  ↓
1. 解绑旧事件（.off('.searcher')）
2. 绑定 compositionstart 事件（中文输入法开始）
3. 绑定 compositionend 事件（中文输入法确认）
4. 绑定 input 事件（英文直接输入）
```

#### 搜索过滤逻辑

```javascript
Searcher.filter(keyword)
  ↓
1. 空关键词：显示所有卡片
2. 遍历所有 .xe-widget 元素
3. 提取书签名称
4. 匹配逻辑：
   - 直接匹配（中文/英文）
   - 拼音全拼匹配（pinyinPro.pinyin）
   - 拼音首字母匹配（pinyinPro.pinyin pattern: 'first'）
5. 显示/隐藏卡片
6. 显示/隐藏分类区块（无可见卡片时隐藏）
7. 显示/隐藏"未找到"提示
```

### SyncManager 模块

#### 自动同步流程

```javascript
SyncManager.checkAndSync()
  ↓
1. 读取 OSS 配置（localStorage.ws_oss_config）
2. 反混淆配置（XOR + Base64）
3. 创建 OSS 客户端
4. 读取本地版本号（localStorage.ws_private_version）
5. 下载远程版本文件（version.json）
6. 比较版本号（字符串比较）
7. 版本更新时：
   7.1 下载数据文件（data-{版本号}.json）
   7.2 解析 JSON
   7.3 保存到 localStorage（DataSourceManager.savePrivateData）
   7.4 更新版本号和下载时间
   7.5 当前激活私有数据源时刷新页面
8. 失败时：console.error（静默处理）
```

#### 定时同步

```javascript
SyncManager.startTimer(intervalSeconds)
  ↓
1. 停止旧定时器（stopTimer）
2. 创建新定时器（setInterval）
3. 定时调用 checkAndSync()
```

## 关键函数实现

### normalizeLogo(logo)

```javascript
功能：规范化 logo 路径，统一转为绝对路径

输入格式：
- 纯文件名：       "dribbble.png"
- 相对根目录：     "./assets/images/logos/dribbble.png"
- 相对父目录：     "../assets/images/logos/dribbble.png"
- 绝对路径：       "/assets/images/logos/dribbble.png"
- 外部 URL：       "https://example.com/logo.png"
- 空值：           null / undefined / ""

输出格式：
- 纯文件名 → "/assets/images/logos/dribbble.png"
- 相对路径 → "/assets/images/logos/dribbble.png"
- 绝对路径 → 原样返回
- 外部 URL → 原样返回
- 空值 → 读取 localStorage.ws_default_logo 或 "/assets/images/favicon.png"

实现逻辑：
1. 检查是否为空，空值时读取默认 logo
2. 检查是否为外部 URL（/^https?:\/\//i），是则原样返回
3. 检查是否为绝对路径（logo.charAt(0) === '/'），是则原样返回
4. 去掉 ./ 或 ../ 前缀（replace(/^(\.\.\/|\.\/)+/, '')）
5. 检查是否含路径分隔符（indexOf('/') === -1）
6. 不含分隔符视为纯文件名，拼接 "/assets/images/logos/"
7. 含分隔符则拼接 "/"
```

### wsKey(name)

```javascript
功能：生成带版本后缀的 localStorage key

当前实现：
return 'ws_' + name;  // 已移除版本后缀

注释掉的实现：
return 'ws_' + name + '_' + APP_VERSION;

说明：
- 原设计：每次更新 APP_VERSION 后旧数据自动隔离
- 当前实现：移除版本后缀，保持数据持久化
- 兼容性：读取时优先读带后缀的 key，再读无后缀的 key
```

## 事件绑定机制

### 侧边栏子菜单展开/收起

```javascript
Renderer._initSubMenus()
  ↓
1. 查找所有含子菜单的 li 元素（li:has(> ul)）
2. 添加 .has-sub 类
3. 解绑旧事件（.off('click.submenu')）
4. 绑定新事件（.on('click.submenu')）
5. 点击时：
   5.1 阻止默认行为（ev.preventDefault()）
   5.2 获取父 li 和子 ul
   5.3 已展开：移除 .expanded 类，slideUp(200)
   5.4 未展开：收起同级其他展开项，添加 .expanded 类，slideDown(200)
```

### 搜索框中文输入法支持

```javascript
var composing = false;

compositionstart 事件：
  composing = true;  // 标记正在输入拼音

compositionend 事件：
  composing = false;  // 标记确认选字
  Searcher.filter(keyword);  // 触发搜索

input 事件：
  if (!composing) {  // 非中文输入法期间
    Searcher.filter(keyword);
  }
```

### 删除按钮事件冒泡控制

```javascript
卡片 HTML：
<div class="bookmark-card" onclick="window.open(url, '_blank')">
  <span class="bookmark-delete-btn" 
        onclick="Renderer.deleteBookmark(event, categoryId, siteUrl)">
    &times;
  </span>
  ...
</div>

Renderer.deleteBookmark(event, categoryId, siteUrl)：
  if (event) {
    event.stopPropagation();  // 阻止冒泡到卡片的 onclick
    event.preventDefault();   // 阻止默认行为
  }
```

## 样式实现细节

### 书签卡片悬浮效果

```css
.box2 {
  height: 64px;
  transition: all 0.3s ease;
}

.box2:hover {
  transform: translateY(-6px);  /* 上移 6px */
  box-shadow: 0 26px 40px -24px rgba(0, 36, 100, 0.3);  /* 阴影 */
}
```

### 删除按钮显示/隐藏

```css
.bookmark-delete-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  opacity: 0;  /* 默认隐藏 */
  transition: opacity 0.2s ease;
}

.bookmark-card:hover .bookmark-delete-btn {
  opacity: 1;  /* 悬浮时显示 */
}
```

### 搜索框聚焦动画

```css
#search-input {
  width: 400px;
  transition: all 0.3s ease;
}

#search-input:focus {
  width: 500px;  /* 聚焦时宽度增加 */
  border-color: #a0b4c8;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
```

### Logo 图片圆角配置

```css
/* 主页卡片 Logo */
.xe-comment-entry img {
  border-radius: 0;  /* 当前：直角 */
  /* 可选值：
     0 = 完全直角
     4px = 轻微圆角（推荐）
     8px = 中等圆角
     50% = 圆形
  */
}

/* 管理面板书签列表 Logo */
.bm-site-logo img {
  border-radius: 0;  /* 当前：直角 */
}

/* 导出到浏览器 Logo */
.be-site-logo {
  border-radius: 4px;  /* 当前：轻微圆角 */
}
```

## 初始化流程

### 页面加载时

```javascript
$(document).ready(function () {
  ↓
1. 记录应用版本号（localStorage.ws_app_version = APP_VERSION）
2. 应用列数配置（ColumnsManager.getColumns）
3. 更新列数标签（#columns-label）
4. 获取激活数据源（DataSourceManager.getActive）
5. 更新数据源标签（DataSourceManager._updateLabel）
6. 加载数据源（DataSourceManager.load）
7. 渲染页面（Renderer.render）
8. 初始化搜索（Searcher.init）
9. 绑定数据源切换按钮（#datasource-btn）
10. 绑定列数切换按钮（#columns-btn）
11. 读取同步配置（localStorage.ws_sync_config）
12. 页面加载时自动同步（syncCfg.onLoad === true）
13. 启动定时同步（syncCfg.interval > 0）
});
```

### 懒加载初始化

```javascript
Renderer.render(data) 中：
  if (typeof lozad === 'function') {
    var observer = lozad();
    observer.observe();
  }

index.html 中：
  <script>
    $(document).ready(function() {
      const observer = lozad();
      observer.observe();
    });
  </script>
```

## 数据持久化

### localStorage 数据结构

```javascript
// 应用配置
ws_app_version: "v20260418"
ws_active_source: "default" | "private"
ws_columns: "4" | "6" | "12"
ws_default_logo: "/assets/images/logos/custom.png"

// 私有数据
ws_private_data: "{\"categories\":[...]}"
ws_private_version: "20260418123456"

// 同步配置
ws_sync_config: "{\"onLoad\":true,\"interval\":3600}"
ws_oss_config: "Base64(XOR(JSON.stringify(ossConfig)))"

// 同步状态
ws_last_download_at: "2026-04-18T12:34:56.789Z"
ws_last_download_version: "20260418123456"
```

### OSS 配置混淆

```javascript
加密：
1. JSON.stringify(ossConfig)
2. XOR 加密（key: 'ws2024'）
3. Base64 编码
4. encodeURIComponent
5. 保存到 localStorage.ws_oss_config

解密：
1. 读取 localStorage.ws_oss_config
2. decodeURIComponent(escape(atob(ossConfigRaw)))
3. XOR 解密（key: 'ws2024'）
4. JSON.parse
```

## 兼容性处理

### jQuery Deferred

```javascript
// 使用 jQuery 1.11.1 的 Deferred API
var deferred = $.Deferred();

// 成功时
deferred.resolve(data);

// 失败时
deferred.reject(reason);

// 返回 Promise
return deferred.promise();

// 使用时
DataSourceManager.load(source)
  .done(function (data) { ... })
  .fail(function (reason) { ... });
```

### ES5 语法

```javascript
// 使用 var 声明变量
var name = 'value';

// 使用 for 循环
for (var i = 0; i < array.length; i++) { ... }

// 使用 function 关键字
function myFunction() { ... }

// 避免使用 ES6+ 特性：
// - let / const
// - 箭头函数
// - 模板字符串
// - 解构赋值
// - Promise（使用 jQuery Deferred 代替）
```

### 中文输入法兼容

```javascript
// 使用 composition 事件处理中文输入法
var composing = false;

$input.on('compositionstart', function () {
  composing = true;
});

$input.on('compositionend', function () {
  composing = false;
  Searcher.filter($(this).val().trim());
});

$input.on('input', function () {
  if (!composing) {
    Searcher.filter($(this).val().trim());
  }
});
```

## 性能优化

### 懒加载

- 使用 lozad.js 实现图片懒加载
- 图片使用 `data-src` 属性，不使用 `src`
- 添加 `class="lozad"` 标记
- 渲染后调用 `lozad().observe()` 初始化

### 事件委托

- 删除按钮使用内联 `onclick`，避免大量事件监听器
- 侧边栏子菜单事件绑定到父元素

### DOM 操作优化

- 批量生成 HTML 字符串，一次性插入 DOM
- 避免频繁的 DOM 查询，缓存 jQuery 对象

### 搜索优化

- 使用 `toLowerCase()` 统一转小写比较
- 拼音匹配使用 pinyin-pro 库（高性能）
- 搜索时只显示/隐藏元素，不重新渲染

## 调试技巧

### 查看当前数据源

```javascript
console.log(DataSourceManager.getActive());
```

### 查看私有数据

```javascript
console.log(DataSourceManager.getPrivateData());
```

### 查看 localStorage

```javascript
console.log(localStorage);
```

### 清空私有数据

```javascript
localStorage.removeItem('ws_private_data');
localStorage.removeItem('ws_private_version');
```

### 重置所有配置

```javascript
Object.keys(localStorage).forEach(function(key) {
  if (key.startsWith('ws_')) {
    localStorage.removeItem(key);
  }
});
location.reload();
```
