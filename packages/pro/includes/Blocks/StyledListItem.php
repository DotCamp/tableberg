<?php

namespace Tableberg\Pro\Blocks;

use Tableberg\Pro\Common;
use Tableberg\Pro\Defaults;
use Tableberg\Utils\Utils;
/**
 * Register Styled list item
 *
 * @package Tableberg_Pro
 */

/**
 * Manage Styled list item registration.
 */
class StyledListItem {

	/**
	 * Constructor
	 *
	 * @return void
	 */
	public function __construct() {
		add_action( 'init', array( $this, 'styled_list_item_block_registration' ) );
	}
	/**
	 * Get block styles.
	 *
	 * @param array $attributes - block attributes.
	 * @return string Generated CSS styles.
	 */
	public static function get_styles( $attributes ) {
		$padding = Utils::get_spacing_css( $attributes['padding']  ??[]);
		$margin  = Utils::get_spacing_css( $attributes['margin'] ?? []);

		$styles = array(
			'color'          => $attributes['textColor']??'',
			'padding-top'    => $padding['top'] ?? '',
			'padding-right'  => $padding['right'] ?? '',
			'padding-bottom' => $padding['bottom'] ?? '',
			'padding-left'   => $padding['left'] ?? '',
			'margin-top'     => $margin['top'] ?? '',
			'margin-right'   => $margin['right'] ?? '',
			'margin-bottom'  => $margin['bottom'] ?? '',
			'margin-left'    => $margin['left'] ?? '',
			'--tableberg-styled-list-icon-color' => $attributes['iconColor']??'',
			'--tableberg-styled-list-icon-size' => $attributes['iconSize']??false?$attributes['iconSize'].'px':'',
			'--tableberg-styled-list-icon-spacing' => $attributes['iconSpacing']??false?$attributes['iconSpacing'].'px':'',
		);

		return Utils::generate_css_string( $styles );
	}
	/**
	 * Renders the block on the server.
	 *
	 * @param array    $attributes The block attributes.
	 * @param string   $contents    The block content.
	 * @param WP_Block $block      The block object.
	 * @return string Returns the HTML content for the custom cell block.
	 */
	public function tableberg_render_styled_list_item_block( $attributes, $contents, $block ) {
		$item_text = isset( $attributes['text'] ) ? $attributes['text'] : '';
		$styles = $this->get_styles( $attributes );
		$classNames = "";
		$icon = Common::get_icon_svg($attributes);
		if ($icon) {
			$classNames = "tableberg-list-item-has-icon";
		}
		if (!$icon) {		
			return '<li class="'.$classNames.'" style="' . $styles . '">::__TABLEBERG_STYLED_LIST_ICON__::<div>' . $item_text . '</div></li>';
		}
		 
		return '<li class="'.$classNames.'" style="' . $styles . '">' .$icon.'<div>'. $item_text . '</div></li>';
	}

	/**
	 * Register the block.
	 */
	public function styled_list_item_block_registration() {
		$defaults = new Defaults();

		register_block_type_from_metadata(
			TABLEBERG_PRO_DIR_PATH . 'dist/blocks/styled-list/styled-list-item/block.json',
			array(
				'attributes'      => $defaults->get_default_attributes( 'tableberg/styled-list-item' ),
				'render_callback' => array( $this, 'tableberg_render_styled_list_item_block' ),
			)
		);
	}
}
