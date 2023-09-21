<?php
/**
 * Image Block
 *
 * @package Tableberg
 */

/**
 * Handle the block registration on server side and rendering.
 */
class Tableberg_Image {

	/**
	 * Constructor
	 *
	 * @return void
	 */
	public function __construct() {
		add_action( 'init', array( $this, 'block_registration' ) );
	}

	/**
	 * Renders the `core/image` block on the server,
	 * adding a data-id attribute to the element if core/gallery has added on pre-render.
	 *
	 * @param  array    $attributes The block attributes.
	 * @param  string   $content    The block content.
	 * @param  WP_Block $block      The block object.
	 * @return string Returns the block content with the data-id attribute added.
	 */
	public function render_tableberg_image_block( $attributes, $content, $block ) {
		return $content;
	}


	/**
	 * Register the block.
	 */
	public function block_registration() {
		register_block_type(
			TABLEBERG_DIR_PATH . 'build/image/block.json',
			array(
				'render_callback' => array( $this, 'render_tableberg_image_block' ),
			)
		);
	}
}

new Tableberg_Image();
