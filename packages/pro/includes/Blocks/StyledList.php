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
	public static function get_styles(array $attributes, string $id)
	{
		$padding = Utils::get_spacing_css(isset($attributes['listSpacing']) ? $attributes['listSpacing'] : []);

		

		$styles = array(
			'color' => $attributes['textColor'],
			'background' => $attributes['backgroundColor'],
			'padding-top' => $padding['top'] ?? '',
			'padding-right' => $padding['right'] ?? '',
			'padding-bottom' => $padding['bottom'] ?? '',
			'--tableberg-styled-list-icon-color' => $attributes['iconColor'],
			'--tableberg-styled-list-icon-size' => $attributes['iconSize'] . 'px',
			'--tableberg-styled-list-icon-spacing' => Utils::get_spacing_css_single($attributes['iconSpacing']),
			'--tableberg-styled-list-inner-spacing' => Utils::get_spacing_css_single(isset($attributes['listIndent']) ? $attributes['listIndent'] : ''),
		);

		$pleft = $padding['left'] ?? '0';

		if ($attributes['isOrdered'] || !isset($attributes['icon']) || !$attributes['icon']) {
			$styles['list-style'] = $attributes['listStyle'] ?? "auto";
			if ($pleft == '0') {
				$styles['padding-left'] = '1em';
			} else {
				$styles['padding-left'] = "calc(1em + $pleft)";
			}
		} else {
			$styles['padding-left'] = $pleft;
		}

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
		$tag = $attributes['isOrdered'] ? 'ol' : 'ul';
		$contents = HtmlUtils::replace_starting_tag($contents, 'ul', '<' . $tag);
		if (!$attributes['isOrdered'] && isset($attributes['icon']) && $attributes['icon']) {
			$icon = Common::get_icon_svg($attributes);
			$contents = str_replace('::__TABLEBERG_STYLED_LIST_ICON__::', $icon, $contents);
			$contents = HtmlUtils::append_attr_value($contents, $tag, ' tableberg-styled-list tableberg-list-has-icon', 'class');
		} else {
			$contents = str_replace('::__TABLEBERG_STYLED_LIST_ICON__::', '', $contents);
			$contents = HtmlUtils::append_attr_value($contents, $tag, ' tableberg-styled-list', 'class');

		}

		$id = '__tableberg_styled_list_' . self::$count++;

		$contents = HtmlUtils::append_attr_value($contents, $tag, self::get_styles($attributes, $id), 'style');
		$contents = HtmlUtils::append_attr_value($contents, $tag, $id, 'id');
		return $contents;
	}

	/**
	 * Register the block.
	 */
	public function styled_list_block_registration()
	{
		$defaults = new Defaults();

		register_block_type_from_metadata(
			TABLEBERG_PRO_DIR_PATH . 'dist/blocks/styled-list/block.json',
			array(
				'attributes' => $defaults->get_default_attributes('tableberg/styled-list'),
				'render_callback' => array($this, 'tableberg_render_styled_list_block'),
			)
		);
	}
}