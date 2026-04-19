# 需求文档

## 简介

本功能为 WebStack 管理面板新增 **Tab Copy 导入**能力，允许用户将 Tab Copy 浏览器插件复制的 JSON 数组数据（格式：`[{"title": "...", "url": "..."}]`）直接粘贴到管理面板，快速批量导入为书签，并指定目标分类，从而大幅提升书签录入效率。

## 词汇表

- **Tab_Copy_Importer**：负责解析 Tab Copy JSON 数组并将其转换为书签的导入模块
- **Tab_Copy_JSON**：Tab Copy 插件导出的 JSON 数组，每个元素包含 `title`（标签页标题）和 `url`（标签页地址）字段
- **Bookmark**：书签对象，包含 `name`、`url`、`logo` 字段，存储于私有数据源的分类 `sites` 数组中
- **Category**：书签分类，可为一级分类（含 `sites`）或二级子分类（父分类含 `children`）
- **Private_Data_Source**：存储于 `localStorage` 的私有书签数据，格式与 `default.json` 相同
- **Import_Preview**：导入前展示的待导入书签预览列表，允许用户确认或取消

---

## 需求

### 需求 1：粘贴 Tab Copy JSON 数据

**用户故事：** 作为一名用户，我希望在管理面板中粘贴 Tab Copy 插件复制的 JSON 数组，以便快速批量导入多个标签页为书签。

#### 验收标准

1. THE Tab_Copy_Importer SHALL 在管理面板的书签管理页面（`admin/bookmarks.html`）提供一个专用的文本输入区域，用于粘贴 Tab Copy JSON 数据。
2. WHEN 用户在输入区域粘贴或输入文本后点击"解析"按钮，THE Tab_Copy_Importer SHALL 解析输入内容为 Tab_Copy_JSON 对象数组。
3. WHEN 解析成功且数组不为空，THE Tab_Copy_Importer SHALL 展示 Import_Preview，列出所有待导入书签的 `title` 和 `url`。
4. IF 输入内容为空字符串，THEN THE Tab_Copy_Importer SHALL 显示提示信息"请粘贴 Tab Copy JSON 数据"，并终止解析流程。
5. IF 输入内容不是合法 JSON，THEN THE Tab_Copy_Importer SHALL 显示错误提示"JSON 格式错误，请检查输入内容"，并终止解析流程。
6. IF 输入内容是合法 JSON 但不是数组，THEN THE Tab_Copy_Importer SHALL 显示错误提示"数据格式错误，需要 JSON 数组格式"，并终止解析流程。
7. IF 解析后数组为空（`[]`），THEN THE Tab_Copy_Importer SHALL 显示提示信息"数组为空，没有可导入的书签"，并终止解析流程。

---

### 需求 2：解析 Tab Copy JSON 字段

**用户故事：** 作为一名用户，我希望系统能正确识别 Tab Copy JSON 中的 `title` 和 `url` 字段，以便将标签页数据准确转换为书签。

#### 验收标准

1. WHEN 解析 Tab_Copy_JSON 数组中的每个元素，THE Tab_Copy_Importer SHALL 将元素的 `title` 字段映射为 Bookmark 的 `name` 字段。
2. WHEN 解析 Tab_Copy_JSON 数组中的每个元素，THE Tab_Copy_Importer SHALL 将元素的 `url` 字段映射为 Bookmark 的 `url` 字段。
3. WHEN 某个元素缺少 `url` 字段或 `url` 值为空字符串，THE Tab_Copy_Importer SHALL 跳过该元素，并在 Import_Preview 中以警告样式标注"已跳过（缺少 URL）"。
4. WHEN 某个元素缺少 `title` 字段或 `title` 值为空字符串，THE Tab_Copy_Importer SHALL 使用该元素的 `url` 值作为 Bookmark 的 `name` 字段。
5. THE Tab_Copy_Importer SHALL 将所有新建 Bookmark 的 `logo` 字段初始化为空字符串。

---

### 需求 3：选择目标分类

**用户故事：** 作为一名用户，我希望在导入前选择书签要保存到的目标分类，以便将书签整理到正确的位置。

#### 验收标准

1. WHEN Import_Preview 展示时，THE Tab_Copy_Importer SHALL 同时展示一个分类选择下拉框，列出 Private_Data_Source 中所有可用的叶子分类（即含 `sites` 数组的分类）。
2. WHILE Private_Data_Source 为空或不存在，THE Tab_Copy_Importer SHALL 在分类下拉框中显示提示项"请先创建私有数据源"，并禁用"确认导入"按钮。
3. THE Tab_Copy_Importer SHALL 在分类下拉框中以"父分类 / 子分类"格式显示二级子分类的完整路径。
4. WHEN 用户未选择任何分类时点击"确认导入"按钮，THE Tab_Copy_Importer SHALL 显示提示"请选择目标分类"，并阻止导入操作。

---

### 需求 4：确认并执行导入

**用户故事：** 作为一名用户，我希望确认预览后一键将所有书签导入到指定分类，以便快速完成批量录入。

#### 验收标准

1. WHEN 用户在 Import_Preview 中选择目标分类并点击"确认导入"按钮，THE Tab_Copy_Importer SHALL 将所有有效 Bookmark 追加到 Private_Data_Source 中目标分类的 `sites` 数组末尾。
2. WHEN 导入操作完成，THE Tab_Copy_Importer SHALL 显示成功提示，内容包含实际导入的书签数量，格式为"成功导入 N 个书签"。
3. WHEN 导入操作完成，THE Tab_Copy_Importer SHALL 清空输入区域的文本内容，并隐藏 Import_Preview。
4. WHEN 导入操作完成，THE Tab_Copy_Importer SHALL 触发书签列表刷新，使新导入的书签立即显示在书签管理列表中。

---

### 需求 5：只读数据源保护

**用户故事：** 作为一名用户，我希望系统在当前数据源为只读（默认数据源）时禁用导入功能，以便明确知道只有私有数据源才支持导入操作。

#### 验收标准

1. WHILE 当前激活数据源为默认数据源（只读），THE Tab_Copy_Importer SHALL 禁用整个导入功能区域（包括输入框、解析按钮及确认导入按钮），并在导入区域顶部显示提示"当前为默认数据源（只读），请先切换至私有数据源"。
2. WHILE 当前激活数据源为私有数据源，THE Tab_Copy_Importer SHALL 启用导入功能区域，并隐藏只读提示。
