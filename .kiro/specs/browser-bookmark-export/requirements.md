# Requirements Document

## Introduction

本需求文档定义了 WebStack 管理面板中"导出书签到浏览器"功能的需求。该功能允许用户将书签数据导出为 Netscape Bookmark File Format（HTML 格式），以便导入到 Chrome、Firefox、Edge、Safari 等主流浏览器中。

## Glossary

- **Export_Module**: 导出模块，负责将书签数据转换为浏览器可识别的 HTML 格式并触发下载
- **Data_Source_Manager**: 数据源管理器，管理默认数据源（default.json）和私有数据源（localStorage）
- **Bookmark_Data**: 书签数据，包含分类层级结构和站点信息的 JSON 对象
- **Netscape_Format**: Netscape Bookmark File Format，浏览器书签导入的标准 HTML 格式
- **Selection_UI**: 选择界面，允许用户选择要导出的分类和书签
- **Browser**: 浏览器，指 Chrome、Firefox、Edge、Safari 等支持 Netscape Bookmark File Format 的浏览器

## Requirements

### Requirement 1: 导出为 Netscape Bookmark File Format

**User Story:** 作为用户，我希望将书签导出为标准的 HTML 格式，以便能够导入到各种浏览器中

#### Acceptance Criteria

1. WHEN 用户点击"导出到浏览器"按钮，THE Export_Module SHALL 生成符合 Netscape Bookmark File Format 标准的 HTML 文件
2. THE Export_Module SHALL 在 HTML 文件头部包含 DOCTYPE 声明和必需的 META 标签
3. THE Export_Module SHALL 使用 `<DL>` 和 `<DT>` 标签构建书签层级结构
4. THE Export_Module SHALL 为每个书签生成包含 `HREF` 和 `ADD_DATE` 属性的 `<A>` 标签
5. THE Export_Module SHALL 为每个分类生成包含 `ADD_DATE` 属性的 `<H3>` 标签
6. THE Export_Module SHALL 使用 Unix 时间戳（秒）作为 `ADD_DATE` 属性值

### Requirement 2: 保留分类层级结构

**User Story:** 作为用户，我希望导出的书签保留原有的分类层级，以便在浏览器中保持组织结构

#### Acceptance Criteria

1. WHEN Bookmark_Data 包含一级分类，THE Export_Module SHALL 将其转换为一级 `<H3>` 标签
2. WHEN Bookmark_Data 包含二级分类，THE Export_Module SHALL 将其转换为嵌套的 `<DL>` 和 `<H3>` 标签
3. THE Export_Module SHALL 保持分类在 Bookmark_Data 中的原始顺序
4. THE Export_Module SHALL 保持书签在每个分类中的原始顺序
5. WHEN 一级分类包含 `children` 数组，THE Export_Module SHALL 遍历所有子分类并生成嵌套结构

### Requirement 3: 选择性导出分类

**User Story:** 作为用户，我希望能够选择要导出哪些分类，以便只导出我需要的内容

#### Acceptance Criteria

1. WHEN 用户打开导出界面，THE Selection_UI SHALL 显示所有一级分类的复选框列表
2. THE Selection_UI SHALL 为每个一级分类显示其名称和书签数量
3. WHEN 用户勾选一级分类复选框，THE Selection_UI SHALL 自动勾选该分类下的所有子分类
4. WHEN 用户取消勾选一级分类复选框，THE Selection_UI SHALL 自动取消勾选该分类下的所有子分类
5. WHEN 一级分类包含子分类，THE Selection_UI SHALL 显示可展开的子分类列表
6. THE Selection_UI SHALL 允许用户独立勾选或取消勾选子分类
7. WHEN 用户点击"全选"按钮，THE Selection_UI SHALL 勾选所有分类和子分类
8. WHEN 用户点击"取消全选"按钮，THE Selection_UI SHALL 取消勾选所有分类和子分类

### Requirement 4: 选择性导出书签

**User Story:** 作为用户，我希望能够选择要导出哪些具体的书签，以便精确控制导出内容

#### Acceptance Criteria

1. WHEN 用户展开某个分类，THE Selection_UI SHALL 显示该分类下所有书签的复选框列表
2. THE Selection_UI SHALL 为每个书签显示其名称、URL 和 logo 预览
3. WHEN 用户勾选分类复选框，THE Selection_UI SHALL 自动勾选该分类下的所有书签
4. WHEN 用户取消勾选分类复选框，THE Selection_UI SHALL 自动取消勾选该分类下的所有书签
5. THE Selection_UI SHALL 允许用户独立勾选或取消勾选单个书签
6. WHEN 分类下的所有书签都被勾选，THE Selection_UI SHALL 自动勾选该分类的复选框
7. WHEN 分类下的部分书签被勾选，THE Selection_UI SHALL 显示该分类复选框为半选状态（indeterminate）

