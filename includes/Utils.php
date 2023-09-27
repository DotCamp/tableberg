<?php
/**
 * Table Block
 *
 * @package Tableberg
 */

namespace Tableberg;

/**
 * Styling Help full functions utility class
 */
class Utils {
	/**
	 * Check if border has split borders.
	 *
	 * @param array $border - block border.
	 * @return bool Whether the border has split sides.
	 */
	public static function has_split_borders( $border = array() ) {
		$sides = array( 'top', 'right', 'bottom', 'left' );
		foreach ( $border as $side => $value ) {
			if ( in_array( $side, $sides, true ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Get the border CSS from attributes.
	 *
	 * @param array $object - block border.
	 * @return array CSS styles for the border.
	 */
	public static function get_border_css( $object ) {
		$css = array();

		if ( ! self::has_split_borders( $object ) ) {
			$css['top']    = $object;
			$css['right']  = $object;
			$css['bottom'] = $object;
			$css['left']   = $object;
			return $css;
		}

		return $object;
	}

	/**
	 * Get the CSS value for a single side of the border.
	 *
	 * @param array  $border - border.
	 * @param string $side - border side.
	 * @return string CSS value for the specified side.
	 */
	public static function get_single_side_border_value( $border, $side ) {
		$width = $border[ $side ]['width'] ?? '';
		$style = $border[ $side ]['style'] ?? '';
		$color = $border[ $side ]['color'] ?? '';

		return "{$width} " . ( $width && empty( $border[ $side ]['style'] ) ? 'solid' : $style ) . " {$color}";
	}

	/**
	 * Get border variables for CSS.
	 *
	 * @param array  $border - border.
	 * @param string $slug - slug to use in variable.
	 * @return array CSS styles for the border variables.
	 */
	public static function get_border_variables_css( $border, $slug ) {
		$border_in_dimensions = self::get_border_css( $border );
		$border_sides         = array( 'top', 'right', 'bottom', 'left' );
		$borders              = array();

		foreach ( $border_sides as $side ) {
			$side_property             = "--tableberg-{$slug}-border-{$side}";
			$side_value                = self::get_single_side_border_value( $border_in_dimensions, $side );
			$borders[ $side_property ] = $side_value;
		}

		return $borders;
	}

	/**
	 * Check if spacing value is preset or custom.
	 *
	 * @param string $value - spacing value.
	 * @return bool Whether the value is a preset or custom spacing.
	 */
	public static function is_value_spacing_preset( $value ) {
		if ( ! $value || ! is_string( $value ) ) {
			return false;
		}
		return '0' === $value || strpos( $value, 'var:preset|spacing|' ) === 0;
	}

	/**
	 * Return the spacing variable for CSS.
	 *
	 * @param string $value - spacing value.
	 * @return string CSS variable or the original value.
	 */
	public static function get_spacing_preset_css_var( $value ) {
		if ( ! $value ) {
			return null;
		}

		$matches = array();
		preg_match( '/var:preset\|spacing\|(.+)/', $value, $matches );

		if ( empty( $matches ) ) {
			return $value;
		}
		return "var(--wp--preset--spacing--{$matches[1]})";
	}

	/**
	 * Get the CSS for spacing.
	 *
	 * @param array $object - spacing object.
	 * @return array CSS styles for spacing.
	 */
	public static function get_spacing_css( $object ) {
		$css = array();

		foreach ( $object as $key => $value ) {
			if ( self::is_value_spacing_preset( $value ) ) {
				$css[ $key ] = self::get_spacing_preset_css_var( $value );
			} else {
				$css[ $key ] = $value;
			}
		}

		return $css;
	}

	/**
	 * Check if a value is undefined.
	 *
	 * @param mixed $value - value.
	 * @return bool Whether the value is undefined.
	 */
	public static function is_undefined( $value ) {
		return null === $value || ! isset( $value ) || empty( $value );
	}

	/**
	 * Generate CSS string if value is not empty.
	 *
	 * @param array $styles - CSS styles.
	 * @return string Generated CSS string.
	 */
	public static function generate_css_string( $styles ) {
		$css_string = '';

		foreach ( $styles as $key => $value ) {
			if ( ! self::is_undefined( $value ) && false !== $value && trim( $value ) !== '' && trim( $value ) !== 'undefined undefined undefined' && ! empty( $value ) ) {
				$css_string .= $key . ': ' . $value . '; ';
			}
		}

		return $css_string;
	}

	/**
	 * Get background color or gradient.
	 *
	 * @param array  $attributes - block attributes.
	 * @param string $color_attr_key - block background color attribute key.
	 * @param string $gradient_attr_key - block background gradient attribute key.
	 * @return string Background color or gradient.
	 */
	public static function get_background_color( $attributes, $color_attr_key, $gradient_attr_key ) {
		$bg_color = '';
		if ( ! empty( $attributes[ $color_attr_key ] ) ) {
			$bg_color = $attributes[ $color_attr_key ];
		} elseif ( ! empty( $attributes[ $gradient_attr_key ] ) ) {
			$bg_color = $attributes[ $gradient_attr_key ];
		}
		return $bg_color;
	}
}
