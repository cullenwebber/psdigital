<?php

use Timber\Timber;

function get_team_posts($limit = -1)
{
    $args = array(
        'post_type' => 'team',
        'posts_per_page' => $limit,
        'orderby' => 'menu_order',
        'order' => 'ASC',
    );

    return Timber::get_posts($args);
}

function get_featured_projects()
{
    $group = get_field('projects');
    $featured_projects = $group ? $group['featured_projects'] : null;
    return Timber::get_posts($featured_projects);
}

function get_testimonials($limit = -1)
{
    $args = array(
        'post_type' => 'testimonial',
        'posts_per_page' => $limit,
        'orderby' => 'menu_order',
        'order' => 'ASC',
    );

    return Timber::get_posts($args);
}

function get_projects($limit = -1, $page = 1, $category = null)
{
    $args = array(
        'post_type' => 'projects',
        'posts_per_page' => $limit,
        'orderby' => 'menu_order',
        'order' => 'ASC',
    );

    if ($limit > 0) {
        $args['paged'] = $page;
    }

    if ($category && $category !== 'all') {
        $args['tax_query'] = array(
            array(
                'taxonomy' => 'category',
                'field' => 'slug',
                'terms' => $category,
            ),
        );
    }

    return Timber::get_posts($args);
}

function get_project_categories()
{

    $args = array(
        'taxonomy' => 'category',
        'hide_empty' => true,
        'post_type' => 'projects'
    );

    return Timber::get_terms($args);
}
