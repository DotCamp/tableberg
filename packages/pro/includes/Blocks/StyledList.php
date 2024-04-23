<?php

namespace Tableberg\Pro\Blocks;

use Tableberg\Assets;
use Tableberg\Pro\Common;
use Tableberg\Pro\Defaults;
use Tableberg\Utils\HtmlUtils;
use Tableberg\Utils\Utils;

/**
 * Register Styled list
 *
 * @package Tableberg_Pro
 */

/**
 * Manage Styled list registration.
 */
class StyledList
{

	public static int $count = 0;
	/**
	 * Constructor
	 *
	 * @return void
	 */
	public function __construct()
	{
		add_action('init', array($this, 'styled_list_block_registration'));

	}

	/**
	 * Get block styles.
	 *
	 * @param array $attributes - block attributes.
	 * @return string Generated CSS styles.
	 */
	public static function get_styles(array $attributes, string $id, bool $hasIcon)
	{
		$padding = Utils::get_spacing_css(isset($attributes['listSpacing']) ? $attributes['listSpacing'] : []);



		$styles = array(
			'color' => $attributes['textColor'],
			'background' => $attributes['backgroundColor'],
			'padding-top' => $padding['top'] ?? '',
			'padding-right' => $padding['right'] ?? '',
			'padding-left' => $padding['left'] ?? '',
			'padding-bottom' => $padding['bottom'] ?? '',
			'--tableberg-styled-list-icon-color' => $attributes['iconColor'],
			'--tableberg-styled-list-icon-size' => $attributes['iconSize'] . 'px',
			'--tableberg-styled-list-icon-spacing' => Utils::get_spacing_css_single($attributes['iconSpacing']),
			'--tableberg-styled-list-inner-spacing' => Utils::get_spacing_css_single(isset($attributes['listIndent']) ? $attributes['listIndent'] : ''),
		);

		if (isset($attributes['itemSpacing'])) {
			$iSpacing = Utils::get_spacing_css_single($attributes['itemSpacing']);
			if ($iSpacing != '0') {
				Assets::$dynamicStyles .= '#' . $id . ' > li {margin-bottom: ' . $iSpacing . ';}';
			}
		}

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
	public function tableberg_render_styled_list_block($attributes, $contents, $block)
	{

		$icon = Common::get_icon_svg($attributes);
		$contents = str_replace('::__TABLEBERG_STYLED_LIST_ICON__::', $icon, $contents);
		$contents = HtmlUtils::append_attr_value($contents, 'ul', ' tableberg-styled-list', 'class');

		$id = '__tableberg_styled_list_' . self::$count++;

		$contents = HtmlUtils::append_attr_value($contents, 'ul', self::get_styles($attributes, $id, !!$icon), 'style');
		$contents = HtmlUtils::append_attr_value($contents, 'ul', $id, 'id');
		return $contents;
	}

	/**
	 * Register the block.
	 */
	public function styled_list_block_registration()
	{

		$json = TABLEBERG_PRO_DIR_PATH . 'dist/blocks/styled-list/block.json';
		$attrs = json_decode(file_get_contents($json), true)['attributes'];

		register_block_type_from_metadata(
			$json,
			array(
				'attributes' => $attrs,
				'render_callback' => array($this, 'tableberg_render_styled_list_block'),
			)
		);
	}
}