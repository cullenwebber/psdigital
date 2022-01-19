<?php

/**
 * Add your block name here to register it
 */
function get_acf_blocks() {
    return [
        // "Title",
        // "Left Text Image",
        // "Right Text Image"
    ];
}

add_action('acf/init', 'sd_init_acf_blocks');
function sd_init_acf_blocks() {
    if (! function_exists('acf_register_block_type')) {
        return;
    }
    
    // Get the blocks from the function
    $acf_blocks = get_acf_blocks();

    if (empty($acf_blocks)) {
        return;
    }
    
    // Loop through and register each block
    foreach ($acf_blocks as $block_name) {
        acf_register_block_type(array (
            'name'              => strtolower($block_name),
            'title'             => __($block_name),
            'description'       => __('Displays a custom Start Digital block'),
            'render_template'   => __DIR__ . "/" . strtolower(str_replace(" ", "-", $block_name)) . '.php',
            'category'          => ['Start Digital', 'Custom'],
        ));

    }
}