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
        // add_action("init", [$this, "register_block"]);
    }

    private function generate_tab_contianer_styles($activeBackground, $activeText)
    {
        return '--tableberg-tab-active-background-color: ' . esc_attr($activeBackground) . ';
                        --tableberg-tab-active-text-color: ' . esc_attr($activeText) . ';';
    }

    private function get_border_radius_css($input)
    {
        if (preg_match('/var\(--.*--(\d+)\)/', $input, $matches)) {
            return $matches[1] . 'px';
        }
        return $input;
    }

    private function get_style($gap, $borderRadius, $activeBackground, $activeText, $inactiveBackground, $inactiveText)
    {
        $borderRadiusCss = $this->get_border_radius_css($borderRadius);
        return '<style>
        .tab-headings { margin-bottom: ' . esc_attr($gap) . '; }
        .tab-heading { border-radius: ' . esc_attr($borderRadiusCss) . '; }
        .tab-heading.active {
            background-color: ' . esc_attr($activeBackground) . ';
            color: ' . esc_attr($activeText) . ';
        }
        .tab-heading {
            background-color: ' . esc_attr($inactiveBackground) . ';
            color: ' . esc_attr($inactiveText) . ';
        }
        </style>';
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

        $style = $this->get_style($gap, $borderRadius, $activeBackground, $activeText, $inactiveBackground, $inactiveText);

        $container_styles = $this->generate_tab_contianer_styles($activeBackground, $inactiveBackground, $activeText, $inactiveText, $borderRadius);

        $output = '<div class="tab-block" style="' . esc_attr($container_styles) . '">';
        $output .= $style;
        $output .= '<nav class="tab-headings ' . esc_attr($alignment_class) . '" style="margin-bottom: ' . esc_attr($gap) . ';">';

        $defaultActiveTabIndex = $attributes['defaultActiveTabIndex'];

        foreach ($attributes["tabs"] as $index => $headings) {
            $activeClass = ((int)$index === (int) $defaultActiveTabIndex) ? 'active' : '';

            $output .= '<div class="tab-heading ' . esc_attr($activeClass) . '" data-index="' . esc_attr($index) .  '">
                        <p>' . esc_html($headings["title"]) . "</p>
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
