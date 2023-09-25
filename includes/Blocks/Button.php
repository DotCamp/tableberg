<?php

/**
 * Button Block
 *
 * @package Tableberg
 */

namespace Tableberg\Blocks;

/**
 * Handle the block registration on server side and rendering.
 */
class Button {

	/**
	 * Constructor
	 *
	 * @return void
	 */
public function __construct() {
	 add_action( 'init', array( $this, 'block_registration' ) );
}

	/**
	 * Get border CSS styles from border style array
	 *
	 * @param array $border_style - border style array
	 * @return string   border CSS inline style string
	 */
public function get_border_style( $border_style ) {
	 $radius = $border_style['radius'];
	if ( ! is_array( $radius ) ) {
		return "border-radius: {$radius};";
	}

	/**
	 * Renders the custom button block on the server.
	 *
	 * @param array    $attributes The block attributes.
	 * @param string   $content    The block content.
	 * @param WP_Block $block      The block object.
	 * @return string  Returns the HTML content for the custom button block.
	 */
	public function render_tableberg_button_block( $attributes, $content, $block ) {
		$text                   = isset( $attributes['text'] ) ? $attributes['text'] : '';
		$width                  = isset( $attributes['width'] ) ? $attributes['width'] : '';
		$background_color       = isset( $attributes['backgroundColor'] ) ? $attributes['backgroundColor'] : '';
		$text_color             = isset( $attributes['textColor'] ) ? $attributes['textColor'] : '';
		$background_hover_color =
			$attributes['backgroundHoverColor'] ??
			$attributes['background_color'] ??
			'var(--wp--preset--color--primary)';
		$text_hover_color       =
			$attributes['textHoverColor'] ??
			$attributes['text_color'] ??
			'var(--wp--preset--color--base)';
		$text_align             = isset( $attributes['textAlign'] ) ? $attributes['textAlign'] : '';
		$id                     = isset( $attributes['id'] ) ? $attributes['id'] : '';
		$url                    = isset( $attributes['url'] ) ? $attributes['url'] : '';
		$link_target            = isset( $attributes['linkTarget'] ) ? $attributes['linkTarget'] : '';
		$rel                    = isset( $attributes['rel'] ) ? $attributes['rel'] : '';
		$style                  = isset( $attributes['style'] ) ? $attributes['style'] : '';
		$font_size              = isset( $attributes['fontSize'] ) ? $attributes['fontSize'] : '';

		$classes = trim(
			join(
				' ',
				array(
					'wp-block-tableberg-button',
					( $width ) ? "has-custom-width wp-block-button__width-{$width}" : '',
					$font_size ? 'has-custom-font-size' : '',
				)
			)
		);

		$classes = trim(
			join(
				' ',
				array(
					'wp-block-tableberg-button',
					( $width ) ? "has-custom-width wp-block-button__width-{$width}" : '',
					$style['fontSize'] ? 'has-custom-font-size' : '',
				)
			)
		);

		$button_classes = trim(
			join(
				' ',
				array(
					'wp-block-button__link',
					'wp-element-button',
					$text_align ? "has-text-align-{$text_align}" : '',
				)
			)
		);

		$button_styles = join(
			'',
			array(
				$text_color ? "color: {$text_color};" : '',
				$background_color ? "background-color: {$background_color};" : '',
				"--text-hover-color: {$text_hover_color};",
				"--background-hover-color: {$background_hover_color};",
				$this->get_border_style( $style['border'] ),
			)
		);

		$button_attrs = sprintf( 'class="%1$s" style="%2$s"', esc_attr( $button_classes ), esc_attr( $button_styles ) );

		$button = $url ? sprintf(
			'<a href="%1$s" %2$s rel="%3$s" target="%4$s">%5$s</a>',
			$url,
			$button_attrs,
			esc_attr( $rel ),
			esc_attr( $link_target ),
			esc_html( $text )
		) :
			sprintf( '<div %1$s>%2$s</div>', $button_attrs, esc_html( $text ) );

		return sprintf( '<div class="%1$s" id="%2$s">%3$s</div>', $classes, esc_attr( $id ), $button );
	}

	/**
	 * Register the block.
	 */
	public function block_registration() {
		register_block_type(
			TABLEBERG_DIR_PATH . 'build/button/block.json',
			array(
				'render_callback' => array( $this, 'render_tableberg_button_block' ),
			)
		);
	}
}
