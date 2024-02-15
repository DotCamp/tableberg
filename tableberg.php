<?php

/**
 * Plugin Name:       Tableberg
 * Plugin URI:        https://tableberg.com/
 * Description:       Table Block by Tableberg - Create Better Tables With Block Editor
 * Version:           0.3.1
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


if (!function_exists('tab_fs')) {
	// Create a helper function for easy SDK access.
	function tab_fs() {
		global $tab_fs;

		if (!isset($tab_fs)) {
			// Include Freemius SDK.
			require_once __DIR__ . '/includes/freemius/start.php';

			$tab_fs = fs_dynamic_init(array(
				'id'                  => '14649',
				'slug'                => 'tableberg',
				'type'                => 'plugin',
				'public_key'          => 'pk_8043aa788c004c4b385af8384c74b',
				'is_premium'          => false,
				'has_addons'          => false,
				'has_paid_plans'      => false,
				'menu'                => array(
					'slug'           => 'tableberg-settings',
					'first-path'     => 'admin.php?page=tableberg-settings&route=welcome',
				),
			));
		}

		return $tab_fs;
	}

	// Init Freemius.
	tab_fs();
	// Signal that SDK was initiated.
	do_action('tab_fs_loaded');
}


if (!class_exists('Tableberg')) {
	/**
	 * External Query Block main class.
	 */
	class Tableberg {


		/**
		 * Constructor.
		 *
		 * @return void
		 */
		public function __construct() {
			new Tableberg\Admin\Tableberg_Admin();
			new Tableberg\Blocks\Button();
			new Tableberg\Blocks\Image();
			new Tableberg\Blocks\Table();
			new Tableberg\Blocks\Cell();
			register_activation_hook(__FILE__, array($this, 'activate_plugin'));
			register_deactivation_hook(__FILE__, array($this, 'deactivate_plugin'));
		}

		/**
		 * The code that runs during plugin activation.
		 * This action is documented in includes/Activator.php
		 */
		public function activate_plugin() {
			Tableberg\Activator::activate();
		}

		/**
		 * The code that runs during plugin deactivation.
		 * This action is documented in includes/Deactivator.php
		 */
		public function deactivate_plugin() {
			Tableberg\Deactivator::deactivate();
		}
	}

	new Tableberg();
}
