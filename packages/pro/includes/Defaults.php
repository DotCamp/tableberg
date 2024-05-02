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
						'type' => 'string',
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
					'type' => 'string',
					'default' => '',
				),
				'listSpacing' => [
					'type' => 'object',
					'default' => []
				],
				'listIndent' => [
					'type' => 'string',
					'default' => 'var:preset|spacing|10'
				],
				'iconColor' => array(
					'type' => 'string',
					'default' => '#000000',
				),
				'iconSize' => array(
					'type' => 'number',
					'default' => 15,
				),
				'iconSpacing' => array(
					'type' => 'string',
					'default' => 'var:preset|spacing|5',
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
				'listStyle' => [
					'type' => 'string',
					'default' => 'disc'
				],
				'icon' => [
					'type' => 'object',
					'default' => [
						'iconName' => 'check',
						'type' => 'font-awesome',
						'icon' => [
							'type' => 'svg',
							'props' => [
								'xmlns' => 'http://www.w3.org/2000/svg',
								'viewBox' => '0 0 512 512',
								'children' => [
									'type' => 'path',
									'key' => null,
									'ref' => null,
									'props' => [
										'd' => 'M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z'
									],
								]
							],
						]

					]
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
