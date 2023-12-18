<?php
/**
 * The admin-specific functionality of the plugin.
 *
 * @package tableberg
 */

namespace Tableberg\Admin;

use Tableberg;
use Tableberg\Version_Control;
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
		$this->add_tableberg_admin_hook();

		// initialize version sync manager.
		Tableberg\Version_Sync_Manager::init();

		// initialize version control manager.
		Version_Control::init();

		add_action( 'admin_menu', array( $this, 'register_admin_menus' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_script' ) );
		add_filter( 'tableberg/filter/admin_settings_menu_data', array( $this, 'add_settings_menu_data' ), 1, 1 );
	}
	/**
	 * Add hook
	 */
	public function add_tableberg_admin_hook() {
		add_action( 'wp_ajax_toggle_individual_control', array( $this, 'toggle_individual_control' ) );
		add_action( 'wp_ajax_toggle_global_control', array( $this, 'toggle_global_control' ) );
	}

	/**
	 * Toggle the global_control
	 */
	private function toggle_global_control() {
		check_ajax_referer( 'toggle_global_control' );

		if ( isset( $_POST['enable'] ) ) {
			$enable = sanitize_text_field( wp_unslash( $_POST['enable'] ) );
			update_option( 'tableberg_global_control', $enable );
		}
	}
	/**
	 * Toggle the individual_control
	 */
	private function toggle_individual_control() {
		check_ajax_referer( 'toggle_individual_control' );

		if ( isset( $_POST['enable'] ) ) {
			$enable = sanitize_text_field( wp_unslash( $_POST['enable'] ) );
			update_option( 'tableberg_individual_control', $enable );
		}
	}
	/**
	 * Add data for admin settings menu frontend.
	 *
	 * @param array $data frontend data.
	 *
	 * @return array filtered frontend data
	 */
	public function add_settings_menu_data( $data ) {
		$data['assets'] = array(
			'logo' => trailingslashit( $this->plugin_url ) . 'includes/Admin/images/logos/menu-icon-colored.svg',
		);

		$data['individual_control'] = array(
			'data' => get_option( 'tableberg_individual_control', false ),
			'ajax' => array(
				'toggleIndividualControl' => array(
					'url'    => admin_url( 'admin-ajax.php' ),
					'action' => 'toggle_individual_control',
					'nonce'  => wp_create_nonce( 'toggle_individual_control' ),
				),
			),
		);
		$data['global_control']     = array(
			'data' => get_option( 'tableberg_global_control', false ),
			'ajax' => array(
				'toggleGlobalControl' => array(
					'url'    => admin_url( 'admin-ajax.php' ),
					'action' => 'toggle_global_control',
					'nonce'  => wp_create_nonce( 'toggle_global_control' ),
				),
			),
		);
		$data['block_properties']   = array(
			'data' => get_option( 'tableberg_block_properties', false ),
		);

		$data = array_merge( $data, Tableberg\Utils::welcome_page() );
		return $data;
	}
	/**
	 * Enqueue admin scripts.
	 */
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
			'Tableberg Settings',
			'Tableberg',
			'manage_options',
			$menu_page_slug,
			array( $this, 'main_menu_template_cb' ),
			plugin_dir_url( __FILE__ ) . 'images/logos/menu-icon.svg'
		);
	}
}

