/* ==========================================================
   assets/js/admin.js
   管理面板逻辑
   模块：CategoryManager, BookmarkManager, Sorter, ImportExport, OSSConfig, SyncManager
   ES5 风格，兼容 jQuery 1.11.1
   ========================================================== */

/* ----------------------------------------------------------
   CategoryManager 模块
   ---------------------------------------------------------- */
var CategoryManager = {

    /**
     * 初始化：绑定事件，渲染分类树
     */
    init: function () {
        CategoryManager.render();
        CategoryManager._bindEvents();
    },

    /**
     * 渲染分类树
     */
    render: function () {
        var source = DataSourceManager.getActive();
        var isDefault = (source === 'default');

        // 更新数据源名称显示
        $('#cat-source-name').text(isDefault ? '默认数据源' : '私有数据源');

        // 只读提示
        if (isDefault) {
            $('#cat-readonly-tip').show();
            $('#cat-add-btn').prop('disabled', true);
        } else {
            $('#cat-readonly-tip').hide();
            $('#cat-add-btn').prop('disabled', false);
        }

        var $tree = $('#category-tree');
        $tree.html('<div class="cat-loading">加载中...</div>');

        DataSourceManager.load(source).done(function (data) {
            if (!data || !data.categories || !data.categories.length) {
                $tree.html('<div class="cat-empty">暂无分类数据。</div>');
                return;
            }
            var html = '';
            for (var i = 0; i < data.categories.length; i++) {
                html += CategoryManager._buildCategoryRow(data.categories[i], i, data.categories.length, isDefault);
            }
            $tree.html('<div class="cat-list">' + html + '</div>');
        }).fail(function () {
            $tree.html('<div class="cat-empty">数据加载失败。</div>');
        });
    },

    /**
     * 构建一级分类行 HTML
     */
    _buildCategoryRow: function (cat, index, total, isDefault) {
        var disabledAttr = isDefault ? ' disabled' : '';
        var disabledClass = isDefault ? ' cat-btn-disabled' : '';

        var html = '<div class="cat-item cat-item-top" data-id="' + cat.id + '">';
        html += '<div class="cat-item-row">';
        html += '<span class="cat-item-icon"><i class="' + (cat.icon || 'linecons-tag') + '"></i></span>';
        html += '<span class="cat-item-name">' + CategoryManager._escHtml(cat.name) + '</span>';
        html += '<span class="cat-item-meta">';

        // 书签数量提示
        if (cat.children && cat.children.length) {
            var totalSites = 0;
            for (var c = 0; c < cat.children.length; c++) {
                totalSites += (cat.children[c].sites || []).length;
            }
            html += '<span class="cat-badge">' + cat.children.length + ' 子分类 / ' + totalSites + ' 书签</span>';
        } else {
            html += '<span class="cat-badge">' + (cat.sites || []).length + ' 书签</span>';
        }

        html += '</span>';
        html += '<span class="cat-item-actions">';
        html += '<button class="cat-btn cat-btn-sub' + disabledClass + '" data-action="add-sub" data-id="' + cat.id + '"' + disabledAttr + ' title="添加子分类"><i class="fa fa-sitemap"></i></button>';
        html += '<button class="cat-btn cat-btn-rename' + disabledClass + '" data-action="rename" data-id="' + cat.id + '"' + disabledAttr + ' title="重命名"><i class="fa fa-pencil"></i></button>';
        html += '<button class="cat-btn cat-btn-up' + disabledClass + '" data-action="move-up" data-id="' + cat.id + '"' + (index === 0 ? ' disabled' : disabledAttr) + ' title="上移"><i class="fa fa-arrow-up"></i></button>';
        html += '<button class="cat-btn cat-btn-down' + disabledClass + '" data-action="move-down" data-id="' + cat.id + '"' + (index === total - 1 ? ' disabled' : disabledAttr) + ' title="下移"><i class="fa fa-arrow-down"></i></button>';
        html += '<button class="cat-btn cat-btn-del' + disabledClass + '" data-action="delete" data-id="' + cat.id + '"' + disabledAttr + ' title="删除"><i class="fa fa-trash"></i></button>';
        html += '</span>';
        html += '</div>';

        // 子分类列表
        if (cat.children && cat.children.length) {
            html += '<div class="cat-children">';
            for (var j = 0; j < cat.children.length; j++) {
                html += CategoryManager._buildSubCategoryRow(cat.children[j], j, cat.children.length, cat.id, isDefault);
            }
            html += '</div>';
        }

        html += '</div>';
        return html;
    },

    /**
     * 构建二级分类行 HTML
     */
    _buildSubCategoryRow: function (sub, index, total, parentId, isDefault) {
        var disabledAttr = isDefault ? ' disabled' : '';
        var disabledClass = isDefault ? ' cat-btn-disabled' : '';

        var html = '<div class="cat-item cat-item-sub" data-id="' + sub.id + '" data-parent="' + parentId + '">';
        html += '<div class="cat-item-row">';
        html += '<span class="cat-item-name">' + CategoryManager._escHtml(sub.name) + '</span>';
        html += '<span class="cat-item-meta"><span class="cat-badge">' + (sub.sites || []).length + ' 书签</span></span>';
        html += '<span class="cat-item-actions">';
        html += '<button class="cat-btn cat-btn-rename' + disabledClass + '" data-action="rename-sub" data-id="' + sub.id + '" data-parent="' + parentId + '"' + disabledAttr + ' title="重命名"><i class="fa fa-pencil"></i></button>';
        html += '<button class="cat-btn cat-btn-up' + disabledClass + '" data-action="move-sub-up" data-id="' + sub.id + '" data-parent="' + parentId + '"' + (index === 0 ? ' disabled' : disabledAttr) + ' title="上移"><i class="fa fa-arrow-up"></i></button>';
        html += '<button class="cat-btn cat-btn-down' + disabledClass + '" data-action="move-sub-down" data-id="' + sub.id + '" data-parent="' + parentId + '"' + (index === total - 1 ? ' disabled' : disabledAttr) + ' title="下移"><i class="fa fa-arrow-down"></i></button>';
        html += '<button class="cat-btn cat-btn-del' + disabledClass + '" data-action="delete-sub" data-id="' + sub.id + '" data-parent="' + parentId + '"' + disabledAttr + ' title="删除"><i class="fa fa-trash"></i></button>';
        html += '</span>';
        html += '</div>';
        html += '</div>';
        return html;
    },

    /**
     * 绑定所有事件
     */
    _bindEvents: function () {
        // 添加一级分类按钮
        $('#cat-add-btn').on('click', function () {
            CategoryManager._openModal('add-top', '', '');
        });

        // 切换数据源按钮
        $('#cat-switch-source-btn').on('click', function () {
            var current = DataSourceManager.getActive();
            var target = (current === 'default') ? 'private' : 'default';
            CategoryManager._switchSource(target);
        });

        // 分类树操作按钮（事件委托）
        $('#category-tree').on('click', '[data-action]', function () {
            var action = $(this).data('action');
            var id = $(this).data('id');
            var parentId = $(this).data('parent') || '';

            if (action === 'add-sub') {
                CategoryManager._openModal('add-sub', '', id);
            } else if (action === 'rename') {
                CategoryManager._openModal('rename', id, '');
            } else if (action === 'rename-sub') {
                CategoryManager._openModal('rename-sub', id, parentId);
            } else if (action === 'delete') {
                CategoryManager.deleteCategory(id, '');
            } else if (action === 'delete-sub') {
                CategoryManager.deleteCategory(id, parentId);
            } else if (action === 'move-up') {
                CategoryManager._moveCategory(id, 'up');
            } else if (action === 'move-down') {
                CategoryManager._moveCategory(id, 'down');
            } else if (action === 'move-sub-up') {
                CategoryManager._moveSubCategory(parentId, id, 'up');
            } else if (action === 'move-sub-down') {
                CategoryManager._moveSubCategory(parentId, id, 'down');
            }
        });

        // Modal 保存按钮
        $('#modal-cat-save').on('click', function () {
            var mode = $('#modal-cat-mode').val();
            var name = $.trim($('#modal-cat-name').val());
            var id = $('#modal-cat-id').val();
            var parentId = $('#modal-cat-parent-id').val();

            if (!name) {
                alert('请输入分类名称');
                return;
            }

            if (mode === 'add-top') {
                var icon = $('input[name="cat-icon"]:checked').val() || 'linecons-star';
                CategoryManager.addCategory(name, icon);
            } else if (mode === 'add-sub') {
                CategoryManager.addSubCategory(parentId, name);
            } else if (mode === 'rename') {
                CategoryManager.renameCategory(id, name, '');
            } else if (mode === 'rename-sub') {
                CategoryManager.renameCategory(id, name, parentId);
            }

            $('#modal-category').modal('hide');
        });
    },

    /**
     * 打开 Modal
     * @param {string} mode  'add-top' | 'add-sub' | 'rename' | 'rename-sub'
     * @param {string} id    分类 id（重命名时使用）
     * @param {string} parentId  父分类 id（add-sub / rename-sub 时使用）
     */
    _openModal: function (mode, id, parentId) {
        $('#modal-cat-mode').val(mode);
        $('#modal-cat-id').val(id);
        $('#modal-cat-parent-id').val(parentId);
        $('#modal-cat-name').val('');

        if (mode === 'add-top') {
            $('#modal-cat-title').text('添加一级分类');
            $('#modal-cat-icon-group').show();
            $('input[name="cat-icon"][value="linecons-star"]').prop('checked', true);
        } else if (mode === 'add-sub') {
            $('#modal-cat-title').text('添加子分类');
            $('#modal-cat-icon-group').hide();
        } else if (mode === 'rename' || mode === 'rename-sub') {
            $('#modal-cat-title').text('重命名分类');
            $('#modal-cat-icon-group').hide();
            // 预填当前名称
            var data = DataSourceManager.getPrivateData();
            if (data) {
                var currentName = CategoryManager._findName(data, id, parentId);
                if (currentName) {
                    $('#modal-cat-name').val(currentName);
                }
            }
        }

        $('#modal-category').modal('show');
    },

    /**
     * 在数据中查找分类名称
     */
    _findName: function (data, id, parentId) {
        var cats = data.categories || [];
        if (!parentId) {
            for (var i = 0; i < cats.length; i++) {
                if (cats[i].id === id) return cats[i].name;
            }
        } else {
            for (var j = 0; j < cats.length; j++) {
                if (cats[j].id === parentId && cats[j].children) {
                    for (var k = 0; k < cats[j].children.length; k++) {
                        if (cats[j].children[k].id === id) return cats[j].children[k].name;
                    }
                }
            }
        }
        return '';
    },

    /**
     * 切换数据源
     */
    _switchSource: function (target) {
        if (target === 'private') {
            var privateData = DataSourceManager.getPrivateData();
            if (!privateData) {
                var confirmed = confirm('私有数据源为空，是否以默认数据源内容初始化私有数据源？');
                if (confirmed) {
                    $.getJSON('./assets/data/default.json').done(function (defaultData) {
                        var copy = JSON.parse(JSON.stringify(defaultData));
                        DataSourceManager.savePrivateData(copy);
                        localStorage.setItem(wsKey('active_source'), 'private');
                        CategoryManager.render();
                    }).fail(function () {
                        alert('加载默认数据源失败，请重试。');
                    });
                }
                return;
            }
        }
        localStorage.setItem(wsKey('active_source'), target);
        CategoryManager.render();
    },

    /**
     * 添加一级分类
     * @param {string} name
     * @param {string} icon
     */
    addCategory: function (name, icon) {
        var data = DataSourceManager.getPrivateData() || { categories: [] };
        var newCat = {
            id: 'cat-' + Date.now(),
            name: name,
            icon: icon || 'linecons-star',
            sites: []
        };
        data.categories.push(newCat);
        DataSourceManager.savePrivateData(data);
        CategoryManager.render();
    },

    /**
     * 添加二级子分类
     * @param {string} parentId
     * @param {string} name
     */
    addSubCategory: function (parentId, name) {
        var data = DataSourceManager.getPrivateData();
        if (!data) return;

        var cats = data.categories;
        var parent = null;
        for (var i = 0; i < cats.length; i++) {
            if (cats[i].id === parentId) {
                parent = cats[i];
                break;
            }
        }
        if (!parent) return;

        var newSub = {
            id: 'cat-' + Date.now(),
            name: name,
            sites: []
        };

        // 若该一级分类有 sites（纯一级），需转换结构
        if (parent.sites && parent.sites.length > 0) {
            var doConvert = confirm('该分类下已有 ' + parent.sites.length + ' 个书签，添加子分类后书签将被移至新子分类"' + name + '"中，是否继续？');
            if (!doConvert) return;
            newSub.sites = parent.sites;
            parent.children = [newSub];
            delete parent.sites;
        } else if (parent.children) {
            // 已有子分类，直接追加
            parent.children.push(newSub);
        } else {
            // sites 为空，直接转换
            parent.children = [newSub];
            delete parent.sites;
        }

        DataSourceManager.savePrivateData(data);
        CategoryManager.render();
    },

    /**
     * 重命名分类
     * @param {string} id
     * @param {string} newName
     * @param {string} parentId  空字符串表示一级分类
     */
    renameCategory: function (id, newName, parentId) {
        var data = DataSourceManager.getPrivateData();
        if (!data) return;

        var cats = data.categories;
        if (!parentId) {
            for (var i = 0; i < cats.length; i++) {
                if (cats[i].id === id) {
                    cats[i].name = newName;
                    break;
                }
            }
        } else {
            for (var j = 0; j < cats.length; j++) {
                if (cats[j].id === parentId && cats[j].children) {
                    for (var k = 0; k < cats[j].children.length; k++) {
                        if (cats[j].children[k].id === id) {
                            cats[j].children[k].name = newName;
                            break;
                        }
                    }
                }
            }
        }

        DataSourceManager.savePrivateData(data);
        CategoryManager.render();
    },

    /**
     * 删除分类
     * @param {string} id
     * @param {string} parentId  空字符串表示一级分类
     */
    deleteCategory: function (id, parentId) {
        var confirmed;
        if (!parentId) {
            confirmed = confirm('确定删除该一级分类？该分类下的所有子分类和书签也将被删除。');
        } else {
            confirmed = confirm('确定删除该子分类？该子分类下的所有书签也将被删除。');
        }
        if (!confirmed) return;

        var data = DataSourceManager.getPrivateData();
        if (!data) return;

        var cats = data.categories;
        if (!parentId) {
            for (var i = 0; i < cats.length; i++) {
                if (cats[i].id === id) {
                    cats.splice(i, 1);
                    break;
                }
            }
        } else {
            for (var j = 0; j < cats.length; j++) {
                if (cats[j].id === parentId && cats[j].children) {
                    for (var k = 0; k < cats[j].children.length; k++) {
                        if (cats[j].children[k].id === id) {
                            cats[j].children.splice(k, 1);
                            break;
                        }
                    }
                }
            }
        }

        DataSourceManager.savePrivateData(data);
        CategoryManager.render();
    },

    /**
     * 移动一级分类
     */
    _moveCategory: function (id, direction) {
        var data = DataSourceManager.getPrivateData();
        if (!data) return;
        var cats = data.categories;
        var idx = -1;
        for (var i = 0; i < cats.length; i++) {
            if (cats[i].id === id) { idx = i; break; }
        }
        if (idx === -1) return;
        if (direction === 'up' && idx === 0) return;
        if (direction === 'down' && idx === cats.length - 1) return;

        var swapIdx = direction === 'up' ? idx - 1 : idx + 1;
        var tmp = cats[idx];
        cats[idx] = cats[swapIdx];
        cats[swapIdx] = tmp;

        DataSourceManager.savePrivateData(data);
        CategoryManager.render();
    },

    /**
     * 移动二级子分类
     */
    _moveSubCategory: function (parentId, subId, direction) {
        var data = DataSourceManager.getPrivateData();
        if (!data) return;
        var cats = data.categories;
        for (var i = 0; i < cats.length; i++) {
            if (cats[i].id === parentId && cats[i].children) {
                var children = cats[i].children;
                var idx = -1;
                for (var j = 0; j < children.length; j++) {
                    if (children[j].id === subId) { idx = j; break; }
                }
                if (idx === -1) return;
                if (direction === 'up' && idx === 0) return;
                if (direction === 'down' && idx === children.length - 1) return;

                var swapIdx = direction === 'up' ? idx - 1 : idx + 1;
                var tmp = children[idx];
                children[idx] = children[swapIdx];
                children[swapIdx] = tmp;
                break;
            }
        }
        DataSourceManager.savePrivateData(data);
        CategoryManager.render();
    },

    /**
     * HTML 转义
     */
    _escHtml: function (str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }
};

