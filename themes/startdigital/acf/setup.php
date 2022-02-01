<?php

/**
 * Only allow users to select our custom ACF blocks on pages
 * 
 * @return String[] $allowed_block_types
 */
function sd_allow_only_acf_blocks($allowed_block_types, $editor_context) {
    if ( ! empty( $editor_context->post ) ) { 
        // Put any core block we want to allow here
        $allowed_block_types = ["core/spacer"];

        $acf_dir = __DIR__ . '/acf/*';
        foreach(glob($acf_dir) as $acf_file) {
            $allowed_block_types[] = "acf/$acf_file";
        }

        return $allowed_block_types;
    }

    return $allowed_block_types;
}
add_filter('allowed_block_types_all', 'sd_allow_only_acf_blocks', 10, 2);

/**
 * Make the ACF block editor wider
 */
function sd_make_acf_editor_wider() {
    echo 
    '<style>
    .wp-block {max-width: 1280px;}
    </style>';
}
add_action('admin_head', 'sd_make_acf_editor_wider');
