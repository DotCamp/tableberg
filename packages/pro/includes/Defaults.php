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
class Defaults {

	/**
	 * Default Block Attributes
	 *
	 * @var array Block Attributes
	 */
	public $default_values = array(
		'tableberg/star-rating'      => array(
			'attributes' => array(
				'blockID'         => array(
					'type'    => 'string',
					'default' => '',
				),
				'starCount'       => array(
					'type'    => 'number',
					'default' => 5,
				),
				'starSize'        => array(
					'type'    => 'number',
					'default' => 20,
				),
				'starColor'       => array(
					'type'    => 'string',
					'default' => '#FFB901',
				),
				'selectedStars'   => array(
					'type'    => 'number',
					'default' => 0,
				),
				'reviewText'      => array(
					'type'    => 'string',
					'default' => '',
				),
				'reviewTextAlign' => array(
					'type'    => 'string',
					'default' => 'text',
				),
				'reviewTextColor' => array(
					'type'    => 'string',
					'default' => '',
				),
				'starAlign'       => array(
					'type'    => 'string',
					'default' => 'left',
				),
				'padding'         => array(
					'type'    => 'array',
					'default' => array(),
				),
				'margin'          => array(
					'type'    => 'array',
					'default' => array(),
				),
			),
		),
		'tableberg/styled-list-item' => array(
			'attributes' => array(
				'attributes' => array(
					'blockID'      => array(
						'type'    => 'string',
						'default' => '',
					),
					'itemText'     => array(
						'type'    => 'string',
						'default' => '',
					),
					'selectedIcon' => array(
						'type'    => 'string',
						'default' => 'check',
					),
					'iconColor'    => array(
						'type'    => 'string',
						'default' => '#000000',
					),
					'iconSize'     => array(
						'type'    => 'number',
						'default' => 5,
					),
					'fontSize'     => array(
						'type'    => 'number',
						'default' => 0,
					),
					'padding'      => array(
						'type'    => 'array',
						'default' => array(),
					),
					'margin'       => array(
						'type'    => 'array',
						'default' => array(),
					),
				),
			),
		),
		'tableberg/styled-list'      => array(
			'attributes' => array(
				'list'             => array(
					'type'    => 'string',
					'default' => '',
				),
				'alignment'        => array(
					'type'    => 'string',
					'default' => 'left',
				),
				'iconColor'        => array(
					'type'    => 'string',
					'default' => '#000000',
				),
				'iconSize'         => array(
					'type'    => 'number',
					'default' => 5,
				),
				'fontSize'         => array(
					'type'    => 'number',
					'default' => 0,
				),
				'itemSpacing'      => array(
					'type'    => 'number',
					'default' => 0,
				),
				'columns'          => array(
					'type'    => 'number',
					'default' => 1,
				),
				'maxMobileColumns' => array(
					'type'    => 'number',
					'default' => 2,
				),
				'isRootList'       => array(
					'type'    => 'boolean',
					'default' => false,
				),
				'textColor'        => array(
					'type'    => 'string',
					'default' => '',
				),
				'backgroundColor'  => array(
					'type'    => 'string',
					'default' => '',
				),
				'padding'          => array(
					'type'    => 'array',
					'default' => array(
						'top'    => '',
						'right'  => '',
						'bottom' => '',
						'left'   => '',
					),
				),
				'margin'           => array(
					'type'    => 'array',
					'default' => array(
						'top'    => '',
						'right'  => '',
						'bottom' => '',
						'left'   => '',
					),
				),
				'listItem'         => array(
					'type'    => 'array',
					'default' => array(),
				),
				'icon'             => array(
					'type'    => 'array',
					'default' => array(
						'iconName' => 'check',
						'type'     => 'font-awesome',
						'icon'     => array(
							'type'   => 'svg',
							'key'    => null,
							'ref'    => null,
							'props'  => array(
								'xmlns'    => 'http://www.w3.org/2000/svg',
								'viewBox'  => '0 0 512 512',
								'children' => array(
									'type'  => 'path',
									'key'   => null,
									'ref'   => null,
									'props' => array(
										'd' => 'M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z',
									),
								),
								'_owner'   => null,
							),
							'_owner' => null,
						),
					),
				),
			),
		),
		'tableberg/html'             => array(
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
	public function get_default_attributes( $block_name ) {
		return $this->default_values[ $block_name ]['attributes'];
	}
}
