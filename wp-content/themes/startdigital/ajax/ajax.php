<?php

/**
 * Enqueue the required script
 */
add_action('wp_enqueue_scripts', function () {
    wp_enqueue_script('startdigital-ajax', get_stylesheet_directory_uri() . '/ajax/ajax.js', array('jquery'), filemtime(get_stylesheet_directory() . '/ajax/ajax.js') );
    wp_localize_script('startdigital-ajax', 'sd_ajax', array('ajax_url' => admin_url('admin-ajax.php')));
});

/**
 * Add 'type=module' to the script tag
 */
add_filter('script_loader_tag', function ($tag, $handle, $src) {
    if ('startdigital-ajax' !== $handle) {
        return $tag;
    }
    // change the script tag by adding type="module" and return it.
    $tag = '<script type="module" src="' . esc_url($src) . '"></script>';
    return $tag;
}, 10, 3);

/**
 * Fetch the data
 */
function sd_ajax_fetch() {
    $context = Timber::context();
    $page = $_GET['page'];
    $args = json_decode(str_replace("\\", "", $_GET['query']), true);
    $context['item_template'] = $_GET['item_template'];

    // $args to be dynamically generated from JS call
    $data = Timber::get_posts($args);

    if (empty($data) && $page == 1) {
        wp_send_json_error();
        wp_die();
    }

    // Reset the data array
    $context['items'] = [];

    foreach ($data as $item) {
        $context['items'][] = $item;
    }

    $data = Timber::compile('ajax/items.twig', $context);

    wp_send_json_success(['content' => $data]);
    // wp_send_json_success(['content' => $data, 'count' => count($accessories), 'total' => get_term_by('slug', 'accessories', 'product_cat')->count]);
    wp_die();
}
add_action('wp_ajax_sd_ajax_fetch', 'sd_ajax_fetch');
add_action('wp_ajax_nopriv_sd_ajax_fetch', 'sd_ajax_fetch');
