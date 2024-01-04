<?php
/**
 * Fired during plugin activation
 *
 *  @package Tableberg
 */

namespace Tableberg;

use Tableberg\Utils;
use Tableberg;

/**
 * Fired during plugin activation.
 *
 * This class defines all code necessary to run during the plugin's activation.
 *
 * @since      1.0.2
 *  @package Tableberg
 * @author     Imtiaz Rayhan <imtiazrayhan@gmail.com>
 */
class Activator {

	/**
	 * Short Description. (use period)
	 *
	 * Long Description.
	 *
	 * @since    1.0.2
	 */
	public static function activate() {

		set_transient( '_welcome_redirect_tableberg', true, 60 );

		require_once TABLEBERG_DIR_PATH . 'includes/Utils.php';

		$individual_control = get_option( 'tableberg_individual_control', false );
		$block_properties   = get_option( 'tableberg_block_properties', false );
		$global_control     = get_option( 'tableberg_global_control', false );

		if ( ! $global_control ) {
			update_option( 'tableberg_global_control', Utils::global_control() );
		}
		if ( ! $individual_control ) {
			update_option( 'tableberg_individual_control', Utils::individual_control() );
		}
		if ( ! $block_properties ) {
			update_option( 'tableberg_block_properties', Utils::default_block_properties() );
		}

		if ( ! get_option( 'tableberg_version' ) ) {
			add_option( 'tableberg_version', Tableberg\Constants::plugin_version() );
		}
	}

}