/* ----------------------------------------------------------
   管理面板 Tab 切换初始化
   ---------------------------------------------------------- */
$(document).ready(function () {
    // Tab 切换
    $('#admin-tabs').on('click', '.admin-tab a', function (e) {
        e.preventDefault();
        var $tab = $(this).closest('.admin-tab');
        var panelId = $tab.data('panel');

        // 更新 tab 激活状态
        $('.admin-tab').removeClass('active');
        $tab.addClass('active');

        // 显示对应面板
        $('.admin-panel').removeClass('active');
        $('#' + panelId).addClass('active');

        // 切换到分类管理时刷新
        if (panelId === 'panel-category') {
            CategoryManager.render();
        }
        // 切换到书签管理时刷新
        if (panelId === 'panel-bookmark') {
            BookmarkManager.render();
            BookmarkManager._bindEvents();
        }
        // 切换到导入/导出时初始化
        if (panelId === 'panel-import-export') {
            ImportExport.init();
        }
        // 切换到 OSS 配置时初始化
        if (panelId === 'panel-oss-config') {
            OSSConfig.init();
        }
        // 切换到同步状态时初始化
        if (panelId === 'panel-sync') {
            SyncManager.renderStatus();
            SyncManager.init();
        }
    });

    // 初始化默认激活面板（书签管理）
    BookmarkManager.render();
    BookmarkManager._bindEvents();

    // 支持 URL hash 直接跳转到指定面板（如 admin.html#sync）
    var hash = window.location.hash.replace('#', '');
    if (hash) {
        var $targetTab = $('.admin-tab[data-panel="panel-' + hash + '"]');
        if ($targetTab.length) {
            $targetTab.find('a').trigger('click');
        }
    }
});

