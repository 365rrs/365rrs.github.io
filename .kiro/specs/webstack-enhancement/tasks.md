# 实现计划：WebStack 二次开发

## 概述

将 WebStack 从硬编码 HTML 导航站升级为数据驱动的可管理导航站。按以下顺序实现：先完成数据提取和核心渲染，再实现搜索和数据源切换，最后构建管理面板和 OSS 同步功能。

技术约束：纯 HTML/CSS/JS，无构建系统，Bootstrap 3 + jQuery 1.11.1。

---

## 任务列表

- [x] 1. 移除多语言，统一中文版本
  - 修改根路径 `index.html`：移除语言检测逻辑，直接重定向至 `cn/index.html`
  - 修改 `en/index.html` 和 `en/about.html`：改为重定向至对应中文页面
  - 修改 `cn/index.html`：移除顶部导航栏中的语言切换下拉菜单（`.language-switcher` 元素）
  - _需求：1.1、1.2、1.3、1.4_

- [x] 2. 提取默认数据源 JSON
  - 创建目录 `assets/data/`，新建 `assets/data/default.json`
  - 遍历 `cn/index.html` 中所有 `.xe-widget` 卡片，按分类提取 `name`、`url`、`logo`、`desc` 字段
  - 按设计文档中的数据结构组织 JSON：顶层 `{ "categories": [...] }`，每个分类含 `id`、`name`、`icon`，纯一级分类含 `sites`，含子分类的一级分类含 `children`
  - 分类 `id` 使用 `cat-` 前缀加英文标识（如 `cat-recommend`），与原 HTML 锚点对应
  - _需求：2.1、2.2_

- [x] 3. 重构 `cn/index.html` 为动态渲染骨架
  - 清空 `cn/index.html` 中所有硬编码的侧边栏 `<li>` 菜单项（保留 `<ul id="main-menu">` 容器）
  - 清空主内容区所有硬编码的 `<h4>` 标题和 `.row` 卡片块（保留 `.main-content` 容器结构）
  - 在顶部导航栏左侧添加搜索输入框（`<input id="search-input">`）
  - 在顶部导航栏右侧添加数据源切换入口（显示当前数据源名称的按钮/下拉）
  - 在主内容区添加空结果提示占位元素 `<div id="no-results">`（默认隐藏）
  - 在 `</body>` 前引入 `../assets/js/app.js`（位于 xenon 脚本之后）
  - _需求：1.3、2.3、3.1、4.6_

- [x] 4. 实现 `assets/js/app.js` — Renderer 模块
  - 实现 `Renderer.render(data)` 方法：遍历 `data.categories`，生成侧边栏 `<li>` 菜单项和主内容区分类区块
    - 纯一级分类：生成 `<li><a href="#cat-id" class="smooth">` + `<h4 id="cat-id">` + `.row` 卡片列表
    - 一级+二级分类：生成带子菜单的 `<li>`，每个子分类生成对应 `<h4>` 和卡片列表
  - 实现 `Renderer._buildCard(site)` 方法：生成与原 HTML 一致的 `.xe-widget.xe-conversations.box2` 卡片 HTML，使用 `data-src` + `class="lozad"` 懒加载图片
  - 实现 `Renderer._buildMenuItem(category)` 方法：生成侧边栏菜单项 HTML
  - 实现 `Renderer.clear()` 方法：清空侧边栏菜单和主内容区
  - 渲染完成后调用 `lozad().observe()`、`$('[data-toggle="tooltip"]').tooltip()`，并触发 Xenon 侧边栏初始化
  - 加载失败时在主内容区显示错误提示
  - _需求：2.3、2.4、2.5_

  - [ ]* 4.1 编写属性测试：渲染完整性（属性 2）
    - **属性 2：渲染完整性**
    - 对任意合法数据集，`Renderer.render(data)` 后页面中 `.xe-widget` 数量应等于所有叶子节点书签总数
    - **验证需求：2.3**

