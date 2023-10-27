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
 * Custom logo to login screen
 */
function customLoginLogo()
{
    echo '<style type="text/css">
        body.login div#login h1 a {
            background-image: url(' . get_theme_file_uri('static/start-admin.png') . ');
        }
    </style>';
}
add_action('login_enqueue_scripts', 'customLoginLogo');

/**
 * Enable features from Soil when plugin is activated
 * @link https://roots.io/plugins/soil/
 */
add_theme_support('soil', [
    'clean-up',
    'disable-rest-api',
    'disable-asset-versioning',
    'disable-trackbacks',
    'google-analytics' => 'UA-XXXXX-Y',
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
