<?php
/**
 * Cell Block
 *
 * @package Tableberg
 */

namespace Tableberg\Blocks;

use Tableberg;
use \WP_HTML_Tag_Processor;

/**
 * Handle the block registration on server side and rendering.
 */
class Cell {

	/**
	 * Constructor
	 *
	 * @return void
	 */
	public function __construct() {
		add_action( 'init', array( $this, 'block_registration' ) );
	}

	/**
	 * Renders the custom cell block on the server.
	 *
	 * @param array    $attributes The block attributes.
	 * @param string   $content    The block content.
	 * @param WP_Block $block      The block object.
	 * @return string Returns the HTML content for the custom cell block.
	 */
	public function render_tableberg_cell_block( $attributes, $content, $block ) {
		$vertical_align = $attributes['vAlign'] ?? '';

		$td = new WP_HTML_Tag_Processor( $content );

		if ( $td->next_tag( 'td' ) && $vertical_align ) {
			$td->add_class( "align-v-{$vertical_align}" );
		}

		return $td;
	}

	/**
	 * Register the block.
	 */
	public function block_registration() {
		$defaults = new \Tableberg\Defaults();
		register_block_type(
			TABLEBERG_DIR_PATH . 'build/cell/block.json',
			array(
				'attributes'      => $defaults->get_default_attributes( 'tableberg/cell' ),
				'render_callback' => array( $this, 'render_tableberg_cell_block' ),
			)
		);
	}
}