- [x] 5. 实现 `assets/js/app.js` — DataSourceManager 模块
  - 实现 `DataSourceManager.getActive()`：读取 `localStorage["ws_active_source"]`，默认返回 `"default"`
  - 实现 `DataSourceManager.load(source)`：返回 Promise；`"default"` 时 `fetch("../assets/data/default.json")`；`"private"` 时读取 `localStorage["ws_private_data"]`
  - 实现 `DataSourceManager.switchTo(source)`：保存至 localStorage，调用 `DataSourceManager.load()` 后调用 `Renderer.render()`；私有数据不存在时显示引导提示
  - 实现 `DataSourceManager.getPrivateData()` 和 `DataSourceManager.savePrivateData(data)`
  - 页面加载时读取激活数据源并调用 `DataSourceManager.load()` → `Renderer.render()`
  - _需求：4.1、4.2、4.3、4.4、4.5、4.6、11.1、11.5_

  - [ ]* 5.1 编写属性测试：数据源选择持久化（属性 5）
    - **属性 5：数据源选择持久化**
    - 对任意数据源标识，`switchTo(source)` 后 `getActive()` 应返回相同值
    - **验证需求：4.4**

  - [ ]* 5.2 编写属性测试：数据序列化 Round-Trip（属性 1）
    - **属性 1：数据序列化 Round-Trip**
    - 对任意合法数据对象，`JSON.stringify` 后再 `JSON.parse` 应深度相等
    - **验证需求：2.2**

- [x] 6. 实现 `assets/js/app.js` — Searcher 模块
  - 实现 `Searcher.init()`：绑定 `#search-input` 的 `keyup` 事件，调用 `Searcher.filter(keyword)`
  - 实现 `Searcher.filter(keyword)`：
    - `keyword` 为空时显示所有 `.xe-widget` 和 `.categy-section`，隐藏 `#no-results`
    - 非空时遍历所有 `.xe-widget`，对 `name`（`strong` 文本）和 `desc`（`p` 文本）做不区分大小写的包含匹配，显示/隐藏对应卡片
    - 遍历所有 `.category-section`，无可见卡片时隐藏整个区块
    - 所有卡片均隐藏时显示 `#no-results`
  - 页面加载完成后调用 `Searcher.init()`
  - _需求：3.1、3.2、3.3、3.4、3.5、3.6_

  - [ ]* 6.1 编写属性测试：搜索结果正确性（属性 3）
    - **属性 3：搜索结果正确性**
    - 对任意非空关键词，`filter(keyword)` 后所有可见卡片的 name 或 desc 均应包含该关键词
    - **验证需求：3.2、3.3**

  - [ ]* 6.2 编写属性测试：搜索清空恢复（属性 4）
    - **属性 4：搜索清空恢复**
    - 任意关键词搜索后调用 `filter("")`，可见卡片数量应恢复为书签总数
    - **验证需求：3.4**

- [x] 7. 检查点 — 确保导航站核心功能正常
  - 确保所有测试通过，验证：数据加载渲染、搜索过滤、数据源切换均正常工作，如有问题请告知。

- [x] 8. 创建管理面板页面骨架 `cn/admin.html`
  - 新建 `cn/admin.html`，复用与 `cn/index.html` 相同的 HTML 头部（CSS 引用、meta 标签）
  - 新建 `assets/css/admin.css`，在 `admin.html` 中引入
  - 页面布局：顶部导航栏（含数据源切换按钮、返回主页链接）+ 左侧标签页导航（分类管理、书签管理、导入导出、OSS 配置、同步状态）+ 右侧内容区
  - 在 `cn/index.html` 的导航栏中添加"管理面板"链接指向 `admin.html`
  - 在 `</body>` 前引入 `../assets/js/app.js` 和 `../assets/js/admin.js`
  - _需求：5.1、7.1_

- [x] 9. 实现 `assets/js/admin.js` — CategoryManager 模块
  - 实现分类管理界面渲染：读取当前数据源，以树形列表展示所有一级分类及其子分类
  - 实现"添加一级分类"：表单含名称（支持 emoji）和图标选择，提交后追加至数据末尾并保存 localStorage
  - 实现"添加二级子分类"：在指定一级分类下追加子分类，该一级分类自动切换为"一级+二级"结构
  - 实现"重命名分类"：内联编辑或弹窗表单，保存后更新 localStorage
  - 实现"删除一级分类"：确认对话框说明级联删除影响，确认后删除并保存 localStorage
  - 实现"删除二级子分类"：确认对话框，确认后删除并保存 localStorage
  - 遵守约束：有子分类的一级分类不允许直接添加书签；无子分类的一级分类允许直接添加书签
  - 每次变更后调用 `DataSourceManager.savePrivateData()` 并刷新界面
  - _需求：6.1、6.2、6.3、6.4、6.5、6.6、6.7、6.8、6.9_

