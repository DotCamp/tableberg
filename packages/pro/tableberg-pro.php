<?php
/**
 * Plugin Name:       Tableberg Pro
 * Description:       Tableberg Pro: table builder Gutenberg block
 * Version:           0.5.5
 * Requires at least: 6.1
 * Requires PHP:      7.0
 * Author:            Dotcamp
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       tableberg-pro
 *
 * @package Tableberg Pro
 */

if (!defined('ABSPATH')) {
	exit; // Exit if accessed directly.
}

if (!defined('TABLEBERG_PRO_VERSION')) {
	define('TABLEBERG_PRO_VERSION', '0.0.2');
}

if (!defined('TABLEBERG_PRO_DIR_PATH')) {
	define('TABLEBERG_PRO_DIR_PATH', plugin_dir_path(__FILE__));
}

if (!defined('TABLEBERG_PRO_URL')) {
	define('TABLEBERG_PRO_URL', plugin_dir_url(__FILE__));
}
if (!defined('TABLEBERG_PRO_PLUGIN_FILE')) {
	define('TABLEBERG_PRO_PLUGIN_FILE', __FILE__);
}

use Tableberg\Pro\Assets;
use Tableberg\Pro\Blocks;

require_once __DIR__ . '/vendor/autoload.php';

if (!function_exists('tp_fs')) {
	// Create a helper function for easy SDK access.
	function tp_fs()
	{
		global $tp_fs;

		if (!isset($tp_fs)) {
			// Include Freemius SDK.
			if (file_exists(dirname(dirname(__FILE__)) . '/tableberg/includes/freemius/start.php')) {
				// Try to load SDK from parent plugin folder.
				require_once dirname(dirname(__FILE__)) . '/tableberg/includes/freemius/start.php';
			} else if (file_exists(dirname(dirname(__FILE__)) . '/tableberg-pro/includes/freemius/start.php')) {
				// Try to load SDK from premium parent plugin folder.
				require_once dirname(dirname(__FILE__)) . '/tableberg-pro/includes/freemius/start.php';
			} else {
				require_once dirname(__FILE__) . '/includes/freemius/start.php';
			}

			$tp_fs = fs_dynamic_init(
				array(
					'id' => '14650',
					'slug' => 'tableberg-pro',
					'premium_slug' => 'tableberg-pro',
					'type' => 'plugin',
					'public_key' => 'pk_e89a9a631d5a65df8a50c74bc96e9',
					'is_premium' => true,
					'is_premium_only' => true,
					'has_paid_plans' => true,
					'is_org_compliant' => false,
					'parent' => array(
						'id' => '14649',
						'slug' => 'tableberg',
						'public_key' => 'pk_8043aa788c004c4b385af8384c74b',
						'name' => 'Tableberg',
					),
					'menu' => array(
						'slug' => 'tableberg-settings',
						'first-path' => 'admin.php?page=tableberg-settings&route=welcome',
					),
				)
			);
		}

		return $tp_fs;
	}
}


function tp_fs_is_parent_active_and_loaded()
{
	// Check if the parent's init SDK method exists.
	return function_exists('tab_fs');
}

function tp_fs_is_parent_active()
{
	$active_plugins = get_option('active_plugins', array());

	if (is_multisite()) {
		$network_active_plugins = get_site_option('active_sitewide_plugins', array());
		$active_plugins = array_merge($active_plugins, array_keys($network_active_plugins));
	}

	foreach ($active_plugins as $basename) {
		if (
			0 === strpos($basename, 'tableberg/') ||
			0 === strpos($basename, 'tableberg-pro-premium/')
		) {
			return true;
		}
	}

	return false;
}

function tp_fs_init()
{
	if (tp_fs_is_parent_active_and_loaded()) {
		// Init Freemius.
		tp_fs();


		// Signal that the add-on's SDK was initiated.
		do_action('tp_fs_loaded');

		// Parent is active, add your init code here.
		if (!class_exists('Tableberg_Pro_Main')) {
			/**
			 * Tableberg Pro main class.
			 */
			class Tableberg_Pro_Main
			{


				/**
				 * Constructor.
				 *
				 * @return void
				 */
				public function __construct()
				{
					new Blocks\StarRating();
					new Blocks\StyledList();
					new Blocks\StyledListItem();
					new Blocks\Html();
					new Blocks\Icon();
					new Blocks\Ribbon();
					new Assets();

					\Tableberg\Patterns\RegisterPatterns::from_dir(__DIR__ . '/includes/patterns');
				}
			}
			if (tp_fs()->can_use_premium_code()) {
				new Tableberg_Pro_Main();
			}

		}

	} else {
		// Parent is inactive, add your error handling here.
	}
}

if (tp_fs_is_parent_active_and_loaded()) {
	// If parent already included, init add-on.
	tp_fs_init();
} else if (tp_fs_is_parent_active()) {
	// Init add-on only after the parent is loaded.
	add_action('tab_fs_loaded', 'tp_fs_init');
} else {
	// Even though the parent is not activated, execute add-on for activation / uninstall hooks.
	tp_fs_init();
}



add_action('admin_init', function () {
	if (!is_plugin_active('tableberg/tableberg.php')) {
		if (is_plugin_active('tableberg-pro/tableberg-pro.php')) {
			deactivate_plugins('tableberg-pro/tableberg-pro.php');
			add_action('admin_notices', function () {
				echo '<div class="notice notice-warning is-dismissible">
                        <p>Tableberg Pro has been deactivated because Tableberg is not active.</p>
                      </div>';
			});
		}
	}
});
