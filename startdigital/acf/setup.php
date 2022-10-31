<?php

/**
 * Only allow users to select our custom ACF blocks on pages
 *
 * @return String[] $allowed_block_types
 */
function sd_allow_only_acf_blocks($allowed_block_types, $editor_context) {
    if ( ! empty( $editor_context->post ) ) {
        // Put any core block we want to allow here
        $allowed_block_types = [];

        $acf_dir = __DIR__ . "/*";
        foreach(glob($acf_dir) as $acf_file) {
            if (str_ends_with($acf_file, 'setup.php')) {
                continue;
            }

            $filename = basename($acf_file, ".php");
            $allowed_block_types[] = "acf/" . str_replace('_', '-', $filename);
        }

        return $allowed_block_types;
    }

    return $allowed_block_types;
}
add_filter('allowed_block_types_all', 'sd_allow_only_acf_blocks', 10, 2);