- [x] 10. 实现 `assets/js/admin.js` — BookmarkManager 模块
  - 实现书签管理界面渲染：按分类分组展示所有书签，每条书签显示 logo、名称、URL、描述及操作按钮
  - 实现"添加书签"：表单含书签名称、URL、Logo 图片地址、描述字段，提交后追加至指定分类的 `sites` 数组并保存 localStorage
  - 实现"编辑书签"：点击编辑按钮弹出预填充表单，保存后更新对应条目并保存 localStorage
  - 实现"删除书签"：确认对话框，确认后从 `sites` 数组移除并保存 localStorage
  - 每次增删改后调用 `DataSourceManager.savePrivateData()` 并刷新界面
  - _需求：5.2、5.3、5.4、5.5、5.6_

  - [ ]* 10.1 编写属性测试：书签增删数量不变量（属性 6）
    - **属性 6：书签增删数量不变量**
    - 添加书签后总数应为 N+1；删除书签后总数应为 N-1
    - **验证需求：5.3、5.5**

  - [ ]* 10.2 编写属性测试：书签编辑幂等性（属性 7）
    - **属性 7：书签编辑幂等性**
    - 编辑保存后再次读取，对应字段应等于修改后的值；其他书签不受影响
    - **验证需求：5.4**

- [x] 11. 实现 `assets/js/admin.js` — Sorter 模块
  - 实现 `Sorter.moveCategory(categoryId, direction)`：在 `categories` 数组中交换目标分类与相邻分类，边界时不操作，保存 localStorage 并刷新界面
  - 实现 `Sorter.moveSubCategory(parentId, subId, direction)`：在父分类的 `children` 数组中执行同样操作
  - 实现 `Sorter.moveSite(categoryId, siteIndex, direction)`：在对应分类的 `sites` 数组中交换书签位置
  - 在分类管理和书签管理界面为每个条目添加"上移"/"下移"按钮，绑定对应 Sorter 方法
  - Sorter 仅操作 Private_Source，不修改 Default_Source
  - _需求：12.1、12.2、12.3、12.4、12.5、12.6_

  - [ ]* 11.1 编写属性测试：排序边界不变量（属性 12）
    - **属性 12：排序边界不变量**
    - 对顶部元素执行"上移"或底部元素执行"下移"，列表顺序应保持不变
    - **验证需求：12.1、12.4**

  - [ ]* 11.2 编写属性测试：Default_Source 排序不变量（属性 11）
    - **属性 11：Default_Source 排序不变量**
    - 任意排序操作前后，Default_Source 数据对象应完全不变
    - **验证需求：12.6**

- [x] 12. 实现 `assets/js/admin.js` — ImportExport 模块
  - 实现"导出数据"：将 `ws_private_data` 序列化为 JSON 字符串，创建 Blob 并触发浏览器下载（文件名含时间戳）
  - 实现"导入数据"：`<input type="file">` 选择 JSON 文件，用 `FileReader.readAsText()` 读取，`JSON.parse()` 解析，验证含 `categories` 数组后覆盖 localStorage；格式错误时显示具体错误信息，不执行覆盖
  - 实现"复制 JSON"：将当前数据 JSON 文本显示在只读 `<textarea>`，提供"一键复制"按钮调用 `navigator.clipboard.writeText()`
  - 实现"粘贴 JSON"：提供可编辑 `<textarea>`，点击"解析并导入"后执行与文件导入相同的解析和验证逻辑
  - _需求：5.7、5.8、5.9、5.10、5.11_

  - [ ]* 12.1 编写属性测试：导入/导出 Round-Trip（属性 8）
    - **属性 8：导入/导出 Round-Trip**
    - 对任意合法 Local_Data，导出再导入后 localStorage 中的数据应与原始数据深度相等
    - **验证需求：5.7、5.8、5.9**

  - [ ]* 12.2 编写属性测试：非法 JSON 导入不修改数据（属性 9）
    - **属性 9：非法 JSON 导入不修改数据**
    - 对任意非法 JSON 字符串或缺少 `categories` 字段的对象，导入后 `ws_private_data` 应与操作前完全相同
    - **验证需求：5.11**

