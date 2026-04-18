# 需求文档

## 简介

本文档描述对 WebStack 设计师导航站的二次开发需求。WebStack 是一个纯静态前端项目（HTML/CSS/JS），部署在 GitHub Pages 上，面向 UI/UX 设计师和产品经理提供设计资源导航。

本次二开的核心目标是：
1. 将硬编码在 HTML 中的网站数据提取为 JSON 格式，实现数据与视图分离
2. 移除多语言支持，只保留中文版本
3. 新增站内搜索功能
4. 支持私有数据源，用户可在浏览器中可视化管理自己的导航数据
5. 通过阿里云 OSS 实现私有数据的多端同步

---

## 词汇表

- **导航站（Navigator）**：WebStack 网站本体，展示网站卡片列表的主页面
- **卡片（Card）**：代表一个外部网站的 UI 组件，包含 Logo、名称、描述和链接
- **分类（Category）**：侧边栏菜单中的一级或二级导航分组，对应主内容区的一个区块
- **默认数据源（Default_Source）**：项目内置的 JSON 数据文件，包含原始策划的网站列表
- **私有数据源（Private_Source）**：用户自定义的网站列表数据，以 localStorage 为主存储，OSS 为远端备份
- **本地数据（Local_Data）**：缓存在浏览器 localStorage 中的私有数据源副本，是管理面板编辑和导航站渲染的直接数据来源
- **数据源（Data_Source）**：默认数据源或私有数据源之一
- **OSS**：阿里云对象存储服务（Object Storage Service），用于存储和同步私有数据
- **版本文件（Version_File）**：存储在 OSS 上的元数据文件（如 `webstack/version.json`），记录当前数据版本号和最后修改时间
- **数据文件（Data_File）**：存储在 OSS 上的实际私有数据 JSON 文件（如 `webstack/data-{version}.json`），与版本文件配套使用
- **管理面板（Admin_Panel）**：独立的管理页面，提供数据管理、OSS 配置等功能
- **同步（Sync）**：将私有数据在浏览器 localStorage 与阿里云 OSS 之间进行上传或下载
- **渲染器（Renderer）**：负责读取数据源 JSON 并动态生成页面卡片和侧边栏菜单的 JS 模块
- **搜索器（Searcher）**：负责对当前数据源进行关键词过滤并更新页面显示的 JS 模块
- **排序器（Sorter）**：负责处理分类和书签手动排序操作并将结果持久化至 localStorage 的 JS 模块

---

## 需求

### 需求 1：移除多语言，统一为中文单语言版本

**用户故事：** 作为站点维护者，我希望移除英文版本，只保留中文版本，以便降低维护成本，避免双语内容不同步的问题。

#### 验收标准

1. THE 导航站 SHALL 只提供中文版本，移除 `en/` 目录下的页面
2. THE 导航站 SHALL 将根路径 `index.html` 直接重定向至中文主页，不再进行语言检测
3. THE 导航站 SHALL 移除页面顶部导航栏中的语言切换下拉菜单
4. WHEN 用户访问原英文路径（`/en/index.html`），THE 导航站 SHALL 重定向至中文主页

---

### 需求 2：数据 JSON 化——将网站数据从 HTML 中提取为 JSON 文件

**用户故事：** 作为站点维护者，我希望网站数据以 JSON 格式独立存储，以便后续通过程序化方式管理和更新内容，而无需直接编辑 HTML。

#### 验收标准

1. THE 导航站 SHALL 提供一个默认数据文件 `assets/data/default.json`，包含所有原始网站卡片数据
2. THE Default_Source JSON 文件 SHALL 遵循以下数据结构：顶层为分类数组，每个分类包含 `id`、`name`（支持 emoji）、`icon`、`children`（可选子分类）和 `sites`（网站列表），每个网站包含 `name`、`url`、`logo` 字段
3. THE Renderer SHALL 在页面加载时读取当前激活的数据源 JSON，动态生成侧边栏菜单和主内容区的卡片列表
4. WHEN 数据源 JSON 加载失败，THE Renderer SHALL 在主内容区显示错误提示信息
5. THE 导航站 SHALL 保持与原始页面相同的视觉外观和交互行为（侧边栏、卡片样式、平滑滚动等）

---

### 需求 3：站内搜索

