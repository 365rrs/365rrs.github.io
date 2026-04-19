# Webstack 网址导航

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/WebStackPage/WebStackPage.github.io.svg?style=social&label=Star)](https://github.com/WebStackPage/WebStackPage.github.io)

### 在线演示: [➡️ https://365rrs.top/](https://365rrs.top/)

一个面向设计师的静态网址导航/书签目录站点，收录 UI 设计资源、灵感画廊、设计工具、字体、Mockup、教程及 UED 团队博客等优质链接。

**纯前端实现，无需后端，开箱即用！**

![](http://www.webstack.cc/assets/images/preview.gif)

---

## 📢 关于本项目

本项目基于 [WebStackPage/WebStackPage.github.io](https://github.com/WebStackPage/WebStackPage.github.io) 进行二次开发。

**特别鸣谢：**
- 原项目作者：[Viggo](https://www.viggoz.com)
- 二开工具：[Kiro](https://kiro.ai) - 一款强大的 AI 辅助开发工具，全程使用 Kiro 完成本次二次开发

> Kiro 是一款优秀的 AI 编程助手，能够显著提升开发效率，强烈推荐！

---

## ✨ 核心特性

- 🚀 **纯静态部署** - 无构建系统、无包管理器、无编译步骤，直接编辑推送即可部署
- 📊 **数据驱动** - 书签数据存储在 JSON 文件，通过 JavaScript 动态渲染页面
- 🔄 **双数据源** - 支持默认数据源（只读 JSON）+ 私有数据源（localStorage）
- 🎨 **管理面板** - 内置书签/分类管理、导入/导出、阿里云 OSS 云端同步
- 🔍 **智能搜索** - 支持中文名称、拼音全拼、拼音首字母匹配
- 📱 **响应式设计** - 基于 Bootstrap 3.x，完美适配各种设备
- ☁️ **云端同步** - 支持阿里云 OSS 自动同步，多端数据共享

---

## 📦 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| jQuery | 1.11.1 | DOM 操作、事件处理、AJAX |
| Bootstrap | 3.x | 栅格系统、组件、Modal |
| TweenMax | - | 侧边栏动画、滚动效果 |
| lozad.js | - | 图片懒加载 |
| pinyin-pro | 3.x | 中文拼音搜索支持 |
| Xenon Theme | - | 管理后台 UI 主题 |

---

## 🚀 快速开始

### 方法 1：直接使用（推荐）

1. **克隆或下载项目**
   ```bash
   git clone https://github.com/365rrs/365rrs.github.io.git
   cd 365rrs.github.io
   ```

2. **修改书签数据**
   
   编辑 `assets/data/default.json`，添加你的网站：
   ```json
   {
     "name": "站点名称",
     "url": "https://example.com/",
     "logo": "./assets/images/logos/example.png"
   }
   ```

3. **添加 Logo 图标**
   
   将站点 Logo（建议 120×120px PNG）放入 `assets/images/logos/` 目录

4. **部署上线**
   
   - **GitHub Pages**: 推送到 GitHub 仓库，启用 Pages 功能
   - **Vercel/Netlify**: 导入仓库，自动部署
   - **静态服务器**: 直接上传所有文件到服务器

### 方法 2：使用管理面板

项目内置了完整的管理面板，无需后端即可管理书签：

1. 访问 `admin.html` 进入管理面板
2. 在"书签管理"中添加/编辑/删除书签
3. 在"分类管理"中管理分类结构
4. 使用"导入/导出"功能备份数据
5. 配置"OSS 同步"实现云端备份

---

## 📁 项目结构

```
/
├── index.html              # 主导航页
├── about.html              # 关于页
├── admin.html              # 管理面板入口
├── 404.html                # 自定义 404 页
├── CNAME                   # 自定义域名配置
│
├── admin/                  # 管理面板页面
│   ├── bookmarks.html      # 书签管理
│   ├── categories.html     # 分类管理
│   ├── import-export.html  # 导入导出
│   ├── oss-config.html     # OSS 配置
│   └── sync.html           # 数据同步
│
└── assets/
    ├── css/                # 样式文件
    │   ├── nav.css         # 自定义样式
    │   ├── admin.css       # 管理面板样式
    │   └── xenon-*.css     # Xenon 主题样式
    │
    ├── js/                 # JavaScript 文件
    │   ├── app.js          # 核心应用逻辑
    │   ├── admin.js        # 管理面板逻辑
    │   └── xenon-*.js      # Xenon 主题脚本
    │
    ├── data/               # 数据文件
    │   ├── default.json    # 默认书签数据
    │   └── logos-list.json # Logo 文件列表
    │
    ├── html/               # 工具页面
    │   ├── json-formatter.html
    │   ├── mybatis-sql-parser.html
    │   └── ...
    │
    └── images/             # 图片资源
        └── logos/          # 站点 Logo（258+ 个）
```

---

## 📝 数据结构

`assets/data/default.json` 数据格式：

```json
{
  "categories": [
    {
      "id": "cat-recommend",
      "name": "常用推荐",
      "icon": "linecons-star",
      "sites": [
        {
          "name": "Dribbble",
          "url": "https://dribbble.com/",
          "logo": "./assets/images/logos/dribbble.png"
        }
      ]
    },
    {
      "id": "cat-inspiration",
      "name": "灵感采集",
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

**支持两级分类：**
- 一级分类直接包含 `sites` 数组
- 或包含 `children` 数组（子分类，每个子分类包含 `sites`）

---

## 🎨 自定义配置

### 修改应用版本

编辑 `assets/js/app.js`，更新版本号（用于 localStorage 隔离）：

```javascript
var APP_VERSION = 'v20260418';  // 格式：vYYYYMMDD
```

### 添加新分类

在 `default.json` 的 `categories` 数组中添加：

```json
{
  "id": "cat-new",
  "name": "新分类",
  "icon": "linecons-star",  // 使用 Linecons 图标类名
  "sites": [...]
}
```

### 可用图标字体

- **Font Awesome** - 前缀 `fa-`（如 `fa-star`）
- **Linecons** - 前缀 `linecons-`（如 `linecons-star`）
- **Elusive Icons** - 前缀 `el-`
- **Meteocons** - 前缀 `meteocons-`
- **Glyphicons** - 前缀 `glyphicon-`

### 自定义样式

编辑 `assets/css/nav.css`：

```css
.box2 {
  /* 书签卡片样式 */
  height: 56px;
  border-radius: 4px;
}

.box2:hover {
  /* 悬浮效果 */
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
```

---

## 🔧 核心功能

### 1. 双数据源系统

- **默认数据源**: `assets/data/default.json`（只读）
- **私有数据源**: 存储在 `localStorage`（可编辑）
- 通过顶部导航栏切换数据源

### 2. 智能搜索

支持三种搜索方式：
- 中文名称匹配：`花瓣`
- 拼音全拼匹配：`huaban`
- 拼音首字母匹配：`hb`

### 3. 云端同步

配置阿里云 OSS 后，支持：
- 自动版本比较
- 增量数据同步
- 多端数据共享
- 定时自动同步

### 4. 图片懒加载

使用 lozad.js 实现：
```html
<img data-src="./assets/images/logos/xxx.png" class="lozad" />
```

---

## 🌐 部署指南

### GitHub Pages

1. Fork 本仓库
2. 在仓库设置中启用 GitHub Pages
3. 选择 `main` 分支作为源
4. 访问 `https://your-username.github.io/repo-name`

### 自定义域名

1. 在项目根目录创建 `CNAME` 文件
2. 写入你的域名：`example.com`
3. 在域名 DNS 设置中添加 CNAME 记录指向 GitHub Pages

### Vercel 部署

1. 导入 GitHub 仓库到 Vercel
2. 无需配置，自动部署
3. 获得 `.vercel.app` 域名或绑定自定义域名

### Netlify 部署

1. 连接 GitHub 仓库到 Netlify
2. 构建命令留空（纯静态项目）
3. 发布目录设置为 `/`（根目录）

---

## 📷 截图展示

![](http://www.webstack.cc/assets/images/webstack_banner_cn.png)
![](http://7xnb6x.com1.z0.glb.clouddn.com/webstack-03-Introduction.png)
![](http://7xnb6x.com1.z0.glb.clouddn.com/webstack-04-infomation.png)
![](http://7xnb6x.com1.z0.glb.clouddn.com/webstack-05-production.png)
![](http://7xnb6x.com1.z0.glb.clouddn.com/webstack-06-production2.png)

---

## 🖼️ 图片资源说明

- `/assets/images/logos/default.png` - 网站标签的默认图标
- `/assets/images/logos/` - 所有网站图标切图，尺寸均为 120px×120px
- `/assets/webstack_logos.sketch` - 图标设计源文件（[下载](https://WebStackPage.github.io/assets/webstack_logos.sketch)）

> 打开 Sketch 文件需要 Sketch 版本 ≥ 50.2 (55047)

---

## ⚠️ 重要声明

**关于 "Webstack Pro" 付费版本：**

"一导航"未经允许推出的 "Webstack Pro 版本" 付费导航主题，**与本项目没有任何关系**。已经和该公司多次沟通，该公司始终没有移除所有 "Webstack Pro" 相关名称，在此郑重声明。

![](https://github.com/WebStackPage/WebStackPage.github.io/blob/master/assets/images/webstack_no_pro.png)

**本项目立场：**
- ✅ WebStack 所有项目均为**完全免费开源**
- ✅ WebStack **没有任何 Pro 版本或专业版本**
- ✅ 尊重各位共建者劳动成果实现盈利
- ❌ 不鼓励任何盗用 "WebstackPro" 名义盈利的行为

---

## 📄 开源协议

Copyright © 2017-2026 **[webstack.cc](https://webstack.cc)** 

Released under the **MIT License**.

> **注意事项：**
> 
> 本站开源的目的是大家能够在本站的基础之上有所启发，做出更多新的东西。并不是让大家照搬所有代码。
> 
> 如果你使用这个开源项目，请**注明**本项目开源地址。

---

## 🤝 贡献指南

欢迎贡献代码、提交 Issue 或 Pull Request！

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的修改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

---

## 📮 联系方式

- 原项目作者：[Viggo](https://www.viggoz.com)
- 原项目博客：[blog.viggoz.com](http://blog.viggoz.com)
- 原项目主页：[webstack.cc](https://webstack.cc)
- 原项目仓库：[WebStackPage/WebStackPage.github.io](https://github.com/WebStackPage/WebStackPage.github.io)

**二开工具推荐：**
- [Kiro](https://kiro.ai) - AI 辅助开发工具，本项目全程使用 Kiro 完成二次开发

---

**JUST DOWNLOAD AND DO WHAT THE FUCK YOU WANT TO.**

⭐ 如果这个项目对你有帮助，请给个 Star 支持一下！

---

## 🙏 致谢

- 感谢 [Viggo](https://www.viggoz.com) 创建了优秀的 WebStack 项目
- 感谢 [Kiro](https://kiro.ai) 提供的强大 AI 开发工具支持
- 感谢所有为开源社区做出贡献的开发者们
