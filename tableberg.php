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
 */

function tableberg_register_block_types()
{
	register_block_type(__DIR__ . '/build');
	register_block_type(__DIR__ . '/build/row');
	register_block_type(__DIR__ . '/build/cell');
	register_block_type(__DIR__ . '/build/button');
}
add_action('init', 'tableberg_register_block_types');
