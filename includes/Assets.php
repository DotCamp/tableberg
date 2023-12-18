<?php
/**
 * The file register assets for the plugin
 *
 *  @package Tableberg
 */
namespace Tableberg;

/**
 * Handle plugin assets
 */
class Assets {
	/**
	 * Register blocks assets
	 */
	public function register_blocks_assets() {
		wp_register_script(
			'tableberg-script',
			TABLEBERG_URL . 'build/tableberg.build.js',
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
			),
			'0.0.2',
			false
		);
		wp_register_style(
			'tableberg-editor-style',
			TABLEBERG_URL . 'build/tableberg-editor-style.css',
			array(),
			'0.0.2',
			false
		);
		wp_register_style(
			'tableberg-style',
			TABLEBERG_URL . 'build/tableberg-frontend-style.css',
			array(),
			'0.0.2',
			false
		);
	}
	/**
	 * Enqueue Admin assets
	 */
	public function register_admin_assets() {
		wp_enqueue_script(
			'tableberg-admin-script',
			TABLEBERG_URL . 'build/tableberg-admin.build.js',
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
			),
			'0.0.2',
			true
		);
		$frontend_script_data = apply_filters( 'tableberg/filter/admin_settings_menu_data', array() );
		wp_localize_script( 'tableberg-admin-script', 'tablebergAdminMenuData', $frontend_script_data );
		wp_enqueue_style(
			'tableberg-admin-style',
			TABLEBERG_URL . 'build/tableberg-admin-style.css',
			array(),
			'0.0.2',
			'all'
		);
	}
}
