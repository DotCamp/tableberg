<?php
/**
 * Table Block
 *
 * @package Tableberg
 */

namespace Tableberg\Blocks;

use Tableberg;
use WP_Block;

/**
 * Handle the block registration on server side and rendering.
 */
class Table {

	/**
	 * Constructor
	 *
	 * @return void
	 */
	public function __construct() {
		add_action( 'init', array( $this, 'block_registration' ) );
	}

	/**
	 * Get block styles.
	 *
	 * @param array $attributes - block attributes.
	 * @return string Generated CSS styles.
	 */
	public static function get_styles( $attributes ) {
		$header_bg_color   = \Tableberg\Utils::get_background_color( $attributes, 'headerBackgroundColor', 'headerBackgroundGradient' );
		$even_row_bg_color = \Tableberg\Utils::get_background_color( $attributes, 'evenRowBackgroundColor', 'evenRowBackgroundGradient' );
		$odd_row_bg_color  = \Tableberg\Utils::get_background_color( $attributes, 'oddRowBackgroundColor', 'oddRowBackgroundGradient' );
		$footer_bg_color   = \Tableberg\Utils::get_background_color( $attributes, 'footerBackgroundColor', 'footerBackgroundGradient' );

		$cell_padding = \Tableberg\Utils::get_spacing_css( $attributes['cellPadding'] );

		$table_border_variables = \Tableberg\Utils::get_border_variables_css( $attributes['tableBorder'], 'table' );
		$inner_border_variables = $attributes['enableInnerBorder'] ? \Tableberg\Utils::get_border_variables_css( $attributes['innerBorder'], 'inner' ) : array();

		$styles = array(
			'--tableber-table-width'          => $attributes['tableWidth'],
			'--tableberg-header-bg-color'     => $header_bg_color,
			'--tableberg-even-row-bg-color'   => $even_row_bg_color,
			'--tableberg-odd-row-bg-color'    => $odd_row_bg_color,
			'--tableberg-footer-bg-color'     => $footer_bg_color,
			'--tableberg-cell-padding-top'    => $cell_padding['top'] ?? '',
			'--tableberg-cell-padding-right'  => $cell_padding['right'] ?? '',
			'--tableberg-cell-padding-bottom' => $cell_padding['bottom'] ?? '',
			'--tableberg-cell-padding-left'   => $cell_padding['left'] ?? '',
		) + $table_border_variables + $inner_border_variables;

		return \Tableberg\Utils::generate_css_string( $styles );
	}

	/**
	 * Class if styling is applied.
	 *
	 * @param array $attributes The block attributes.
	 * @return array CSS classes based on attributes.
	 */
	public function get_style_class( $attributes ) {
		$table_width         = $attributes['tableWidth'];
		$table_alignment     = $attributes['tableAlignment'];
		$enable_inner_border = $attributes['enableInnerBorder'];
		$classes             = array();
		if ( $enable_inner_border ) {
			$classes[] = 'has-inner-border';
		}
		$is_value_empty = function( $value ) {
			return (
				is_null( $value ) ||
				false === $value ||
				trim( $value ) === '' ||
				trim( $value ) === 'undefined undefined undefined' ||
				empty( $value )
			);
		};

		if ( ! $is_value_empty( $table_width ) ) {
			$classes[] = 'has-table-width';
		}
		if ( ! $is_value_empty( $table_alignment ) ) {
			$classes[] = 'justify-table-' . $table_alignment;
		}

		return $classes;
	}
	/**
	 * Renders the custom table block on the server.
	 *
	 * @param array    $attributes The block attributes.
	 * @param string   $content    The block content.
	 * @param WP_Block $block      The block object.
	 * @return string Returns the HTML content for the custom table block.
	 */
	public function render_tableberg_table_block( $attributes, $content, $block ) {
		$class_names        = $this->get_style_class( $attributes );
		$style              = $this->get_styles( $attributes );
		$wrapper_attributes = get_block_wrapper_attributes(
			array(
				'class' => trim( join( ' ', $class_names ) ),
				'style' => $style,
			)
		);

		$pattern = '/<table[^>]*>/s';
		if ( preg_match( $pattern, $content, $matches ) ) {
			$table_element = $matches[0];

			$content = str_replace( $table_element, '<table ' . $wrapper_attributes . ' >', $content );
		}
		return $content;
	}

	/**
	 * Register the block.
	 */
	public function block_registration() {
		$defaults         = new \Tableberg\Defaults();
		$tableberg_assets = new Tableberg\Assets();
		$tableberg_assets->register_blocks_assets();
		register_block_type(
			TABLEBERG_DIR_PATH . 'build/block.json',
			array(
				'attributes'      => $defaults->get_default_attributes( 'tableberg/table' ),
				'render_callback' => array( $this, 'render_tableberg_table_block' ),
			)
		);
	}
}
