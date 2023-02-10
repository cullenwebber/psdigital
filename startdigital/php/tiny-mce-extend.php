<?php

/**
 * Adds the custom TinyMCE field to the WordPress WYSIWYG editor
 */
function sd_add_custom_dropdown_to_mce($buttons) {
    array_unshift($buttons, 'styleselect');
    return $buttons;
}
add_filter('mce_buttons_2', 'sd_add_custom_dropdown_to_mce');

/**
 * When a user selects one of the custom styles from the dropdown menu,
 * the corresponding class (e.g. is-h1, is-h2, etc.) is applied to the selected heading.
 */
function sd_allow_custom_classes_to_be_applied_to_headings($init_array) {
    $headings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    $style_formats = array();

    foreach ($headings as $heading) {
        $style_formats[] = array(
            'title' => "Looks like $heading",
            'selector' => 'h1,h2,h3,h4,h5,h6,span',
            'classes' => "is-$heading"
        );
    }

    // Also add one for buttons
    $style_formats[] = array(
        'title' => "Looks like a button",
        'selector' => 'a',
        'classes' => "is-button"
    );

    // Insert the array, JSON ENCODED, into 'style_formats'
    $init_array['style_formats'] = json_encode( $style_formats );

    return $init_array;

}
add_filter('tiny_mce_before_init', 'sd_allow_custom_classes_to_be_applied_to_headings');
