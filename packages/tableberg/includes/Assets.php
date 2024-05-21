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
class Assets
{
	/**
	 * We will store dynamically generated styles here & render them
	 * in wp_footer call
	 */
	public static $dynamicStyles = '';
	/**
	 * Register block assets for frontend.
	 * I.e. dynamic responsiveness
	 */
	public function register_frontend_assets()
	{
		wp_enqueue_script(
			'tableberg-frontend-script',
			TABLEBERG_URL . 'includes/assets/js/frontend.js',
			[],
			Constants::plugin_version(),
			true
		);
		add_action('wp_footer', function () {
			if (self::$dynamicStyles) {
				echo '<style>' . self::$dynamicStyles . '</style>';
				self::$dynamicStyles = '';
			}
		});
	}
	/**
	 * Register blocks assets
	 */
	public function register_blocks_assets()
	{
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
			Constants::plugin_version(),
			false
		);
		wp_register_style(
			'tableberg-editor-style',
			TABLEBERG_URL . 'build/tableberg-editor-style.css',
			array(),
			Constants::plugin_version(),
			false
		);
		wp_register_style(
			'tableberg-style',
			TABLEBERG_URL . 'build/tableberg-frontend-style.css',
			array(),
			Constants::plugin_version(),
			false
		);

		self::pass_data_to_js('tableberg-script');
	}
	/**
	 * Enqueue Admin assets
	 */
	public function register_admin_assets()
	{
		wp_enqueue_script(
			'tableberg-admin-script',
			TABLEBERG_URL . 'includes/Admin/assets/tableberg-admin.build.js',
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
			Constants::plugin_version(),
			true
		);

		self::pass_data_to_js('tableberg-admin-script');

		wp_enqueue_script(
			'tableberg-preview-device-change-observer',
			TABLEBERG_URL . 'includes/assets/js/PreviewDeviceChangeObserver.js',
			[],
			Constants::plugin_version(),
			true
		);
		$frontend_script_data = apply_filters('tableberg/filter/admin_settings_menu_data', array());
		wp_localize_script('tableberg-admin-script', 'tablebergAdminMenuData', $frontend_script_data);
		wp_enqueue_style(
			'tableberg-admin-style',
			TABLEBERG_URL . 'includes/Admin/assets/tableberg-admin-style.css',
			array(),
			Constants::plugin_version(),
			'all'
		);
	}


	private static function pass_data_to_js(string $handle)
	{
		$data = [
			'plugin_url' => TABLEBERG_URL
		];
		global $tp_fs;
		if (isset($tp_fs)) {
			$data['IS_PRO'] = $tp_fs->is__premium_only()
				&& $tp_fs->can_use_premium_code();
		} else {
			$data['IS_PRO'] = false;
		}
		wp_localize_script($handle, 'TABLEBERG_CFG', $data);
	}
}
