<?php
/**
 * Register block assets.
 *
 * @package Tableberg_Pro
 */

/**
 * Manage star rating block registration.
 */
class Assets {

	/**
	 * Constructor
	 *
	 * @return void
	 */
	public function __construct() {
		add_action( 'init', array( $this, 'assets_registration' ) );
	}
	/**
	 * Register the block.
	 */
	public function assets_registration() {
		wp_register_style(
			'tableberg-pro-editor-style',
			TABLEBERG_PRO_URL . 'dist/tableberg-pro-editor.css',
			array(),
			TABLEBERG_PRO_VERSION,
			false
		);
		wp_register_style(
			'tableberg-pro-frontend-style',
			TABLEBERG_PRO_URL . 'dist/style-tableberg-pro-style.css',
			array(),
			TABLEBERG_PRO_VERSION,
			false
		);
		wp_register_script(
			'tableberg-pro-block-script',
			TABLEBERG_PRO_URL . 'dist/tableberg-pro.js',
			array(
				'lodash',
				'react',
				'wp-block-editor',
				'wp-blocks',
				'wp-components',
				'wp-data',
				'wp-element',
				'wp-i18n',
				'wp-primitives',
				'wp-api',
			),
			TABLEBERG_PRO_VERSION,
			false
		);
	}
}
