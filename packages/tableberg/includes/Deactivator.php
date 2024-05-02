<?php

/**
 * Fired during plugin deactivation
 *
 *  @package Tableberg
 */

namespace Tableberg;

/**
 * Fired during plugin deactivation.
 *
 * This class defines all code necessary to run during the plugin's deactivation.
 *
 * @since      1.0.2
 * @author     Imtiaz Rayhan <imtiazrayhan@gmail.com>
 */
class Deactivator
{

    public static function deactivate()
    {
        delete_option('tableberg_individual_control');
        delete_option('tableberg_block_properties');
        delete_option('tableberg_global_control');
        delete_option('tableberg_version');

        delete_transient('_welcome_redirect_tableberg');
        delete_option('tableberg_installDate');
    }
}
