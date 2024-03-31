<?php
/**
 * Register Styled list
 *
 * @package Tableberg_Pro
 */

/**
 * Manage Styled list registration.
 */
class Styled_List {

	/**
	 * Constructor
	 *
	 * @return void
	 */
	public function __construct() {
		add_action( 'init', array( $this, 'styled_list_block_registration' ) );

	}

	/**
	 * Get block styles.
	 *
	 * @param array $attributes - block attributes.
	 * @return string Generated CSS styles.
	 */
	public static function get_styles( $attributes ) {
		require_once TABLEBERG_PRO_DIR_PATH . 'includes/class-tableberg-pro-utilities.php';
		if ( ! $attributes['isRootList'] ) {
			return '';
		}

		$block_stylesheets = '';

		$prefix             = '#tableberg_styled_list-' . $attributes['blockID'];
		$block_stylesheets .= $prefix . '{';
		$utils              = new Utils();
		$padding            = $utils->get_spacing_css( isset( $attributes['padding'] ) ? $attributes['padding'] : array() );
		$margin             = $utils->get_spacing_css( isset( $attributes['margin'] ) ? $attributes['margin'] : array() );
		$icon_data          = isset( $attributes['icon']['icon'] ) ? $attributes['icon']['icon'] : array();
		$icon_size          = isset( $attributes['iconSize'] ) ? $attributes['iconSize'] : 5;
		$icon_path          = isset( $icon_data['props']['children']['props']['d'] ) ? $icon_data['props']['children']['props']['d'] : 'M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z';
		$view_box           = isset( $icon_data['props']['viewBox'] ) ? $icon_data['props']['viewBox'] : '0 0 512 512';
		$icon_color         = isset( $attributes['iconColor'] ) ? $attributes['iconColor'] : '#000000';
		$font_size          = isset( $attributes['fontSize'] ) ? $attributes['fontSize'] . 'px' : '';
		$item_spacing       = isset( $attributes['itemSpacing'] ) ? $attributes['itemSpacing'] . 'px' : '';
		$columns            = isset( $attributes['columns'] ) ? $attributes['columns'] : 1;
		$max_mobile_columns = isset( $attributes['maxMobileColumns'] ) ? $attributes['maxMobileColumns'] : 1;

		$styles             = array(
			'padding-top'      => isset( $padding['top'] ) ? $padding['top'] : '',
			'padding-right'    => isset( $padding['right'] ) ? $padding['right'] : '',
			'padding-bottom'   => isset( $padding['bottom'] ) ? $padding['bottom'] : '',
			'padding-left'     => isset( $padding['left'] ) ? $padding['left'] : '',
			'margin-top'       => isset( $margin['top'] ) ? $margin['top'] . '!important' : '',
			'margin-right'     => isset( $margin['right'] ) ? $margin['right'] . '!important' : '',
			'margin-bottom'    => isset( $margin['bottom'] ) ? $margin['bottom'] . '!important' : '',
			'margin-left'      => isset( $margin['left'] ) ? $margin['left'] . '!important' : '',
			'text-align'       => isset( $attributes['alignment'] ) ? $attributes['alignment'] : '',
			'color'            => isset( $attributes['textColor'] ) ? $attributes['textColor'] : '',
			'background-color' => isset( $attributes['backgroundColor'] ) ? $attributes['backgroundColor'] : '',
		);
		$block_stylesheets .= $utils->generate_css_string( $styles );
		$block_stylesheets .= '} ';
		$block_stylesheets .= $prefix . ' li::before{';
		$icon_styles        = array(
			'height'           => '' . ( ( 4 + $icon_size ) / 10 ) . 'em',
			'width'            => '' . ( ( 4 + $icon_size ) / 10 ) . 'em',
			'top'              => ( $icon_size >= 5 ? 3 : ( $icon_size < 3 ? 2 : 0 )
			) . 'px',
			'font-size'        => '1em',
			'background-image' => 'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="' . $view_box . '"><path fill="%23' . substr( $icon_color, 1 ) . '"  d="' . $icon_path . '"></path></svg>\')',
		);
		$block_stylesheets .= $utils->generate_css_string( $icon_styles );
		$block_stylesheets .= '}';
		$block_stylesheets .= $prefix . ' li{';
		$list_item_styles   = array(
			'text-indent' => '-' . ( 0.4 + $icon_size * 0.1 ) . 'em;',
			'font-size'   => $font_size,
		);

		if ( $item_spacing > 0 ) {
			if ( isset( $attributes['list'] ) && '' !== $attributes['list'] ) {
				$list_item_styles['margin-bottom'] = $item_spacing;
			}
		}
		$block_stylesheets .= $utils->generate_css_string( $list_item_styles );

		$block_stylesheets .= '}';
		if ( $item_spacing > 0 ) {
			if ( isset( $attributes['list'] ) && '' !== $attributes['list'] ) {
				$prefix . ' li>ul{margin-top: ' . $item_spacing . 'px;}';
			} else {
				$prefix . ' .tableberg_styled_list_item:not(:first-child){' .
				'margin-top: ' . $item_spacing . 'px;' .
				'}' .
				$prefix . ' .tableberg_styled_list_sublist > .tableberg_styled_list_item:first-child{' .
				'margin-top: ' . $item_spacing . 'px;
			}';
			}
		}
		if ( ! isset( $attributes['list'] ) || '' === $attributes['list'] ) {
			if ( $columns > 1 ) {
				$block_stylesheets .= 'ul' . $prefix . '{' . PHP_EOL .
					'column-count: ' . $columns . ';' . PHP_EOL .
					'}';
			}
			if ( $columns > $max_mobile_columns ) {
				$block_stylesheets .= '@media (max-width: 599px){' . PHP_EOL .
						'ul' . $prefix . '{' . PHP_EOL .
						'column-count: ' . $max_mobile_columns . ';' . PHP_EOL .
						'}' . PHP_EOL .
						'}';
			}
			return $block_stylesheets;
		}
	}
	/**
	 * Renders the block on the server.
	 *
	 * @param array    $attributes The block attributes.
	 * @param string   $contents    The block content.
	 * @param WP_Block $block      The block object.
	 * @return string Returns the HTML content for the custom cell block.
	 */
	public function tableberg_render_styled_list_block( $attributes, $contents, $block ) {
		$list_items       = '';
		$block_attributes = isset( $block->parsed_block['attrs'] ) ? $block->parsed_block['attrs'] : $attributes;
		$list             = $attributes['list'];
		$list_item        = $attributes['listItem'];
		$icon_color       = $attributes['iconColor'];
		$icon_size        = $attributes['iconSize'];
		$is_root_list     = $attributes['isRootList'];
		$class_name       = isset( $attributes['className'] ) ? $attributes['className'] : '';
		$block_id         = $attributes['blockID'];
		$styles           = $this->get_styles( $block_attributes );

		add_action(
			'wp_head',
			function()use ( $styles ) {
				ob_start(); ?>

					<style><?php echo( $styles ); ?></style>

				<?php
				ob_end_flush();
			}
		);

		if ( json_encode( $list_item ) === '[' . join( ',', array_fill( 0, 3, '{"text":"","selectedIcon":"check","indent":0}' ) ) . ']' ) {
			$list_items = $list;
		} else {
			$sorted_items = array();

			foreach ( $list_item as $elem ) {
				$last = count( $sorted_items ) - 1;
				if ( count( $sorted_items ) === 0 || $sorted_items[ $last ][0]['indent'] < $elem['indent'] ) {
					array_push( $sorted_items, array( $elem ) );
				} elseif ( $sorted_items[ $last ][0]['indent'] === $elem['indent'] ) {
					array_push( $sorted_items[ $last ], $elem );
				} else {
					while ( $sorted_items[ $last ][0]['indent'] > $elem['indent'] ) {
						array_push( $sorted_items[ count( $sorted_items ) - 2 ], array_pop( $sorted_items ) );
						$last = count( $sorted_items ) - 1;
					}
					if ( $sorted_items[ $last ][0]['indent'] === $elem['indent'] ) {
						array_push( $sorted_items[ $last ], $elem );
					}
				}
			}
			$sorted_items_count = count( $sorted_items );
			while ( $sorted_items_count > 1 &&
			$sorted_items[ $sorted_items_count - 1 ][0]['indent'] > $sorted_items[ $sorted_items_count - 2 ][0]['indent'] ) {
				array_push( $sorted_items[ $sorted_items_count - 2 ], array_pop( $sorted_items ) );
			}

			if ( ! function_exists( 'make_list' ) ) {
				/**
				 * Make list.
				 *
				 * @param int    $num number of items.
				 * @param array  $item single item.
				 * @param string $color color.
				 * @param int    $size text size.
				 */
				function make_list( $num, $item, $color, $size ) {
					static $output_string = '';
					if ( 0 === $num && '' !== $output_string ) {
						$output_string = '';
					}
					if ( isset( $item['indent'] ) ) {
						$output_string .= '<li>' . ( '' === $item['text'] ? '<br/>' : $item['text'] ) . '</li>';
					} else {
						$output_string = substr_replace(
							$output_string,
							'<ul class="fa-ul">',
							strrpos( $output_string, '</li>' ),
							strlen( '</li>' )
						);

						foreach ( $item as $key => $sub_item ) {
							make_list( $key + 1, $sub_item, $color, $size );
						}
						$output_string .= '</ul></li>';
					}
					return $output_string;
				}
			}

			foreach ( $sorted_items as $key => $item ) {
				$list_items = make_list( $key, $item, $icon_color, $icon_size );
			}
		}
		if ( '' === $list ) {
			return '<ul class="' . ( $is_root_list ?
						( 'tableberg_styled_list' . (
								isset( $class_name ) ? ' ' . esc_attr( $class_name )
								: '' ) . '"'
						. ( '' === $block_id ? '' : ' id="tableberg_styled_list-' . $block_id . '"' ) )
					: 'tableberg_styled_list_sublist"' ) .
			'>' . $contents . '</ul>';

		} else {
			return '<div class="tableberg_styled_list ' . ( isset( $class_name ) ? ' ' . esc_attr( $class_name ) : '' ) . '"'
			. ( '' === $block_id ? '' : ' id="tableberg_styled_list-' . $block_id . '"' ) .
			'><ul class="fa-ul">' . $list_items . '</ul></div>';
		}
	}

	/**
	 * Register the block.
	 */
	public function styled_list_block_registration() {
		require_once TABLEBERG_PRO_DIR_PATH . 'includes/class-tableberg-pro-defaults-attributes.php';
		$defaults = new Defaults();

		register_block_type_from_metadata(
			TABLEBERG_PRO_DIR_PATH . 'dist/blocks/styled-list/block.json',
			array(
				'attributes'      => $defaults->get_default_attributes( 'tableberg/styled-list' ),
				'render_callback' => array( $this, 'tableberg_render_styled_list_block' ),
			)
		);
	}
}
new Styled_List();
