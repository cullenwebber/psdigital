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
