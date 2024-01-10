<?php
/**
 * Row Block
 *
 * @package Tableberg
 */

namespace Tableberg\Blocks;

/**
 * Handle the block registration on server side and rendering.
 */
class Row {

	/**
	 * Constructor
	 *
	 * @return void
	 */
	public function __construct() {
		add_action( 'init', array( $this, 'block_registration' ) );
	}

	/**
	 * Renders the custom row block on the server.
	 *
	 * @param array    $attributes The block attributes.
	 * @param string   $content    The block content.
	 * @param WP_Block $block      The block object.
	 * @return string Returns the HTML content for the custom row block.
	 */
	public function render_tableberg_row_block( $attributes, $content, $block ) {
		$footer_class = $attributes['isHeader'] ? 'tableberg-footer' : '';
		$header_class = $attributes['isFooter'] ? 'tableberg-header' : '';

		$classes = array( 'wp-block-tableberg-row', 'tableberg-row', $footer_class, $header_class );

		$style = \Tableberg\Utils::generate_css_string([
			'--tableberg-row-height' => $attributes['height']??'',
		]);

		$content = str_replace( '<tr class="wp-block-tableberg-row', '<tr style="'.$style.'" class="' . join( ' ', $classes ) . '', $content );

		return $content;
	}

	/**
	 * Register the block.
	 */
	public function block_registration() {
		$defaults = new \Tableberg\Defaults();
		register_block_type(
			TABLEBERG_DIR_PATH . 'build/row/block.json',
			array(
				'attributes'      => $defaults->get_default_attributes( 'tableberg/row' ),
				'render_callback' => array( $this, 'render_tableberg_row_block' ),
			)
		);
	}
}
