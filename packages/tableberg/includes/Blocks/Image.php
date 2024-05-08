<?php
/**
 * Image Block
 *
 * @package Tableberg
 */

namespace Tableberg\Blocks;

/**
 * Handle the block registration on server side and rendering.
 */
class Image {

	/**
	 * Constructor
	 *
	 * @return void
	 */
	public function __construct() {
		add_action( 'init', array( $this, 'block_registration' ) );
	}

	/**
	 * Check is border split
	 *
	 * @param array $border - block border.
	 */
	public function has_split_borders( $border = array() ) {
		$sides = array( 'top', 'right', 'bottom', 'left' );
		foreach ( $border as $side => $value ) {
			if ( in_array( $side, $sides, true ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Get the border from attributes
	 *
	 * @param array $object - block border.
	 */
	public function get_splitted_border( $object ) {
		$css = array();

		if ( ! $this->has_split_borders( $object ) ) {
			$css['top']    = $object;
			$css['right']  = $object;
			$css['bottom'] = $object;
			$css['left']   = $object;
			return $css;
		}

		return $object;
	}

	/**
	 * Get the single side of border
	 *
	 * @param array  $border - border.
	 * @param string $side - border side.
	 */
	public function get_single_side_border_value( $border, $side ) {
		$width = $border[ $side ]['width'] ?? '';
		$style = $border[ $side ]['style'] ?? '';
		$color = $border[ $side ]['color'] ?? '';

		return "{$width} " . ( $width && empty( $border[ $side ]['style'] ) ? 'solid' : $style ) . " {$color}";
	}

	/**
	 * Get border variables
	 *
	 * @param array $border_attribute - border.
	 */
	public function get_border_variables_css( $border_attribute ) {
		$border_sides     = array( 'top', 'right', 'bottom', 'left' );
		$splitted_borders = $this->get_splitted_border( $border_attribute );
		$borders          = array();

		foreach ( $border_sides as $side ) {
			$side_property = "border-$side";
			$side_value    = $this->get_single_side_border_value( $splitted_borders, $side );

			$borders[ $side_property ] = $side_value;
		}

		return $borders;
	}

	/**
	 * Build the CSS style for the image element.
	 *
	 * @param array  $borders The borders.
	 * @param string $aspect_ratio The aspect ratio.
	 * @param string $scale The scaling method.
	 * @param int    $width The width of the image.
	 * @param int    $height The height of the image.
	 * @param array  $border_radius The border radius of the image.
	 * @return string The CSS style string.
	 */
	public function build_image_style( $borders, $aspect_ratio, $scale, $width, $height, $border_radius ) {
		$style = '';

		if ( $aspect_ratio && ! empty( $aspect_ratio ) ) {
			$style .= "aspect-ratio: $aspect_ratio;";
		}

		if ( $scale && ! empty( $scale ) ) {
			$style .= "object-fit: $scale;";
		}

		if ( $width && ! empty( $width ) ) {
			$style .= "width: {$width};";
		}

		if ( $height && ! empty( $height ) ) {
			$style .= "height: {$height};";
		}

		if ( $borders && ! empty( $borders ) ) {
			foreach ( $borders as $property => $value ) {
				$style .= "$property:$value;";
			}
		}

		if ( $border_radius && ! empty( $border_radius ) ) {
			if ( isset( $border_radius['topLeft'] ) ) {
				$style .= 'border-top-left-radius:' . $border_radius['topLeft'] . ';';
			}
			if ( isset( $border_radius['topRight'] ) ) {
				$style .= 'border-top-right-radius:' . $border_radius['topRight'] . ';';
			}
			if ( isset( $border_radius['bottomLeft'] ) ) {
				$style .= 'border-bottom-left-radius:' . $border_radius['bottomLeft'] . ';';
			}
			if ( isset( $border_radius['bottomLeft'] ) ) {
				$style .= 'border-bottom-right-radius:' . $border_radius['bottomRight'] . ';';
			}
		}
		return $style;
	}

	/**
	 * Renders the custom image block on the server.
	 *
	 * @param array    $attributes The block attributes.
	 * @param string   $content    The block content.
	 * @param WP_Block $block      The block object.
	 * @return string Returns the HTML content for the custom image block.
	 */
	public function render_tableberg_image_block( $attributes, $content, $block ) {
		$size_slug    = $attributes['sizeSlug'];
		$media        = $attributes['media'];
		$url          = isset( $media['sizes'][ $size_slug ]['url'] ) ? $media['sizes'][ $size_slug ]['url'] : $media['url'] ?? '';
		$alt          = $attributes['alt'];
		$caption      = $attributes['caption'];
		$align        = $attributes['align'] ?? 'left';
		$href         = $attributes['href'];
		$rel          = $attributes['rel'];
		$link_class   = $attributes['linkClass'];
		$width        = $attributes['width'];
		$height       = $attributes['height'];
		$aspect_ratio = $attributes['aspectRatio'];
		$scale        = $attributes['scale'];
		$id           = isset( $media['id'] );
		$link_target  = $attributes['linkTarget'];

		$new_rel       = ! empty( $rel ) ? ' rel = "' . esc_attr( $rel ) . '"' : '';
		$border        = $this->get_border_variables_css( $attributes['border'] );
		$border_radius = $attributes['borderRadius'];

		$classes = join(
			' ',
			[
				'wp-block-tableberg-image',
				'tableberg-image-' . $align,
				'size-' . $size_slug,
				( $width || $height ) ? 'is-resized' : '',
			]
		);

		$image_classes = join(
			' ',
			array_filter(
				[
					$id ? 'wp-image-' . esc_attr( $id ) : '',
				]
			)
		);

		$image = sprintf(
			'<img src="%1$s" alt="%2$s" class="%3$s" style="%4$s" />',
			esc_url( $url ),
			esc_attr( $alt ),
			esc_attr( $image_classes ),
			$this->build_image_style( $border, $aspect_ratio, $scale, $width, $height, $border_radius )
		);

		$figure = '';

		if ( $href ) {
			$figure = sprintf(
				'<a href="%1$s" class="%2$s" target="%3$s"%4$s>%5$s</a>',
				esc_url( $href ),
				esc_attr( $link_class ),
				esc_attr( $link_target ),
				$new_rel,
				$image
			);
		} else {
			$figure = $image;
		}

		if ( ! empty( $caption ) ) {
			$figure .= sprintf(
				'<figcaption class="wp-element-caption">%1$s</figcaption>',
				esc_html( $caption )
			);
		}

		return sprintf(
			'<figure class="%1$s">%2$s</figure>',
			esc_attr( $classes ),
			$figure
		);
	}

	/**
	 * Register the block.
	 */
	public function block_registration() {
		register_block_type(
			TABLEBERG_DIR_PATH . 'build/image/block.json',
			array(
				'render_callback' => array( $this, 'render_tableberg_image_block' ),
			)
		);
	}
}
