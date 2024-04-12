<?php

namespace Tableberg\Pro\Blocks;

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
	public static function get_styles($attributes)
	{
		$padding = Utils::get_spacing_css(isset($attributes['padding']) ? $attributes['padding'] : []);
		$margin = Utils::get_spacing_css(isset($attributes['margin']) ? $attributes['margin'] : []);

		$styles = array(
			'color' => $attributes['textColor'],
			'background' => $attributes['backgroundColor'],
			'padding-top' => $padding['top'] ?? '',
			'padding-right' => $padding['right'] ?? '',
			'padding-bottom' => $padding['bottom'] ?? '',
			'margin-top' => $margin['top'] ?? '',
			'margin-right' => $margin['right'] ?? '',
			'margin-bottom' => $margin['bottom'] ?? '',
			'margin-left' => $margin['left'] ?? '',
			'--tableberg-styled-list-icon-color' => $attributes['iconColor'],
			'--tableberg-styled-list-icon-size' => $attributes['iconSize'] . 'px',
			'--tableberg-styled-list-icon-spacing' => $attributes['iconSpacing'] . 'px',
			'--tableberg-styled-list-spacing' => $attributes['itemSpacing'] . 'px',
			'--tableberg-styled-list-inner-spacing' => $attributes['listSpacing'] . 'px',
		);
		if ($attributes['isOrdered'] || !$attributes['icon']) {
			$styles['list-style'] = $attributes['listStyle'] ?? "auto";
			$styles['--tableberg-styled-list-padding-left'] = $padding['left'] ? $padding['left'] . 'px' : '0px';
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
		if (!$attributes['isOrdered'] && $attributes['icon']) {
			$icon = Common::get_icon_svg($attributes);
			$contents = str_replace('::__TABLEBERG_STYLED_LIST_ICON__::', $icon, $contents);
			$contents = HtmlUtils::append_attr_value($contents, $tag, ' tableberg-styled-list tableberg-list-has-icon', 'class');
		} else {
			$contents = str_replace('::__TABLEBERG_STYLED_LIST_ICON__::', '', $contents);
			$contents = HtmlUtils::append_attr_value($contents, $tag, ' tableberg-styled-list', 'class');

		}
		$contents = HtmlUtils::append_attr_value($contents, $tag, self::get_styles($attributes), 'style');
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