**用户故事：** 作为设计师用户，我希望能在导航站内快速搜索网站名称或描述，以便在大量卡片中迅速找到目标资源。

#### 验收标准

1. THE 导航站 SHALL 在顶部导航栏提供一个搜索输入框
2. WHEN 用户在搜索框中输入关键词，THE Searcher SHALL 对当前数据源中所有卡片的名称和描述字段进行不区分大小写的模糊匹配
3. WHEN 搜索结果存在，THE Searcher SHALL 只显示匹配的卡片，隐藏不匹配的卡片，并隐藏没有匹配卡片的分类区块
4. WHEN 搜索框内容为空，THE Searcher SHALL 恢复显示所有卡片和分类区块
5. WHEN 搜索结果为空，THE Searcher SHALL 在主内容区显示"未找到相关网站"的提示信息
6. THE Searcher SHALL 在用户每次按键输入时实时更新搜索结果，无需点击搜索按钮

---

### 需求 4：多数据源支持

**用户故事：** 作为高级用户，我希望能在默认数据源和我的私有数据源之间切换，以便在使用官方推荐内容和个人定制内容之间灵活选择。

#### 验收标准

1. THE 导航站 SHALL 支持两种数据源：Default_Source（默认数据源）和 Private_Source（私有数据源）
2. THE 导航站 SHALL 默认激活 Default_Source
3. WHEN 用户切换数据源，THE Renderer SHALL 清空当前页面内容并使用新数据源重新渲染侧边栏和卡片列表
4. THE 导航站 SHALL 将用户选择的数据源记录在 localStorage 中，以便页面刷新后保持上次的选择
5. WHEN Private_Source 不存在（用户尚未创建私有数据），THE 导航站 SHALL 提示用户前往管理面板创建私有数据
6. THE 导航站 SHALL 在顶部导航栏或侧边栏提供数据源切换入口，显示当前激活的数据源名称

---

### 需求 5：可视化管理面板——网站卡片管理

**用户故事：** 作为站点维护者，我希望通过可视化界面管理私有数据源中的网站卡片，以便无需手动编辑 JSON 文件即可增删改查网站条目，并能通过导入/导出功能在设备间迁移数据。

#### 验收标准

1. THE Admin_Panel SHALL 提供独立的管理页面（`cn/admin.html`），通过导航栏链接可访问
2. THE Admin_Panel SHALL 以列表或表格形式展示私有数据源中所有分类和网站卡片
3. WHEN 用户点击"添加网站"，THE Admin_Panel SHALL 显示表单，包含书签名称、URL、图标（Logo 图片地址）字段，提交后将新书签添加至私有数据源
4. WHEN 用户点击某个网站卡片的"编辑"按钮，THE Admin_Panel SHALL 显示预填充当前数据的编辑表单，保存后更新私有数据源中对应条目
5. WHEN 用户点击某个网站卡片的"删除"按钮，THE Admin_Panel SHALL 显示确认对话框，确认后从私有数据源中移除该条目
6. THE Admin_Panel SHALL 在每次增删改操作后将最新的私有数据源保存至 localStorage
7. THE Admin_Panel SHALL 提供"导出数据"功能，将当前 Local_Data 序列化为 JSON 文件并触发浏览器下载至本地
8. THE Admin_Panel SHALL 提供"导入数据"功能，允许用户选择本地 JSON 文件，解析后覆盖 localStorage 中的 Local_Data
9. THE Admin_Panel SHALL 提供"复制 JSON"功能，将当前 Local_Data 的 JSON 文本显示在页面内的只读文本区域，并提供一键复制到剪贴板的按钮
10. THE Admin_Panel SHALL 提供"粘贴 JSON"功能，提供可编辑文本框供用户粘贴 JSON 文本，点击"解析并导入"后将文本解析为数据覆盖 localStorage 中的 Local_Data
11. IF 导入的 JSON 文件或粘贴的 JSON 文本格式不合法，THEN THE Admin_Panel SHALL 显示具体的解析错误信息，不执行数据覆盖操作

---

### 需求 6：可视化管理面板——分类管理

**用户故事：** 作为站点维护者，我希望通过可视化界面管理私有数据源的分类结构，以便自定义导航的分组方式。

#### 验收标准