### Requirement 5: 数据源选择

**User Story:** 作为用户，我希望能够选择从默认数据源或私有数据源导出，以便灵活管理不同的书签集合

#### Acceptance Criteria

1. THE Selection_UI SHALL 显示当前激活的数据源名称（"默认数据源"或"私有数据源"）
2. THE Selection_UI SHALL 提供数据源切换按钮
3. WHEN 用户点击数据源切换按钮，THE Selection_UI SHALL 切换到另一个数据源
4. WHEN 数据源切换完成，THE Selection_UI SHALL 重新加载并显示新数据源的分类列表
5. THE Export_Module SHALL 从当前选中的数据源读取书签数据

### Requirement 6: 触发文件下载

**User Story:** 作为用户，我希望导出操作能够自动触发文件下载，以便快速保存导出的书签文件

#### Acceptance Criteria

1. WHEN 用户点击"导出"按钮且至少选择了一个书签，THE Export_Module SHALL 生成 HTML 文件内容
2. THE Export_Module SHALL 使用 Blob API 创建文件对象
3. THE Export_Module SHALL 使用 URL.createObjectURL 生成临时下载链接
4. THE Export_Module SHALL 创建隐藏的 `<a>` 标签并设置 `download` 属性
5. THE Export_Module SHALL 自动触发 `<a>` 标签的点击事件以启动下载
6. THE Export_Module SHALL 在下载触发后清理临时 URL 对象
7. THE Export_Module SHALL 使用格式为 `webstack-bookmarks-YYYYMMDD_HHMMSS.html` 的文件名

### Requirement 7: 导出验证和错误处理

**User Story:** 作为用户，我希望在导出过程中得到清晰的反馈，以便了解操作是否成功

#### Acceptance Criteria

1. WHEN 用户点击"导出"按钮且未选择任何书签，THE Selection_UI SHALL 显示错误提示"请至少选择一个书签"
2. WHEN 数据源加载失败，THE Selection_UI SHALL 显示错误提示"数据加载失败，请重试"
3. WHEN 导出成功完成，THE Selection_UI SHALL 显示成功提示"已导出 N 个书签到 M 个分类"
4. THE Selection_UI SHALL 在 2.5 秒后自动隐藏成功提示
5. WHEN 导出过程中发生异常，THE Selection_UI SHALL 显示错误提示并记录错误信息到控制台

### Requirement 8: UI 集成到导入导出页面

**User Story:** 作为用户，我希望导出到浏览器功能与现有的导入导出功能并列显示，以便统一管理数据操作

#### Acceptance Criteria

1. THE Selection_UI SHALL 在 `admin/import-export.html` 页面中作为新的区块显示
2. THE Selection_UI SHALL 位于"导出数据"区块之后
3. THE Selection_UI SHALL 使用与现有区块一致的样式类（`ie-block`）
4. THE Selection_UI SHALL 包含区块标题"导出到浏览器"
5. THE Selection_UI SHALL 包含描述文本"将书签导出为 HTML 格式，可导入到 Chrome/Firefox/Edge/Safari 等浏览器"

### Requirement 9: 浏览器兼容性

**User Story:** 作为用户，我希望导出的书签文件能够被主流浏览器正确识别和导入

#### Acceptance Criteria

1. THE Export_Module SHALL 生成的 HTML 文件能够被 Chrome 浏览器导入
2. THE Export_Module SHALL 生成的 HTML 文件能够被 Firefox 浏览器导入
3. THE Export_Module SHALL 生成的 HTML 文件能够被 Edge 浏览器导入
4. THE Export_Module SHALL 生成的 HTML 文件能够被 Safari 浏览器导入
5. THE Export_Module SHALL 对书签名称和 URL 中的特殊字符进行 HTML 转义

### Requirement 10: 性能要求

**User Story:** 作为用户，我希望导出操作能够快速完成，即使书签数量较多

#### Acceptance Criteria

1. WHEN Bookmark_Data 包含少于 1000 个书签，THE Export_Module SHALL 在 1 秒内完成 HTML 生成
2. WHEN Bookmark_Data 包含 1000 到 5000 个书签，THE Export_Module SHALL 在 3 秒内完成 HTML 生成
3. THE Selection_UI SHALL 在数据源切换后 500 毫秒内完成界面刷新
4. THE Export_Module SHALL 使用字符串拼接而非 DOM 操作来构建 HTML 内容以提高性能
