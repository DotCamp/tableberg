<?php

namespace Tableberg\Pro\Blocks;

use Tableberg\Pro\Common;
use Tableberg\Pro\Defaults;
use Tableberg\Utils\HtmlUtils;
use Tableberg\Utils\Utils;

/**
 * Register Styled list item
 *
 * @package Tableberg_Pro
 */

/**
 * Manage Styled list item registration.
 */
class StyledListItem
{

	/**
	 * Constructor
	 *
	 * @return void
	 */
	public function __construct()
	{
		add_action('init', array($this, 'styled_list_item_block_registration'));
	}
	/**
	 * Get block styles.
	 *
	 * @param array $attributes - block attributes.
	 * @return string Generated CSS styles.
	 */
	public static function get_styles($attributes)
	{
		$styles = array(
			'color' => $attributes['textColor'] ?? '',
			'--tableberg-styled-list-icon-color' => $attributes['iconColor'] ?? '',
			'--tableberg-styled-list-icon-size' => $attributes['iconSize'] ?? '',
			'--tableberg-styled-list-icon-spacing' => Utils::get_spacing_css_single($attributes['iconSpacing'] ?? ''),
		);

		return Utils::generate_css_string($styles);
	}
	/**
	 * Renders the block on the server.
	 *
	 * @param array    $attributes The block attributes.
	 * @param string   $contents    The block content.
	 * @param WP_Block $block      The block object.
	 * @return string Returns the HTML content for the custom cell block.
	 */
	public function tableberg_render_styled_list_item_block($attributes, $contents, $block)
	{
		$item_text = isset($attributes['text']) ? $attributes['text'] : '';
		$styles = $this->get_styles($attributes);
		$icon = Common::get_icon_svg($attributes);
		if (!$icon) {
			$icon = '::__TABLEBERG_STYLED_LIST_ICON__::';
		}

		$contents = HtmlUtils::append_attr_value($contents, 'div', 'tableberg-inner-list-holder', 'class');

		return
			'<li style="' . $styles . '">
			    <div class="tableberg-list-item-inner">
				    <div class="tableberg-list-icon">' . $icon . '</div>
					<div class="tableberg-list-text">' . wp_kses_data($item_text) . '</div>
				</div>
				' . $contents . '
			</li>';
	}

	/**
	 * Register the block.
	 */
	public function styled_list_item_block_registration()
	{
		$json =
			TABLEBERG_PRO_DIR_PATH . 'dist/blocks/styled-list/styled-list-item/block.json';
		$attrs = json_decode(file_get_contents($json), true)['attributes'];

		register_block_type_from_metadata(
			$json,
			[
				'attributes' => $attrs,
				'render_callback' => array($this, 'tableberg_render_styled_list_item_block'),
			]
		);
	}
}
