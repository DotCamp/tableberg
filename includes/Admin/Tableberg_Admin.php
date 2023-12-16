<?php
/**
 * The admin-specific functionality of the plugin.
 *
 * @package ultimate-blocks
 */

namespace Tableberg\Admin;

use Tableberg;

/**
 * Manage Tableberg Admin
 */
class Tableberg_Admin {
	/**
	 * The ID of this plugin.
	 *
	 * @access   private
	 * @var      string $plugin_name The ID of this plugin.
	 */
	private $plugin_name;

	/**
	 * The version of this plugin.
	 *
	 * @access   private
	 * @var      string $version The current version of this plugin.
	 */
	private $version;
	/**
	 * The PATH of this plugin.
	 *
	 * @access   private
	 * @var      string $plugin_path The PATH of this plugin.
	 */
	private $plugin_path;

	/**
	 * The URL of this plugin.
	 *
	 * @access   private
	 * @var      string $plugin_url The URL of this plugin.
	 */
	private $plugin_url;

	/**
	 * Initialize the class and set its properties.
	 */
	public function __construct() {

		$this->plugin_name = 'tableberg';
		$this->version     = TABLEBERG_VERSION;
		$this->plugin_path = TABLEBERG_DIR_PATH;
		$this->plugin_url  = TABLEBERG_URL;
		add_action( 'admin_menu', array( $this, 'register_admin_menus' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_script' ) );
	}

	public function enqueue_admin_script() {
		$tableberg_assets = new Tableberg\Assets();
		$tableberg_assets->register_admin_assets();
	}

	/**
	 * Set template for main setting page
	 *
	 * @return void
	 */
	public function main_menu_template_cb() {
		require_once $this->plugin_path . 'includes/Admin/templates/menus/main-menu.php';
	}
	/**
	 * Register Setting Pages for the admin area.
	 */
	public function register_admin_menus() {

		// assign global variables.
		global $menu_page;
		global $menu_page_slug;

		$menu_page_slug = 'tableberg-settings';
		$menu_page      = add_menu_page(
			'Tablerberg Settings',
			'Tableberg',
			'manage_options',
			$menu_page_slug,
			array( $this, 'main_menu_template_cb' ),
			plugin_dir_url( __FILE__ ) . 'images/logos/menu-icon.svg'
		);
	}
}

