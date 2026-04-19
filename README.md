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
- 二开工具：[Kiro](https://kiro.dev/) - 一款强大的 AI 辅助开发工具，全程使用 Kiro 完成本次二次开发

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

## 📋 快速开始示例数据

以下是一个完整的示例数据，包含 1 个一级菜单和 1 个二级菜单，可以直接复制后通过管理面板的"导入/导出"功能导入到本地私有数据源：

```json
{
  "categories": [
    {
      "id": "cat-dev-tools",
      "name": "开发工具",
      "icon": "linecons-star",
      "sites": [
        {
          "name": "GitHub",
          "url": "https://github.com/",
          "logo": "./assets/images/logos/github.png"
        },
        {
          "name": "Stack Overflow",
          "url": "https://stackoverflow.com/",
          "logo": "./assets/images/logos/stackoverflow.png"
        },
        {
          "name": "MDN Web Docs",
          "url": "https://developer.mozilla.org/",
          "logo": "./assets/images/logos/mdn.png"
        }
      ]
    },
    {
      "id": "cat-design",
      "name": "设计资源",
      "icon": "linecons-lightbulb",
      "children": [
        {
          "id": "cat-design-inspiration",
          "name": "设计灵感",
          "sites": [
            {
              "name": "Dribbble",
              "url": "https://dribbble.com/",
              "logo": "./assets/images/logos/dribbble.png"
            },
            {
              "name": "Behance",
              "url": "https://www.behance.net/",
              "logo": "./assets/images/logos/behance.png"
            },
            {
              "name": "Pinterest",
              "url": "https://www.pinterest.com/",
              "logo": "./assets/images/logos/pinterest.png"
            }
          ]
        },
        {
          "id": "cat-design-tools",
          "name": "设计工具",
          "sites": [
            {
              "name": "Figma",
              "url": "https://www.figma.com/",
              "logo": "./assets/images/logos/figma.png"
            },
            {
              "name": "Sketch",
              "url": "https://www.sketch.com/",
              "logo": "./assets/images/logos/sketch.png"
            },
            {
              "name": "Adobe XD",
              "url": "https://www.adobe.com/products/xd.html",
              "logo": "./assets/images/logos/adobexd.png"
            }
          ]
        }
      ]
    }
  ]
}
```

**使用方法：**
1. 复制上面的 JSON 数据
2. 访问 `admin.html` 进入管理面板
3. 点击"导入/导出"标签
4. 在"导入数据"区域粘贴 JSON 数据
5. 点击"导入到私有数据源"按钮
6. 切换到私有数据源即可看到导入的书签

**数据结构说明：**
- `cat-dev-tools`：一级菜单示例，直接包含 3 个书签
- `cat-design`：二级菜单示例，包含 2 个子分类（设计灵感、设计工具），每个子分类各有 3 个书签

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

项目支持两种独立的数据源，可以随时切换：

**默认数据源（只读）：**
- 数据文件：`assets/data/default.json`
- 特点：只读，无法通过管理面板修改
- 适用场景：
  - 展示公共书签集合（如设计资源导航）
  - 作为初始模板供用户参考
  - 部署到服务器供多人访问的公共导航站
- 修改方式：直接编辑 `default.json` 文件后重新部署

**私有数据源（可编辑）：**
- 存储位置：浏览器 `localStorage`（key: `ws_private_data_{版本号}`）
- 特点：完全可编辑，支持增删改查
- 适用场景：
  - 个人定制书签集合
  - 在默认数据基础上添加私人书签
  - 需要频繁更新的动态内容
- 管理方式：通过管理面板（`admin.html`）进行可视化管理

**数据源切换：**
- 位置：顶部导航栏"数据源切换"按钮
- 切换逻辑：
  - 首次切换到私有数据源时，如果私有数据为空，会提示是否用默认数据初始化
  - 切换后立即重新渲染页面，显示对应数据源的内容
  - 当前激活的数据源会保存在 `localStorage`，下次访问自动加载

**典型使用流程：**
1. 初次访问：查看默认数据源的内容
2. 切换到私有数据源：系统提示用默认数据初始化
3. 在私有数据源中添加/删除/修改书签
4. 通过 OSS 同步或导入/导出功能备份私有数据
5. 随时切换回默认数据源查看原始内容

> 💡 **提示**：
> - 默认数据源和私有数据源完全独立，互不影响。你可以保持默认数据源不变，在私有数据源中自由定制。
> - 私有数据源存储在浏览器的 `localStorage` 中，具有以下特点：
>   - **浏览器隔离**：不同浏览器的数据互不共享（Chrome、Firefox、Edge 等各自独立）
>   - **域名隔离**：不同域名下的数据互不共享
>   - **容量限制**：通常为 5-10MB，足够存储数千条书签
>   - **持久化存储**：数据永久保存，除非手动清除浏览器数据或卸载浏览器
>   - **本地存储**：数据仅存储在本地，不会自动上传到服务器
> - 建议定期使用"导入/导出"或"OSS 同步"功能备份私有数据，避免因清除浏览器缓存、重装系统等操作导致数据丢失。

### 2. 智能搜索

支持三种搜索方式：
- 中文名称匹配：`花瓣`
- 拼音全拼匹配：`huaban`
- 拼音首字母匹配：`hb`

### 3. 云端同步

配置阿里云 OSS 后，支持：

**手动同步：**
- **上传到云端** - 将本地私有数据源上传到阿里云 OSS，生成版本号（时间戳格式 YYYYMMDDHHmmss）
- **从云端下载** - 从阿里云 OSS 下载最新版本数据到本地，覆盖本地私有数据源

**自动同步：**
- **页面加载时同步** - 打开网站时自动检查云端版本，如有更新则自动下载
- **定时自动同步** - 可设置定时器（如每 3600 秒），自动检查并下载云端更新
- **版本比较机制** - 通过 `version.json` 文件比较本地和云端版本号，仅在云端版本更新时下载

**数据结构：**
- `version.json` - 存储当前最新版本号
- `data-{版本号}.json` - 实际数据文件，如 `data-20260418120000.json`

**使用场景：**
- 多设备数据同步（家里电脑、公司电脑、手机浏览器）
- 数据云端备份，防止本地数据丢失
- 团队共享书签数据

> 💡 **无需 OSS？** 如果不想配置阿里云 OSS，可以使用管理面板中的"导入/导出"功能实现数据备份和手动同步：
> - 在设备 A 导出 JSON 文件
> - 通过网盘、邮件等方式传输到设备 B
> - 在设备 B 导入 JSON 文件
> 
> 这种方式虽然需要手动操作，但无需任何云服务配置，完全免费

### 4. 图片懒加载

使用 lozad.js 实现：
```html
<img data-src="./assets/images/logos/xxx.png" class="lozad" />
```

---

## 🌐 部署指南

### 方式 1：本地预览

最简单的方式，无需任何配置：

1. **克隆或下载项目到本地**
   ```bash
   git clone https://github.com/your-username/your-repo.git
   ```
   或直接下载 ZIP 压缩包并解压

2. **直接打开**
   
   双击 `index.html` 文件，即可在浏览器中打开使用
   
   > 💡 提示：纯静态项目，无需安装任何依赖或启动服务器

### 方式 2：在线部署

#### GitHub Pages

1. Fork 本仓库
2. 在仓库设置中启用 GitHub Pages
3. 选择 `main` 分支作为源
4. 访问 `https://your-username.github.io/repo-name`

#### 自定义域名

1. 在项目根目录创建 `CNAME` 文件
2. 写入你的域名：`example.com`
3. 在域名 DNS 设置中添加 CNAME 记录指向 GitHub Pages

#### Vercel 部署

1. 导入 GitHub 仓库到 Vercel
2. 无需配置，自动部署
3. 获得 `.vercel.app` 域名或绑定自定义域名

#### Netlify 部署

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
- [Kiro](https://kiro.dev/) - AI 辅助开发工具，本项目全程使用 Kiro 完成二次开发

---

**JUST DOWNLOAD AND DO WHAT THE FUCK YOU WANT TO.**

⭐ 如果这个项目对你有帮助，请给个 Star 支持一下！

---

## 🙏 致谢

- 感谢 [Viggo](https://www.viggoz.com) 创建了优秀的 WebStack 项目
- 感谢 [Kiro](https://kiro.dev/) 提供的强大 AI 开发工具支持
- 感谢所有为开源社区做出贡献的开发者们