1. THE Admin_Panel SHALL 提供分类管理界面，展示私有数据源的完整分类树，支持以下两种结构模式：
   - **纯一级**：只有一级分类，书签直接挂在一级分类下
   - **一级 + 二级**：一级分类下包含若干二级子分类，书签挂在二级分类下
2. WHEN 用户添加一级分类，THE Admin_Panel SHALL 允许指定分类名称（支持 emoji 字符）和图标（从现有图标字体中选择）
3. WHEN 用户为某个一级分类添加二级子分类，THE Admin_Panel SHALL 允许指定子分类名称（支持 emoji 字符），该一级分类自动切换为"一级 + 二级"结构模式
4. WHEN 一级分类下存在二级子分类时，THE Admin_Panel SHALL 不允许直接在该一级分类下添加书签，书签只能添加至其二级子分类中
5. WHEN 一级分类下不存在二级子分类时，THE Admin_Panel SHALL 允许直接在该一级分类下添加书签
6. WHEN 用户重命名分类（一级或二级），THE Admin_Panel SHALL 更新私有数据源中该分类的名称
7. WHEN 用户删除一级分类，THE Admin_Panel SHALL 显示确认对话框，说明该分类及其所有子分类和书签也将被删除，确认后执行删除
8. WHEN 用户删除二级子分类，THE Admin_Panel SHALL 显示确认对话框，说明该子分类下的所有书签也将被删除，确认后执行删除
9. THE Admin_Panel SHALL 在每次分类变更后将最新数据保存至 localStorage

---

### 需求 7：可视化管理面板——数据源切换与初始化

**用户故事：** 作为用户，我希望在管理面板中切换数据源，并能将默认数据源复制为私有数据源的初始内容，以便在官方数据基础上进行个性化修改。

#### 验收标准

1. THE Admin_Panel SHALL 在页面顶部显示当前激活的数据源，并提供切换按钮
2. WHEN 私有数据源为空且用户选择切换至私有数据源，THE Admin_Panel SHALL 提示用户是否以默认数据源内容初始化私有数据源
3. WHEN 用户确认初始化，THE Admin_Panel SHALL 将 Default_Source 的完整数据深拷贝至 Private_Source 并保存至 localStorage
4. THE Admin_Panel SHALL 在切换数据源后刷新管理界面以展示对应数据源的内容

---

### 需求 8：OSS 配置管理

**用户故事：** 作为用户，我希望在管理面板中配置阿里云 OSS 连接信息，并能导入/导出配置，以便在不同设备上快速恢复 OSS 连接。

#### 验收标准

1. THE Admin_Panel SHALL 提供 OSS 配置表单，包含以下字段：AccessKeyId、AccessKeySecret、Bucket 名称、Region（地域）、基础路径前缀（如 `webstack/`，用于构造版本文件和数据文件的 Object 路径）
2. WHEN 用户保存 OSS 配置，THE Admin_Panel SHALL 将配置信息加密后存储至 localStorage
3. THE Admin_Panel SHALL 提供"导出配置"功能，将 OSS 配置信息导出为 JSON 文件下载至本地
4. THE Admin_Panel SHALL 提供"导入配置"功能，允许用户选择本地 JSON 文件，解析后填充 OSS 配置表单
5. WHEN 用户点击"测试连接"，THE Admin_Panel SHALL 尝试使用当前配置读取 OSS 上的 Version_File，并显示连接成功或失败的提示信息
6. IF OSS 配置信息不完整，THEN THE Admin_Panel SHALL 禁用同步相关操作按钮并显示提示

---

### 需求 9：OSS 数据同步——手动同步

**用户故事：** 作为用户，我希望能手动将私有数据上传至 OSS 或从 OSS 下载，以便在需要时主动控制数据同步。

#### 验收标准

1. THE Admin_Panel SHALL 提供"上传至 OSS"按钮，点击后将当前 Local_Data 作为新版本上传至 OSS：先写入 Data_File（路径如 `webstack/data-{version}.json`），再更新 Version_File（路径如 `webstack/version.json`）中的版本号和最后修改时间
2. THE Admin_Panel SHALL 提供"从 OSS 下载"按钮，点击后先读取 Version_File 获取最新版本号，再下载对应的 Data_File，并将数据覆盖 localStorage 中的 Local_Data
3. WHEN 上传操作成功，THE Admin_Panel SHALL 显示成功提示，包含上传时间戳和新版本号
4. WHEN 下载操作成功，THE Admin_Panel SHALL 显示成功提示，包含 Version_File 中记录的最后修改时间，并刷新管理界面
5. IF 上传或下载操作失败，THEN THE Admin_Panel SHALL 显示具体的错误信息（如网络错误、权限错误、Bucket 不存在、版本文件不存在等）
6. WHILE 同步操作进行中，THE Admin_Panel SHALL 显示加载状态，禁用同步按钮防止重复操作

