<?php

namespace Tableberg\Pro\Blocks;

use Tableberg\Pro\Common;
use Tableberg\Utils\Utils;

class Ribbon
{


    public function __construct()
    {
        add_action('init', array($this, 'block_registration'));
    }

    private static function render_bookmark(array $attributes): string
    {
        $ind = $attributes['individual'];
        $style = Utils::generate_css_string([
            "color" => $attributes["color"] ?? '',
            "font-size" => $attributes["fontSize"] ?? '',
            "height" => $ind["height"],
            "width" => $ind["width"],
            $ind["originX"] => $ind["x"],
            $ind["originY"] => $ind["y"],
        ]);

        $contentStyle = Utils::generate_css_string(Utils::get_spacing_style($ind['padding'] ?? [], 'padding') + [
            'background' => Utils::get_any($attributes, 'bgGradient', 'background')
        ]);

        $content = '<div class="tableberg-ribbon-bookmark-content" style="' . $contentStyle . '">' . $attributes['text'] . '</div>';

        return '<div class="tableberg-ribbon tableberg-ribbon-bookmark" style="' . $style . '">' . $content . '</div>';
    }

    private static function render_corner(array $attributes): string
    {
        $ind = $attributes['individual'];
        $style = Utils::generate_css_string([
            "color" => $attributes["color"] ?? '',
            "font-size" => $attributes["fontSize"] ?? '',
            "height" => "calc( 2 * {$ind['distance']})",
            "width" => "calc( 2 * {$ind['distance']})",
            $ind["side"] => "-3px"
        ]);

        $contentStyle = Utils::generate_css_string([
            'background' => Utils::get_any($attributes, 'bgGradient', 'background')
        ]);

        $content = '<div class="tableberg-ribbon-corner-' . esc_attr($ind['side']) . '"><div class="tableberg-ribbon-corner-text" style="' . $contentStyle . '">' . esc_html($attributes['text']) . '</div></div>';

        return '<div class="tableberg-ribbon tableberg-ribbon-corner" style="' . $style . '">' . $content . '</div>';
    }

    private static function render_side(array $attributes): string
    {
        $ind = $attributes['individual'];
        $style = Utils::generate_css_string([
            "color" => $attributes["color"] ?? '',
            "font-size" => $attributes["fontSize"] ?? '',
            $ind["originY"] => $ind["y"],
            $ind["side"] => "-20px"
        ]);

        $contentStyle = Utils::generate_css_string(
            Utils::get_spacing_style($ind['padding'] ?? [], 'padding') +
            Utils::get_border_style($ind['border'] ?? []) +
            [
                'background' => Utils::get_any($attributes, 'bgGradient', 'background')
            ]
        );

        $content = '<div class="tableberg-ribbon-side-content" style="' . $contentStyle . '">' . esc_html($attributes['text']) . '</div>';

        return '<div class="tableberg-ribbon tableberg-ribbon-side tableberg-ribbon-side-' . esc_attr($ind['side']) . '" style="' . $style . '">' . $content .
            '<div class="tableberg-ribbon-side-shadow"></div></div>';
    }


    private static function render_badge(array $attributes): string
    {
        $ind = $attributes['individual'];

        $position = [];

        $translateX = '0px';
        $translateY = '0px';

        if ($ind['originX'] == 'center') {
            if (!$ind["x"]) {
                $ind["x"] = '0px';
            }
            $position['left'] = 'calc(50% + (' . $ind['x'] . '))';
            $translateX = '-50%';
        } else {
            $position[$ind["originX"]] = $ind["x"];
        }

        if ($ind['originY'] == 'center') {
            if (!$ind["y"]) {
                $ind["y"] = '0px';
            }
            $position['top'] = 'calc(50% + (' . $ind['y'] . '))';
            $translateY = '-50%';
        } else {
            $position[$ind["originY"]] = $ind["y"];
        }

        $style = Utils::generate_css_string([
            "color" => $attributes["color"] ?? '',
            "font-size" => $attributes["fontSize"] ?? '',
            "transform" => "translate(" . $translateX . ", " . $translateY . ")" . (isset($ind['rotate']) ? ' rotate(' . $ind['rotate'] . 'deg)' : ''),
        ] + $position);

        $contentStyle = Utils::generate_css_string(
            Utils::get_spacing_style($ind['padding'] ?? [], 'padding') +
            Utils::get_border_radius_style($ind['borderRadius'] ?? []) +
            [
                'background' => Utils::get_any($attributes, 'bgGradient', 'background')
            ]
        );

        $content = '<div class="tableberg-ribbon-badge-content" style="' . $contentStyle . '">' . esc_html($attributes['text']) . '</div>';

        return '<div class="tableberg-ribbon tableberg-ribbon-badge" style="' . $style . '">' . $content .
            '</div>';
    }

    private static function render_icon(array $attributes): string
    {
        $ind = $attributes['individual'];
        $style = Utils::generate_css_string([
            "font-size" => $attributes["fontSize"] ?? '',
            $ind["originX"] => $ind["x"],
            $ind["originY"] => $ind["y"],
        ]);

        $contentStyle = Utils::generate_css_string(Utils::get_spacing_style($ind['padding'] ?? [], 'padding') + [
            'background' => Utils::get_any($attributes, 'bgGradient', 'background'),
            'fill' => $attributes['color'] ?? null
        ]);

        $icon = Common::get_icon_svg($ind, [
            'height' => $ind['size'],
            'width' => $ind['size'],
        ]);

        $content = '<div class="tableberg-shape-' . esc_attr($ind['shape']) . '" style="' . $contentStyle . '">' . $icon . '</div>';

        return '<div class="tableberg-ribbon tableberg-ribbon-icon" style="' . $style . '">' . $content . '</div>';
    }

    public function render_block(array $attributes, $content, $block)
    {
        switch ($attributes['type']) {
            case 'bookmark':
                return self::render_bookmark($attributes);

            case 'corner':
                return self::render_corner($attributes);

            case 'side':
                return self::render_side($attributes);

            case 'badge':
                return self::render_badge($attributes);

            case 'icon':
                return self::render_icon($attributes);

        }

        return 'Unsupported ribbon type';
    }


    public function block_registration()
    {

        $jsonPath = TABLEBERG_PRO_DIR_PATH . 'dist/blocks/ribbon/block.json';
        $attrs = json_decode(file_get_contents($jsonPath), true)['attributes'];

        register_block_type_from_metadata(
            $jsonPath,
            [
                'attributes' => $attrs,
                'render_callback' => array($this, 'render_block'),
            ]
        );
    }
}
