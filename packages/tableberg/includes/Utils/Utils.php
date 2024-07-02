<?php

/**
 * Table Block
 *
 * @package Tableberg
 */

namespace Tableberg\Utils;

/**
 * Styling Help full functions utility class
 */
class Utils
{

	/**
	 * Get global font style variables for CSS.
	 * @return array CSS styles for the global font.
	 */
	public static function get_global_style_variables_css(array $attributes)
	{
		return [
			'--tableberg-global-text-color' => $attributes['fontColor'] ?? '',
			'--tableberg-global-link-color' => $attributes['linkColor'] ?? '',
			'--tableberg-global-font-size' => $attributes['fontSize'] ?? '',
		];
	}

	/**
	 * Get welcome page data.
	 *
	 * @return array
	 */
	public static function welcome_page()
	{
		return array(
			'welcome' => array(
				'title' => 'Welcome to Tableberg!',
				'content' => 'Elevate Your Content with Seamless Tables - The Ultimate WordPress Block Editor Plugin for Effortless Table Creation!',
			),
			'documentation' => array(
				'title' => 'Documentation',
				'content' => 'Elevate your space with Tableberg: a sleek, modern table block for style and functionality. Crafted for timeless elegance and versatility.',
			),
			'support' => array(
				'title' => 'Support',
				'content' => "Visit our Tableberg Support Page for quick solutions and assistance. We're here to ensure your Tableberg experience is seamless and satisfying.",
			),
			'community' => array(
				'title' => 'Join Community',
				'content' => 'Join the vibrant Tableberg community. Connect, share, and discover endless possibilities together. Elevate your experience with like-minded enthusiasts now!',
			),
			'upgrade' => array(
				'title' => 'Upgrade to Tableberg PRO!',
				'content' => 'Elevate Your Content with Seamless Tables - The Ultimate WordPress Block Editor Plugin for Effortless Table Creation!',
			),
		);
	}
	/**
	 * Get Individual Control.
	 *
	 * @return array
	 */
	public static function individual_control()
	{
		return array(
			array(
				'title' => 'Individual Control',
				'name' => 'individual_control',
				'content' => 'Elevate Your Content with Seamless Tables - The Ultimate WordPress Block Editor Plugin for Effortless Table Creation!',
				'active' => false,
			),
		);
	}
	/**
	 * Get global control.
	 *
	 * @return array
	 */
	public static function global_control()
	{
		return array(
			array(
				'title' => 'Global Control',
				'name' => 'global_control',
				'content' => 'Elevate Your Content with Seamless Tables - The Ultimate WordPress Block Editor Plugin for Effortless Table Creation!',
				'active' => true,
			),
		);
	}
	/**
	 * Get default block properties.
	 *
	 * @return array
	 */
	public static function default_block_properties()
	{
		return array(
			array(
				'title' => 'Default Row Number',
				'name' => 'row_number',
				'content' => 'Set your default row number of the table when you add Tableberg to your site. Further you can increase or decrease it there simply.',
				'value' => 3,
			),
			array(
				'title' => 'Default Column Number',
				'name' => 'column_number',
				'content' => 'Set your default column number of the table when you add Tableberg to your site. Further you can increase or decrease it there simply.',
				'value' => 3,
			),
			array(
				'title' => 'Default Property Font Size',
				'name' => 'font_size',
				'content' => 'Set your default FONT SIZE of the PROPERTY of the table when you add Tableberg to your site. Further you can increase or decrease it there simply.',
				'value' => 18,
			),
		);
	}
	/**
	 * Check if border has split borders.
	 *
	 * @param array $border - block border.
	 * @return bool Whether the border has split sides.
	 */
	public static function has_split_borders($border = array())
	{
		$sides = array('top', 'right', 'bottom', 'left');
		foreach ($border as $side => $value) {
			if (in_array($side, $sides, true)) {
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
	public static function get_border_css($object)
	{
		$css = array();

		if (!self::has_split_borders($object)) {
			$css['top'] = $object;
			$css['right'] = $object;
			$css['bottom'] = $object;
			$css['left'] = $object;
			return $css;
		}

		return $object;
	}



	public static function get_border_style($object): array
	{

		if (is_string($object)) {
			return [
				'border' => $object
			];
		}
		if (isset($object['color']) || isset($object['width'])) {
			return [
				'border-width' => $object['width'] ?? '',
				'border-color' => $object['color'] ?? '',
			];
		}
		$css = [];

		foreach ($object as $key => $value) {
			$css['border-' . $key . '-width'] = $value['width'] ?? '';
			$css['border-' . $key . '-color'] = $value['color'] ?? '';
		}
		return $css;
	}
	public static function get_border_radius_style($object): array
	{
		if (is_string($object)) {
			return [
				'border-radius' => $object
			];
		}

		$css = [];

		foreach ($object as $key => $value) {
			$corner = strtolower(preg_replace('/(?<!^)[A-Z]/', '-$0', $key));
			$css['border-' . $corner . '-radius'] = $value;
		}
		return $css;
	}

	public static function get_border_radius_var($object, string $prefix, &$hasValue = false): array
	{
		if (is_string($object)) {
			$hasValue = $object != '0px';
			return [
				$prefix . '-top-left' => $object,
				$prefix . '-top-right' => $object,
				$prefix . '-bottom-left' => $object,
				$prefix . '-bottom-right' => $object,
			];
		}

		$css = [];

		foreach ($object as $key => $value) {
			$corner = strtolower(preg_replace('/(?<!^)[A-Z]/', '-$0', $key));
			$css[$prefix . '-' . $corner] = $value;
			if ($value != '0px') {
				$hasValue = true;
			}
		}
		return $css;
	}

	/**
	 * Get the CSS value for a single side of the border.
	 *
	 * @param array  $border - border.
	 * @param string $side - border side.
	 * @return string CSS value for the specified side.
	 */
	public static function get_single_side_border_value($border, $side)
	{
		$width = $border[$side]['width'] ?? '';
		$style = $border[$side]['style'] ?? '';
		$color = $border[$side]['color'] ?? '';

		return "{$width} " . ($width && empty($border[$side]['style']) ? 'solid' : $style) . " {$color}";
	}
	/**
	 * Check if a value is considered empty based on certain conditions.
	 *
	 * @param mixed $value - The value to check.
	 * @return bool Whether the value is considered empty.
	 */
	public static function is_value_empty($value)
	{
		return (
			self::is_undefined($value) ||
			false === $value ||
			trim($value) === '' ||
			trim($value) === 'undefined undefined undefined' ||
			empty($value)
		);
	}
	/**
	 * Get border variables for CSS.
	 *
	 * @param array  $border - border.
	 * @param string $slug - slug to use in variable.
	 * @return array CSS styles for the border variables.
	 */
	public static function get_border_variables_css($border, $slug)
	{
		$border_in_dimensions = self::get_border_css($border);
		$border_sides = array('top', 'right', 'bottom', 'left');
		$borders = array();

		foreach ($border_sides as $side) {
			$side_property = "--tableberg-{$slug}-border-{$side}";
			$side_value = self::get_single_side_border_value($border_in_dimensions, $side);
			$borders[$side_property] = $side_value;
		}

		return $borders;
	}

	/**
	 * Check if spacing value is preset or custom.
	 *
	 * @param string $value - spacing value.
	 * @return bool Whether the value is a preset or custom spacing.
	 */
	public static function is_value_spacing_preset($value)
	{
		if (!$value || !is_string($value)) {
			return false;
		}
		return '0' === $value || strpos($value, 'var:preset|spacing|') === 0;
	}

	/**
	 * Return the spacing variable for CSS.
	 *
	 * @param string $value - spacing value.
	 * @return string CSS variable or the original value.
	 */
	public static function get_spacing_preset_css_var($value)
	{
		if (!$value) {
			return null;
		}

		$matches = array();
		preg_match('/var:preset\|spacing\|(.+)/', $value, $matches);

		if (empty($matches)) {
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
	public static function get_spacing_css($object)
	{
		$css = array();

		foreach ($object as $key => $value) {
			if (self::is_value_spacing_preset($value)) {
				$css[$key] = self::get_spacing_preset_css_var($value);
			} else {
				$css[$key] = $value;
			}
		}

		return $css;
	}

	/**
	 * Get the CSS for spacing.
	 *
	 * @param array $object - spacing object.
	 * @return array CSS styles for spacing.
	 */
	public static function get_spacing_style(array $object, string $prop)
	{
		$css = [];

		foreach ($object as $key => $value) {
			if (self::is_value_spacing_preset($value)) {
				$css[$prop . '-' . $key] = self::get_spacing_preset_css_var($value);
			} else {
				$css[$prop . '-' . $key] = $value;
			}
		}

		return $css;
	}


	/**
	 * Get the CSS for spacing.
	 *
	 * @param string $value - spacing value.
	 * @return string CSS styles for spacing.
	 */
	public static function get_spacing_css_single($value)
	{
		if (self::is_value_spacing_preset($value)) {
			return self::get_spacing_preset_css_var($value);
		} else {
			return $value;
		}
	}

	/**
	 * Check if a value is undefined.
	 *
	 * @param mixed $value - value.
	 * @return bool Whether the value is undefined.
	 */
	public static function is_undefined($value)
	{
		return null === $value || !isset($value) || empty($value);
	}

	/**
	 * Generate CSS string if value is not empty.
	 *
	 * @param array $styles - CSS styles.
	 * @return string Generated CSS string.
	 */
	public static function generate_css_string($styles)
	{
		$css_string = '';

		foreach ($styles as $key => $value) {
			if (!self::is_undefined($value) && false !== $value && trim($value) !== '' && trim($value) !== 'undefined undefined undefined' && !empty($value)) {
				$css_string .= $key . ': ' . $value . '; ';
			}
		}

		return esc_attr($css_string);
	}

	/**
	 * Get background color or gradient.
	 *
	 * @param array  $attributes - block attributes.
	 * @param string $color_attr_key - block background color attribute key.
	 * @param string $gradient_attr_key - block background gradient attribute key.
	 * @return string Background color or gradient.
	 */
	public static function get_background_color($attributes, $color_attr_key, $gradient_attr_key)
	{
		$bg_color = '';
		if (!empty($attributes[$color_attr_key])) {
			$bg_color = $attributes[$color_attr_key];
		} elseif (!empty($attributes[$gradient_attr_key])) {
			$bg_color = $attributes[$gradient_attr_key];
		}
		return $bg_color;
	}


	public static function get_any(array $attributes, string ...$keys)
	{
		foreach ($keys as $key) {
			if (isset($attributes[$key]) && $attributes[$key]) {
				return $attributes[$key];
			}
		}
		return '';
	}
}