/* ----------------------------------------------------------
   BookmarkManager 模块
   ---------------------------------------------------------- */
var BookmarkManager = {

    /**
     * 初始化：渲染书签列表
     */
    init: function () {
        BookmarkManager.render();
    },

    /**
     * 渲染书签列表（按分类分组）
     */
    render: function () {
        var source = DataSourceManager.getActive();
        var isDefault = (source === 'default');

        // 更新数据源名称显示
        $('#bm-source-name').text(isDefault ? '默认数据源' : '私有数据源');

        // 只读提示
        if (isDefault) {
            $('#bm-readonly-tip').show();
        } else {
            $('#bm-readonly-tip').hide();
        }

        var $list = $('#bookmark-list');
        $list.html('<div class="bm-loading">加载中...</div>');

        DataSourceManager.load(source).done(function (data) {
            if (!data || !data.categories || !data.categories.length) {
                $list.html('<div class="bm-empty">暂无书签数据。</div>');
                return;
            }

            var html = '';
            var cats = data.categories;
            for (var i = 0; i < cats.length; i++) {
                var cat = cats[i];
                if (cat.children && cat.children.length) {
                    // 一级+二级结构：遍历子分类
                    for (var j = 0; j < cat.children.length; j++) {
                        var sub = cat.children[j];
                        html += BookmarkManager._buildBlock(sub, sub.id, cat.id, isDefault);
                    }
                } else {
                    // 纯一级结构
                    html += BookmarkManager._buildBlock(cat, cat.id, '', isDefault);
                }
            }

            if (!html) {
                $list.html('<div class="bm-empty">暂无书签数据。</div>');
            } else {
                $list.html(html);
            }
        }).fail(function () {
            $list.html('<div class="bm-empty">数据加载失败。</div>');
        });
    },

    /**
     * 构建单个分类区块 HTML
     * @param {Object} cat       分类对象（含 sites）
     * @param {string} catId     分类 id
     * @param {string} parentId  父分类 id（纯一级时为空字符串）
     * @param {boolean} isDefault 是否只读
     */
    _buildBlock: function (cat, catId, parentId, isDefault) {
        var sites = cat.sites || [];
        var disabledAttr = isDefault ? ' disabled' : '';
        var disabledClass = isDefault ? ' bm-btn-disabled' : '';

        var blockId = 'bm-block-' + catId;
        var html = '<div class="bm-block" id="' + blockId + '">';

        // 区块标题行
        html += '<div class="bm-block-header" data-toggle-block="' + blockId + '">';
        html += '<span class="bm-block-title">';
        html += '<i class="fa fa-chevron-down bm-toggle-icon"></i> ';
        html += BookmarkManager._escHtml(cat.name);
        html += '</span>';
        html += '<span class="bm-block-right">';
        html += '<span class="bm-count">' + sites.length + ' 个书签</span>';
        html += '<button class="btn btn-xs btn-primary bm-add-btn' + disabledClass + '"' + disabledAttr;
        html += ' data-cat-id="' + catId + '" data-parent-id="' + parentId + '"' + disabledAttr + '>';
        html += '<i class="fa fa-plus"></i> 添加书签</button>';
        html += '</span>';
        html += '</div>';

        // 书签列表
        html += '<div class="bm-site-list">';
        if (sites.length === 0) {
            html += '<div class="bm-site-empty">暂无书签，点击右上角添加。</div>';
        } else {
            for (var i = 0; i < sites.length; i++) {
                html += BookmarkManager._buildSiteRow(sites[i], i, sites.length, catId, parentId, isDefault);
            }
        }
        html += '</div>';

        html += '</div>';
        return html;
    },

    /**
     * 构建单条书签行 HTML
     */
    _buildSiteRow: function (site, index, total, catId, parentId, isDefault) {
        var disabledAttr = isDefault ? ' disabled' : '';
        var disabledClass = isDefault ? ' bm-btn-disabled' : '';
        var logoSrc = site.logo || './assets/images/logos/default.png';
        var name = site.name || '';
        var url = site.url || '';

        var html = '<div class="bm-site-row">';

        // logo
        html += '<span class="bm-site-logo">';
        html += '<img src="' + BookmarkManager._escAttr(logoSrc) + '"';
        html += ' onerror="this.style.display=\'none\';this.nextSibling.style.display=\'inline-block\'"';
        html += ' alt="' + BookmarkManager._escAttr(name) + '" width="32" height="32">';
        html += '<i class="fa fa-globe bm-logo-fallback" style="display:none;font-size:24px;color:#c8d3e0;"></i>';
        html += '</span>';

        // 名称
        html += '<span class="bm-site-name">' + BookmarkManager._escHtml(name) + '</span>';

        // URL（截断）
        html += '<span class="bm-site-url" title="' + BookmarkManager._escAttr(url) + '">';
        html += BookmarkManager._escHtml(url.length > 40 ? url.substring(0, 40) + '...' : url);
        html += '</span>';

        // 操作按钮
        html += '<span class="bm-site-actions">';
        html += '<button class="bm-btn' + disabledClass + '" data-action="edit-site"';
        html += ' data-cat-id="' + catId + '" data-parent-id="' + parentId + '" data-index="' + index + '"';
        html += disabledAttr + ' title="编辑"><i class="fa fa-pencil"></i></button>';

        html += '<button class="bm-btn' + disabledClass + '" data-action="del-site"';
        html += ' data-cat-id="' + catId + '" data-parent-id="' + parentId + '" data-index="' + index + '"';
        html += disabledAttr + ' title="删除"><i class="fa fa-trash"></i></button>';

        html += '<button class="bm-btn' + disabledClass + '" data-action="move-site-up"';
        html += ' data-cat-id="' + catId + '" data-parent-id="' + parentId + '" data-index="' + index + '"';
        html += (index === 0 ? ' disabled' : disabledAttr) + ' title="上移"><i class="fa fa-arrow-up"></i></button>';

        html += '<button class="bm-btn' + disabledClass + '" data-action="move-site-down"';
        html += ' data-cat-id="' + catId + '" data-parent-id="' + parentId + '" data-index="' + index + '"';
        html += (index === total - 1 ? ' disabled' : disabledAttr) + ' title="下移"><i class="fa fa-arrow-down"></i></button>';

        html += '</span>';
        html += '</div>';
        return html;
    },

    /**
     * 绑定书签管理面板事件（在 panel-bookmark 激活时调用）
     */
    _bindEvents: function () {
        // 快速添加：获取信息按钮
        $('#quick-add-fetch-btn').off('click.qa').on('click.qa', function () {
            var url = $.trim($('#quick-add-url').val());
            if (!url) { alert('请输入网址'); return; }
            if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
            $('#quick-add-url').val(url);
            QuickAdd.fetchInfo(url);
        });

        // 快速添加：URL 输入框回车触发
        $('#quick-add-url').off('keydown.qa').on('keydown.qa', function (e) {
            if (e.keyCode === 13) $('#quick-add-fetch-btn').trigger('click');
        });

        // 快速添加：logo 输入框变化时更新预览
        $('#quick-add-logo').off('input.qa').on('input.qa', function () {
            var val = $.trim($(this).val());
            QuickAdd.updateLogoPreview(val || './assets/images/favicon.png');
        });

        // 快速添加：保存按钮
        $('#quick-add-save-btn').off('click.qa').on('click.qa', function () {
            QuickAdd.save();
        });

        // 切换数据源
        $('#bm-switch-source-btn').off('click.bm').on('click.bm', function () {
            var current = DataSourceManager.getActive();
            var target = (current === 'default') ? 'private' : 'default';
            BookmarkManager._switchSource(target);
        });

        // 区块折叠/展开（事件委托）
        $('#bookmark-list').off('click.bm-toggle').on('click.bm-toggle', '[data-toggle-block]', function (e) {
            // 如果点击的是按钮，不触发折叠
            if ($(e.target).closest('button').length) return;
            var blockId = $(this).data('toggle-block');
            var $list = $('#' + blockId).find('.bm-site-list');
            var $icon = $(this).find('.bm-toggle-icon');
            $list.slideToggle(150);
            $icon.toggleClass('fa-chevron-down fa-chevron-right');
        });

        // 添加书签按钮（事件委托）
        $('#bookmark-list').off('click.bm-add').on('click.bm-add', '.bm-add-btn', function (e) {
            e.stopPropagation();
            var catId = $(this).data('cat-id');
            var parentId = $(this).data('parent-id') || '';
            BookmarkManager._openModal('add', catId, -1, parentId, null);
        });

        // 书签操作按钮（事件委托）
        $('#bookmark-list').off('click.bm-action').on('click.bm-action', '[data-action]', function (e) {
            e.stopPropagation();
            var action = $(this).data('action');
            var catId = $(this).data('cat-id');
            var parentId = $(this).data('parent-id') || '';
            var index = parseInt($(this).data('index'), 10);

            if (action === 'edit-site') {
                BookmarkManager._getSite(catId, index, parentId).done(function (site) {
                    BookmarkManager._openModal('edit', catId, index, parentId, site);
                });
            } else if (action === 'del-site') {
                BookmarkManager.deleteSite(catId, index, parentId);
            } else if (action === 'move-site-up') {
                BookmarkManager.moveSite(catId, index, 'up', parentId);
            } else if (action === 'move-site-down') {
                BookmarkManager.moveSite(catId, index, 'down', parentId);
            }
        });

        // Modal 保存按钮
        $('#modal-bm-save').off('click.bm').on('click.bm', function () {
            var mode = $('#modal-bm-mode').val();
            var catId = $('#modal-bm-cat-id').val();
            var parentId = $('#modal-bm-parent-id').val();
            var index = parseInt($('#modal-bm-index').val(), 10);

            var name = $.trim($('#modal-bm-name').val());
            var url = $.trim($('#modal-bm-url').val());
            var logo = $.trim($('#modal-bm-logo').val());

            if (!name) { alert('请输入书签名称'); return; }
            if (!url) { alert('请输入书签 URL'); return; }

            var site = { name: name, url: url, logo: logo };

            if (mode === 'add') {
                BookmarkManager.addSite(catId, site, parentId);
            } else if (mode === 'edit') {
                BookmarkManager.editSite(catId, index, site, parentId);
            }

            $('#modal-bookmark').modal('hide');
        });

        // 所属分类下拉：填充叶子节点分类
        $('#modal-bookmark').off('show.bs.modal.bm').on('show.bs.modal.bm', function () {
            BookmarkManager._fillCategorySelect();
        });

        // URL 失焦时自动尝试获取 favicon（仅当 logo 字段为空时）
        $('#modal-bm-url').off('blur.bm').on('blur.bm', function () {
            var url = $.trim($(this).val());
            if (url && !$.trim($('#modal-bm-logo').val())) {
                BookmarkManager._fetchFavicon(url);
            }
        });

        // 手动点击刷新图标按钮
        $('#modal-bm-logo-fetch').off('click.bm').on('click.bm', function () {
            var url = $.trim($('#modal-bm-url').val());
            if (!url) { alert('请先填写 URL'); return; }
            BookmarkManager._fetchFavicon(url);
        });

        // logo 输入框变化时实时更新预览
        $('#modal-bm-logo').off('input.bm').on('input.bm', function () {
            var val = $.trim($(this).val());
            BookmarkManager._updateLogoPreview(val || './assets/images/logos/default.png');
        });

        // 从本地 logos 文件夹选择
        $('#modal-bm-logo-pick').off('click.bm').on('click.bm', function () {
            BookmarkManager._openLogoPicker();
        });
    },

    /**
     * 切换数据源
     */
    _switchSource: function (target) {
        if (target === 'private') {
            var privateData = DataSourceManager.getPrivateData();
            if (!privateData) {
                var confirmed = confirm('私有数据源为空，是否以默认数据源内容初始化私有数据源？');
                if (confirmed) {
                    $.getJSON('./assets/data/default.json').done(function (defaultData) {
                        var copy = JSON.parse(JSON.stringify(defaultData));
                        DataSourceManager.savePrivateData(copy);
                        localStorage.setItem(wsKey('active_source'), 'private');
                        BookmarkManager.render();
                    }).fail(function () {
                        alert('加载默认数据源失败，请重试。');
                    });
                }
                return;
            }
        }
        localStorage.setItem(wsKey('active_source'), target);
        BookmarkManager.render();
    },

    /**
     * 打开书签 Modal
     * @param {string} mode      'add' | 'edit'
     * @param {string} catId     分类 id
     * @param {number} index     书签索引（add 时为 -1）
     * @param {string} parentId  父分类 id（纯一级时为空字符串）
     * @param {Object|null} site 当前书签数据（edit 时预填充）
     */
    _openModal: function (mode, catId, index, parentId, site) {
        $('#modal-bm-mode').val(mode);
        $('#modal-bm-cat-id').val(catId);
        $('#modal-bm-parent-id').val(parentId || '');
        $('#modal-bm-index').val(index);

        if (mode === 'add') {
            $('#modal-bm-title').text('添加书签');
            $('#modal-bm-name').val('');
            $('#modal-bm-url').val('');
            $('#modal-bm-logo').val('');
            BookmarkManager._updateLogoPreview('./assets/images/logos/default.png');
            $('#modal-bm-logo-hint').text('填写 URL 后可自动获取网站图标');
        } else {
            $('#modal-bm-title').text('编辑书签');
            if (site) {
                $('#modal-bm-name').val(site.name || '');
                $('#modal-bm-url').val(site.url || '');
                $('#modal-bm-logo').val(site.logo || '');
                BookmarkManager._updateLogoPreview(site.logo || './assets/images/logos/default.png');
                $('#modal-bm-logo-hint').text('可点击刷新按钮重新获取图标');
            }
        }

        // 所属分类下拉由 show.bs.modal 事件触发 _fillCategorySelect 后自动设置选中值

        $('#modal-bookmark').modal('show');
    },

    /**
     * 填充所属分类下拉（只显示叶子节点）
     */
    _fillCategorySelect: function () {
        var source = DataSourceManager.getActive();
        var $select = $('#modal-bm-category');
        $select.empty();

        DataSourceManager.load(source).done(function (data) {
            if (!data || !data.categories) return;
            var cats = data.categories;
            for (var i = 0; i < cats.length; i++) {
                var cat = cats[i];
                if (cat.children && cat.children.length) {
                    for (var j = 0; j < cat.children.length; j++) {
                        var sub = cat.children[j];
                        $select.append(
                            '<option value="' + cat.id + '::' + sub.id + '">' +
                            BookmarkManager._escHtml(cat.name) + ' / ' + BookmarkManager._escHtml(sub.name) +
                            '</option>'
                        );
                    }
                } else {
                    $select.append(
                        '<option value="' + cat.id + '">' +
                        BookmarkManager._escHtml(cat.name) +
                        '</option>'
                    );
                }
            }

            // 填充完后恢复选中值
            var catId = $('#modal-bm-cat-id').val();
            var parentId = $('#modal-bm-parent-id').val();
            var selectVal = parentId ? (parentId + '::' + catId) : catId;
            $select.val(selectVal);
        });
    },

    /**
     * 从当前激活数据源获取指定书签
     */
    _getSite: function (catId, index, parentId) {
        var deferred = $.Deferred();
        var source = DataSourceManager.getActive();

        DataSourceManager.load(source).done(function (data) {
            var sites = BookmarkManager._getSites(data, catId, parentId);
            var site = (sites && index >= 0 && index < sites.length) ? sites[index] : null;
            deferred.resolve(site);
        }).fail(function () {
            deferred.resolve(null);
        });

        return deferred.promise();
    },

    /**
     * 获取指定分类的 sites 数组引用
     */
    _getSites: function (data, catId, parentId) {
        var cats = data.categories || [];
        if (!parentId) {
            for (var i = 0; i < cats.length; i++) {
                if (cats[i].id === catId) return cats[i].sites || [];
            }
        } else {
            for (var j = 0; j < cats.length; j++) {
                if (cats[j].id === parentId && cats[j].children) {
                    for (var k = 0; k < cats[j].children.length; k++) {
                        if (cats[j].children[k].id === catId) return cats[j].children[k].sites || [];
                    }
                }
            }
        }
        return [];
    },

    /**
     * 添加书签到指定分类
     * @param {string} categoryId  分类 id（叶子节点）
     * @param {Object} site        { name, url, logo }
     * @param {string} parentId    父分类 id（纯一级时为空字符串）
     */
    addSite: function (categoryId, site, parentId) {
        var data = DataSourceManager.getPrivateData();
        if (!data) return;

        var cats = data.categories;
        if (!parentId) {
            for (var i = 0; i < cats.length; i++) {
                if (cats[i].id === categoryId) {
                    if (!cats[i].sites) cats[i].sites = [];
                    cats[i].sites.push(site);
                    break;
                }
            }
        } else {
            for (var j = 0; j < cats.length; j++) {
                if (cats[j].id === parentId && cats[j].children) {
                    for (var k = 0; k < cats[j].children.length; k++) {
                        if (cats[j].children[k].id === categoryId) {
                            if (!cats[j].children[k].sites) cats[j].children[k].sites = [];
                            cats[j].children[k].sites.push(site);
                            break;
                        }
                    }
                }
            }
        }

        DataSourceManager.savePrivateData(data);
        BookmarkManager.render();
    },

    /**
     * 编辑书签
     * @param {string} categoryId  分类 id
     * @param {number} siteIndex   书签索引
     * @param {Object} site        新的书签数据 { name, url, logo }
     * @param {string} parentId    父分类 id
     */
    editSite: function (categoryId, siteIndex, site, parentId) {
        var data = DataSourceManager.getPrivateData();
        if (!data) return;

        var cats = data.categories;
        if (!parentId) {
            for (var i = 0; i < cats.length; i++) {
                if (cats[i].id === categoryId && cats[i].sites) {
                    if (siteIndex >= 0 && siteIndex < cats[i].sites.length) {
                        cats[i].sites[siteIndex] = site;
                    }
                    break;
                }
            }
        } else {
            for (var j = 0; j < cats.length; j++) {
                if (cats[j].id === parentId && cats[j].children) {
                    for (var k = 0; k < cats[j].children.length; k++) {
                        if (cats[j].children[k].id === categoryId && cats[j].children[k].sites) {
                            if (siteIndex >= 0 && siteIndex < cats[j].children[k].sites.length) {
                                cats[j].children[k].sites[siteIndex] = site;
                            }
                            break;
                        }
                    }
                }
            }
        }

        DataSourceManager.savePrivateData(data);
        BookmarkManager.render();
    },

    /**
     * 删除书签（带确认）
     * @param {string} categoryId  分类 id
     * @param {number} siteIndex   书签索引
     * @param {string} parentId    父分类 id
     */
    deleteSite: function (categoryId, siteIndex, parentId) {
        if (!confirm('确定删除该书签？')) return;

        var data = DataSourceManager.getPrivateData();
        if (!data) return;

        var cats = data.categories;
        if (!parentId) {
            for (var i = 0; i < cats.length; i++) {
                if (cats[i].id === categoryId && cats[i].sites) {
                    cats[i].sites.splice(siteIndex, 1);
                    break;
                }
            }
        } else {
            for (var j = 0; j < cats.length; j++) {
                if (cats[j].id === parentId && cats[j].children) {
                    for (var k = 0; k < cats[j].children.length; k++) {
                        if (cats[j].children[k].id === categoryId && cats[j].children[k].sites) {
                            cats[j].children[k].sites.splice(siteIndex, 1);
                            break;
                        }
                    }
                }
            }
        }

        DataSourceManager.savePrivateData(data);
        BookmarkManager.render();
    },

    /**
     * 上移/下移书签
     * @param {string} categoryId  分类 id
     * @param {number} siteIndex   书签索引
     * @param {string} direction   'up' | 'down'
     * @param {string} parentId    父分类 id
     */
    moveSite: function (categoryId, siteIndex, direction, parentId) {
        var data = DataSourceManager.getPrivateData();
        if (!data) return;

        var cats = data.categories;
        var sites = null;

        if (!parentId) {
            for (var i = 0; i < cats.length; i++) {
                if (cats[i].id === categoryId) {
                    sites = cats[i].sites;
                    break;
                }
            }
        } else {
            for (var j = 0; j < cats.length; j++) {
                if (cats[j].id === parentId && cats[j].children) {
                    for (var k = 0; k < cats[j].children.length; k++) {
                        if (cats[j].children[k].id === categoryId) {
                            sites = cats[j].children[k].sites;
                            break;
                        }
                    }
                }
            }
        }

        if (!sites || sites.length < 2) return;
        if (direction === 'up' && siteIndex === 0) return;
        if (direction === 'down' && siteIndex === sites.length - 1) return;

        var swapIdx = direction === 'up' ? siteIndex - 1 : siteIndex + 1;
        var tmp = sites[siteIndex];
        sites[siteIndex] = sites[swapIdx];
        sites[swapIdx] = tmp;

        DataSourceManager.savePrivateData(data);
        BookmarkManager.render();
    },

    /**
     * HTML 转义
     */
    _escHtml: function (str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    },

    /**
     * 属性值转义
     */
    _escAttr: function (str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    },

    /**
     * 打开本地 logos 选择器
     */
    _openLogoPicker: function () {
        var $grid = $('#logo-picker-grid');
        var $search = $('#logo-picker-search');
        $search.val('');

        // 加载 logos-list.json（缓存到 BookmarkManager._logosList）
        function renderGrid(files) {
            $grid.empty();
            var kw = $search.val().toLowerCase();
            var filtered = kw ? files.filter(function(f){ return f.toLowerCase().indexOf(kw) !== -1; }) : files;
            for (var i = 0; i < filtered.length; i++) {
                var fname = filtered[i];
                var path = './assets/images/logos/' + fname;
                var label = fname.replace(/\.png$/i, '');
                $grid.append(
                    '<div class="logo-pick-item" data-path="' + path + '" title="' + label + '">' +
                    '<img src="' + path + '" width="40" height="40" style="border-radius:6px;object-fit:cover;">' +
                    '<span>' + label + '</span>' +
                    '</div>'
                );
            }
        }

        function openModal(files) {
            BookmarkManager._logosList = files;
            renderGrid(files);

            // 搜索过滤
            $search.off('input.picker').on('input.picker', function () {
                renderGrid(files);
            });

            // 点击选择
            $grid.off('click.picker').on('click.picker', '.logo-pick-item', function () {
                var path = $(this).data('path');
                $('#modal-bm-logo').val(path);
                BookmarkManager._updateLogoPreview(path);
                $('#modal-bm-logo-hint').text('已选择本地图标 ✓');
                $('#modal-logo-picker').modal('hide');
            });

            $('#modal-logo-picker').modal('show');
        }

        if (BookmarkManager._logosList) {
            openModal(BookmarkManager._logosList);
        } else {
            $.getJSON('./assets/data/logos-list.json')
                .done(function (files) { openModal(files); })
                .fail(function () { alert('加载 logos 列表失败，请确认 assets/data/logos-list.json 存在。'); });
        }
    },

    /**
     * 尝试从 URL 自动获取 favicon，填入 logo 字段
     * 优先用 Google Favicon API，失败则用 DuckDuckGo，再失败则保持默认
     * @param {string} url
     */
    _fetchFavicon: function (url) {
        var DEFAULT_LOGO = './assets/images/favicon.png';
        var $hint = $('#modal-bm-logo-hint');

        var domain = '';
        try {
            var a = document.createElement('a');
            a.href = url;
            domain = a.hostname;
        } catch (e) { return; }
        if (!domain) return;

        $hint.text('正在获取图标...');
        BookmarkManager._updateLogoPreview(DEFAULT_LOGO);

        var candidates = [
            'https://www.google.com/s2/favicons?sz=64&domain=' + domain,
            'https://icons.duckduckgo.com/ip3/' + domain + '.ico',
            'https://' + domain + '/favicon.ico'
        ];
        var tried = 0;

        function tryNext() {
            if (tried >= candidates.length) {
                $hint.text('未能获取到图标，将使用默认图标');
                BookmarkManager._updateLogoPreview(DEFAULT_LOGO);
                return;
            }
            var src = candidates[tried++];
            var img = new Image();
            img.onload = function () {
                if (img.width > 1 && img.height > 1) {
                    $('#modal-bm-logo').val(src);
                    BookmarkManager._updateLogoPreview(src);
                    $hint.text('已自动获取图标 ✓');
                } else {
                    tryNext();
                }
            };
            img.onerror = function () { tryNext(); };
            img.src = src;
        }
        tryNext();
    },

    /**
     * 更新 logo 预览图
     * @param {string} src
     */
    _updateLogoPreview: function (src) {
        var DEFAULT_LOGO = './assets/images/favicon.png';
        var $preview = $('#modal-bm-logo-preview');
        var img = new Image();
        img.onload = function () { $preview.attr('src', src); };
        img.onerror = function () { $preview.attr('src', DEFAULT_LOGO); };
        img.src = src;
    }
};

