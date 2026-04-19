/*!
 * admin-nav.js — 管理面板公共导航注入模块
 * 暴露为 window.AdminNav，使用 ES5 + jQuery 1.11.1
 */
var AdminNav = (function ($) {

    // ── 菜单项集中配置（唯一维护位置）──────────────────────
    var NAV_CONFIG = [
        { href: './bookmarks.html',     label: '&#128278; 书签管理' },
        { href: './categories.html',    label: '&#128218; 分类管理' },
        { href: './import-export.html', label: '&#128230; 导入/导出' },
        { href: './oss-config.html',    label: '&#9729;&#65039; OSS 配置' },
        { href: './sync.html',          label: '&#128260; 同步状态' }
    ];

    // ── 私有方法 ─────────────────────────────────────────────

    /**
     * 生成顶部 Navbar HTML 字符串
     * @returns {string}
     */
    function _buildNavbarHtml() {
        return '<nav class="admin-navbar">' +
            '<div class="admin-navbar-left">' +
                '<a href="../index.html" class="admin-logo">' +
                    '<img src="../assets/images/logo@2x.png" height="28" alt="WebStack">' +
                '</a>' +
                '<span class="admin-title">管理面板</span>' +
            '</div>' +
            '<div class="admin-navbar-right">' +
                '<a href="../index.html" class="admin-back-link">' +
                    '<i class="linecons-arrow-left"></i> 返回主页' +
                '</a>' +
            '</div>' +
        '</nav>';
    }

    /**
     * 生成左侧 Sidebar HTML 字符串（不含 active 状态）
     * @param {Array} [config] 可选，默认使用 NAV_CONFIG
     * @returns {string}
     */
    function _buildSidebarHtml(config) {
        var items = config || NAV_CONFIG;
        var liHtml = '';
        for (var i = 0; i < items.length; i++) {
            liHtml += '<li class="admin-tab">' +
                '<a href="' + items[i].href + '">' + items[i].label + '</a>' +
            '</li>';
        }
        return '<div class="admin-sidebar">' +
            '<ul class="admin-tabs">' +
                liHtml +
            '</ul>' +
        '</div>';
    }

    /**
     * 根据 window.location.pathname 为匹配菜单项的 <li> 添加 active 类
     */
    function _setActive() {
        var pathname = window.location.pathname;
        // 提取当前文件名（最后一个 / 之后的部分）
        var currentFile = pathname.split('/').pop();

        $('.admin-sidebar .admin-tabs .admin-tab').each(function () {
            var $li = $(this);
            var href = $li.find('a').attr('href') || '';
            // 提取菜单项文件名
            var itemFile = href.split('/').pop();
            if (itemFile && currentFile && itemFile === currentFile) {
                $li.addClass('active');
            } else {
                $li.removeClass('active');
            }
        });
    }

    /**
     * 将 Navbar 和 Sidebar 注入页面，然后设置激活状态
     */
    function _inject() {
        // 将 Navbar prepend 到 body 最顶部
        $('body').prepend(_buildNavbarHtml());

        // 将 Sidebar prepend 到 .admin-container 最前面
        var $container = $('.admin-container');
        if ($container.length === 0) {
            console.warn('[AdminNav] .admin-container 不存在，跳过 Sidebar 注入。');
        } else {
            $container.prepend(_buildSidebarHtml());
        }

        // 注入完成后设置激活状态
        _setActive();
    }

    // ── 初始化 ───────────────────────────────────────────────
    $(document).ready(function () {
        _inject();
    });

    // ── 对外暴露（供测试使用）───────────────────────────────
    return {
        NAV_CONFIG: NAV_CONFIG,
        _buildNavbarHtml: _buildNavbarHtml,
        _buildSidebarHtml: _buildSidebarHtml,
        _setActive: _setActive
    };

}(jQuery));

window.AdminNav = AdminNav;
