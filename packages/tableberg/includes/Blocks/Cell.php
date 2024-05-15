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
		add_action('init', array($this, 'block_registration'));
	}



	private static function getStyles($attributes) {
		$styles = [
			'background' => Utils::get_any($attributes, 'bgGradient', 'background'),
		];
		return Utils::generate_css_string($styles);
	}

	/**
	 * Renders the custom cell block on the server.
	 *
	 * @param array    $attributes The block attributes.
	 * @param string   $content    The block content.
	 * @param \WP_Block $block      The block object.
	 * @return string Returns the HTML content for the custom cell block.
	 */
	public function render_tableberg_cell_block($attributes, $content, $block)
	{
		if (isset($attributes['isTmp']) && $attributes['isTmp']) {
			return '';
		}
		$pre = '';
		$post = '';
		if (is_null(Table::$lastRow)) {
			Table::$lastRow = $attributes['row'];
			$pre = '<tr>';
		} else if (Table::$lastRow != $attributes['row']) {
			$pre = '</tr><tr>';
			Table::$lastRow = $attributes['row'];
		}
		$colspan = isset($attributes['colspan']) ? $attributes['colspan'] : 1;
		$rowspan = isset($attributes['rowspan']) ? $attributes['rowspan'] : 1;

		$attrs_str = 'data-tableberg-row="'.$attributes['row'].'" data-tableberg-col="'.$attributes['col'].'"';
		$classes = 'tableberg-v-align-'.$attributes['vAlign'];

		// Add colspan attribute if it's greater than 1
		if ($colspan > 1) {
			$attrs_str .= ' colspan="' . esc_attr($colspan) . '"';
		}

		// Add rowspan attribute if it's greater than 1
		if ($rowspan > 1) {
			$attrs_str .= ' rowspan="' . esc_attr($rowspan) . '"';
		}

		$tagName = isset($attributes['tagName']) ? $attributes['tagName'] : 'td';

		$content = HtmlUtils::append_attr_value($content, $tagName, self::getStyles($attributes), 'style');

		$content = HtmlUtils::append_attr_value($content, $tagName, ' '.$classes, 'class');

		$content = HtmlUtils::add_attrs_to_tag($content, $tagName, $attrs_str);

		return $pre . $content . $post;
	}

	/**
	 * Register the block.
	 */
	public function block_registration()
	{
		$defaults = new \Tableberg\Defaults();
		register_block_type(
			TABLEBERG_DIR_PATH . 'build/cell/block.json',
			array(
				'attributes' => $defaults->get_default_attributes('tableberg/cell'),
				'render_callback' => array($this, 'render_tableberg_cell_block'),
			)
		);
	}
}
