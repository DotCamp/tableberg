<?php

namespace Tableberg\Pro\Blocks;

class Posts {


	public function __construct() {
		add_action( 'init', array( $this, 'block_registration' ) );
	}

	public function render_block( $attributes, $content, $block ) {
		return '<i>here</i>';
	}

	public function block_registration() {
		$jsonPath = TABLEBERG_PRO_DIR_PATH . 'dist/blocks/posts/block.json';
		$attrs    = json_decode( file_get_contents( $jsonPath ), true )['attributes'];

		register_block_type_from_metadata(
			$jsonPath,
			array(
				'attributes' => $attrs,
				'render_callback' => array( $this, 'render_block' ),
			)
		);
	}
}
