<?php

/**
 * The file defines global constants for the plugin
 *
 *  @package Tableberg
 */

namespace Tableberg;

/**
 * The core plugin class.
 *
 * This is used for defining constants which are used throughout plugin.
 */
class Constants {

	const PLUGIN_VERSION = '0.5.6';

	const PLUGIN_NAME = 'tableberg';

	/**
	 * Get Plugin version
	 *
	 * @return string
	 */
	public static function plugin_version() {
		return self::PLUGIN_VERSION;
	}

	/**
	 * Get Plugin name
	 *
	 * @return string
	 */
	public static function plugin_name() {
		return self::PLUGIN_NAME;
	}

	/**
	 * Get Plugin TEXT DOMAIN
	 *
	 * @return string
	 */
	public static function text_domain() {
		return 'tableberg';
	}
}
