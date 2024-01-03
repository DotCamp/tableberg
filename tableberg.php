<?php
/**
 * Plugin Name:       Tableberg
 * Plugin URI:        https://tableberg.com/
 * Description:       Table Block by Tableberg - Create Better Tables With Block Editor
 * Version:           0.0.2
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

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

if ( ! defined( 'TABLEBERG_DIR_PATH' ) ) {
	define( 'TABLEBERG_DIR_PATH', plugin_dir_path( __FILE__ ) );
}

if ( ! defined( 'TABLEBERG_URL' ) ) {
	define( 'TABLEBERG_URL', plugin_dir_url( __FILE__ ) );
}

require_once __DIR__ . '/vendor/autoload.php';

if ( ! class_exists( 'Tableberg' ) ) {
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
			new Tableberg\Blocks\Button();
			new Tableberg\Blocks\Image();
			new Tableberg\Blocks\Table();
			new Tableberg\Blocks\Cell();
			new Tableberg\Blocks\Row();
		}
	}

	new Tableberg();
}