---

### 需求 10：OSS 数据同步——自动同步

**用户故事：** 作为用户，我希望导航站能自动从 OSS 同步数据，以便在多个设备上始终看到最新的私有数据，无需每次手动操作。

#### 验收标准

1. THE Admin_Panel SHALL 提供自动同步配置选项，包含以下策略：
   - 页面加载时自动从 OSS 下载（开关）
   - 定时自动从 OSS 下载（开关 + 间隔选择：30 分钟、1 小时、2 小时）
2. WHEN 页面加载时自动同步已启用，THE 导航站 SHALL 在页面加载完成后先读取 OSS 上的 Version_File，若版本号新于 localStorage 中记录的版本号，则下载对应 Data_File 并更新 Local_Data
3. WHEN 定时同步已启用，THE 导航站 SHALL 按照配置的时间间隔定期执行版本检查，仅在 OSS 版本更新时才下载 Data_File
4. WHEN 自动同步下载成功且数据有变化，THE 导航站 SHALL 刷新当前页面的卡片展示（若当前激活的是私有数据源）
5. IF 自动同步失败，THE 导航站 SHALL 静默记录错误至浏览器控制台，不打断用户的正常浏览
6. THE 导航站 SHALL 将自动同步配置保存至 localStorage，页面刷新后保持配置状态
7. WHEN OSS 配置不完整，THE 导航站 SHALL 跳过自动同步操作

---

### 需求 11：本地数据持久化与离线可用

**用户故事：** 作为用户，我希望即使在没有网络或 OSS 不可用的情况下，私有数据仍然可以正常使用，以便保证导航站的基本可用性。

#### 验收标准

1. THE 导航站 SHALL 始终使用 localStorage 中的 Local_Data 进行渲染，不依赖实时 OSS 连接；OSS 仅作为远端备份和多端同步通道
2. THE 导航站 SHALL 在 localStorage 中记录当前 Local_Data 对应的版本号，用于与 OSS Version_File 进行比对
3. WHEN OSS 同步失败或网络不可用，THE 导航站 SHALL 继续使用 localStorage 中的 Local_Data 正常展示
4. THE Admin_Panel SHALL 在同步状态区域显示最后一次成功同步的时间戳（上传和下载分别记录）及对应版本号
5. WHEN localStorage 中不存在私有数据源，THE 导航站 SHALL 自动回退至默认数据源展示

---

### 需求 12：分类与书签手动排序

**用户故事：** 作为站点维护者，我希望能在管理面板中手动调整分类和书签的显示顺序，以便按照自己的优先级和使用习惯组织导航内容。

#### 验收标准

1. THE Admin_Panel SHALL 在分类管理界面为每个一级分类提供排序操作（拖拽或上移/下移按钮），调整一级分类之间的顺序
2. WHEN 一级分类下存在二级子分类，THE Admin_Panel SHALL 同样为该一级分类下的二级子分类提供排序操作
3. WHEN 用户对分类（一级或二级）执行排序操作，THE Sorter SHALL 实时更新 Local_Data 中对应层级的分类顺序并保存至 localStorage
4. THE Admin_Panel SHALL 在书签管理界面为每个分类（纯一级模式下的一级分类，或一级+二级模式下的二级分类）内的书签提供排序操作（拖拽或上移/下移按钮）
5. WHEN 用户对书签执行排序操作，THE Sorter SHALL 实时更新 Local_Data 中该分类下的书签顺序并保存至 localStorage
5. WHEN 排序结果保存至 localStorage 后，THE Renderer SHALL 在下次渲染时按照更新后的顺序展示分类和书签
6. THE Sorter SHALL 仅对 Private_Source 的 Local_Data 执行排序操作，不修改 Default_Source 的数据
