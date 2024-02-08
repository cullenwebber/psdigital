<?php

/**
 * Remove author from oEmbeds
 */
function disableEmbedsFilter($data)
{
    unset($data['author_url']);
    unset($data['author_name']);
    return $data;
}
add_filter('oembed_response_data', 'disableEmbedsFilter');

/**
 * Enable features from Soil when plugin is activated
 * @link https://roots.io/plugins/soil/
 */
add_theme_support('soil', [
    'clean-up',
    'disable-rest-api',
    'disable-asset-versioning',
    'disable-trackbacks',
    'js-to-footer',
    'nav-walker',
    'nice-search',
    'relative-urls'
]);

/**
 * Remove items from admin bar
 */
function removeItemsFromAdminBar(WP_Admin_Bar $menu)
{
    $menu->remove_node('comments'); // Comments
    $menu->remove_node('customize'); // Customize
    $menu->remove_node('dashboard'); // Dashboard
    $menu->remove_node('edit'); // Edit
    $menu->remove_node('menus'); // Menus
    $menu->remove_node('new-content'); // New Content
    $menu->remove_node('search'); // Search
    $menu->remove_node('themes'); // Themes
    $menu->remove_node('updates'); // Updates
    $menu->remove_node('view'); // View
    $menu->remove_node('widgets'); // Widgets
    $menu->remove_node('wp-logo'); // WordPress Logo
}
add_action('admin_bar_menu', 'removeItemsFromAdminBar', 999);

/**
 * Remove items from dashboard
 */
function removeItemsFromDashboard()
{
    remove_meta_box('dashboard_activity', 'dashboard', 'normal'); // Activity
    remove_meta_box('dashboard_site_health', 'dashboard', 'normal'); // Site Health Status
    remove_meta_box('dashboard_primary', 'dashboard', 'side'); // WordPress Events and News
    remove_meta_box('dashboard_quick_press', 'dashboard', 'side'); // Quick Draft
}
add_action('wp_dashboard_setup', 'removeItemsFromDashboard');

/**
 * Use the Favicon as the login screen logo
 */
function faviconAsLoginLogo()
{
    $favicon = get_site_icon_url();

    echo "
        <style type='text/css'>
            body.login div#login h1 a {
                background-image: url('$favicon');
                pointer-events: none;
            }
        </style>
    ";
}
add_action('login_enqueue_scripts', 'faviconAsLoginLogo');

/**
 * Create a Super Admin role
 *
 * @return void
 */
function createSuperAdminRole()
{
    if (!is_null(get_role('super_admin'))) {
        return;
    }

    $capabilities = get_role('administrator')->capabilities;
    add_role('super_admin', 'Super Admin', $capabilities);
}
add_action('admin_init', 'createSuperAdminRole');

/**
 * Assign the Super Admin role to the user with the username 'startdig'
 *
 * @return void
 */
function assignSuperAdminRoleToUser()
{
    $userId = username_exists('startdig');

    if (!$userId) {
        return;
    }

    $user = new WP_User($userId);

    if (in_array('super_admin', $user->roles)) {
        return;
    }

    $user->set_role('super_admin');
}
add_action('admin_init', 'assignSuperAdminRoleToUser');

/**
 * Remove ability to edit themes and plugins from all roles except 'super_admin'
 *
 * @return void
 */
function removeThemeAndPluginEditCapabilities()
{
    global $wp_roles;
    if (!isset($wp_roles)) $wp_roles = new WP_Roles();

    $roles = $wp_roles->get_names();

    foreach ($roles as $role => $r) {
        if ($role === 'super_admin') continue;

        $role = get_role($role);

        $role->remove_cap('edit_themes');
        $role->remove_cap('install_plugins');
        $role->remove_cap('edit_plugins');
        $role->remove_cap('update_plugins');
        $role->remove_cap('delete_plugins');
    }
}
add_action('init', 'removeThemeAndPluginEditCapabilities');

/**
 * Add GTM to the header
 */
function addGtmToHead()
{
    $id = get_field('google_tag_manager_id');

    if (!$id) {
        return;
    }

    return <<<EOD
        <!-- Google Tag Manager -->
        <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer', $id);</script>
        <!-- End Google Tag Manager -->
        EOD;
}
add_action('wp_head', 'addGtmToHead');

/**
 * Add Google Analytics to the header
 */
function addGoogleAnalyticsToHead()
{
    $id = get_field('google_analytics_id');

    if (!$id) {
        return;
    }

    return <<<EOD
        <script async src="https://www.googletagmanager.com/gtag/js?id=$id"></script>
        <script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', $id);
        </script>
    EOD;
}
add_action('wp_head', 'addGoogleAnalyticsToHead');