/* ----------------------------------------------------------
   QuickAdd 模块 — 快速添加书签
   ---------------------------------------------------------- */
var QuickAdd = {

    /**
     * 获取 URL 的页面信息（标题 + favicon）
     * 由于跨域限制，标题通过 allorigins 代理获取，favicon 用 Google API
     */
    fetchInfo: function (url) {
        var $preview = $('#quick-add-preview');
        var $btn = $('#quick-add-fetch-btn');
        var $result = $('#quick-add-result');

        $btn.prop('disabled', true).html('<i class="fa fa-spinner fa-spin"></i> 获取中...');
        $preview.hide();
        $result.hide();

        // 提取域名用于 favicon
        var domain = '';
        try { domain = (new URL(url)).hostname; } catch(e) { domain = url.replace(/^https?:\/\//, '').split('/')[0]; }

        var faviconUrl = 'https://www.google.com/s2/favicons?sz=64&domain=' + domain;

        // 用 allorigins 代理获取页面 HTML，提取 <title>
        var proxyUrl = 'https://api.allorigins.win/get?url=' + encodeURIComponent(url);

        $.getJSON(proxyUrl).done(function (data) {
            var title = '';
            if (data && data.contents) {
                var match = data.contents.match(/<title[^>]*>([^<]+)<\/title>/i);
                if (match) title = match[1].trim();
            }
            if (!title) title = domain;

            $('#quick-add-name').val(title);
            $('#quick-add-logo').val(faviconUrl);
            QuickAdd.updateLogoPreview(faviconUrl);
            QuickAdd._fillCategorySelect();
            $preview.show();
        }).fail(function () {
            // 代理失败时仍显示预览，只是标题为空
            $('#quick-add-name').val(domain);
            $('#quick-add-logo').val(faviconUrl);
            QuickAdd.updateLogoPreview(faviconUrl);
            QuickAdd._fillCategorySelect();
            $preview.show();
        }).always(function () {
            $btn.prop('disabled', false).html('<i class="fa fa-search"></i> 获取信息');
        });
    },

    /**
     * 更新 logo 预览
     */
    updateLogoPreview: function (src) {
        var $img = $('#quick-add-logo-preview');
        var fallback = './assets/images/favicon.png';
        var img = new Image();
        img.onload = function () { $img.attr('src', src); };
        img.onerror = function () { $img.attr('src', fallback); };
        img.src = src;
    },

    /**
     * 填充分类下拉（只显示叶子节点）
     */
    _fillCategorySelect: function () {
        var $select = $('#quick-add-category');
        $select.empty();
        var source = DataSourceManager.getActive();
        DataSourceManager.load(source).done(function (data) {
            if (!data || !data.categories) return;
            data.categories.forEach(function (cat) {
                if (cat.children && cat.children.length) {
                    cat.children.forEach(function (sub) {
                        $select.append('<option value="' + cat.id + '::' + sub.id + '">' +
                            cat.name + ' / ' + sub.name + '</option>');
                    });
                } else {
                    $select.append('<option value="' + cat.id + '">' + cat.name + '</option>');
                }
            });
        });
    },

    /**
     * 保存书签
     */
    save: function () {
        var name = $.trim($('#quick-add-name').val());
        var url  = $.trim($('#quick-add-url').val());
        var logo = $.trim($('#quick-add-logo').val());
        var catVal = $('#quick-add-category').val();
        var $result = $('#quick-add-result');

        if (!name) { alert('请输入书签名称'); return; }
        if (!url)  { alert('请输入网址'); return; }
        if (!catVal) { alert('请选择分类'); return; }

        var catId, parentId;
        if (catVal.indexOf('::') !== -1) {
            var parts = catVal.split('::');
            parentId = parts[0];
            catId    = parts[1];
        } else {
            catId    = catVal;
            parentId = '';
        }

        BookmarkManager.addSite(catId, { name: name, url: url, logo: logo }, parentId);

        // 重置表单
        $('#quick-add-url').val('');
        $('#quick-add-preview').hide();
        $result.removeClass('ie-result-ok ie-result-err')
               .addClass('ie-result-ok')
               .text('✓ 已保存：' + name)
               .show();
        setTimeout(function () { $result.fadeOut(); }, 2500);
    }
};

/* ----------------------------------------------------------
   Sorter 模块（薄封装）
   ---------------------------------------------------------- */
var Sorter = {
    moveCategory: function (categoryId, direction) {
        CategoryManager._moveCategory(categoryId, direction);
    },
    moveSubCategory: function (parentId, subId, direction) {
        CategoryManager._moveSubCategory(parentId, subId, direction);
    },
    moveSite: function (categoryId, siteIndex, direction, parentId) {
        BookmarkManager.moveSite(categoryId, siteIndex, direction, parentId);
    }
};

/* ----------------------------------------------------------
   ImportExport 模块
   ---------------------------------------------------------- */
var ImportExport = {

    _initialized: false,

    /**
     * 初始化：更新数据源状态，绑定所有事件（幂等）
     */
    init: function () {
        ImportExport._updateSourceBar();

        if (ImportExport._initialized) return;
        ImportExport._initialized = true;

        // 导出按钮
        $('#ie-export-btn').on('click', function () {
            ImportExport.exportJSON();
        });

        // 文件选择按钮 → 触发 file input
        $('#ie-import-file-btn').on('click', function () {
            $('#ie-import-file').val('').trigger('click');
        });

        // file input 变化 → 导入
        $('#ie-import-file').on('change', function () {
            var file = this.files && this.files[0];
            if (file) {
                ImportExport.importFromFile(file);
            }
        });

        // 显示 JSON 按钮
        $('#ie-show-json-btn').on('click', function () {
            ImportExport.showJSON();
        });

        // 一键复制按钮
        $('#ie-copy-btn').on('click', function () {
            ImportExport.copyJSON();
        });

        // 解析并导入（粘贴）
        $('#ie-paste-import-btn').on('click', function () {
            ImportExport.importFromPaste();
        });
    },

    /**
     * 更新数据源状态栏（任务13）
     */
    _updateSourceBar: function () {
        var source = DataSourceManager.getActive();
        var isDefault = (source === 'default');
        $('#ie-source-name').text(isDefault ? '默认数据源' : '私有数据源');
        if (isDefault) {
            $('#ie-source-hint').show();
        } else {
            $('#ie-source-hint').hide();
        }
    },

    /**
     * 导出当前激活数据源为 JSON 文件
     */
    exportJSON: function () {
        var source = DataSourceManager.getActive();
        DataSourceManager.load(source).done(function (data) {
            var json = JSON.stringify(data, null, 2);
            var now = new Date();
            var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
            var dateStr = '' + now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate()) +
                          '_' + pad(now.getHours()) + pad(now.getMinutes()) + pad(now.getSeconds());
            var filename = 'webstack-data-' + dateStr + '.json';

            var blob = new Blob([json], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }).fail(function () {
            alert('数据加载失败，无法导出。');
        });
    },

    /**
     * 从文件导入 JSON
     * @param {File} file
     */
    importFromFile: function (file) {
        var $result = $('#ie-import-result');
        $result.hide().removeClass('ie-result-ok ie-result-err');

        var reader = new FileReader();
        reader.onload = function (e) {
            var text = e.target.result;
            ImportExport._parseAndSave(text, $result);
        };
        reader.onerror = function () {
            ImportExport._showResult($result, false, '文件读取失败，请重试。');
        };
        reader.readAsText(file);
    },

    /**
     * 显示当前激活数据源的 JSON 到只读 textarea
     */
    showJSON: function () {
        var source = DataSourceManager.getActive();
        DataSourceManager.load(source).done(function (data) {
            var json = JSON.stringify(data, null, 2);
            $('#ie-json-display').val(json).show();
            $('#ie-copy-btn').show();
        }).fail(function () {
            alert('数据加载失败。');
        });
    },

    /**
     * 复制 JSON 文本到剪贴板
     */
    copyJSON: function () {
        var text = $('#ie-json-display').val();
        if (!text) return;

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function () {
                alert('已复制到剪贴板 ✓');
            }).catch(function () {
                ImportExport._copyFallback(text);
            });
        } else {
            ImportExport._copyFallback(text);
        }
    },

    /**
     * 降级复制方案
     */
    _copyFallback: function (text) {
        var $ta = $('#ie-json-display');
        $ta.select();
        try {
            document.execCommand('copy');
            alert('已复制到剪贴板 ✓');
        } catch (e) {
            alert('复制失败，请手动选中文本复制。');
        }
    },

    /**
     * 解析粘贴的 JSON 并导入
     */
    importFromPaste: function () {
        var $result = $('#ie-paste-result');
        $result.hide().removeClass('ie-result-ok ie-result-err');

        var text = $.trim($('#ie-json-paste').val());
        if (!text) {
            ImportExport._showResult($result, false, '请先粘贴 JSON 数据。');
            return;
        }
        ImportExport._parseAndSave(text, $result);
    },

    /**
     * 解析 JSON 文本并保存（公共逻辑）
     * @param {string} text
     * @param {jQuery} $result  结果提示区域
     */
    _parseAndSave: function (text, $result) {
        var data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            ImportExport._showResult($result, false, 'JSON 格式错误：' + e.message);
            return;
        }

        if (!data.categories || !Array.isArray(data.categories)) {
            ImportExport._showResult($result, false, '数据格式错误：缺少 categories 字段');
            return;
        }

        DataSourceManager.savePrivateData(data);
        localStorage.setItem(wsKey('active_source'), 'private');
        ImportExport._updateSourceBar();
        ImportExport._showResult($result, true, '导入成功！已切换至私有数据源，共 ' + data.categories.length + ' 个分类。');
    },

    /**
     * 显示结果提示
     * @param {jQuery} $el
     * @param {boolean} ok
     * @param {string} msg
     */
    _showResult: function ($el, ok, msg) {
        $el.removeClass('ie-result-ok ie-result-err')
           .addClass(ok ? 'ie-result-ok' : 'ie-result-err')
           .text(msg)
           .show();
    }
};

