<?php

namespace Tableberg\Pro\Blocks;

use Tableberg\Utils\Utils;

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

    public function render_tab_block($attributes, $content)
    {
        $alignment_class = isset($attributes['alignment']) ? $attributes['alignment'] : 'left';
        $gap = isset($attributes['gap']) ? Utils::get_spacing_css_single($attributes['gap']) : '0';
        $borderRadius = isset($attributes['tabBorderRadius']) ? Utils::get_spacing_css_single($attributes['tabBorderRadius']) : '0';
        $activeTabIndicatorColor = isset($attributes['activeTabIndicatorColor']) ? $attributes['activeTabIndicatorColor'] : '#0000ff';
        $inactiveColor = isset($attributes['inactiveTabBackgroundColor']) ? $attributes['inactiveTabBackgroundColor'] : '#cccccc';
        $activeBackground = isset($attributes['activeTabBackgroundColor']) ? $attributes['activeTabBackgroundColor'] : '#ffffff';
        $inactiveBackground = isset($attributes['inactiveTabBackgroundColor']) ? $attributes['inactiveTabBackgroundColor'] : '#f0f0f0';
        $activeText = isset($attributes['activeTabTextColor']) ? $attributes['activeTabTextColor'] : '#ffffff';
        $inactiveText = isset($attributes['inactiveTabTextColor']) ? $attributes['inactiveTabTextColor'] : '#333333';


        // Construct the outer container with updated CSS variables
        $output = '<div class="tab-block" style="
        --tableberg-tab-gap: ' . esc_attr($gap) . ';
        --tableberg-tab-border-radius: ' . esc_attr($borderRadius) . ';
        --tableberg-tab-active-indicator-color: ' . esc_attr($activeTabIndicatorColor) . ';
        --tableberg-tab-inactive-background-color: ' . esc_attr($inactiveBackground) . ';
        --tableberg-tab-active-background-color: ' . esc_attr($activeBackground) . ';
        --tableberg-tab-active-text-color: ' . esc_attr($activeText) . ';
        --tableberg-tab-inactive-text-color: ' . esc_attr($inactiveText) . ';
        --tableberg-tab-inactive-color: ' . esc_attr($inactiveColor) . ';
    ">';

        // Add the tab headings with alignment and gap styles
        $output .= '<nav class="tab-headings ' . esc_attr($alignment_class) . '">';
        foreach ($attributes["tabs"] as $headings) {
            $output .= '<div class="tab-heading"><p>' . esc_html($headings["title"]) . "</p></div>";
        }
        $output .= "</nav>";

        // Append content and close the outer container
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
