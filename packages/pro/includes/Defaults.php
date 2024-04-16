<?php

namespace Tableberg\Pro;

/**
 * Default Attributes
 *
 * @package Tableberg_Pro
 */

/**
 * Handles default attributes of blocks.
 */
class Defaults
{

	/**
	 * Default Block Attributes
	 *
	 * @var array Block Attributes
	 */
	public $default_values = array(
		'tableberg/star-rating' => array(
			'attributes' => array(
				'starCount' => array(
					'type' => 'number',
					'default' => 5,
				),
				'starSize' => array(
					'type' => 'number',
					'default' => 20,
				),
				'starColor' => array(
					'type' => 'string',
					'default' => '#FFB901',
				),
				'selectedStars' => array(
					'type' => 'number',
					'default' => 0,
				),
				'reviewText' => array(
					'type' => 'string',
					'default' => '',
				),
				'reviewTextAlign' => array(
					'type' => 'string',
					'default' => 'left',
				),
				'reviewTextColor' => array(
					'type' => 'string',
					'default' => '',
				),
				'starAlign' => array(
					'type' => 'string',
					'default' => 'left',
				),
				'padding' => array(
					'type' => 'array',
					'default' => [],
				),
				'margin' => array(
					'type' => 'array',
					'default' => [],
				),
			),
		),
		'tableberg/styled-list-item' => array(
			'attributes' => array(
				'attributes' => array(
					'text' => array(
						'type' => 'string',
						'default' => '',
					),
					'icon' => array(
						'type' => 'object',
						'default' => null,
					),
					'iconColor' => array(
						'type' => 'string',
						'default' => null,
					),
					'iconSize' => array(
						'type' => 'number',
						'default' => null,
					),
					'iconSpacing' => array(
						'type' => 'number',
						'default' => null,
					),
					'fontSize' => array(
						'type' => 'string',
						'default' => null,
					),
					'textColor' => array(
						'type' => 'string',
						'default' => null,
					),
				),
			),
		),
		'tableberg/styled-list' => array(
			'attributes' => array(
				'isOrdered' => array(
					'type' => 'boolean',
					'default' => false,
				),
				'alignment' => array(
					'type' => 'string',
					'default' => 'left',
				),
				'itemSpacing' => array(
					'type' => 'number',
					'default' => 1,
				),
				'listSpacing' => [
					'type' => 'number',
					'default' => 5
				],
				'iconColor' => array(
					'type' => 'string',
					'default' => '#000000',
				),
				'iconSize' => array(
					'type' => 'number',
					'default' => 10,
				),
				'iconSpacing' => array(
					'type' => 'number',
					'default' => 5,
				),
				'fontSize' => array(
					'type' => 'string',
					'default' => '',
				),
				'textColor' => array(
					'type' => 'string',
					'default' => '',
				),
				'backgroundColor' => array(
					'type' => 'string',
					'default' => '',
				),
				'padding' => array(
					'type' => 'array',
					'default' => array(
						'top' => '',
						'right' => '',
						'bottom' => '',
						'left' => '',
					),
				),
				'margin' => array(
					'type' => 'array',
					'default' => array(
						'top' => '',
						'right' => '',
						'bottom' => '',
						'left' => '',
					),
				),
				'listStyle' => [
					'type' => 'string',
					'default' => 'disc'
				],
				'icon' => [
					'type' => 'object',
					'default' => null
				]
			),
		),
		'tableberg/html' => array(
			'attributes' => array(
				'content' => array(
					'type' => 'string',
				),
			),
		),
	);

	/**
	 * Get block default attributes with block name.
	 *
	 * @param string $block_name block name.
	 * @return array block attributes
	 */
	public function get_default_attributes($block_name)
	{
		return $this->default_values[$block_name]['attributes'];
	}
}
