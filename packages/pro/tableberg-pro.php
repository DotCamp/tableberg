<?php
/**
 * Plugin Name:       Tableberg Pro
 * Description:       Tableberg Pro: table builder Gutenberg block
 * Version:           0.0.2
 * Requires at least: 6.1
 * Requires PHP:      7.0
 * Author:            Dotcamp
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       tableberg-pro
 *
 * @package Tableberg Pro
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

if ( ! defined( 'TABLEBERG_PRO_VERSION' ) ) {
	define( 'TABLEBERG_PRO_VERSION', '0.0.2' );
}

if ( ! defined( 'TABLEBERG_PRO_DIR_PATH' ) ) {
	define( 'TABLEBERG_PRO_DIR_PATH', plugin_dir_path( __FILE__ ) );
}

if ( ! defined( 'TABLEBERG_PRO_URL' ) ) {
	define( 'TABLEBERG_PRO_URL', plugin_dir_url( __FILE__ ) );
}
if ( ! defined( 'TABLEBERG_PRO_PLUGIN_FILE' ) ) {
	define( 'TABLEBERG_PRO_PLUGIN_FILE', __FILE__ );
}

use Tableberg\Pro\Assets;
use Tableberg\Pro\Blocks;

require_once __DIR__ . '/vendor/autoload.php';


if ( ! class_exists( 'Tableberg_Pro_Main' ) ) {
	/**
	 * Tableberg Pro main class.
	 */
	class Tableberg_Pro_Main {


		/**
		 * Constructor.
		 *
		 * @return void
		 */
		public function __construct() {
			new Blocks\StarRating();
			new Blocks\StyledList();
			new Blocks\StyledListItem();
			new Blocks\Html();
			new Blocks\Icon();
			new Assets();
		}
	}

	new Tableberg_Pro_Main();
}
