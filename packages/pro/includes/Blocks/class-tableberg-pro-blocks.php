<?php
/**
 * Handle all blocks.
 *
 * @package Tableberg_Pro
 */

/**
 * Manage all blocks.
 */
class Blocks {

	/**
	 * Constructor
	 *
	 * @return void
	 */
	public function __construct() {
		require_once TABLEBERG_PRO_DIR_PATH . 'includes/Blocks/class-tableberg-pro-star-rating-block.php';
		require_once TABLEBERG_PRO_DIR_PATH . 'includes/Blocks/class-tableberg-pro-html.php';
		require_once TABLEBERG_PRO_DIR_PATH . 'includes/Blocks/class-tableberg-pro-styled-list-block.php';
		require_once TABLEBERG_PRO_DIR_PATH . 'includes/Blocks/class-tableberg-pro-styled-list-item-block.php';
	}
}
