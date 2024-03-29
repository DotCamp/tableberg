<?php

/**
 * Fired during plugin activation
 *
 *  @package Tableberg
 */

namespace Tableberg;

use Tableberg\Utils\Utils;

/**
 * Fired during plugin activation.
 *
 * This class defines all code necessary to run during the plugin's activation.
 *
 * @since      1.0.2
 *  @package Tableberg
 * @author     Imtiaz Rayhan <imtiazrayhan@gmail.com>
 */
class Activator
{
    public static function activate()
    {

        set_transient('_welcome_redirect_tableberg', true, 60);

        $individual_control = get_option('tableberg_individual_control', false);
        $block_properties   = get_option('tableberg_block_properties', false);
        $global_control     = get_option('tableberg_global_control', false);

        if (!$global_control) {
            update_option('tableberg_global_control', Utils::global_control());
        }
        if (!$individual_control) {
            update_option('tableberg_individual_control', Utils::individual_control());
        }
        if (!$block_properties) {
            update_option('tableberg_block_properties', Utils::default_block_properties());
        }

        update_option('tableberg_version', Constants::plugin_version());

        update_option('tableberg_installDate', date('Y-m-d h:i:s'));
        add_option('tableberg_review_notify', 'no');
    }
}
