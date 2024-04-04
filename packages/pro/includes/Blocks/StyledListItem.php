<?php

namespace Tableberg\Pro\Blocks;

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

		$utils   = new Utils();
		$padding = $utils->get_spacing_css( isset( $attributes['padding'] ) ? $attributes['padding'] : array() );
		$margin  = $utils->get_spacing_css( isset( $attributes['margin'] ) ? $attributes['margin'] : array() );

		$styles = array(
			'padding-top'    => $padding['top'] ?? '',
			'padding-right'  => $padding['right'] ?? '',
			'padding-bottom' => $padding['bottom'] ?? '',
			'padding-left'   => $padding['left'] ?? '',
			'margin-top'     => $margin['top'] ?? '',
			'margin-right'   => $margin['right'] ?? '',
			'margin-bottom'  => $margin['bottom'] ?? '',
			'margin-left'    => $margin['left'] ?? '',
		);

		return $utils->generate_css_string( $styles );
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
		$item_text = isset( $attributes['itemText'] ) ? $attributes['itemText'] : '';

		$styles = $this->get_styles( $attributes );

		return '<li class="tableberg_styled_list_item" style="' . $styles . '">' . $item_text . $contents . '</li>';
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
