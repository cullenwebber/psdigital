<?php


use Timber\Timber;

/**
 * Gravity Forms customizations: disable default CSS & convert submit inputs to <button>
 */
class GravityFormsCustomisation
{
    /**
     * Initialize hooks.
     */
    public function __construct()
    {
        add_filter('gform_disable_css', [$this, 'disable_css']);
        add_filter('gform_submit_button_1', [$this, 'input_to_button'], 10, 2);
    }

    /**
     * Disable Gravity Forms default CSS.
     *
     * @return bool Always true to disable GF CSS.
     */
    public function disable_css()
    {
        return true;
    }

    /**
     * Convert the form submit <input> into a <button> element.
     *
     * @param string $button The original HTML for the input.
     * @param array  $form   The GF form object.
     * @return string Modified HTML for a <button>.
     */
    public function input_to_button($button, $form)
    {
        // Parse the input HTML into a fragment
        $fragment = WP_HTML_Processor::create_fragment($button);
        $fragment->next_token();

        // Base attributes to carry over
        $attributes = ['id', 'type', 'class', 'onclick'];
        // Include any data- attributes
        $data_attributes = $fragment->get_attribute_names_with_prefix('data-');
        if (! empty($data_attributes)) {
            $attributes = array_merge($attributes, $data_attributes);
        }

        // Build the new attribute string
        $new_attributes = [];
        foreach ($attributes as $attribute) {
            $value = $fragment->get_attribute($attribute);
            if (! empty($value)) {
                $new_attributes[] = sprintf(
                    '%s="%s"',
                    $attribute,
                    esc_attr($value)
                );
            }
        }

        // Return the <button> markup
        return sprintf(
            '<button %s><span>%s</span></button>',
            implode(' ', $new_attributes),
            'Send Message'
        );
    }
}

// Instantiate to register hooks
new GravityFormsCustomisation();
