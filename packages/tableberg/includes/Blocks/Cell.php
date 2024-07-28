<?php
/**
 * Cell Block
 *
 * @package Tableberg
 */

namespace Tableberg\Blocks;

use Tableberg;
use Tableberg\Utils\HtmlUtils;
use Tableberg\Utils\Utils;

/**
 * Handle the block registration on server side and rendering.
 */
class Cell
{

	/**
	 * Constructor
	 *
	 * @return void
	 */
	public function __construct()
	{
		add_action('init', [$this, 'block_registration']);
	}



	private static function getStyles($attributes)
	{
		$styles = [
			'background' => Utils::get_any($attributes, 'bgGradient', 'background'),
		];
		$blockSpacing = Utils::get_spacing_css_single($attributes['blockSpacing'] ?? '');
		if ($blockSpacing && $blockSpacing[0] != '0') {
			$styles['--tableberg-block-spacing'] = $blockSpacing;
		}
		return Utils::generate_css_string($styles);
	}

	private static function getInnerStyles($attributes){

		$styles = [
			'display' => $attributes['isHorizontal'] ? 'flex': 'block',
			'justify-content' => $attributes['justifyContent'],
			'flex-wrap' => $attributes['wrapItems'] ? 'wrap': 'nowrap',
		];

		return Utils::generate_css_string($styles);
	}

	
	public function render_tableberg_cell_block($attributes, $content, $block)
	{
		if ($attributes['isTmp']) {
			return '';
		}

		$colspan = $attributes['colspan'] ?? 1;
		$rowspan = $attributes['rowspan'] ?? 1;

		$attrs_str = 'data-tableberg-row="' . esc_attr($attributes['row']) . '" data-tableberg-col="' . esc_attr($attributes['col']) . '"';
		$classes = 'tableberg-v-align-' . esc_attr($attributes['vAlign']);

		// Add colspan attribute if it's greater than 1
		if ($colspan > 1) {
			$attrs_str .= ' colspan="' . esc_attr($colspan) . '"';
		}

		// Add rowspan attribute if it's greater than 1
		if ($rowspan > 1) {
			$attrs_str .= ' rowspan="' . esc_attr($rowspan) . '"';
		}

		$tagName = isset($attributes['tagName']) ? esc_attr($attributes['tagName']) : 'td';

		$content = HtmlUtils::append_attr_value($content, $tagName, self::getStyles($attributes), 'style');

		$content = HtmlUtils::append_attr_value($content, $tagName, ' ' . $classes, 'class');

		$content = HtmlUtils::add_attrs_to_tag($content, $tagName, $attrs_str);

		$innerClass = 'tableberg-cell-inner';
		if ($attributes['isHorizontal']) {
			$innerClass .= ' tableberg-cell-horizontal';
		}

		$innerDiv = '<div class="'.$innerClass.'" style="' . self::getInnerStyles($attributes) . '">';

		$content = HtmlUtils::insert_inside_tag($content, $tagName, $innerDiv);
		$content = HtmlUtils::replace_closing_tag($content, $tagName, '</div></'.$tagName.'>');


		Table::$rows[$attributes['row']][$attributes['col']] = $content;

		return '';
	}

	/**
	 * Register the block.
	 */
	public function block_registration()
	{
		$json = TABLEBERG_DIR_PATH . 'build/cell/block.json';
		register_block_type(
			$json,
			[
				'attributes' => json_decode(file_get_contents($json), true)['attributes'],
				'render_callback' => [$this, 'render_tableberg_cell_block'],
			]
		);
	}
}
