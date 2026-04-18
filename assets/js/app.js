/* ==========================================================
   assets/js/app.js
   模块顺序：Renderer → DataSourceManager → Searcher → 初始化入口
   ES5 风格，兼容 jQuery 1.11.1
   ========================================================== */

/* 应用版本号 — 每次发布更新此值 */
var APP_VERSION = 'v20260418';

/**
 * 生成带版本后缀的 localStorage key
 * 例如：wsKey('private_data') → 'ws_private_data_v20260418'
 * @param {string} name
 * @returns {string}
 */
function wsKey(name) {
    return 'ws_' + name + '_' + APP_VERSION;
}

/* ----------------------------------------------------------
   Renderer 模块
   ---------------------------------------------------------- */
var Renderer = {

    /**
     * 渲染完整页面（侧边栏 + 内容区）
     * @param {Object} data  { categories: [...] }
     */
    render: function (data) {
        Renderer.clear();

        if (!data || !data.categories || !data.categories.length) {
            Renderer._showError('数据为空或格式不正确');
            return;
        }

        var menuHtml = '';
        var contentHtml = '';

        for (var i = 0; i < data.categories.length; i++) {
            var cat = data.categories[i];
            menuHtml += Renderer._buildMenuItem(cat);
            contentHtml += Renderer._buildSection(cat);
        }

        $('#main-menu').html(menuHtml);

        // 追加固定菜单项：关于本站
        $('#main-menu').append(
            '<li>' +
            '<a href="about.html">' +
            '<i class="linecons-heart"></i>' +
            '<span class="tooltip-blue">关于本站</span>' +
            '<span class="label label-Primary pull-right hidden-collapsed">♥︎</span>' +
            '</a>' +
            '</li>'
        );

        // 将内容插入到 nav 之后、#no-results 之前
        var $nav = $('.main-content nav').first();
        $nav.after(contentHtml);

        // 初始化懒加载
        if (typeof lozad === 'function') {
            var observer = lozad();
            observer.observe();
        }

        // 初始化 tooltip
        if ($.fn.tooltip) {
            $('[data-toggle="tooltip"]').tooltip();
        }

        // 重新绑定侧边栏子菜单展开/收起（动态渲染后 xenon 已绑定的事件失效，需手动重绑）
        Renderer._initSubMenus();
    },

    /**
     * 重新绑定侧边栏 has-sub 展开/收起事件
     * xenon-custom.js 在页面初始化时一次性绑定，动态插入菜单后需手动重绑
     */
    _initSubMenus: function () {
        var $items = $('#main-menu').find('li:has(> ul)');
        $items.addClass('has-sub');

        // 先解绑旧事件，避免重复绑定
        $items.children('a').off('click.submenu').on('click.submenu', function (ev) {
            ev.preventDefault();
            var $li = $(this).parent();
            var $sub = $li.children('ul');

            if ($li.hasClass('expanded')) {
                $li.removeClass('expanded');
                $sub.slideUp(200);
            } else {
                // 收起同级其他展开项
                $li.siblings('.has-sub.expanded').each(function () {
                    $(this).removeClass('expanded').children('ul').slideUp(200);
                });
                $li.addClass('expanded');
                $sub.slideDown(200);
            }
        });
    },

    /**
     * 生成单个卡片 HTML
     * @param {Object} site  { name, url, logo }
     * @returns {string}
     */
    _buildCard: function (site) {
        var name = site.name || '';
        var url = site.url || '#';
        var logo = site.logo || '';

        return '<div class="col-sm-3">' +
            '<div class="xe-widget xe-conversations box2 label-info"' +
            ' onclick="window.open(\'' + url.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + '\', \'_blank\')"' +
            ' data-toggle="tooltip"' +
            ' data-placement="bottom"' +
            ' title=""' +
            ' data-original-title="' + url.replace(/"/g, '&quot;') + '">' +
            '<div class="xe-comment-entry">' +
            '<a class="xe-user-img">' +
            '<img data-src="' + logo.replace(/"/g, '&quot;') + '"' +
            ' class="lozad img-circle"' +
            ' width="40"' +
            ' alt="' + name.replace(/"/g, '&quot;') + '">' +
            '</a>' +
            '<div class="xe-comment">' +
            '<a href="#" class="xe-user-name overflowClip_1">' +
            '<strong>' + name + '</strong>' +
            '</a>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
    },

    /**
     * 生成侧边栏菜单项 HTML
     * @param {Object} category
     * @returns {string}
     */
    _buildMenuItem: function (category) {
        var id = category.id || '';
        var name = category.name || '';
        var icon = category.icon || 'linecons-star';

        if (category.children && category.children.length) {
            // 一级 + 二级结构
            var subItems = '';
            for (var i = 0; i < category.children.length; i++) {
                var child = category.children[i];
                subItems += '<li>' +
                    '<a href="#' + child.id + '" class="smooth">' +
                    '<span class="title">' + child.name + '</span>' +
                    '</a>' +
                    '</li>';
            }
            return '<li class="has-sub">' +
                '<a href="#">' +
                '<i class="' + icon + '"></i>' +
                '<span class="title">' + name + '</span>' +
                '</a>' +
                '<ul>' + subItems + '</ul>' +
                '</li>';
        } else {
            // 纯一级结构
            return '<li>' +
                '<a href="#' + id + '" class="smooth">' +
                '<i class="' + icon + '"></i>' +
                '<span class="title">' + name + '</span>' +
                '</a>' +
                '</li>';
        }
    },

    /**
     * 生成内容区分类区块 HTML（内部方法）
     * @param {Object} category
     * @returns {string}
     */
    _buildSection: function (category) {
        var id = category.id || '';
        var name = category.name || '';
        var icon = category.icon || 'linecons-tag';

        if (category.children && category.children.length) {
            // 一级 + 二级结构：一级标题 + 各子分类的 h4 和卡片行
            var innerHtml = '';
            for (var i = 0; i < category.children.length; i++) {
                var child = category.children[i];
                var childCards = '';
                if (child.sites && child.sites.length) {
                    for (var j = 0; j < child.sites.length; j++) {
                        childCards += Renderer._buildCard(child.sites[j]);
                    }
                }
                innerHtml += '<h4 class="text-gray">' +
                    '<i class="linecons-tag" style="margin-right:7px;" id="' + child.id + '"></i>' +
                    child.name +
                    '</h4>' +
                    '<div class="row">' + childCards + '</div>';
            }
            return '<div class="category-section" id="section-' + id + '">' +
                '<h4 class="text-gray">' +
                '<i class="' + icon + '" style="margin-right:7px;" id="' + id + '"></i>' +
                name +
                '</h4>' +
                innerHtml +
                '</div>';
        } else {
            // 纯一级结构
            var cards = '';
            if (category.sites && category.sites.length) {
                for (var k = 0; k < category.sites.length; k++) {
                    cards += Renderer._buildCard(category.sites[k]);
                }
            }
            return '<div class="category-section" id="section-' + id + '">' +
                '<h4 class="text-gray">' +
                '<i class="linecons-tag" style="margin-right:7px;" id="' + id + '"></i>' +
                name +
                '</h4>' +
                '<div class="row">' + cards + '</div>' +
                '</div>';
        }
    },

    /**
     * 清空侧边栏菜单和主内容区动态内容
     * 保留 #no-results 和 footer
     */
    clear: function () {
        $('#main-menu').empty();
        // 移除 nav 之后、footer 之前的所有动态 category-section 元素
        $('.main-content .category-section').remove();
    },

    /**
     * 在主内容区显示错误提示
     * @param {string} msg
     */
    _showError: function (msg) {
        var $nav = $('.main-content nav').first();
        $nav.after(
            '<div class="category-section" id="section-error" style="padding:40px;text-align:center;color:#e74c3c;">' +
            '<i class="linecons-close" style="font-size:48px;"></i>' +
            '<p style="margin-top:16px;font-size:16px;">数据加载失败：' + msg + '</p>' +
            '</div>'
        );
    }
};

/* ----------------------------------------------------------
   DataSourceManager 模块
   ---------------------------------------------------------- */
var DataSourceManager = {

    /**
     * 获取当前激活数据源标识
     * @returns {string} "default" | "private"
     */
    getActive: function () {
        return localStorage.getItem(wsKey('active_source')) || 'default';
    },

    /**
     * 读取数据源，返回 jQuery Deferred/Promise
     * @param {string} source  "default" | "private"
     * @returns {$.Deferred}
     */
    load: function (source) {
        var deferred = $.Deferred();

        if (source === 'private') {
            var raw = localStorage.getItem(wsKey('private_data'));
            if (raw) {
                try {
                    var data = JSON.parse(raw);
                    deferred.resolve(data);
                } catch (e) {
                    deferred.reject('私有数据解析失败：' + e.message);
                }
            } else {
                deferred.reject('private_not_found');
            }
        } else {
            // 默认数据源：通过 AJAX 加载 JSON 文件
            $.getJSON('./assets/data/default.json')
                .done(function (data) {
                    deferred.resolve(data);
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    deferred.reject('默认数据源加载失败：' + textStatus);
                });
        }

        return deferred.promise();
    },

    /**
     * 切换数据源，保存到 localStorage，加载后渲染
     * @param {string} source  "default" | "private"
     */
    switchTo: function (source) {
        if (source === 'private') {
            var raw = localStorage.getItem(wsKey('private_data'));
            if (!raw) {
                alert('私有数据源尚未创建，请前往管理面板初始化私有数据。');
                return;
            }
        }

        localStorage.setItem(wsKey('active_source'), source);
        DataSourceManager._updateLabel(source);

        DataSourceManager.load(source)
            .done(function (data) {
                Renderer.render(data);
                Searcher.init();
            })
            .fail(function (reason) {
                if (reason === 'private_not_found') {
                    Renderer._showError('私有数据源不存在，请前往管理面板创建私有数据。');
                } else {
                    Renderer._showError(reason);
                }
            });
    },

    /**
     * 读取私有数据对象
     * @returns {Object|null}
     */
    getPrivateData: function () {
        var raw = localStorage.getItem(wsKey('private_data'));
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch (e) {
            return null;
        }
    },

    /**
     * 保存私有数据到 localStorage，自动注入应用版本号
     * @param {Object} data
     */
    savePrivateData: function (data) {
        data.appVersion = APP_VERSION;
        localStorage.setItem(wsKey('private_data'), JSON.stringify(data));
        localStorage.setItem('ws_app_version', APP_VERSION);
    },

    /**
     * 更新顶部导航栏数据源标签文字（内部方法）
     * @param {string} source
     */
    _updateLabel: function (source) {
        var label = source === 'private' ? '私有数据源' : '默认数据源';
        $('#datasource-label').text(label);
    }
};

/* ----------------------------------------------------------
   Searcher 模块
   ---------------------------------------------------------- */
var Searcher = {

    /**
     * 绑定搜索框事件，支持中文输入法（composition）
     */
    init: function () {
        var composing = false;
        var $input = $('#search-input');

        $input.off('.searcher');

        // 中文输入法开始输入拼音时，不触发搜索
        $input.on('compositionstart.searcher', function () {
            composing = true;
        });

        // 中文输入法确认选字后，触发一次搜索
        $input.on('compositionend.searcher', function () {
            composing = false;
            Searcher.filter($(this).val().trim());
        });

        // 英文直接输入用 input 事件，中文输入法期间跳过
        $input.on('input.searcher', function () {
            if (!composing) {
                Searcher.filter($(this).val().trim());
            }
        });
    },

    /**
     * 过滤卡片，支持中文名称、拼音全拼、拼音首字母匹配
     * @param {string} keyword
     */
    filter: function (keyword) {
        if (!keyword) {
            $('.xe-widget').closest('.col-sm-3').show();
            $('.category-section').show();
            $('#no-results').hide();
            return;
        }

        var kw = keyword.toLowerCase();
        var totalVisible = 0;

        $('.xe-widget').each(function () {
            var $widget = $(this);
            var name = $widget.find('.xe-user-name strong').text();
            var nameLower = name.toLowerCase();

            var matched = false;

            // 1. 直接匹配（中文/英文）
            if (nameLower.indexOf(kw) !== -1) {
                matched = true;
            }

            // 2. 拼音匹配（需要 pinyin-pro 库）
            if (!matched && typeof pinyinPro !== 'undefined') {
                // 全拼，如 "dribbble" → 跳过，中文 "花瓣" → "huaban"
                var fullPinyin = pinyinPro.pinyin(name, { toneType: 'none', separator: '' }).toLowerCase();
                // 首字母，如 "花瓣" → "hb"
                var initials = pinyinPro.pinyin(name, { pattern: 'first', separator: '' }).toLowerCase();

                if (fullPinyin.indexOf(kw) !== -1 || initials.indexOf(kw) !== -1) {
                    matched = true;
                }
            }

            if (matched) {
                $widget.closest('.col-sm-3').show();
                totalVisible++;
            } else {
                $widget.closest('.col-sm-3').hide();
            }
        });

        $('.category-section').each(function () {
            var hasVisible = $(this).find('.col-sm-3:visible').length > 0;
            $(this).toggle(hasVisible);
        });

        $('#no-results').toggle(totalVisible === 0);
    }
};

/* ----------------------------------------------------------
   初始化入口
   ---------------------------------------------------------- */
$(document).ready(function () {
    // 记录当前应用版本到 localStorage
    localStorage.setItem('ws_app_version', APP_VERSION);

    var activeSource = DataSourceManager.getActive();
    DataSourceManager._updateLabel(activeSource);

    DataSourceManager.load(activeSource)
        .done(function (data) {
            Renderer.render(data);
            Searcher.init();
        })
        .fail(function (reason) {
            if (reason === 'private_not_found') {
                Renderer._showError('私有数据源不存在，请前往管理面板创建私有数据。');
            } else {
                Renderer._showError(reason);
            }
        });

    // 数据源切换按钮
    $('#datasource-btn').on('click', function (e) {
        e.preventDefault();
        var current = DataSourceManager.getActive();
        var target = current === 'default' ? 'private' : 'default';
        DataSourceManager.switchTo(target);
    });

    // 自动同步：读取 ws_sync_config
    var syncCfgRaw = localStorage.getItem(wsKey('sync_config'));
    if (syncCfgRaw) {
        var syncCfg;
        try { syncCfg = JSON.parse(syncCfgRaw); } catch (e) { syncCfg = null; }
        if (syncCfg) {
            // 页面加载时自动同步
            if (syncCfg.onLoad === true) {
                SyncManager.checkAndSync();
            }
            // 定时同步
            if (syncCfg.interval && syncCfg.interval > 0) {
                SyncManager.startTimer(syncCfg.interval);
            }
        }
    }
});

/* ----------------------------------------------------------
   SyncManager — 自动同步部分（app.js）
   ---------------------------------------------------------- */
var SyncManager = {

    _timer: null,

    /**
     * 检查 OSS 版本并按需下载（自动同步入口）
     * 失败时静默 console.error，不打断用户浏览
     */
    checkAndSync: function () {
        // 读取 OSS 配置（从 localStorage 反混淆）
        var ossConfigRaw = localStorage.getItem(wsKey('oss_config'));
        if (!ossConfigRaw) {
            console.log('[SyncManager] OSS 配置未设置，跳过自动同步');
            return;
        }

        var cfg;
        try {
            var XOR_KEY = 'ws2024';
            var decoded = decodeURIComponent(escape(atob(ossConfigRaw)));
            var plain = '';
            for (var i = 0; i < decoded.length; i++) {
                plain += String.fromCharCode(decoded.charCodeAt(i) ^ XOR_KEY.charCodeAt(i % XOR_KEY.length));
            }
            cfg = JSON.parse(plain);
        } catch (e) {
            console.error('[SyncManager] OSS 配置解析失败', e);
            return;
        }

        if (!cfg || !cfg.accessKeyId || !cfg.accessKeySecret || !cfg.bucket || !cfg.region || !cfg.prefix) {
            console.log('[SyncManager] OSS 配置不完整，跳过自动同步');
            return;
        }

        var client;
        try {
            client = new OSS({
                region: cfg.region,
                accessKeyId: cfg.accessKeyId,
                accessKeySecret: cfg.accessKeySecret,
                bucket: cfg.bucket
            });
        } catch (e) {
            console.error('[SyncManager] 创建 OSS 客户端失败', e);
            return;
        }

        var localVersion = localStorage.getItem(wsKey('private_version')) || '0';

        // 读取 version.json
        client.get(cfg.prefix + 'version.json').then(function (result) {
            var text = new TextDecoder().decode(result.content);
            var versionObj = JSON.parse(text);
            var remoteVersion = versionObj.version || '0';

            // 版本比较（字符串比较，格式 YYYYMMDDHHmmss）
            if (remoteVersion <= localVersion) {
                console.log('[SyncManager] 本地版本已是最新（' + localVersion + '），无需同步');
                return;
            }

            console.log('[SyncManager] 发现新版本：' + remoteVersion + '，开始下载...');

            // 下载数据文件
            client.get(cfg.prefix + 'data-' + remoteVersion + '.json').then(function (dataResult) {
                var dataText = new TextDecoder().decode(dataResult.content);
                var data = JSON.parse(dataText);
                if (!data.categories) {
                    console.error('[SyncManager] 数据文件格式错误：缺少 categories 字段');
                    return;
                }

                var now = new Date().toISOString();
                DataSourceManager.savePrivateData(data);
                localStorage.setItem(wsKey('private_version'), remoteVersion);
                localStorage.setItem(wsKey('last_download_at'), now);
                localStorage.setItem(wsKey('last_download_version'), remoteVersion);

                console.log('[SyncManager] 自动同步完成，版本：' + remoteVersion);

                // 当前激活私有数据源时刷新页面
                if (DataSourceManager.getActive() === 'private') {
                    Renderer.render(data);
                    Searcher.init();
                }
            }).catch(function (err) {
                console.error('[SyncManager] 下载数据文件失败', err);
            });
        }).catch(function (err) {
            console.error('[SyncManager] 读取 version.json 失败', err);
        });
    },

    /**
     * 启动定时同步
     * @param {number} intervalSeconds  间隔秒数
     */
    startTimer: function (intervalSeconds) {
        SyncManager.stopTimer();
        SyncManager._timer = setInterval(function () {
            SyncManager.checkAndSync();
        }, intervalSeconds * 1000);
        console.log('[SyncManager] 定时同步已启动，间隔：' + intervalSeconds + ' 秒');
    },

    /**
     * 停止定时同步
     */
    stopTimer: function () {
        if (SyncManager._timer) {
            clearInterval(SyncManager._timer);
            SyncManager._timer = null;
        }
    }
};
