<?php

// Custom media field
function custom_media_add_media_custom_field($form_fields, $post)
{
    $screen_sizes = array('desktop', 'mobile');

    $html = "";
    foreach ($screen_sizes as $size) {
        $field_value = get_post_meta($post->ID, "bg_pos_{$size}", true);
        $disabled = ($field_value && $field_value != '50% 50%') ? '' : 'style="display:none"';
        $label = ($field_value && $field_value != '50% 50%') ? 'Change' : 'Set';
        $size_text = ($field_value && $field_value != '50% 50%') ? "<b>{$size}</b>: {$field_value}" : "<b>{$size}</b>: Centered (default)";
        $field_value = ($field_value) ? $field_value : '50% 50%';

        $html .= "
            <input type='hidden' value='{$field_value}' id='bg_pos_{$size}_id' name='attachments[{$post->ID}][bg_pos_{$size}]' data-attachment-id='$post->ID'>
            <div class='focusp_label_holder'>
                <div id='{$size}_value'>{$size_text}</div>
                <input type='button' class='button button-small' value='{$label}' id='label_{$size}' onclick='setFocus(\"{$size}\")'>
                <span class='close button button-small' id='reset_{$size}' {$disabled} onclick='resetFocus(\"{$size}\")'>Reset</span>
            </div>
        ";
    }

    $html .= "
        <div class='overlay image_focus_point'>
            <div class='img-container'>
                <div class='header'>
                    <div class='wrapper'>
                        <h3>Click on the image to set the focus point</h3>
                        <div class='controls'>
                            <span class='button button-secondary' onclick='cancelFocus()'>Cancel</span>
                            <span class='button button-primary' onclick='closeOverlay(event)'>Save</span>
                        </div>
                    </div>
                </div>
                <div class='container'>
                    <div class='pin'></div>
                    <img src='" . wp_get_attachment_url($post->ID) . "'>
                </div>
            </div>
        </div>
    ";

    $form_fields['background_position'] = array(
        'value' => '',
        'label' => __('Focus Point'),
        'helps' => __(''),
        'input' => 'html',
        'html' => $html
    );

    return $form_fields;
}
add_filter('attachment_fields_to_edit', 'custom_media_add_media_custom_field', null, 2);

function update_attachment_bg_position()
{
    $attachment_id = $_POST['attachment_id'];
    $bg_pos_desktop = $_POST['bg_pos_desktop'];
    $bg_pos_mobile = $_POST['bg_pos_mobile'];

    update_post_meta($attachment_id, "bg_pos_desktop", $bg_pos_desktop);
    update_post_meta($attachment_id, "bg_pos_mobile", $bg_pos_mobile);

    echo 'success';
    wp_die(); // this is required to terminate immediately and return a proper response
}

add_action('wp_ajax_update_attachment_bg_position', 'update_attachment_bg_position');
add_action('wp_ajax_nopriv_update_attachment_bg_position', 'update_attachment_bg_position');


// Apply filter in frontend to object-position
function filter_gallery_img_atts($atts, $attachment)
{
    $screen_sizes = array('desktop', 'mobile');
    $bg_pos_styles = array();

    foreach ($screen_sizes as $size) {
        $bg_pos = get_post_meta($attachment->ID, "bg_pos_{$size}", true);

        if ($bg_pos != "") {
            $bg_pos_styles[] = "@media ({$size}) {object-position: {$bg_pos};}";
        }
    }

    if (!empty($bg_pos_styles)) {
        $atts['style'] = implode(' ', $bg_pos_styles);
    }

    return $atts;
}
add_filter('wp_get_attachment_image_attributes', 'filter_gallery_img_atts', 10, 2);


//enqueue script in admin
function image_bg_admin_scripts()
{
    $file_path = __DIR__;
    $url_path = str_replace($_SERVER['DOCUMENT_ROOT'], '', $file_path);
    wp_enqueue_style('image-bg-css', $url_path . '/image-focal-point.css');
    wp_enqueue_script('image-bg-js', $url_path . '/image-focal-point.js', array(), '');
}

add_action('admin_enqueue_scripts', 'image_bg_admin_scripts');

/**
 * Get an attachment ID given a URL.
 * Better than the inbuilt method. Used in partial/image.twig
 * Taken from https://wpscholar.com/blog/get-attachment-id-from-wp-image-url/
 *
 * @param string $url
 *
 * @return int Attachment ID on success, 0 on failure
 */
function get_attachment_id($url)
{

    $attachment_id = 0;

    $dir = wp_upload_dir();

    if (false !== strpos($url, $dir['baseurl'] . '/')) { // Is URL in uploads directory?
        $file = basename($url);

        $query_args = array(
            'post_type'   => 'attachment',
            'post_status' => 'inherit',
            'fields'      => 'ids',
            'meta_query'  => array(
                array(
                    'value'   => $file,
                    'compare' => 'LIKE',
                    'key'     => '_wp_attachment_metadata',
                ),
            )
        );

        $query = new WP_Query($query_args);

        if ($query->have_posts()) {

            foreach ($query->posts as $post_id) {

                $meta = wp_get_attachment_metadata($post_id);

                $original_file = basename($meta['file']);
                $cropped_image_files = wp_list_pluck($meta['sizes'], 'file');

                if ($original_file === $file || in_array($file, $cropped_image_files)) {
                    $attachment_id = $post_id;
                    break;
                }
            }
        }
    }

    return $attachment_id;
}
