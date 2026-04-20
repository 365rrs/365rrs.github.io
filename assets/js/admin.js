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
        $('#cat-add-btn').off('click.cat').on('click.cat', function () {
            CategoryManager._openModal('add-top', '', '');
        });

        // 切换数据源按钮
        $('#cat-switch-source-btn').off('click.cat').on('click.cat', function () {
            var current = DataSourceManager.getActive();
            var target = (current === 'default') ? 'private' : 'default';
            CategoryManager._switchSource(target);
        });

        // 分类树操作按钮（事件委托）
        $('#category-tree').off('click.cat').on('click.cat', '[data-action]', function () {
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
        $('#modal-cat-save').off('click.cat').on('click.cat', function () {
            var mode = $('#modal-cat-mode').val();
            var name = $.trim($('#modal-cat-name').val());
            var id = $('#modal-cat-id').val();
            var oldParentId = $('#modal-cat-parent-id').val();

            if (!name) {
                alert('请输入分类名称');
                return;
            }

            if (mode === 'add-top') {
                var icon = $('input[name="cat-icon"]:checked').val() || 'linecons-star';
                CategoryManager.addCategory(name, icon);
            } else if (mode === 'add-sub') {
                CategoryManager.addSubCategory(oldParentId, name);
            } else if (mode === 'rename') {
                // 编辑一级分类：同时更新名称和图标
                var icon = $('input[name="cat-icon"]:checked').val() || 'linecons-star';
                CategoryManager.renameCategory(id, name, '', icon);
            } else if (mode === 'rename-sub') {
                // 编辑子分类：检查父分类是否变更
                var newParentId = $('#modal-cat-parent-select').val();
                
                if (newParentId === oldParentId) {
                    // 父分类未变更，只重命名
                    CategoryManager.renameCategory(id, name, oldParentId);
                } else {
                    // 父分类已变更，需要移动子分类
                    CategoryManager.moveSubCategoryToParent(id, oldParentId, newParentId, name);
                }
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
            $('#modal-cat-parent-group').hide();
            $('input[name="cat-icon"][value="linecons-star"]').prop('checked', true);
        } else if (mode === 'add-sub') {
            $('#modal-cat-title').text('添加子分类');
            $('#modal-cat-icon-group').hide();
            $('#modal-cat-parent-group').hide();
        } else if (mode === 'rename' || mode === 'rename-sub') {
            var isTopLevel = (mode === 'rename');
            $('#modal-cat-title').text(isTopLevel ? '编辑分类' : '编辑子分类');
            
            // 一级分类显示图标选择器，子分类隐藏
            if (isTopLevel) {
                $('#modal-cat-icon-group').show();
                $('#modal-cat-parent-group').hide();
            } else {
                $('#modal-cat-icon-group').hide();
                $('#modal-cat-parent-group').show();
                // 填充父分类下拉框
                CategoryManager._fillParentSelect(parentId);
            }
            
            // 预填当前名称和图标
            var data = DataSourceManager.getPrivateData();
            if (data) {
                var category = CategoryManager._findCategory(data, id, parentId);
                if (category) {
                    $('#modal-cat-name').val(category.name);
                    // 一级分类预填图标
                    if (isTopLevel && category.icon) {
                        $('input[name="cat-icon"][value="' + category.icon + '"]').prop('checked', true);
                    }
                }
            }
        }

        $('#modal-category').modal('show');
    },

    /**
     * 在数据中查找分类对象
     */
    _findCategory: function (data, id, parentId) {
        var cats = data.categories || [];
        if (!parentId) {
            // 查找一级分类
            for (var i = 0; i < cats.length; i++) {
                if (cats[i].id === id) return cats[i];
            }
        } else {
            // 查找子分类
            for (var j = 0; j < cats.length; j++) {
                if (cats[j].id === parentId && cats[j].children) {
                    for (var k = 0; k < cats[j].children.length; k++) {
                        if (cats[j].children[k].id === id) return cats[j].children[k];
                    }
                }
            }
        }
        return null;
    },

    /**
     * 填充父分类下拉框（编辑子分类时使用）
     * @param {string} currentParentId  当前父分类 id
     */
    _fillParentSelect: function (currentParentId) {
        var data = DataSourceManager.getPrivateData();
        if (!data) return;

        var $select = $('#modal-cat-parent-select');
        $select.empty();

        var cats = data.categories || [];
        for (var i = 0; i < cats.length; i++) {
            var cat = cats[i];
            // 只列出一级分类（可以有 children 或 sites）
            $select.append(
                '<option value="' + CategoryManager._escAttr(cat.id) + '">' +
                CategoryManager._escHtml(cat.name) +
                '</option>'
            );
        }

        // 设置当前选中值
        if (currentParentId) {
            $select.val(currentParentId);
        }
    },

    /**
     * 在数据中查找分类名称
     */
    _findName: function (data, id, parentId) {
        var category = CategoryManager._findCategory(data, id, parentId);
        return category ? category.name : '';
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
                    $.getJSON('../assets/data/default.json').done(function (defaultData) {
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
     * @param {string} newIcon  新图标（可选，仅一级分类使用）
     */
    renameCategory: function (id, newName, parentId, newIcon) {
        var data = DataSourceManager.getPrivateData();
        if (!data) return;

        var cats = data.categories;
        if (!parentId) {
            // 更新一级分类
            for (var i = 0; i < cats.length; i++) {
                if (cats[i].id === id) {
                    cats[i].name = newName;
                    // 如果提供了新图标，则更新图标
                    if (newIcon) {
                        cats[i].icon = newIcon;
                    }
                    break;
                }
            }
        } else {
            // 更新子分类
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
        var parentCategory = null;

        if (!parentId) {
            // 删除一级分类
            for (var i = 0; i < cats.length; i++) {
                if (cats[i].id === id) {
                    cats.splice(i, 1);
                    break;
                }
            }
        } else {
            // 删除子分类
            for (var j = 0; j < cats.length; j++) {
                if (cats[j].id === parentId && cats[j].children) {
                    parentCategory = cats[j];
                    for (var k = 0; k < cats[j].children.length; k++) {
                        if (cats[j].children[k].id === id) {
                            cats[j].children.splice(k, 1);
                            break;
                        }
                    }
                    break;
                }
            }

            // 检查父分类的剩余子分类数量
            if (parentCategory && parentCategory.children) {
                if (parentCategory.children.length === 0) {
                    // 没有子分类了，转换回纯一级结构（空书签列表）
                    delete parentCategory.children;
                    parentCategory.sites = [];
                } else if (parentCategory.children.length === 1) {
                    // 只剩 1 个子分类，提示用户是否将书签提升到一级分类
                    var lastSub = parentCategory.children[0];
                    var bookmarkCount = (lastSub.sites || []).length;
                    
                    if (bookmarkCount > 0) {
                        var doPromote = confirm(
                            '分类"' + parentCategory.name + '"下现在只剩 1 个子分类"' + lastSub.name + 
                            '"（含 ' + bookmarkCount + ' 个书签），是否将这些书签直接挂到一级分类"' + 
                            parentCategory.name + '"下？\n\n' +
                            '点击"确定"：书签提升到一级分类，删除子分类结构\n' +
                            '点击"取消"：保持当前的二级分类结构'
                        );
                        
                        if (doPromote) {
                            // 将唯一子分类的书签提升到一级分类
                            parentCategory.sites = lastSub.sites || [];
                            delete parentCategory.children;
                        }
                    } else {
                        // 子分类没有书签，直接转换为纯一级结构
                        parentCategory.sites = [];
                        delete parentCategory.children;
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
     * 将子分类移动到新的父分类下（编辑子分类时父分类变更）
     * @param {string} subId        子分类 id
     * @param {string} oldParentId  原父分类 id
     * @param {string} newParentId  新父分类 id
     * @param {string} newName      更新后的子分类名称
     */
    moveSubCategoryToParent: function (subId, oldParentId, newParentId, newName) {
        var data = DataSourceManager.getPrivateData();
        if (!data) return;

        var cats = data.categories;
        var subCategory = null;
        var oldParentCategory = null;

        // 1. 从原父分类中找到并删除子分类
        for (var i = 0; i < cats.length; i++) {
            if (cats[i].id === oldParentId && cats[i].children) {
                oldParentCategory = cats[i];
                for (var j = 0; j < cats[i].children.length; j++) {
                    if (cats[i].children[j].id === subId) {
                        // 保存子分类对象（包含所有书签）
                        subCategory = cats[i].children[j];
                        // 更新名称
                        subCategory.name = newName;
                        // 从原父分类删除
                        cats[i].children.splice(j, 1);
                        break;
                    }
                }
                if (subCategory) break;
            }
        }

        if (!subCategory) {
            alert('未找到要移动的子分类');
            return;
        }

        // 2. 检查原父分类的剩余子分类数量
        if (oldParentCategory && oldParentCategory.children) {
            if (oldParentCategory.children.length === 0) {
                // 没有子分类了，转换回纯一级结构（空书签列表）
                delete oldParentCategory.children;
                oldParentCategory.sites = [];
            } else if (oldParentCategory.children.length === 1) {
                // 只剩 1 个子分类，提示用户是否将书签提升到一级分类
                var lastSub = oldParentCategory.children[0];
                var bookmarkCount = (lastSub.sites || []).length;
                
                if (bookmarkCount > 0) {
                    var doPromote = confirm(
                        '原分类"' + oldParentCategory.name + '"下现在只剩 1 个子分类"' + lastSub.name + 
                        '"（含 ' + bookmarkCount + ' 个书签），是否将这些书签直接挂到一级分类"' + 
                        oldParentCategory.name + '"下？\n\n' +
                        '点击"确定"：书签提升到一级分类，删除子分类结构\n' +
                        '点击"取消"：保持当前的二级分类结构'
                    );
                    
                    if (doPromote) {
                        // 将唯一子分类的书签提升到一级分类
                        oldParentCategory.sites = lastSub.sites || [];
                        delete oldParentCategory.children;
                    }
                } else {
                    // 子分类没有书签，直接转换为纯一级结构
                    oldParentCategory.sites = [];
                    delete oldParentCategory.children;
                }
            }
        }

        // 3. 添加到新父分类
        for (var k = 0; k < cats.length; k++) {
            if (cats[k].id === newParentId) {
                // 如果新父分类有 sites（纯一级），需要转换结构
                if (cats[k].sites && cats[k].sites.length > 0) {
                    var doConvert = confirm(
                        '目标分类"' + cats[k].name + '"下已有 ' + cats[k].sites.length + 
                        ' 个书签，移动子分类后这些书签将被移至新子分类"未分类"中，是否继续？'
                    );
                    if (!doConvert) {
                        // 用户取消，恢复原状态（将子分类放回原父分类）
                        for (var m = 0; m < cats.length; m++) {
                            if (cats[m].id === oldParentId) {
                                if (!cats[m].children) cats[m].children = [];
                                cats[m].children.push(subCategory);
                                break;
                            }
                        }
                        return;
                    }
                    
                    // 创建"未分类"子分类存放原有书签
                    var uncategorized = {
                        id: 'cat-' + Date.now() + '-uncategorized',
                        name: '未分类',
                        sites: cats[k].sites
                    };
                    cats[k].children = [uncategorized, subCategory];
                    delete cats[k].sites;
                } else if (cats[k].children) {
                    // 已有子分类，直接追加
                    cats[k].children.push(subCategory);
                } else {
                    // sites 为空，直接转换
                    cats[k].children = [subCategory];
                    delete cats[k].sites;
                }
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
    },

    /**
     * 属性值转义
     */
    _escAttr: function (str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
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
        }
        // 切换到导入/导出时初始化
        if (panelId === 'panel-import-export') {
            ImportExport.init();
            BrowserExportManager.init();
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

    // 初始化分类管理事件（只绑定一次）
    CategoryManager._bindEvents();

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
        var logoSrc = normalizeLogo(site.logo);
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
            QuickAdd.updateLogoPreview(val || '../assets/images/favicon.png');
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
            var oldCatId = $('#modal-bm-cat-id').val();
            var oldParentId = $('#modal-bm-parent-id').val();
            var index = parseInt($('#modal-bm-index').val(), 10);

            var name = $.trim($('#modal-bm-name').val());
            var url = $.trim($('#modal-bm-url').val());
            var logo = $.trim($('#modal-bm-logo').val());

            if (!name) { alert('请输入书签名称'); return; }
            if (!url) { alert('请输入书签 URL'); return; }

            var site = { name: name, url: url, logo: logo };

            if (mode === 'add') {
                // 添加模式：读取用户选择的分类
                var selectedCat = $('#modal-bm-category').val();
                var newCatId, newParentId;
                if (selectedCat.indexOf('::') > -1) {
                    var parts = selectedCat.split('::');
                    newParentId = parts[0];
                    newCatId = parts[1];
                } else {
                    newCatId = selectedCat;
                    newParentId = '';
                }
                BookmarkManager.addSite(newCatId, site, newParentId);
            } else if (mode === 'edit') {
                // 编辑模式：读取用户选择的分类，判断是否变更
                var selectedCat = $('#modal-bm-category').val();
                var newCatId, newParentId;
                if (selectedCat.indexOf('::') > -1) {
                    var parts = selectedCat.split('::');
                    newParentId = parts[0];
                    newCatId = parts[1];
                } else {
                    newCatId = selectedCat;
                    newParentId = '';
                }

                // 判断分类是否变更
                if (newCatId === oldCatId && newParentId === oldParentId) {
                    // 分类未变更，直接更新
                    BookmarkManager.editSite(oldCatId, index, site, oldParentId);
                } else {
                    // 分类已变更，先删除再添加
                    BookmarkManager.moveSiteToCategory(oldCatId, index, oldParentId, newCatId, newParentId, site);
                }
            }

            $('#modal-bookmark').modal('hide');
        });

        // 所属分类下拉：填充叶子节点分类
        $('#modal-bookmark').off('show.bs.modal.bm').on('show.bs.modal.bm', function () {
            BookmarkManager._fillCategorySelect();
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
            BookmarkManager._updateLogoPreview(val || '../assets/images/logos/default.png');
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
                    $.getJSON('../assets/data/default.json').done(function (defaultData) {
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
            BookmarkManager._updateLogoPreview('../assets/images/logos/default.png');
            $('#modal-bm-logo-hint').text('填写 URL 后可自动获取网站图标');
        } else {
            $('#modal-bm-title').text('编辑书签');
            if (site) {
                $('#modal-bm-name').val(site.name || '');
                $('#modal-bm-url').val(site.url || '');
                $('#modal-bm-logo').val(site.logo || '');
                BookmarkManager._updateLogoPreview(site.logo || '../assets/images/logos/default.png');
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
     * 将书签移动到新分类（编辑时分类变更）
     * @param {string} oldCatId     原分类 id
     * @param {number} siteIndex    书签索引
     * @param {string} oldParentId  原父分类 id
     * @param {string} newCatId     新分类 id
     * @param {string} newParentId  新父分类 id
     * @param {Object} site         更新后的书签数据 { name, url, logo }
     */
    moveSiteToCategory: function (oldCatId, siteIndex, oldParentId, newCatId, newParentId, site) {
        var data = DataSourceManager.getPrivateData();
        if (!data) return;

        var cats = data.categories;

        // 1. 从原分类删除书签
        if (!oldParentId) {
            for (var i = 0; i < cats.length; i++) {
                if (cats[i].id === oldCatId && cats[i].sites) {
                    if (siteIndex >= 0 && siteIndex < cats[i].sites.length) {
                        cats[i].sites.splice(siteIndex, 1);
                    }
                    break;
                }
            }
        } else {
            for (var j = 0; j < cats.length; j++) {
                if (cats[j].id === oldParentId && cats[j].children) {
                    for (var k = 0; k < cats[j].children.length; k++) {
                        if (cats[j].children[k].id === oldCatId && cats[j].children[k].sites) {
                            if (siteIndex >= 0 && siteIndex < cats[j].children[k].sites.length) {
                                cats[j].children[k].sites.splice(siteIndex, 1);
                            }
                            break;
                        }
                    }
                }
            }
        }

        // 2. 添加到新分类
        if (!newParentId) {
            for (var m = 0; m < cats.length; m++) {
                if (cats[m].id === newCatId) {
                    if (!cats[m].sites) cats[m].sites = [];
                    cats[m].sites.push(site);
                    break;
                }
            }
        } else {
            for (var n = 0; n < cats.length; n++) {
                if (cats[n].id === newParentId && cats[n].children) {
                    for (var p = 0; p < cats[n].children.length; p++) {
                        if (cats[n].children[p].id === newCatId) {
                            if (!cats[n].children[p].sites) cats[n].children[p].sites = [];
                            cats[n].children[p].sites.push(site);
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
     * 从当前数据源提取所有已使用的 logo（去重）
     * @param {Function} callback  callback(logos)，logos 为 [{path, label}] 数组
     */
    _getUsedLogos: function (callback) {
        var source = DataSourceManager.getActive();
        DataSourceManager.load(source).done(function (data) {
            var seen = {};
            var logos = [];
            var cats = (data && data.categories) || [];
            function collectSites(sites) {
                for (var i = 0; i < sites.length; i++) {
                    var rawLogo = sites[i].logo;
                    if (!rawLogo) continue;
                    var logo = normalizeLogo(rawLogo);
                    if (!seen[logo]) {
                        seen[logo] = true;
                        var parts = logo.split('/');
                        var fname = parts[parts.length - 1];
                        logos.push({ path: logo, label: fname.replace(/\.png$/i, '') });
                    }
                }
            }
            for (var i = 0; i < cats.length; i++) {
                var cat = cats[i];
                if (cat.children && cat.children.length) {
                    for (var j = 0; j < cat.children.length; j++) {
                        collectSites(cat.children[j].sites || []);
                    }
                } else {
                    collectSites(cat.sites || []);
                }
            }
            callback(logos);
        }).fail(function () { callback([]); });
    },

    /**
     * 打开本地 logos 选择器
     */
    _openLogoPicker: function () {
        var $grid = $('#logo-picker-grid');
        var $search = $('#logo-picker-search');
        var $usedSection = $('#logo-picker-used-section');
        var $usedGrid = $('#logo-picker-used-grid');
        $search.val('');

        function onPickLogo(path) {
            $('#modal-bm-logo').val(path);
            BookmarkManager._updateLogoPreview(path);
            $('#modal-bm-logo-hint').text('已选择本地图标 ✓');
            $('#modal-logo-picker').modal('hide');
        }

        // 渲染常用 logo 区域
        function renderUsed(usedLogos) {
            if (!usedLogos || !usedLogos.length) {
                $usedSection.hide();
                return;
            }
            $usedSection.show();
            $usedGrid.empty();
            for (var i = 0; i < usedLogos.length; i++) {
                var item = usedLogos[i];
                $usedGrid.append(
                    '<div class="logo-pick-item" data-path="' + item.path + '" title="' + item.label + '">' +
                    '<img src="' + item.path + '" width="40" height="40" style="border-radius:6px;object-fit:cover;" onerror="this.style.opacity=0.3">' +
                    '<span>' + item.label + '</span>' +
                    '</div>'
                );
            }
            $usedGrid.off('click.picker-used').on('click.picker-used', '.logo-pick-item', function () {
                onPickLogo($(this).data('path'));
            });
        }

        // 加载 logos-list.json（缓存到 BookmarkManager._logosList）
        function renderGrid(files) {
            $grid.empty();
            var kw = $search.val().toLowerCase();
            var filtered = kw ? files.filter(function(f){ return f.toLowerCase().indexOf(kw) !== -1; }) : files;
            for (var i = 0; i < filtered.length; i++) {
                var fname = filtered[i];
                var path = '../assets/images/logos/' + fname;
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

            // 点击选择（全量列表）
            $grid.off('click.picker').on('click.picker', '.logo-pick-item', function () {
                onPickLogo($(this).data('path'));
            });

            // 加载常用 logo
            BookmarkManager._getUsedLogos(function (usedLogos) {
                renderUsed(usedLogos);
                $('#modal-logo-picker').modal('show');
            });
        }

        if (BookmarkManager._logosList) {
            openModal(BookmarkManager._logosList);
        } else {
            $.getJSON('../assets/data/logos-list.json')
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
        var DEFAULT_LOGO = '../assets/images/favicon.png';
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
        var DEFAULT_LOGO = '../assets/images/favicon.png';
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
        var fallback = '../assets/images/favicon.png';
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

        $('#oss-clear-btn').on('click', function () {
            OSSConfig.clearConfig();
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
     * 清空 OSS 配置：删除 localStorage 中的配置并清空表单
     */
    clearConfig: function () {
        if (!confirm('确定要清空 OSS 配置吗？此操作不可恢复。')) return;
        localStorage.removeItem(wsKey('oss_config'));
        $('#oss-ak').val('');
        $('#oss-sk').val('');
        $('#oss-bucket').val('');
        $('#oss-region').val('');
        $('#oss-prefix').val('');
        OSSConfig._showResult(true, '配置已清空 ✓');
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


/* ============================================================
 * TabCopyImporter — Tab Copy 批量导入模块
 * 依赖：jQuery 1.11.1, DataSourceManager, BookmarkManager
 * ============================================================ */
var TabCopyImporter = {

    /**
     * 初始化：绑定按钮事件，更新只读状态
     */
    init: function () {
        var self = this;
        $('#tab-copy-parse-btn').on('click', function () {
            self._parse();
        });
        $('#tab-copy-import-btn').on('click', function () {
            self._doImport();
        });
        this._updateReadonlyState();
    },

    /**
     * 根据当前数据源启用/禁用导入区域
     */
    _updateReadonlyState: function () {
        var isDefault = (DataSourceManager.getActive() === 'default');
        if (isDefault) {
            $('#tab-copy-textarea').prop('disabled', true);
            $('#tab-copy-parse-btn').prop('disabled', true);
            $('#tab-copy-import-btn').prop('disabled', true);
            $('#tab-copy-readonly-tip').show();
        } else {
            $('#tab-copy-textarea').prop('disabled', false);
            $('#tab-copy-parse-btn').prop('disabled', false);
            $('#tab-copy-import-btn').prop('disabled', false);
            $('#tab-copy-readonly-tip').hide();
        }
    },

    /**
     * HTML 转义工具函数
     * @param {string} str
     * @returns {string}
     */
    _escHtml: function (str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    },

    /**
     * 在 #tab-copy-result 显示成功/错误提示
     * @param {boolean} ok
     * @param {string} msg
     */
    _showResult: function (ok, msg) {
        var $el = $('#tab-copy-result');
        $el.removeClass('ie-result-ok ie-result-err')
           .addClass(ok ? 'ie-result-ok' : 'ie-result-err')
           .text(msg)
           .show();
    },

    /**
     * 校验输入文本
     * @param {string} text
     * @returns {{ error: boolean, message?: string, data?: Array }}
     */
    _validateInput: function (text) {
        if (!text || text.trim() === '') {
            return { error: true, message: '请粘贴 Tab Copy JSON 数据' };
        }
        var parsed;
        try {
            parsed = JSON.parse(text);
        } catch (e) {
            return { error: true, message: 'JSON 格式错误，请检查输入内容' };
        }
        if (!Array.isArray(parsed)) {
            return { error: true, message: '数据格式错误，需要 JSON 数组格式' };
        }
        if (parsed.length === 0) {
            return { error: true, message: '数组为空，没有可导入的书签' };
        }
        return { error: false, data: parsed };
    },

    /**
     * 将 Tab Copy 数组转换为 Bookmark 数组
     * 无效项（缺少 url）返回 { skipped: true, originalTitle: '' }
     * @param {Array} arr
     * @returns {Array}
     */
    _parseItems: function (arr) {
        var results = [];
        for (var i = 0; i < arr.length; i++) {
            var item = arr[i];
            var url = item.url || '';
            if (!url) {
                results.push({ skipped: true, originalTitle: item.title || '' });
                continue;
            }
            var name = (item.title && item.title !== '') ? item.title : url;
            results.push({ name: name, url: url, logo: '' });
        }
        return results;
    },

    /**
     * 渲染预览列表 HTML 并显示预览区
     * @param {Array} items  _parseItems 返回的数组
     */
    _renderPreview: function (items) {
        var self = this;
        var html = '';
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (item.skipped) {
                html += '<div class="tab-copy-preview-item skipped">' +
                    '<span class="tab-copy-preview-name">' + self._escHtml(item.originalTitle || '（无标题）') + '</span>' +
                    '<span class="tab-copy-preview-skip-label">已跳过（缺少 URL）</span>' +
                    '</div>';
            } else {
                html += '<div class="tab-copy-preview-item">' +
                    '<span class="tab-copy-preview-name">' + self._escHtml(item.name) + '</span>' +
                    '<span class="tab-copy-preview-url">' + self._escHtml(item.url) + '</span>' +
                    '</div>';
            }
        }
        $('#tab-copy-preview-list').html(html);
        $('#tab-copy-preview').show();
    },

    /**
     * 格式化二级分类标签
     * @param {string} parentName
     * @param {string} subName
     * @returns {string}
     */
    _formatCategoryLabel: function (parentName, subName) {
        return parentName + ' / ' + subName;
    },

    /**
     * 填充目标分类下拉框
     */
    _fillCategorySelect: function () {
        var self = this;
        var $select = $('#tab-copy-category');
        $select.empty();

        var data = DataSourceManager.getPrivateData();
        if (!data || !data.categories || data.categories.length === 0) {
            $select.append('<option value="">请先创建私有数据源</option>');
            $('#tab-copy-import-btn').prop('disabled', true);
            return;
        }

        $('#tab-copy-import-btn').prop('disabled', false);
        $select.append('<option value="">— 请选择分类 —</option>');

        var cats = data.categories;
        for (var i = 0; i < cats.length; i++) {
            var cat = cats[i];
            if (cat.sites) {
                // 一级分类（直接含 sites）
                $select.append('<option value="' + self._escHtml(cat.id) + '">' + self._escHtml(cat.name) + '</option>');
            } else if (cat.children && cat.children.length > 0) {
                // 含子分类
                for (var j = 0; j < cat.children.length; j++) {
                    var sub = cat.children[j];
                    if (sub.sites) {
                        var label = self._formatCategoryLabel(cat.name, sub.name);
                        var value = cat.id + '::' + sub.id;
                        $select.append('<option value="' + self._escHtml(value) + '">' + self._escHtml(label) + '</option>');
                    }
                }
            }
        }
    },

    /**
     * 串联校验、解析、预览、填充分类
     */
    _parse: function () {
        var text = $('#tab-copy-textarea').val();
        var validation = this._validateInput(text);
        if (validation.error) {
            this._showResult(false, validation.message);
            $('#tab-copy-preview').hide();
            return;
        }
        var items = this._parseItems(validation.data);
        this._renderPreview(items);
        this._fillCategorySelect();
        $('#tab-copy-result').hide();
        // 缓存解析结果供导入使用
        this._parsedItems = items;
    },

    /**
     * 将书签追加到目标分类 sites 数组末尾
     * @param {Object} data       私有数据对象
     * @param {string} catId      目标分类 id
     * @param {string} parentId   父分类 id（二级分类时非空）
     * @param {Array}  bookmarks  有效书签数组
     */
    _appendToCategory: function (data, catId, parentId, bookmarks) {
        var cats = data.categories;
        for (var i = 0; i < cats.length; i++) {
            var cat = cats[i];
            if (!parentId) {
                // 一级分类
                if (cat.id === catId && cat.sites) {
                    for (var k = 0; k < bookmarks.length; k++) {
                        cat.sites.push(bookmarks[k]);
                    }
                    return;
                }
            } else {
                // 二级分类
                if (cat.id === parentId && cat.children) {
                    for (var j = 0; j < cat.children.length; j++) {
                        var sub = cat.children[j];
                        if (sub.id === catId && sub.sites) {
                            for (var m = 0; m < bookmarks.length; m++) {
                                sub.sites.push(bookmarks[m]);
                            }
                            return;
                        }
                    }
                }
            }
        }
    },

    /**
     * 构建成功提示文本
     * @param {number} n
     * @returns {string}
     */
    _buildSuccessMessage: function (n) {
        return '成功导入 ' + n + ' 个书签';
    },

    /**
     * 执行导入流程
     */
    _doImport: function () {
        var catValue = $('#tab-copy-category').val();
        if (!catValue) {
            this._showResult(false, '请选择目标分类');
            return;
        }

        var items = this._parsedItems || [];
        var validBookmarks = [];
        for (var i = 0; i < items.length; i++) {
            if (!items[i].skipped) {
                validBookmarks.push({ name: items[i].name, url: items[i].url, logo: items[i].logo });
            }
        }

        // 拆分 parentId 和 catId
        var parts = catValue.split('::');
        var parentId = parts.length > 1 ? parts[0] : '';
        var catId    = parts.length > 1 ? parts[1] : parts[0];

        var data = DataSourceManager.getPrivateData();
        this._appendToCategory(data, catId, parentId, validBookmarks);
        DataSourceManager.savePrivateData(data);

        var msg = this._buildSuccessMessage(validBookmarks.length);
        this._showResult(true, msg);

        // 清空输入区域，隐藏预览
        $('#tab-copy-textarea').val('');
        $('#tab-copy-preview').hide();
        this._parsedItems = [];

        // 刷新书签列表
        if (typeof BookmarkManager !== 'undefined' && BookmarkManager.render) {
            BookmarkManager.render();
        }
    }
};

/* ----------------------------------------------------------
   BrowserExportManager 模块
   导出书签到浏览器（Netscape Bookmark File Format）
   ---------------------------------------------------------- */
var BrowserExportManager = {

    /**
     * 内部状态对象
     */
    _state: {
        // 分类选择状态
        // key: categoryId, value: { checked: boolean, indeterminate: boolean }
        categoryStates: {},
        
        // 书签选择状态
        // key: "categoryId:siteIndex", value: boolean
        siteStates: {},
        
        // 分类展开状态
        // key: categoryId, value: boolean
        expandedStates: {}
    },

    /**
     * 初始化：绑定事件，渲染初始界面
     * 幂等操作，可重复调用
     */
    init: function () {
        BrowserExportManager._bindEvents();
        BrowserExportManager.render();
    },

    /**
     * 渲染分类树和书签列表
     * 从当前激活数据源加载数据
     */
    render: function () {
        var $container = $('#be-tree-container');
        var $sourceName = $('#be-source-name');
        var $exportBtn = $('#be-export-btn');
        
        // 1. 获取当前数据源
        var activeSource = DataSourceManager.getActive();
        
        // 2. 更新数据源名称显示
        var sourceName = activeSource === 'private' ? '私有数据源' : '默认数据源';
        $sourceName.text(sourceName);
        
        // 3. 显示加载中状态
        $container.html('<div class="be-loading">加载中...</div>');
        $exportBtn.prop('disabled', true);
        
        // 4. 调用 DataSourceManager.load() 加载数据
        DataSourceManager.load(activeSource)
            .done(function (data) {
                // 处理加载成功
                if (!data || !data.categories || data.categories.length === 0) {
                    // 处理空数据
                    $container.html('<div class="be-empty">暂无数据</div>');
                    $exportBtn.prop('disabled', true);
                    return;
                }
                
                // 调用 _buildCategoryTree() 构建分类树 HTML
                var treeHtml = BrowserExportManager._buildCategoryTree(data.categories);
                $container.html(treeHtml);
                $exportBtn.prop('disabled', false);
            })
            .fail(function (reason) {
                // 处理加载失败
                var errorMsg = '数据加载失败，请重试';
                if (reason && typeof reason === 'string') {
                    errorMsg = reason;
                }
                $container.html('<div class="be-empty" style="color:#e74c3c;">' + errorMsg + '</div>');
                $exportBtn.prop('disabled', true);
            });
    },

    /**
     * 执行导出操作
     * 验证选择 → 生成 HTML → 触发下载
     */
    exportToFile: function () {
        try {
            // 1. 调用 _collectSelectedData() 收集选中数据
            var data = BrowserExportManager._collectSelectedData();
            
            // 2. 验证至少选择了一个书签,否则显示错误提示
            if (data.totalSites === 0) {
                BrowserExportManager._showResult(false, '请至少选择一个书签');
                return;
            }
            
            // 3. 调用 _generateHTML() 生成 HTML 内容
            var html = BrowserExportManager._generateHTML(data);
            
            // 4. 生成文件名: webstack-bookmarks-YYYYMMDD_HHMMSS.html
            var now = new Date();
            var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
            var dateStr = '' + now.getFullYear() + 
                         pad(now.getMonth() + 1) + 
                         pad(now.getDate()) + '_' +
                         pad(now.getHours()) + 
                         pad(now.getMinutes()) + 
                         pad(now.getSeconds());
            var filename = 'webstack-bookmarks-' + dateStr + '.html';
            
            // 5. 调用 _downloadFile() 触发下载
            BrowserExportManager._downloadFile(html, filename);
            
            // 6. 显示成功提示: "已导出 N 个书签到 M 个分类"
            var categoryCount = data.categories.length;
            BrowserExportManager._showResult(true, 
                '已导出 ' + data.totalSites + ' 个书签到 ' + categoryCount + ' 个分类');
            
            // 7. 2.5 秒后自动隐藏提示
            setTimeout(function () {
                $('#be-result').fadeOut(300);
            }, 2500);
            
        } catch (e) {
            // 8. 使用 try-catch 包裹,捕获异常并显示错误提示
            console.error('[BrowserExportManager] 导出失败:', e);
            BrowserExportManager._showResult(false, '导出失败，请重试');
        }
    },

    /**
     * 绑定所有事件监听器（幂等）
     */
    _bindEvents: function () {
        // 使用 .off().on() 模式确保幂等性
        
        // 1. 数据源切换按钮
        $('#be-switch-source-btn').off('click.be').on('click.be', function () {
            var current = DataSourceManager.getActive();
            var target = (current === 'default') ? 'private' : 'default';
            BrowserExportManager._switchSource(target);
        });
        
        // 2. 全选按钮
        $('#be-select-all-btn').off('click.be').on('click.be', function () {
            BrowserExportManager._selectAll();
        });
        
        // 3. 取消全选按钮
        $('#be-deselect-all-btn').off('click.be').on('click.be', function () {
            BrowserExportManager._deselectAll();
        });
        
        // 4. 导出按钮
        $('#be-export-btn').off('click.be').on('click.be', function () {
            BrowserExportManager.exportToFile();
        });
        
        // 5. 使用事件委托绑定分类复选框变化事件
        $('#be-tree-container').off('change.be-cat').on('change.be-cat', '.be-category-checkbox', function () {
            BrowserExportManager._handleCategoryCheckbox($(this));
        });
        
        // 6. 使用事件委托绑定书签复选框变化事件
        $('#be-tree-container').off('change.be-site').on('change.be-site', '.be-site-checkbox', function () {
            BrowserExportManager._handleSiteCheckbox($(this));
        });
        
        // 7. 使用事件委托绑定分类展开/折叠事件
        $('#be-tree-container').off('click.be-toggle').on('click.be-toggle', '.be-toggle-icon', function (e) {
            e.stopPropagation();
            var $icon = $(this);
            var categoryId = $icon.closest('.be-category-row').data('category-id');
            var $siteList = $('#be-sites-' + categoryId);
            
            // 切换展开/折叠状态
            $siteList.slideToggle(200);
            $icon.toggleClass('collapsed');
            
            // 更新内部状态
            BrowserExportManager._state.expandedStates[categoryId] = !$icon.hasClass('collapsed');
        });
    },

    /**
     * 切换数据源
     * @param {string} target - "default" | "private"
     */
    _switchSource: function (target) {
        // 1. 如果切换到私有数据源，检查是否存在
        if (target === 'private') {
            var raw = localStorage.getItem(wsKey('private_data'));
            if (!raw) {
                alert('私有数据源尚未创建，请前往书签管理或分类管理初始化私有数据。');
                return;
            }
        }
        
        // 2. 更新 localStorage 中的 active_source
        localStorage.setItem(wsKey('active_source'), target);
        
        // 3. 清空当前选择状态（切换数据源后重置所有选择）
        BrowserExportManager._state.categoryStates = {};
        BrowserExportManager._state.siteStates = {};
        BrowserExportManager._state.expandedStates = {};
        
        // 4. 调用 render() 重新渲染界面
        BrowserExportManager.render();
    },

    /**
     * 构建分类树 HTML
     * @param {Array} categories - 分类数组
     * @returns {string} HTML 字符串
     */
    _buildCategoryTree: function (categories) {
        var html = '';
        
        // 遍历所有一级分类
        for (var i = 0; i < categories.length; i++) {
            var category = categories[i];
            // 为每个一级分类调用 _buildCategoryRow()
            // parentId 为空字符串表示一级分类
            html += BrowserExportManager._buildCategoryRow(category, '');
        }
        
        return html;
    },

    /**
     * 构建单个分类行 HTML
     * @param {Object} category - 分类对象
     * @param {string} parentId - 父分类 ID（空字符串表示一级分类）
     * @returns {string} HTML 字符串
     */
    _buildCategoryRow: function (category, parentId) {
        var categoryId = category.id || '';
        var categoryName = BrowserExportManager._escapeHtml(category.name || '未命名分类');
        var icon = category.icon || 'linecons-star';
        var isLevel1 = (parentId === '');
        var levelClass = isLevel1 ? 'be-level-1' : 'be-level-2';
        
        // 计算书签总数（包含所有子分类）
        var totalCount = 0;
        
        // 如果有直接的 sites 数组
        if (category.sites && category.sites.length > 0) {
            totalCount += category.sites.length;
        }
        
        // 如果有 children 数组，累加所有子分类的书签数
        if (category.children && category.children.length > 0) {
            for (var i = 0; i < category.children.length; i++) {
                var child = category.children[i];
                if (child.sites && child.sites.length > 0) {
                    totalCount += child.sites.length;
                }
            }
        }
        
        // 构建分类行 HTML
        var html = '';
        html += '<div class="be-category-row ' + levelClass + '" data-category-id="' + categoryId + '">';
        
        // 展开/折叠图标（仅当有内容时显示，放在最前面）
        var hasContent = (category.sites && category.sites.length > 0) || 
                         (category.children && category.children.length > 0);
        if (hasContent) {
            html += '<i class="fa fa-angle-down be-toggle-icon collapsed"></i>';
        } else {
            // 没有内容时添加占位符，保持对齐
            html += '<span class="be-toggle-placeholder"></span>';
        }
        
        // 复选框
        html += '<input type="checkbox" class="be-category-checkbox" data-category-id="' + categoryId + '">';
        
        // 分类图标（仅一级分类显示）
        if (isLevel1 && icon) {
            html += '<i class="' + icon + '" style="margin-right:6px;color:#7a8fa8;"></i>';
        }
        
        // 分类名称
        html += '<span class="be-category-name">' + categoryName + '</span>';
        
        // 计数徽章
        if (totalCount > 0) {
            html += '<span class="be-category-count">' + totalCount + '</span>';
        }
        
        html += '</div>';
        
        // 构建书签列表容器（默认隐藏）
        if (hasContent) {
            html += '<div id="be-sites-' + categoryId + '" style="display:none;">';
            
            // 如果有 children 数组，遍历子分类
            if (category.children && category.children.length > 0) {
                for (var j = 0; j < category.children.length; j++) {
                    var child = category.children[j];
                    // 递归调用 _buildCategoryRow 构建子分类行（包含其书签列表）
                    html += BrowserExportManager._buildCategoryRow(child, categoryId);
                }
            }
            
            // 如果有 sites 数组，直接调用 _buildSiteList
            if (category.sites && category.sites.length > 0) {
                html += BrowserExportManager._buildSiteList(category.sites, categoryId);
            }
            
            html += '</div>';
        }
        
        return html;
    },

    /**
     * 构建书签列表 HTML
     * @param {Array} sites - 书签数组
     * @param {string} categoryId - 所属分类 ID
     * @returns {string} HTML 字符串
     */
    _buildSiteList: function (sites, categoryId) {
        if (!sites || sites.length === 0) {
            return '';
        }
        
        var html = '<div class="be-site-list">';
        
        // 遍历所有书签
        for (var i = 0; i < sites.length; i++) {
            var site = sites[i];
            var siteName = BrowserExportManager._escapeHtml(site.name || '未命名书签');
            var siteUrl = BrowserExportManager._escapeHtml(site.url || '#');
            var siteLogo = normalizeLogo(site.logo);
            var siteKey = categoryId + ':' + i;
            
            html += '<div class="be-site-row" data-site-key="' + siteKey + '">';
            
            // 复选框
            html += '<input type="checkbox" class="be-site-checkbox" data-site-key="' + siteKey + '" data-category-id="' + categoryId + '">';
            
            // Logo
            html += '<img src="' + siteLogo + '" class="be-site-logo" alt="' + siteName + '">';
            
            // 书签名称
            html += '<span class="be-site-name">' + siteName + '</span>';
            
            // URL（截断显示）
            html += '<span class="be-site-url">' + siteUrl + '</span>';
            
            html += '</div>';
        }
        
        html += '</div>';
        
        return html;
    },

    /**
     * 处理分类复选框变化
     * @param {jQuery} $checkbox - 复选框元素
     */
    _handleCategoryCheckbox: function ($checkbox) {
        // 1. 获取分类复选框的选中状态
        var isChecked = $checkbox.prop('checked');
        var categoryId = $checkbox.data('category-id');
        
        // 2. 更新内部状态对象 categoryStates
        BrowserExportManager._state.categoryStates[categoryId] = {
            checked: isChecked,
            indeterminate: false
        };
        
        // 更新 DOM 中的复选框状态
        $checkbox.prop('indeterminate', false);
        
        // 3. 同步该分类下所有子分类的复选框状态
        var $siteContainer = $('#be-sites-' + categoryId);
        if ($siteContainer.length > 0) {
            // 查找该分类下的所有子分类复选框
            $siteContainer.find('.be-category-checkbox').each(function () {
                var $subCheckbox = $(this);
                var subCategoryId = $subCheckbox.data('category-id');
                
                // 设置子分类复选框状态
                $subCheckbox.prop('checked', isChecked);
                $subCheckbox.prop('indeterminate', false);
                
                // 更新子分类的内部状态
                BrowserExportManager._state.categoryStates[subCategoryId] = {
                    checked: isChecked,
                    indeterminate: false
                };
                
                // 递归同步子分类下的书签
                var $subSiteContainer = $('#be-sites-' + subCategoryId);
                if ($subSiteContainer.length > 0) {
                    $subSiteContainer.find('.be-site-checkbox').each(function () {
                        var $siteCheckbox = $(this);
                        var siteKey = $siteCheckbox.data('site-key');
                        
                        // 设置书签复选框状态
                        $siteCheckbox.prop('checked', isChecked);
                        
                        // 更新书签的内部状态
                        BrowserExportManager._state.siteStates[siteKey] = isChecked;
                    });
                }
            });
            
            // 4. 同步该分类下所有书签的复选框状态
            $siteContainer.find('.be-site-checkbox').each(function () {
                var $siteCheckbox = $(this);
                var siteKey = $siteCheckbox.data('site-key');
                
                // 设置书签复选框状态
                $siteCheckbox.prop('checked', isChecked);
                
                // 更新书签的内部状态
                BrowserExportManager._state.siteStates[siteKey] = isChecked;
            });
        }
    },

    /**
     * 处理书签复选框变化
     * @param {jQuery} $checkbox - 复选框元素
     */
    _handleSiteCheckbox: function ($checkbox) {
        // 1. 获取书签复选框的选中状态
        var isChecked = $checkbox.prop('checked');
        var siteKey = $checkbox.data('site-key');
        var categoryId = $checkbox.data('category-id');
        
        // 2. 更新内部状态对象 siteStates
        BrowserExportManager._state.siteStates[siteKey] = isChecked;
        
        // 3. 调用 _updateCategoryCheckboxState() 更新父分类复选框状态
        BrowserExportManager._updateCategoryCheckboxState(categoryId);
    },

    /**
     * 更新分类复选框状态（全选/半选/未选）
     * @param {string} categoryId - 分类 ID
     */
    _updateCategoryCheckboxState: function (categoryId) {
        // 1. 获取该分类的复选框元素
        var $categoryCheckbox = $('.be-category-checkbox[data-category-id="' + categoryId + '"]');
        if ($categoryCheckbox.length === 0) {
            return; // 分类复选框不存在，直接返回
        }
        
        // 2. 统计该分类下所有书签的选中数量
        var $siteContainer = $('#be-sites-' + categoryId);
        if ($siteContainer.length === 0) {
            return; // 没有书签容器，直接返回
        }
        
        // 查找该分类下的所有书签复选框（不包括子分类的书签）
        var $siteCheckboxes = $siteContainer.find('.be-site-checkbox').filter(function () {
            // 只统计直接属于该分类的书签（通过 data-category-id 匹配）
            return $(this).data('category-id') === categoryId;
        });
        
        if ($siteCheckboxes.length === 0) {
            // 如果没有直接的书签，可能只有子分类
            // 检查是否有子分类
            var $subCategoryCheckboxes = $siteContainer.find('.be-category-checkbox');
            if ($subCategoryCheckboxes.length > 0) {
                // 统计子分类的选中状态
                var totalSubCategories = $subCategoryCheckboxes.length;
                var checkedSubCategories = 0;
                var indeterminateSubCategories = 0;
                
                $subCategoryCheckboxes.each(function () {
                    var $subCheckbox = $(this);
                    if ($subCheckbox.prop('checked')) {
                        checkedSubCategories++;
                    } else if ($subCheckbox.prop('indeterminate')) {
                        indeterminateSubCategories++;
                    }
                });
                
                // 根据子分类状态更新父分类状态
                if (checkedSubCategories === totalSubCategories) {
                    // 所有子分类都选中
                    $categoryCheckbox.prop('checked', true);
                    $categoryCheckbox.prop('indeterminate', false);
                    BrowserExportManager._state.categoryStates[categoryId] = {
                        checked: true,
                        indeterminate: false
                    };
                } else if (checkedSubCategories > 0 || indeterminateSubCategories > 0) {
                    // 部分子分类选中或有半选状态
                    $categoryCheckbox.prop('checked', false);
                    $categoryCheckbox.prop('indeterminate', true);
                    BrowserExportManager._state.categoryStates[categoryId] = {
                        checked: false,
                        indeterminate: true
                    };
                } else {
                    // 所有子分类都未选中
                    $categoryCheckbox.prop('checked', false);
                    $categoryCheckbox.prop('indeterminate', false);
                    BrowserExportManager._state.categoryStates[categoryId] = {
                        checked: false,
                        indeterminate: false
                    };
                }
            }
            return;
        }
        
        // 3. 统计选中的书签数量
        var totalSites = $siteCheckboxes.length;
        var checkedSites = 0;
        
        $siteCheckboxes.each(function () {
            if ($(this).prop('checked')) {
                checkedSites++;
            }
        });
        
        // 4. 根据选中情况设置分类复选框状态
        if (checkedSites === totalSites) {
            // 全部选中: 设置分类复选框为 checked, indeterminate = false
            $categoryCheckbox.prop('checked', true);
            $categoryCheckbox.prop('indeterminate', false);
            BrowserExportManager._state.categoryStates[categoryId] = {
                checked: true,
                indeterminate: false
            };
        } else if (checkedSites > 0) {
            // 部分选中: 设置分类复选框 indeterminate = true
            $categoryCheckbox.prop('checked', false);
            $categoryCheckbox.prop('indeterminate', true);
            BrowserExportManager._state.categoryStates[categoryId] = {
                checked: false,
                indeterminate: true
            };
        } else {
            // 全部未选中: 设置分类复选框为 unchecked, indeterminate = false
            $categoryCheckbox.prop('checked', false);
            $categoryCheckbox.prop('indeterminate', false);
            BrowserExportManager._state.categoryStates[categoryId] = {
                checked: false,
                indeterminate: false
            };
        }
    },

    /**
     * 全选所有分类和书签
     */
    _selectAll: function () {
        // 1. 遍历所有分类复选框
        $('.be-category-checkbox').each(function () {
            var $checkbox = $(this);
            var categoryId = $checkbox.data('category-id');
            
            // 设置复选框为 checked
            $checkbox.prop('checked', true);
            $checkbox.prop('indeterminate', false);
            
            // 更新内部状态对象
            BrowserExportManager._state.categoryStates[categoryId] = {
                checked: true,
                indeterminate: false
            };
        });
        
        // 2. 遍历所有书签复选框
        $('.be-site-checkbox').each(function () {
            var $checkbox = $(this);
            var siteKey = $checkbox.data('site-key');
            
            // 设置复选框为 checked
            $checkbox.prop('checked', true);
            
            // 更新内部状态对象
            BrowserExportManager._state.siteStates[siteKey] = true;
        });
    },

    /**
     * 取消全选
     */
    _deselectAll: function () {
        // 1. 遍历所有分类复选框
        $('.be-category-checkbox').each(function () {
            var $checkbox = $(this);
            var categoryId = $checkbox.data('category-id');
            
            // 设置复选框为 unchecked
            $checkbox.prop('checked', false);
            $checkbox.prop('indeterminate', false);
            
            // 更新内部状态对象
            BrowserExportManager._state.categoryStates[categoryId] = {
                checked: false,
                indeterminate: false
            };
        });
        
        // 2. 遍历所有书签复选框
        $('.be-site-checkbox').each(function () {
            var $checkbox = $(this);
            var siteKey = $checkbox.data('site-key');
            
            // 设置复选框为 unchecked
            $checkbox.prop('checked', false);
            
            // 更新内部状态对象
            BrowserExportManager._state.siteStates[siteKey] = false;
        });
    },

    /**
     * 收集选中的书签数据
     * @returns {Object} { categories: [...], totalSites: number }
     */
    _collectSelectedData: function () {
        var result = {
            categories: [],
            totalSites: 0
        };
        
        // 1. 获取当前数据源
        var activeSource = DataSourceManager.getActive();
        
        // 2. 同步加载数据（从 localStorage 或已缓存的数据）
        var sourceData = null;
        if (activeSource === 'private') {
            sourceData = DataSourceManager.getPrivateData();
        } else {
            // 对于默认数据源，我们需要从 DOM 中重建数据结构
            // 因为无法同步加载 JSON 文件，我们从已渲染的 DOM 中提取数据
            sourceData = BrowserExportManager._extractDataFromDOM();
        }
        
        if (!sourceData || !sourceData.categories) {
            return result;
        }
        
        // 3. 遍历所有一级分类
        for (var i = 0; i < sourceData.categories.length; i++) {
            var category = sourceData.categories[i];
            var categoryId = category.id || '';
            
            // 检查该分类是否被选中（checked 或 indeterminate）
            var categoryState = BrowserExportManager._state.categoryStates[categoryId];
            var isCategorySelected = categoryState && (categoryState.checked || categoryState.indeterminate);
            
            // 如果分类未被选中且不是半选状态，跳过
            if (!isCategorySelected) {
                continue;
            }
            
            // 4. 处理该分类
            var exportCategory = {
                id: category.id,
                name: category.name,
                icon: category.icon
            };
            
            // 5. 如果有子分类（children 数组）
            if (category.children && category.children.length > 0) {
                exportCategory.children = [];
                
                for (var j = 0; j < category.children.length; j++) {
                    var child = category.children[j];
                    var childId = child.id || '';
                    
                    // 检查子分类是否被选中
                    var childState = BrowserExportManager._state.categoryStates[childId];
                    var isChildSelected = childState && (childState.checked || childState.indeterminate);
                    
                    if (!isChildSelected) {
                        continue;
                    }
                    
                    // 收集子分类的选中书签
                    var exportChild = {
                        id: child.id,
                        name: child.name,
                        sites: []
                    };
                    
                    if (child.sites && child.sites.length > 0) {
                        for (var k = 0; k < child.sites.length; k++) {
                            var site = child.sites[k];
                            var siteKey = childId + ':' + k;
                            
                            // 检查书签是否被选中
                            if (BrowserExportManager._state.siteStates[siteKey]) {
                                exportChild.sites.push({
                                    name: site.name,
                                    url: site.url,
                                    logo: site.logo
                                });
                                result.totalSites++;
                            }
                        }
                    }
                    
                    // 只有当子分类有选中的书签时才添加
                    if (exportChild.sites.length > 0) {
                        exportCategory.children.push(exportChild);
                    }
                }
            }
            
            // 6. 如果有直接的 sites 数组
            if (category.sites && category.sites.length > 0) {
                exportCategory.sites = [];
                
                for (var m = 0; m < category.sites.length; m++) {
                    var site = category.sites[m];
                    var siteKey = categoryId + ':' + m;
                    
                    // 检查书签是否被选中
                    if (BrowserExportManager._state.siteStates[siteKey]) {
                        exportCategory.sites.push({
                            name: site.name,
                            url: site.url,
                            logo: site.logo
                        });
                        result.totalSites++;
                    }
                }
            }
            
            // 7. 只有当分类有选中的内容时才添加到结果中
            var hasContent = (exportCategory.sites && exportCategory.sites.length > 0) ||
                            (exportCategory.children && exportCategory.children.length > 0);
            
            if (hasContent) {
                result.categories.push(exportCategory);
            }
        }
        
        return result;
    },
    
    /**
     * 从 DOM 中提取数据结构（用于默认数据源）
     * @returns {Object} 数据对象
     */
    _extractDataFromDOM: function () {
        var data = { categories: [] };
        
        // 遍历所有一级分类行
        $('.be-category-row.be-level-1').each(function () {
            var $row = $(this);
            var categoryId = $row.data('category-id');
            var categoryName = $row.find('.be-category-name').text();
            var $icon = $row.find('i[class*="linecons-"]');
            var icon = '';
            
            if ($icon.length > 0) {
                var classes = $icon.attr('class').split(' ');
                for (var i = 0; i < classes.length; i++) {
                    if (classes[i].indexOf('linecons-') === 0) {
                        icon = classes[i];
                        break;
                    }
                }
            }
            
            var category = {
                id: categoryId,
                name: categoryName,
                icon: icon
            };
            
            // 查找该分类的内容容器
            var $container = $('#be-sites-' + categoryId);
            if ($container.length > 0) {
                // 检查是否有子分类
                var $subCategories = $container.find('.be-category-row.be-level-2');
                if ($subCategories.length > 0) {
                    category.children = [];
                    
                    $subCategories.each(function () {
                        var $subRow = $(this);
                        var subCategoryId = $subRow.data('category-id');
                        var subCategoryName = $subRow.find('.be-category-name').text();
                        
                        var subCategory = {
                            id: subCategoryId,
                            name: subCategoryName,
                            sites: []
                        };
                        
                        // 提取子分类的书签
                        var $subContainer = $('#be-sites-' + subCategoryId);
                        if ($subContainer.length > 0) {
                            $subContainer.find('.be-site-row').each(function () {
                                var $siteRow = $(this);
                                var siteName = $siteRow.find('.be-site-name').text();
                                var siteUrl = $siteRow.find('.be-site-url').text();
                                var siteLogo = $siteRow.find('.be-site-logo').attr('src');
                                
                                subCategory.sites.push({
                                    name: siteName,
                                    url: siteUrl,
                                    logo: siteLogo
                                });
                            });
                        }
                        
                        category.children.push(subCategory);
                    });
                }
                
                // 提取直接属于该分类的书签（不在子分类中的）
                var $directSites = $container.find('> .be-site-list .be-site-row');
                if ($directSites.length > 0) {
                    category.sites = [];
                    
                    $directSites.each(function () {
                        var $siteRow = $(this);
                        var siteName = $siteRow.find('.be-site-name').text();
                        var siteUrl = $siteRow.find('.be-site-url').text();
                        var siteLogo = $siteRow.find('.be-site-logo').attr('src');
                        
                        category.sites.push({
                            name: siteName,
                            url: siteUrl,
                            logo: siteLogo
                        });
                    });
                }
            }
            
            data.categories.push(category);
        });
        
        return data;
    },

    /**
     * 生成 Netscape Bookmark File Format HTML
     * @param {Object} data - 选中的数据
     * @returns {string} HTML 字符串
     */
    _generateHTML: function (data) {
        var html = [];
        
        // DOCTYPE 声明
        html.push('<!DOCTYPE NETSCAPE-Bookmark-file-1>');
        
        // 注释说明
        html.push('<!-- This is an automatically generated file.');
        html.push('     It will be read and overwritten.');
        html.push('     DO NOT EDIT! -->');
        
        // META 标签
        html.push('<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">');
        
        // TITLE 标签
        html.push('<TITLE>Bookmarks</TITLE>');
        
        // H1 标签
        html.push('<H1>Bookmarks</H1>');
        
        // 开始书签列表
        html.push('<DL><p>');
        
        // 遍历选中的分类
        for (var i = 0; i < data.categories.length; i++) {
            var category = data.categories[i];
            var level = category.level || 1;
            html.push(BrowserExportManager._generateCategoryHTML(category, level));
        }
        
        // 结束书签列表
        html.push('</DL><p>');
        
        return html.join('\n');
    },

    /**
     * 生成分类 HTML 片段（递归）
     * @param {Object} category - 分类对象
     * @param {number} level - 层级（1 或 2）
     * @returns {string} HTML 字符串
     */
    _generateCategoryHTML: function (category, level) {
        var html = [];
        var timestamp = Math.floor(Date.now() / 1000);
        var escapedName = BrowserExportManager._escapeHtml(category.name);
        
        // 生成分类 H3 标签
        html.push('    <DT><H3 ADD_DATE="' + timestamp + '">' + escapedName + '</H3>');
        
        // 生成 DL 开始标签
        html.push('    <DL><p>');
        
        // 遍历书签
        if (category.sites && category.sites.length > 0) {
            for (var i = 0; i < category.sites.length; i++) {
                html.push(BrowserExportManager._generateSiteHTML(category.sites[i]));
            }
        }
        
        // 如果有子分类，递归调用
        if (category.children && category.children.length > 0) {
            for (var j = 0; j < category.children.length; j++) {
                html.push(BrowserExportManager._generateCategoryHTML(category.children[j], 2));
            }
        }
        
        // 生成 DL 结束标签
        html.push('    </DL><p>');
        
        return html.join('\n');
    },

    /**
     * 生成书签 HTML 片段
     * @param {Object} site - 书签对象
     * @returns {string} HTML 字符串
     */
    _generateSiteHTML: function (site) {
        var timestamp = Math.floor(Date.now() / 1000);
        var escapedName = BrowserExportManager._escapeHtml(site.name);
        var escapedUrl = BrowserExportManager._escapeHtml(site.url);
        
        return '        <DT><A HREF="' + escapedUrl + '" ADD_DATE="' + timestamp + '">' + escapedName + '</A>';
    },

    /**
     * HTML 转义
     * @param {string} str - 原始字符串
     * @returns {string} 转义后的字符串
     */
    _escapeHtml: function (str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    },

    /**
     * 触发文件下载
     * @param {string} content - 文件内容
     * @param {string} filename - 文件名
     */
    _downloadFile: function (content, filename) {
        // 创建 Blob 对象
        var blob = new Blob([content], { type: 'text/html;charset=utf-8' });
        
        // 生成临时 URL
        var url = URL.createObjectURL(blob);
        
        // 创建隐藏的 <a> 标签
        var $link = $('<a></a>')
            .attr('href', url)
            .attr('download', filename)
            .css('display', 'none');
        
        // 添加到 DOM
        $('body').append($link);
        
        // 触发点击事件
        $link[0].click();
        
        // 延迟清理临时 URL 和 DOM 元素
        setTimeout(function () {
            URL.revokeObjectURL(url);
            $link.remove();
        }, 100);
    },

    /**
     * 显示结果提示
     * @param {boolean} success - 是否成功
     * @param {string} message - 提示信息
     */
    _showResult: function (success, message) {
        var $el = $('#be-result');
        $el.removeClass('ie-result-ok ie-result-err')
           .addClass(success ? 'ie-result-ok' : 'ie-result-err')
           .text(message)
           .show();
    }
};
