<?php

/**
 * Plugin Name:       Tableberg
 * Plugin URI:        https://tableberg.com/
 * Description:       Table Block by Tableberg - Create Better Tables With Block Editor
 * Version:           0.5.4
 * Requires at least: 6.1
 * Requires PHP:      7.0
 * Author:            Tableberg
 * Author URI:        https://tableberg.com/
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       tableberg
 *
 * @package Tableberg
 */

if (!defined('ABSPATH')) {
	exit; // Exit if accessed directly.
}
if (!defined('TABLEBERG_VERSION')) {
	define('TABLEBERG_VERSION', '0.0.2');
}
if (!defined('TABLEBERG_DIR_PATH')) {
	define('TABLEBERG_DIR_PATH', plugin_dir_path(__FILE__));
}

if (!defined('TABLEBERG_URL')) {
	define('TABLEBERG_URL', plugin_dir_url(__FILE__));
}
if (!defined('TABLEBERG_PLUGIN_FILE')) {
	define('TABLEBERG_PLUGIN_FILE', __FILE__);
}

require_once __DIR__ . '/vendor/autoload.php';

\Tableberg\Freemius::tab_fs();

if (!class_exists('Tableberg')) {
	class Tableberg
	{
		public function __construct()
		{
			new Tableberg\Admin\Tableberg_Admin();
			new Tableberg\Blocks\Button();
			new Tableberg\Blocks\Image();
			new Tableberg\Blocks\Table();
			new Tableberg\Blocks\Cell();



			if (!\Tableberg\Freemius::isPro()) {


				add_action('init', function () {
					register_block_type(TABLEBERG_DIR_PATH . 'build/upsells-blocks/styled-list-dummy/block.json');
					register_block_type(TABLEBERG_DIR_PATH . 'build/upsells-blocks/html-dummy/block.json');
					register_block_type(TABLEBERG_DIR_PATH . 'build/upsells-blocks/icon-dummy/block.json');
					register_block_type(TABLEBERG_DIR_PATH . 'build/upsells-blocks/ribbon-dummy/block.json');
					register_block_type(TABLEBERG_DIR_PATH . 'build/upsells-blocks/star-rating-dummy/block.json');
				});
			}

			register_activation_hook(__FILE__, [$this, 'activate_plugin']);
			register_deactivation_hook(__FILE__, [$this, 'deactivate_plugin']);
		}

		/**
		 * The code that runs during plugin activation.
		 * This action is documented in includes/Activator.php
		 */
		public function activate_plugin()
		{
			Tableberg\Activator::activate();
		}

		/**
		 * The code that runs during plugin deactivation.
		 * This action is documented in includes/Deactivator.php
		 */
		public function deactivate_plugin()
		{
			Tableberg\Deactivator::deactivate();
		}

	}
	new Tableberg();

	add_action('init', function () {
		Tableberg\Patterns\RegisterPatterns::categories();
		Tableberg\Patterns\RegisterPatterns::from_dir(__DIR__ . '/includes/Patterns/data');
		if (!\Tableberg\Freemius::isPro()) {

			Tableberg\Patterns\RegisterPatterns::upsells();
		}
	});
}
