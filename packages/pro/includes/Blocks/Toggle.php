<?php

namespace Tableberg\Pro\Blocks;

use Tableberg\Utils\Utils;

/**
 *
 *@package Tableberg_pro 
 */

class Toggle
{

    public function __construct()
    {
        add_action("init", [$this, "register_block"]);
    }

    public function render_toggle_block($attributes, $content)
    {
        $alignment_class = isset($attributes['alignment']) ? $attributes['alignment'] : 'left';
        $gap = isset($attributes['gap']) ? Utils::get_spacing_css_single($attributes['gap']) : '0';
        $borderRadius = isset($attributes['tabBorderRadius']) ? Utils::get_spacing_css_single($attributes['tabBorderRadius']) : '0';
        $activeBackground = isset($attributes['activeTabBackgroundColor']) ? $attributes['activeTabBackgroundColor'] : '#ffffff';
        $inactiveBackground = isset($attributes['inactiveTabBackgroundColor']) ? $attributes['inactiveTabBackgroundColor'] : '#f0f0f0';
        $activeText = isset($attributes['activeTabTextColor']) ? $attributes['activeTabTextColor'] : '#ffffff';
        $inactiveText = isset($attributes['inactiveTabTextColor']) ? $attributes['inactiveTabTextColor'] : '#333333';

        $output = '<div
            class="tab-block"
            data-active-background-color="' . esc_attr($activeBackground) . '"
            data-active-color="' . esc_attr($activeText) . '"
            data-background-color="' . esc_attr($inactiveBackground) . '"
            data-color="' . esc_attr($inactiveText) . '"
        >';
        $output .= '<nav
            class="tab-headings ' . esc_attr($alignment_class) . '"
            style="margin-bottom: ' . esc_attr($gap) . ';"
        >';

        $defaultActiveTabIndex = $attributes['defaultActiveTabIndex'];

        foreach ($attributes["tabs"] as $index => $title) {
            $activeClass = ((int)$index === (int) $defaultActiveTabIndex) ? 'active' : '';

            $output .= '<div
                    class="tab-heading ' . esc_attr($activeClass) . '"
                    data-index="' . esc_attr($index) .  '"
                    style="border-radius: ' . esc_attr($borderRadius) . ';"
                >
                    <p>' . esc_html($title) . "</p>
                </div>";
        }

        $output .= "</nav>";

        $output .= '<div class="tab-content" style="display:block;">';
        $output .= $content;
        $output .= '</div>';

        $output .= '</div>';

        return $output;
    }

    public function register_block()
    {
        $json = TABLEBERG_PRO_DIR_PATH . 'dist/blocks/toggle/block.json';
        $attrs = json_decode(file_get_contents($json), true)['attributes'];

        register_block_type_from_metadata(
            $json,
            [
                "attributes" => $attrs,
                "render_callback" => [$this, "render_toggle_block"]
            ]
        );
    }
}
