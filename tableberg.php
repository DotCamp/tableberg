<?php

/**
 * Plugin Name:       Tableberg
 * Description:       Tableberg: table builder Gutenberg block
 * Version:           0.0.2
 * Requires at least: 6.1
 * Requires PHP:      7.0
 * Author:            Dotcamp
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       tableberg
 *
 * @package Tableberg
 */

if (!defined('ABSPATH')) {
	exit; // Exit if accessed directly.
}

if (!defined('TABLEBERG_DIR_PATH')) {
	define('TABLEBERG_DIR_PATH', plugin_dir_path(__FILE__));
}

if (!defined('TABLEBERG_URL')) {
	define('TABLEBERG_URL', plugin_dir_url(__FILE__));
}

if (!class_exists('Tableberg')) {
	/**
	 * External Query Block main class.
	 */
	class Tableberg
	{

		/**
		 * Constructor.
		 *
		 * @return void
		 */
		public function __construct()
		{
			require_once TABLEBERG_DIR_PATH . 'includes/blocks/class-tableberg-button.php';
			require_once TABLEBERG_DIR_PATH . 'includes/blocks/class-tableberg-image.php';
			add_action('init', array($this, 'tableberg_register_block_types'));
		}
		/**
		 * Register Blocks on server side
		 */
		public function tableberg_register_block_types()
		{
			register_block_type(__DIR__ . '/build');
			register_block_type(__DIR__ . '/build/row');
			register_block_type(__DIR__ . '/build/cell');
		}
	}

	new Tableberg();
}
