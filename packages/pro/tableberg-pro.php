<?php
/**
 * Plugin Name:       Tableberg Pro
 * Description:       Tableberg Pro: table builder Gutenberg block
 * Version:           0.5.4
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


add_action('tab_fs_loaded', function () {
	if (class_exists('Tableberg_Pro_Main')) {
		return;
	}
	class Tableberg_Pro_Main
	{
		public function __construct()
		{
			new Blocks\StarRating();
			new Blocks\StyledList();
			new Blocks\StyledListItem();
			new Blocks\Html();
			new Blocks\Icon();
			new Blocks\Ribbon();
			new Assets();
		}
	}

	if (Tableberg\Pro\Freemeius::isActive()) {
		new Tableberg_Pro_Main();
	}
});


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

Tableberg\Pro\Freemeius::isActive();