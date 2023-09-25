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
		return $content;
	}

	/**
	 * Register the block.
	 */
	public function block_registration() {
		register_block_type_from_metadata(
			TABLEBERG_DIR_PATH . 'build/row/block.json',
			array(
				'render_callback' => array( $this, 'render_tableberg_row_block' ),
			)
		);
	}
}
