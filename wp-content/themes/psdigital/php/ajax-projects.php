<?php

use Timber\Timber;

function load_projects_ajax()
{
    // Verify nonce for security
    if (!wp_verify_nonce($_POST['nonce'], 'load_projects_nonce')) {
        wp_die('Security check failed');
    }

    $page = intval($_POST['page']);
    $category = sanitize_text_field($_POST['category']);
    $posts_per_page = 6; // Adjust as needed

    $args = array(
        'post_type' => 'projects',
        'posts_per_page' => $posts_per_page,
        'paged' => $page,
        'orderby' => 'menu_order',
        'order' => 'ASC',
    );

    // Add category filter if specified
    if (!empty($category) && $category !== 'all') {
        $args['tax_query'] = array(
            array(
                'taxonomy' => 'category',
                'field' => 'slug',
                'terms' => $category,
            ),
        );
    }

    $projects = Timber::get_posts($args);
    $total_posts = wp_count_posts('projects')->publish;

    // Get total posts for current category if filtering
    if (!empty($category) && $category !== 'all') {
        $term = get_term_by('slug', $category, 'category');
        if ($term) {
            $total_posts = $term->count;
        }
    }

    $has_more = ($page * $posts_per_page) < $total_posts;

    $context = array(
        'projects' => $projects
    );

    // Render the template with context
    $html = Timber::compile('partials/projects/project-block.twig', $context);

    wp_send_json_success(array(
        'html' => $html,
        'has_more' => $has_more,
        'current_page' => $page,
        'total_posts' => $total_posts
    ));
}

add_action('wp_ajax_load_projects', 'load_projects_ajax');
add_action('wp_ajax_nopriv_load_projects', 'load_projects_ajax');
