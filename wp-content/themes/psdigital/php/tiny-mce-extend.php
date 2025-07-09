<?php

/**
 * When a user selects one of the custom styles from the dropdown menu,
 * the corresponding class (e.g. is-h1, is-h2, etc.) is applied to the selected heading.
 */
function sd_allow_custom_classes_to_be_applied_to_headings($init_array)
{
    $titles = ['Heading 1', 'Heading 2', 'Heading 3', 'Heading 4', 'Heading 5', 'Heading 6', 'Supertitle', 'Larger Paragraph'];
    $headings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'supertitle', 'larger-paragraph'];
    $style_formats = array();

    foreach ($headings as $index => $heading) {
        $style_formats[] = array(
            'title' => "$titles[$index]",
            'selector' => 'h1,h2,h3,h4,h5,h6,span,p,.supertitle,larger-paragraph',
            'attributes' => array('class' => "is-$heading")
        );
    }

    // Configure the font dropdown menu
    $font_formats = [
        'Fraunces=Fraunces,serif',
        'Questrial=Questrial,sans-serif',
        'Arial=Arial,Helvetica,sans-serif',
        'Georgia=Georgia,serif',
        'Times New Roman=Times New Roman,Times,serif',
        'Verdana=Verdana,Geneva,sans-serif'
    ];

    // Configure custom color palette
    $custom_colors = [
        'FBFBFB',
        'White',
        '121212',
        'Black',
        '12448F',
        'Dark Blue',
        '009E61',
        'Green',
        'B4FFB0',
        'Pale Green'
    ];

    $init_array['font_formats'] = implode(';', $font_formats);
    $init_array['style_formats'] = json_encode($style_formats);
    $init_array['textcolor_map'] = json_encode($custom_colors);

    return $init_array;
}
add_filter('tiny_mce_before_init', 'sd_allow_custom_classes_to_be_applied_to_headings');
