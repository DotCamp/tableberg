<?php

namespace Tableberg\Pro\Blocks;

use Tableberg\Pro\Defaults;

/**
 * Register HTML
 *
 * @package Tableberg_Pro
 */

/**
 * Manage HTML registration.
 */
class Html
{

	/**
	 * Constructor
	 *
	 * @return void
	 */
	public function __construct()
	{
		add_action('init', array($this, 'block_registration'));
	}

	/**
	 * Renders the custom cell block on the server.
	 *
	 * @param array    $attributes The block attributes.
	 * @param string   $content    The block content.
	 * @param WP_Block $block      The block object.
	 * @return string Returns the HTML content for the custom cell block.
	 */
	public function render_block($attributes, $content, $block)
	{
		$html = isset($attributes['content']) ? $attributes['content'] : '';
		return preg_replace('#<script(.*?)>(.*?)</script>#is', '', '<div class="tableberg-custom-html"></div><template>' . $html . '</template>');
	}

	/**
	 * Register the block.
	 */
	public function block_registration()
	{
		$defaults = new Defaults();

		register_block_type_from_metadata(
			TABLEBERG_PRO_DIR_PATH . 'dist/blocks/html/block.json',
			array(
				'attributes' => $defaults->get_default_attributes('tableberg/html'),
				'render_callback' => array($this, 'render_block'),
			)
		);
	}
}
