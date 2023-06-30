<?php

/**
 * Plugin Name:       Tableberg
 * Description:       Tableberg: table builder Gutenberg block
 * Version:           0.0.0
 * Requires at least: 6.1
 * Requires PHP:      7.0
 * Author:            Dotcamp
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       tableberg
 *
 */

function create_block_tableberg_block_init()
{
	register_block_type(__DIR__ . '/build');
}
add_action('init', 'create_block_tableberg_block_init');
