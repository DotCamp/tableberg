<?php
/**
 * Default Attributes
 *
 * @package Tableberg
 */

namespace Tableberg;

/**
 * Handles default attributes of blocks.
 */
class Defaults {

	/**
	 * Default Block Attributes
	 *
	 * @var array Block Attributes
	 */
	public $default_values = array(
		'tableberg/table' => array(
			'attributes' => array(
				'rows'            => array(
					'type'    => 'number',
					'default' => 2,
				),
				'cols'            => array(
					'type'    => 'number',
					'default' => 2,
				),
				'hasTableCreated' => array(
					'type'    => 'boolean',
					'default' => false,
				),
			),
		),
		'tableberg/cell'  => array(
			'attributes' => array(
				'vAlign' => array(
					'type'    => 'string',
					'default' => 'center',
				),
			),
		),
		'tableberg/image' => array(
			'attributes' => array(
				'media'           => array(
					'type'    => 'object',
					'default' => array(),
				),
				'height'          => array(
					'type'    => 'string',
					'default' => '',
				),
				'width'           => array(
					'type'    => 'string',
					'default' => '',
				),
				'alt'             => array(
					'type'    => 'string',
					'default' => '',
				),
				'aspectRatio'     => array(
					'type'    => 'string',
					'default' => '',
				),
				'scale'           => array(
					'type'    => 'string',
					'default' => '',
				),
				'sizeSlug'        => array(
					'type'    => 'string',
					'default' => 'large',
				),
				'caption'         => array(
					'type'    => 'string',
					'default' => '',
				),
				'href'            => array(
					'type'    => 'string',
					'default' => '',
				),
				'linkClass'       => array(
					'type'    => 'string',
					'default' => '',
				),
				'linkDestination' => array(
					'type'    => 'string',
					'default' => '',
				),
				'rel'             => array(
					'type'    => 'string',
					'default' => '',
				),
				'linkTarget'      => array(
					'type'    => 'string',
					'default' => '',
				),
				'border'          => array(
					'type'    => 'object',
					'default' => array(),
				),
				'borderRadius'    => array(
					'type'    => 'object',
					'default' => array(),
				),
			),
		),
	);


	/**
	 * Constructor
	 *
	 * @return void
	 */
	public function __construct() {
	}

	/**
	 * Get block default attributes with block name.
	 *
	 * @param string $block_name block name.
	 * @return array block attributes
	 */
	public function get_default_attributes( $block_name ) {
		return $this->default_values[ $block_name ]['attributes'];
	}
}
