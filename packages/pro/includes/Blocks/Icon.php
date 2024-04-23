<?php

namespace Tableberg\Pro\Blocks;

use Tableberg\Pro\Common;
use Tableberg\Utils\Utils;

class Icon
{


    public function __construct()
    {
        add_action('init', array($this, 'block_registration'));
    }


    private static function get_styles(array $attributes): string
    {
        $styles = [
            'justify-content' => $attributes['justify'],
            'background' => Utils::get_any($attributes, 'background', 'bgGradient'),
            '--tableberg-icon-color-hover' => Utils::get_any($attributes, 'colorHover', 'color'),
            '--tableberg-icon-bg-hover' => Utils::get_any($attributes, 'bgGradientHover', 'backgroundHover', 'bgGradient', 'background'),
        ];

        $styles += Utils::get_spacing_style($attributes['padding'] ?? [], 'padding');
        $styles += Utils::get_spacing_style($attributes['margin'] ?? [], 'margin');
        $styles += Utils::get_border_style($attributes['border'] ?? [], );
        $styles += Utils::get_border_radius_style($attributes['borderRadius'] ?? []);

        if (isset($attributes['rotation']) && $attributes['rotation'] > 0) {
            $styles['transform'] = 'rotate(' . $attributes['rotation'] . 'deg)';
        }

        return Utils::generate_css_string($styles);

    }

    public function render_block($attributes, $content, $block)
    {
        $size = $attributes['size'];
        $icon = $attributes['icon'];
        if (isset($icon['type']) && $icon['type'] === 'url') {
            $iconStr = '<img src="' . $icon['url'] . '" style="height: ' . $size . '; width: ' . $size . ';"/>';
        } else {
            $iconAttrs = [
                'height' => $size,
                'width' => $size,
            ];
            if (isset($attributes['color']) && $attributes['color']) {
                $iconAttrs['style'] = 'fill:' . $attributes['color'] . ';';
            }
            $iconStr = Common::get_icon_svg($attributes, $iconAttrs);

        }
        $content = '<div class="tableberg-icon" style="' . self::get_styles($attributes) . '">' . $iconStr . '</div>';
        if (isset($attributes['linkUrl']) && $attributes['linkUrl']) {
            $target = $attributes['linkTarget'] ?? '_self';
            $content = '<a href="' . $attributes['linkUrl'] . '" target="' . $target . '">' . $content . '</a>';
        }
        return $content;
    }


    public function block_registration()
    {

        $jsonPath = TABLEBERG_PRO_DIR_PATH . 'dist/blocks/icon/block.json';
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
