<?php

namespace Tableberg\Pro\Blocks;

use Tableberg\Pro\Defaults;
use Tableberg\Utils\Utils;
/**
 * Register HTML
 *
 * @package Tableberg_Pro
 */

/**
 * Manage HTML registration.
 */
class Html {

	/**
	 * Constructor
	 *
	 * @return void
	 */
	public function __construct() {
		add_action( 'init', array( $this, 'block_registration' ) );
	}
	/**
	 * Get block styles.
	 *
	 * @param array $attributes - block attributes.
	 * @return string Generated CSS styles.
	 */
	public static function get_styles( $attributes ) {

		$utils   = new Utils();
		$padding = $utils->get_spacing_css( $attributes['padding'] );
		$margin  = $utils->get_spacing_css( $attributes['margin'] );

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
	 * Renders the custom cell block on the server.
	 *
	 * @param array    $attributes The block attributes.
	 * @param string   $content    The block content.
	 * @param WP_Block $block      The block object.
	 * @return string Returns the HTML content for the custom cell block.
	 */
	public function render_block( $attributes, $content, $block ) {
		$html = isset( $attributes['content'] ) ? $attributes['content'] : '';
		return html_entity_decode( $html );
	}

	/**
	 * Register the block.
	 */
	public function block_registration() {
		$defaults = new Defaults();

		register_block_type_from_metadata(
			TABLEBERG_PRO_DIR_PATH . 'dist/blocks/html/block.json',
			array(
				'attributes'      => $defaults->get_default_attributes( 'tableberg/html' ),
				'render_callback' => array( $this, 'render_block' ),
			)
		);
	}
}