- [x] 13. 实现 `assets/js/admin.js` — 数据源切换与初始化（管理面板）
  - 在管理面板顶部显示当前激活数据源，提供切换按钮
  - 切换至私有数据源且私有数据为空时，弹出确认框询问是否以默认数据源初始化
  - 确认初始化时：`fetch` 加载 `default.json`，深拷贝数据写入 `ws_private_data`，刷新管理界面
  - 切换数据源后刷新管理界面展示对应数据
  - _需求：7.1、7.2、7.3、7.4_

- [x] 14. 检查点 — 确保管理面板基础功能正常
  - 确保所有测试通过，验证：分类增删改、书签增删改、排序、导入导出均正常工作，如有问题请告知。

- [x] 15. 实现 `assets/js/admin.js` — OSSConfig 模块
  - 实现 OSS 配置表单：字段含 AccessKeyId、AccessKeySecret、Bucket、Region、基础路径前缀
  - 实现"保存配置"：将配置对象 JSON 序列化后做简单 XOR 混淆，存入 `localStorage["ws_oss_config"]`；读取时反混淆还原
  - 实现"导出配置"：将配置（明文）序列化为 JSON 文件触发下载
  - 实现"导入配置"：选择 JSON 文件解析后填充表单字段
  - 实现"测试连接"：使用当前配置初始化 OSS 客户端，尝试读取 `{prefix}version.json`，显示成功或失败提示
  - OSS 配置不完整时禁用同步相关按钮并显示提示
  - 在 `admin.html` 中通过 CDN 引入 ali-oss SDK：`https://gosspublic.alicdn.com/aliyun-oss-sdk-6.18.1.min.js`
  - _需求：8.1、8.2、8.3、8.4、8.5、8.6_

- [x] 16. 实现 SyncManager — 手动同步（`assets/js/admin.js`）
  - 实现 `SyncManager.upload(onSuccess, onError)`：
    - 禁用上传/下载按钮，显示 loading 状态
    - 生成版本号：`new Date().toISOString().replace(/\D/g, '').slice(0, 14)`
    - 先 `OSS.put("{prefix}data-{version}.json", localData)`，再 `OSS.put("{prefix}version.json", versionObj)`
    - 成功后更新 `ws_private_version`、`ws_last_upload_at`、`ws_last_upload_version`，显示成功提示
    - 失败时显示具体错误信息，恢复按钮状态
  - 实现 `SyncManager.download(onSuccess, onError)`：
    - 先读取 `{prefix}version.json` 获取最新版本号，再下载对应 `{prefix}data-{version}.json`
    - 成功后更新 `ws_private_data`、`ws_private_version`、`ws_last_download_at`，刷新管理界面
    - 失败时显示具体错误信息（含版本文件不存在的情况）
  - 在管理面板同步状态区域显示最后上传/下载时间戳和版本号
  - _需求：9.1、9.2、9.3、9.4、9.5、9.6、11.2、11.4_

  - [ ]* 16.1 编写属性测试：OSS 上传/下载 Round-Trip（属性 13，使用 Mock）
    - **属性 13：OSS 上传/下载 Round-Trip（Mock）**
    - 对任意合法 Local_Data，mock 上传后再下载，得到的数据应与上传数据深度相等
    - **验证需求：9.1、9.2**

  - [ ]* 16.2 编写属性测试：版本号单调递增（属性 14）
    - **属性 14：版本号单调递增**
    - 两次连续上传生成的版本号，后者应大于前者（字符串比较）
    - **验证需求：9.1**

- [x] 17. 实现 SyncManager — 自动同步（`assets/js/app.js`）
  - 在 `app.js` 中实现 `SyncManager.checkAndSync()`：
    - OSS 配置不完整时静默跳过（`console.log` 提示）
    - 读取 `{prefix}version.json`，比较 `remoteVersion` 与 `localStorage["ws_private_version"]`
    - 版本更新时下载对应数据文件，更新 localStorage；当前激活私有数据源时调用 `Renderer.render()` 刷新页面
    - 失败时 `console.error` 静默记录，不打断用户浏览
  - 实现 `SyncManager.startTimer(intervalSeconds)` 和 `SyncManager.stopTimer()`：使用 `setInterval` 定期调用 `checkAndSync()`
  - 在管理面板自动同步配置区域提供：页面加载时自动同步开关、定时同步开关 + 间隔选择（30 分钟/1 小时/2 小时）
  - 配置保存至 `localStorage["ws_sync_config"]`，页面加载时读取并按配置启动自动同步
  - _需求：10.1、10.2、10.3、10.4、10.5、10.6、10.7、11.3、11.6_

