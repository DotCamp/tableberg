<?php

namespace Tableberg\Pro\Blocks;

/**
 *
 *@package Tableberg_pro 
 */

class Tab
{

    public function __construct()
    {
        add_action("init", [$this, "register_block"]);
    }


    function getSpacingCss($spacing)
    {
        if (strpos($spacing, 'var:preset|spacing|') === 0) {

            $value = substr($spacing, strrpos($spacing, '|') + 1);

            return 'var(--wp--preset--spacing--' . esc_attr($value) . ')';
        }


        return esc_attr($spacing);
    }

    public function render_tab_block($attributes, $content)
    {
        $alignment_class = isset($attributes['alignment']) ? $attributes['alignment'] : 'left';
        $gap_style = isset($attributes['gap']) ? 'margin-bottom:' . $this->getSpacingCss($attributes['gap'])  : '';


        $output = '<div class="tab-block">';

        $output .= '<nav class="tab-headings ' . esc_attr($alignment_class) . '" style="' . $gap_style . '">';

        foreach ($attributes["tabs"] as $headings) {
            $output .= '<div class="tab-heading"><p>' . esc_html($headings["title"]) . "</p></div>";
        }

        $output .= "</nav>";


        $output .= $content;

        $output .= '</div>';

        return $output;
    }


    public function register_block()
    {
        $json = TABLEBERG_PRO_DIR_PATH . 'dist/blocks/tab/block.json';
        $attrs = json_decode(file_get_contents($json), true)['attributes'];

        register_block_type_from_metadata(
            $json,
            [
                "attributes" => $attrs,
                "render_callback" => [$this, "render_tab_block"]
            ]
        );
    }
}
