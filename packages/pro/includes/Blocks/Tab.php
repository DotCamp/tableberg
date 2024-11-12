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
        $activeColor = isset($attributes['activeColor']) ? $attributes['activeColor'] : '#0000ff';
        $inactiveColor = isset($attributes['inactiveColor']) ? $attributes['inactiveColor'] : '#cccccc';
        $activeBackground = isset($attributes['activeBackground']) ? $attributes['activeBackground'] : '#ffffff';
        $inactiveBackground = isset($attributes['inactiveBackground']) ? $attributes['inactiveBackground'] : '#f0f0f0';
        $activeText = isset($attributes['activeText']) ? $attributes['activeText'] : '#ffffff';
        $inactiveText = isset($attributes['inactiveText']) ? $attributes['inactiveText'] : '#333333';


        $output = '<div class="tab-block" style="
        --tab-active-color: ' . esc_attr($activeColor) . ';
        --tab-inactive-background-color: ' . esc_attr($inactiveBackground) . ';
        --tab-active-background-color: ' . esc_attr($activeBackground) . ';
        --tab-active-text-color: ' . esc_attr($activeText) . ';
        --tab-inactive-text-color: ' . esc_attr($inactiveText) . ';
        --tab-inactive-color: ' . esc_attr($inactiveColor)  . ';">';

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