- [ ] 18. 实现属性测试页面 `test/property-tests.html`
  - 创建 `test/property-tests.html`，通过 CDN 引入 fast-check：`https://cdn.jsdelivr.net/npm/fast-check/lib/bundle/fast-check.min.js`
  - 同时引入 `../assets/js/app.js` 和 `../assets/js/admin.js`（或内联测试所需的纯函数）
  - 每个属性测试配置最少 100 次迭代（`{ numRuns: 100 }`）
  - 实现以下属性测试（每个属性为独立测试块，在页面中显示通过/失败状态）：

  - [ ]* 18.1 属性 1：数据序列化 Round-Trip
    - 使用 fast-check 生成任意合法分类/书签对象，验证 `JSON.stringify` → `JSON.parse` 深度相等
    - **验证需求：2.2**

  - [ ]* 18.2 属性 2：渲染完整性
    - 生成任意合法数据集，调用 `Renderer.render(data)` 后统计 `.xe-widget` 数量等于书签总数
    - **验证需求：2.3**

  - [ ]* 18.3 属性 3：搜索结果正确性
    - 生成任意非空关键词和数据集，`filter(keyword)` 后所有可见卡片均包含关键词
    - **验证需求：3.2、3.3**

  - [ ]* 18.4 属性 4：搜索清空恢复
    - 任意关键词搜索后 `filter("")`，可见卡片数量恢复为书签总数
    - **验证需求：3.4**

  - [ ]* 18.5 属性 5：数据源选择持久化
    - 对 `"default"` 和 `"private"` 两个值，`switchTo` 后 `getActive()` 返回相同值
    - **验证需求：4.4**

  - [ ]* 18.6 属性 6：书签增删数量不变量
    - 添加书签后总数 N+1；删除后总数 N-1
    - **验证需求：5.3、5.5**

  - [ ]* 18.7 属性 7：书签编辑幂等性
    - 编辑保存后字段值等于修改值，其他书签不受影响
    - **验证需求：5.4**

  - [ ]* 18.8 属性 8：导入/导出 Round-Trip
    - 导出再导入后数据深度相等
    - **验证需求：5.7、5.8、5.9**

  - [ ]* 18.9 属性 9：非法 JSON 导入不修改数据
    - 非法 JSON 或缺少 `categories` 字段时，`ws_private_data` 不变
    - **验证需求：5.11**

  - [ ]* 18.10 属性 10：删除分类级联清除
    - 删除含子分类和书签的一级分类后，其所有子分类 ID 和书签均不出现在数据中
    - **验证需求：6.7、6.8**

  - [ ]* 18.11 属性 11：Default_Source 排序不变量
    - 任意排序操作前后，Default_Source 数据对象完全不变
    - **验证需求：12.6**

  - [ ]* 18.12 属性 12：排序边界不变量
    - 顶部元素"上移"或底部元素"下移"后，列表顺序不变
    - **验证需求：12.1、12.4**

  - [ ]* 18.13 属性 13：OSS 上传/下载 Round-Trip（Mock）
    - Mock OSS 操作，上传后下载得到的数据与上传数据深度相等
    - **验证需求：9.1、9.2**

  - [ ]* 18.14 属性 14：版本号单调递增
    - 两次连续生成的版本号，后者字符串大于前者
    - **验证需求：9.1**

- [x] 19. 最终检查点 — 确保所有测试通过
  - 确保所有测试通过，验证完整功能链路：数据加载 → 渲染 → 搜索 → 管理面板 → OSS 同步，如有问题请告知。

---

## 备注

- 标有 `*` 的子任务为可选测试任务，可跳过以加快 MVP 进度
- 每个任务均引用具体需求条款，确保可追溯性
- 属性测试验证系统的普遍正确性，单元测试验证具体示例和边界条件
- OSS SDK 通过 CDN 引入，仅在 `admin.html` 中加载，不影响主页性能
- 所有模块使用 `var` 声明全局对象（兼容 jQuery 1.11.1 时代的 ES5 风格）