/* ----------------------------------------------------------
   OSSConfig 模块
   XOR 混淆 key: 'ws2024'
   ---------------------------------------------------------- */
var OSSConfig = {

    _XOR_KEY: 'ws2024',
    _initialized: false,

    /**
     * XOR 混淆：将字符串与 key 逐字符 XOR，返回 base64
     * @param {string} str
     * @returns {string} base64
     */
    _xorEncode: function (str) {
        var key = OSSConfig._XOR_KEY;
        var result = '';
        for (var i = 0; i < str.length; i++) {
            result += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return btoa(unescape(encodeURIComponent(result)));
    },

    /**
     * XOR 反混淆：base64 解码后逐字符 XOR 还原
     * @param {string} encoded  base64 字符串
     * @returns {string}
     */
    _xorDecode: function (encoded) {
        var key = OSSConfig._XOR_KEY;
        var str = decodeURIComponent(escape(atob(encoded)));
        var result = '';
        for (var i = 0; i < str.length; i++) {
            result += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return result;
    },

    /**
     * 初始化：读取已保存配置填充表单，绑定事件（幂等）
     */
    init: function () {
        var cfg = OSSConfig.load();
        if (cfg) {
            $('#oss-ak').val(cfg.accessKeyId || '');
            $('#oss-sk').val(cfg.accessKeySecret || '');
            $('#oss-bucket').val(cfg.bucket || '');
            $('#oss-region').val(cfg.region || '');
            $('#oss-prefix').val(cfg.prefix || '');
        }

        if (OSSConfig._initialized) return;
        OSSConfig._initialized = true;

        $('#oss-save-btn').on('click', function () {
            OSSConfig.save();
        });

        $('#oss-test-btn').on('click', function () {
            OSSConfig.testConnection();
        });

        $('#oss-export-btn').on('click', function () {
            OSSConfig.exportConfig();
        });

        $('#oss-import-file').on('change', function () {
            var file = this.files && this.files[0];
            if (file) {
                OSSConfig.importConfig(file);
                $(this).val('');
            }
        });
    },

    /**
     * 读取表单值，XOR 混淆后存入 localStorage['ws_oss_config']
     */
    save: function () {
        var cfg = {
            accessKeyId: $.trim($('#oss-ak').val()),
            accessKeySecret: $.trim($('#oss-sk').val()),
            bucket: $.trim($('#oss-bucket').val()),
            region: $.trim($('#oss-region').val()),
            prefix: $.trim($('#oss-prefix').val())
        };
        var encoded = OSSConfig._xorEncode(JSON.stringify(cfg));
        localStorage.setItem(wsKey('oss_config'), encoded);
        OSSConfig._showResult(true, '配置已保存 ✓');
    },

    /**
     * 读取并反混淆，返回配置对象（或 null）
     * @returns {Object|null}
     */
    load: function () {
        var encoded = localStorage.getItem(wsKey('oss_config'));
        if (!encoded) return null;
        try {
            var json = OSSConfig._xorDecode(encoded);
            return JSON.parse(json);
        } catch (e) {
            return null;
        }
    },

    /**
     * 检查 AK/SK/Bucket/Region/prefix 是否都有值
     * @returns {boolean}
     */
    isComplete: function () {
        var cfg = OSSConfig.load();
        if (!cfg) return false;
        return !!(cfg.accessKeyId && cfg.accessKeySecret && cfg.bucket && cfg.region && cfg.prefix);
    },

    /**
     * 用当前配置创建 OSS 客户端实例
     * @returns {OSS|null}
     */
    createClient: function () {
        var cfg = OSSConfig.load();
        if (!cfg) return null;
        try {
            return new OSS({
                region: cfg.region,
                accessKeyId: cfg.accessKeyId,
                accessKeySecret: cfg.accessKeySecret,
                bucket: cfg.bucket
            });
        } catch (e) {
            return null;
        }
    },

    /**
     * 测试连接：尝试读取 {prefix}version.json
     */
    testConnection: function () {
        if (!OSSConfig.isComplete()) {
            OSSConfig._showResult(false, '请先填写并保存完整的 OSS 配置');
            return;
        }
        var cfg = OSSConfig.load();
        var client = OSSConfig.createClient();
        if (!client) {
            OSSConfig._showResult(false, '创建 OSS 客户端失败，请检查配置');
            return;
        }
        var $btn = $('#oss-test-btn');
        $btn.prop('disabled', true).html('<i class="fa fa-spinner fa-spin"></i> 测试中...');

        client.get(cfg.prefix + 'version.json').then(function (result) {
            $btn.prop('disabled', false).html('<i class="fa fa-plug"></i> 测试连接');
            OSSConfig._showResult(true, '连接成功 ✓ OSS 配置有效，version.json 可读取');
        }).catch(function (err) {
            $btn.prop('disabled', false).html('<i class="fa fa-plug"></i> 测试连接');
            var msg = err && err.message ? err.message : String(err);
            // version.json 不存在（首次使用）也算连接成功
            if (msg.indexOf('NoSuchKey') !== -1 || msg.indexOf('404') !== -1) {
                OSSConfig._showResult(true, '连接成功 ✓ Bucket 可访问（version.json 尚未创建，请先上传数据）');
            } else {
                OSSConfig._showResult(false, '连接失败：' + msg);
            }
        });
    },

    /**
     * 导出明文配置为 JSON 文件
     */
    exportConfig: function () {
        var cfg = OSSConfig.load();
        if (!cfg) {
            OSSConfig._showResult(false, '暂无已保存的配置，请先保存配置');
            return;
        }
        var json = JSON.stringify(cfg, null, 2);
        var blob = new Blob([json], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'webstack-oss-config.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    /**
     * 从文件读取配置填充表单
     * @param {File} file
     */
    importConfig: function (file) {
        var reader = new FileReader();
        reader.onload = function (e) {
            try {
                var cfg = JSON.parse(e.target.result);
                $('#oss-ak').val(cfg.accessKeyId || '');
                $('#oss-sk').val(cfg.accessKeySecret || '');
                $('#oss-bucket').val(cfg.bucket || '');
                $('#oss-region').val(cfg.region || '');
                $('#oss-prefix').val(cfg.prefix || '');
                OSSConfig._showResult(true, '配置已导入，请点击"保存配置"使其生效');
            } catch (e2) {
                OSSConfig._showResult(false, '文件解析失败：' + e2.message);
            }
        };
        reader.onerror = function () {
            OSSConfig._showResult(false, '文件读取失败，请重试');
        };
        reader.readAsText(file);
    },

    /**
     * 显示操作结果
     */
    _showResult: function (ok, msg) {
        var $el = $('#oss-result');
        $el.removeClass('ie-result-ok ie-result-err')
           .addClass(ok ? 'ie-result-ok' : 'ie-result-err')
           .text(msg)
           .show();
    }
};

/* ----------------------------------------------------------
   SyncManager 模块（手动同步部分，admin.js）
   ---------------------------------------------------------- */
var SyncManager = {

    _initialized: false,

    /**
     * 初始化同步面板事件（幂等）
     */
    init: function () {
        // 检查 OSS 配置完整性，控制按钮状态
        SyncManager._checkOSSReady();

        if (SyncManager._initialized) return;
        SyncManager._initialized = true;

        // 上传按钮
        $('#sync-upload-btn').on('click', function () {
            SyncManager.upload(
                function () {
                    SyncManager._showResult(true, '上传成功 ✓');
                    SyncManager.renderStatus();
                },
                function (err) {
                    SyncManager._showResult(false, '上传失败：' + err);
                }
            );
        });

        // 下载按钮
        $('#sync-download-btn').on('click', function () {
            SyncManager.download(
                function () {
                    SyncManager._showResult(true, '下载成功 ✓ 本地数据已更新');
                    SyncManager.renderStatus();
                },
                function (err) {
                    SyncManager._showResult(false, '下载失败：' + err);
                }
            );
        });

        // 跳转到 OSS 配置面板
        $('#sync-goto-oss-config').on('click', function (e) {
            e.preventDefault();
            var $tab = $('.admin-tab[data-panel="panel-oss-config"]');
            $tab.trigger('click').find('a').trigger('click');
        });

        // 定时同步开关
        $('#sync-interval-enable').on('change', function () {
            if ($(this).is(':checked')) {
                $('#sync-interval-wrap').show();
            } else {
                $('#sync-interval-wrap').hide();
            }
        });

        // 保存自动同步配置
        $('#sync-config-save-btn').on('click', function () {
            SyncManager.saveSyncConfig();
        });

        // 读取已保存的自动同步配置填充表单
        var syncCfg = SyncManager.loadSyncConfig();
        if (syncCfg) {
            $('#sync-on-load').prop('checked', !!syncCfg.onLoad);
            if (syncCfg.interval > 0) {
                $('#sync-interval-enable').prop('checked', true);
                $('#sync-interval-wrap').show();
                $('#sync-interval-select').val(String(syncCfg.interval));
            }
        }
    },

    /**
     * 检查 OSS 配置完整性，控制按钮和提示
     */
    _checkOSSReady: function () {
        if (OSSConfig.isComplete()) {
            $('#sync-oss-incomplete-tip').hide();
            $('#sync-upload-btn').prop('disabled', false);
            $('#sync-download-btn').prop('disabled', false);
        } else {
            $('#sync-oss-incomplete-tip').show();
            $('#sync-upload-btn').prop('disabled', true);
            $('#sync-download-btn').prop('disabled', true);
        }
    },

    /**
     * 渲染同步状态区域
     */
    renderStatus: function () {
        var lastUpload = localStorage.getItem(wsKey('last_upload_at')) || '—';
        var lastUploadVer = localStorage.getItem(wsKey('last_upload_version')) || '—';
        var lastDownload = localStorage.getItem(wsKey('last_download_at')) || '—';
        var lastDownloadVer = localStorage.getItem(wsKey('last_download_version')) || '—';
        var localVer = localStorage.getItem(wsKey('private_version')) || '—';

        // 格式化时间
        function fmtTime(val) {
            if (!val || val === '—') return '—';
            try {
                var d = new Date(val);
                return d.toLocaleString('zh-CN');
            } catch (e) { return val; }
        }

        $('#sync-last-upload').text(fmtTime(lastUpload));
        $('#sync-last-upload-ver').text(lastUploadVer);
        $('#sync-last-download').text(fmtTime(lastDownload));
        $('#sync-last-download-ver').text(lastDownloadVer);
        $('#sync-local-ver').text(localVer);
        $('#sync-app-ver').text(localStorage.getItem('ws_app_version') || (typeof APP_VERSION !== 'undefined' ? APP_VERSION : '—'));
    },

    /**
     * 上传流程
     * @param {Function} onSuccess
     * @param {Function} onError
     */
    upload: function (onSuccess, onError) {
        if (!OSSConfig.isComplete()) {
            if (onError) onError('OSS 配置不完整');
            return;
        }

        var localData = DataSourceManager.getPrivateData();
        if (!localData) {
            if (onError) onError('私有数据源为空，请先创建私有数据');
            return;
        }

        var client = OSSConfig.createClient();
        if (!client) {
            if (onError) onError('创建 OSS 客户端失败');
            return;
        }

        var cfg = OSSConfig.load();
        var version = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
        var versionObj = { version: version, updatedAt: new Date().toISOString(), appVersion: APP_VERSION };

        // 禁用按钮，显示 loading
        $('#sync-upload-btn').prop('disabled', true).html('<i class="fa fa-spinner fa-spin"></i> 上传中...');
        $('#sync-download-btn').prop('disabled', true);
        $('#sync-result').hide();

        var dataBlob = new Blob([JSON.stringify(localData)], { type: 'application/json' });
        var versionBlob = new Blob([JSON.stringify(versionObj)], { type: 'application/json' });

        // 先上传数据文件
        client.put(cfg.prefix + 'data-' + version + '.json', dataBlob).then(function () {
            // 再上传版本文件
            return client.put(cfg.prefix + 'version.json', versionBlob);
        }).then(function () {
            var now = new Date().toISOString();
            localStorage.setItem(wsKey('private_version'), version);
            localStorage.setItem(wsKey('last_upload_at'), now);
            localStorage.setItem(wsKey('last_upload_version'), version);

            SyncManager._restoreButtons();
            if (onSuccess) onSuccess();
        }).catch(function (err) {
            SyncManager._restoreButtons();
            var msg = err && err.message ? err.message : String(err);
            if (onError) onError(msg);
        });
    },

    /**
     * 下载流程
     * @param {Function} onSuccess
     * @param {Function} onError
     */
    download: function (onSuccess, onError) {
        if (!OSSConfig.isComplete()) {
            if (onError) onError('OSS 配置不完整');
            return;
        }

        var client = OSSConfig.createClient();
        if (!client) {
            if (onError) onError('创建 OSS 客户端失败');
            return;
        }

        var cfg = OSSConfig.load();

        // 禁用按钮，显示 loading
        $('#sync-upload-btn').prop('disabled', true);
        $('#sync-download-btn').prop('disabled', true).html('<i class="fa fa-spinner fa-spin"></i> 下载中...');
        $('#sync-result').hide();

        var remoteVersion = '';

        // 先读取 version.json
        client.get(cfg.prefix + 'version.json').then(function (result) {
            var text = new TextDecoder().decode(result.content);
            var versionObj = JSON.parse(text);
            remoteVersion = versionObj.version;
            if (!remoteVersion) {
                throw new Error('version.json 格式错误：缺少 version 字段');
            }
            // 再下载数据文件
            return client.get(cfg.prefix + 'data-' + remoteVersion + '.json');
        }).then(function (result) {
            var text = new TextDecoder().decode(result.content);
            var data = JSON.parse(text);
            if (!data.categories) {
                throw new Error('数据文件格式错误：缺少 categories 字段');
            }

            var now = new Date().toISOString();
            DataSourceManager.savePrivateData(data);
            localStorage.setItem(wsKey('private_version'), remoteVersion);
            localStorage.setItem(wsKey('last_download_at'), now);
            localStorage.setItem(wsKey('last_download_version'), remoteVersion);

            SyncManager._restoreButtons();
            if (onSuccess) onSuccess();
        }).catch(function (err) {
            SyncManager._restoreButtons();
            var msg = err && err.message ? err.message : String(err);
            if (msg.indexOf('NoSuchKey') !== -1 || msg.indexOf('404') !== -1) {
                msg = 'OSS 上暂无数据，请先上传数据';
            }
            if (onError) onError(msg);
        });
    },

    /**
     * 恢复按钮状态
     */
    _restoreButtons: function () {
        $('#sync-upload-btn').prop('disabled', false).html('<i class="fa fa-cloud-upload"></i> 上传至 OSS');
        $('#sync-download-btn').prop('disabled', false).html('<i class="fa fa-cloud-download"></i> 从 OSS 下载');
    },

    /**
     * 保存自动同步配置到 localStorage
     */
    saveSyncConfig: function () {
        var onLoad = $('#sync-on-load').is(':checked');
        var intervalEnabled = $('#sync-interval-enable').is(':checked');
        var interval = intervalEnabled ? parseInt($('#sync-interval-select').val(), 10) : 0;

        var cfg = { onLoad: onLoad, interval: interval };
        localStorage.setItem(wsKey('sync_config'), JSON.stringify(cfg));

        var $result = $('#sync-config-result');
        $result.removeClass('ie-result-ok ie-result-err')
               .addClass('ie-result-ok')
               .text('自动同步配置已保存 ✓')
               .show();
    },

    /**
     * 读取自动同步配置
     * @returns {Object|null}
     */
    loadSyncConfig: function () {
        var raw = localStorage.getItem(wsKey('sync_config'));
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch (e) {
            return null;
        }
    },

    /**
     * 显示同步操作结果
     */
    _showResult: function (ok, msg) {
        var $el = $('#sync-result');
        $el.removeClass('ie-result-ok ie-result-err')
           .addClass(ok ? 'ie-result-ok' : 'ie-result-err')
           .text(msg)
           .show();
    }
};
