<?php
/**
 * Table Block
 *
 * @package Tableberg
 */

namespace Tableberg\Blocks;

/**
 * Handle the block registration on server side and rendering.
 */
class Table {

	/**
	 * Constructor
	 *
	 * @return void
	 */
	public function __construct() {
		add_action( 'init', array( $this, 'block_registration' ) );
	}

	/**
	 * Renders the custom table block on the server.
	 *
	 * @param array    $attributes The block attributes.
	 * @param string   $content    The block content.
	 * @param WP_Block $block      The block object.
	 * @return string Returns the HTML content for the custom table block.
	 */
	public function render_tableberg_table_block( $attributes, $content, $block ) {
		return $content;
	}

	/**
	 * Register the block.
	 */
	public function block_registration() {
		$defaults = new \Tableberg\Defaults();
		register_block_type_from_metadata(
			TABLEBERG_DIR_PATH . 'build/block.json',
			array(
				'attributes'      => $defaults->get_default_attributes( 'tableberg/table' ),
				'render_callback' => array( $this, 'render_tableberg_table_block' ),
			)
		);
	}
}
