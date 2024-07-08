<?php
/**
 * Button Block
 *
 * @package Tableberg
 */

namespace Tableberg\Blocks;

use Tableberg\Utils\Utils;

/**
 * Handle the block registration on server side and rendering.
 */
class Button
{

	/**
	 * Constructor
	 *
	 * @return void
	 */
	public function __construct()
	{
		add_action('init', array($this, 'block_registration'));
	}

	/**
	 * Get border CSS styles from border style array
	 *
	 * @param array $border_style - border style array.
	 * @return string   border CSS inline style string
	 */
	public function get_border_style($border_style)
	{
		if (!is_array($border_style)) {
			return "";
		}

		$radius = $border_style['radius'];
		if (!is_array($radius)) {
			return "border-radius: {$radius};";
		}

		if (is_array($radius) && count($border_style['radius']) === 4) {
			return "border-top-left-radius: {$border_style['radius']['topLeft']};" .
				"border-bottom-left-radius: {$border_style['radius']['bottomLeft']};" .
				"border-bottom-right-radius: {$border_style['radius']['bottomRight']};" .
				"border-top-right-radius: {$border_style['radius']['topRight']};";
		}
		return "";
	}
	/**
	 * Get block styles.
	 *
	 * @param array $attributes - block attributes.
	 * @return string Generated CSS styles.
	 */
	public static function get_styles($attributes)
	{
		if (!isset($attributes['textHoverColor'])) {
			$attributes['textHoverColor'] = "";
		}
		if (!isset($attributes['textColor'])) {
			$attributes['textColor'] = "";
		}

		$background_color = Utils::get_background_color($attributes, 'backgroundColor', 'backgroundGradient');
		$background_hover_color = Utils::get_background_color($attributes, 'backgroundHoverColor', 'backgroundHoverGradient');


		$styles = array(
			'--tableberg-button-background-color' => $background_color,
			'--tableberg-button-hover-background-color' => $background_hover_color,
			'--tableberg-button-text-hover-color' => $attributes['textHoverColor'],
			'--tableberg-button-text-color' => $attributes['textColor']
		);

		if (isset($attributes['padding'])) {
			$p = Utils::get_spacing_css($attributes['padding']);
			$styles += [
				'padding-top' => $p['top'] ?? '',
				'padding-right' => $p['right'] ?? '',
				'padding-bottom' => $p['bottom'] ?? '',
				'padding-left' => $p['left'] ?? '',
			];
		}

		return Utils::generate_css_string($styles);
	}
	/**
	 * Get block classes.
	 *
	 * @param array $attributes - block attributes.
	 * @return string Generated block classess.
	 */
	public static function get_classes($attributes)
	{
		if (!isset($attributes['backgroundColor'])) {
			$attributes['backgroundColor'] = "";
		}
		if (!isset($attributes['backgroundHoverColor'])) {
			$attributes['backgroundHoverColor'] = "";
		}
		if (!isset($attributes['textHoverColor'])) {
			$attributes['textHoverColor'] = "";
		}
		if (!isset($attributes['textColor'])) {
			$attributes['textColor'] = "";
		}
		if (!isset($attributes['backgroundGradient'])) {
			$attributes['backgroundGradient'] = "";
		}
		if (!isset($attributes['backgroundHoverGradient'])) {
			$attributes['backgroundHoverGradient'] = "";
		}
		if (!isset($attributes['fontSize'])) {
			$attributes['fontSize'] = "";
		}

		$classes = join(
			' ',
			array(
				!Utils::is_value_empty($attributes['backgroundColor']) || !Utils::is_value_empty($attributes['backgroundGradient']) ? 'has-background-color' : '',
				!Utils::is_value_empty($attributes['backgroundHoverColor']) || !Utils::is_value_empty($attributes['backgroundHoverGradient']) ? 'has-hover-background-color' : '',
				!Utils::is_value_empty($attributes['textHoverColor']) ? 'has-hover-text-color' : '',
				!Utils::is_value_empty($attributes['textColor']) ? 'has-text-color' : '',
				!Utils::is_value_empty($attributes['fontSize']) ? 'has-' . $attributes['fontSize'] . '-font-size' : '',
			)
		);
		return $classes;
	}
	/**
	 * Renders the custom button block on the server.
	 *
	 * @param array    $attributes The block attributes.
	 * @param string   $content    The block content.
	 * @param WP_Block $block      The block object.
	 * @return string  Returns the HTML content for the custom button block.
	 */
	public function render_tableberg_button_block($attributes, $content, $block)
	{
		$text = isset($attributes['text']) ? $attributes['text'] : '';
		$align = isset($attributes['align']) ? $attributes['align'] : '';
		$width = isset($attributes['width']) ? $attributes['width'] : '';
		$text_align = isset($attributes['textAlign']) ? $attributes['textAlign'] : '';
		$id = isset($attributes['id']) ? $attributes['id'] : '';
		$url = isset($attributes['url']) ? $attributes['url'] : '';
		$link_target = isset($attributes['linkTarget']) ? $attributes['linkTarget'] : '';
		$rel = isset($attributes['rel']) ? $attributes['rel'] : '';
		$style = isset($attributes['style']) ? $attributes['style'] : '';
		$font_size = isset($attributes['fontSize']) ? $attributes['fontSize'] : '';
		$border = isset($style['border']) ? $style['border'] : '';

		$classes = trim(
			join(
				' ',
				array(
					'wp-block-tableberg-button',
					$align ? "block-align-{$align}" : '',
					$width ? "has-custom-width wp-block-button__width-{$width}" : '',
					$font_size ? 'has-custom-font-size' : '',
					$this->get_classes($attributes),
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
				$this->get_styles($attributes),
				$this->get_border_style($border),
			)
		);

		$button_attrs = sprintf('class="%1$s" style="%2$s"', esc_attr($button_classes), esc_attr($button_styles));

		$button = $url ? sprintf(
			'<a href="%1$s" %2$s rel="%3$s" target="%4$s">%5$s</a>',
			$url,
			$button_attrs,
			esc_attr($rel),
			esc_attr($link_target),
			wp_kses_post($text)
		) :
			sprintf('<div %1$s>%2$s</div>', $button_attrs, wp_kses_post($text));

		return sprintf('<div class="%1$s" id="%2$s">%3$s</div>', $classes, esc_attr($id), $button);
	}

	/**
	 * Register the block.
	 */
	public function block_registration()
	{
		$json = TABLEBERG_DIR_PATH . 'build/button/block.json';
		register_block_type(
			$json,
			array(
				'attributes' => json_decode(file_get_contents($json), true)['attributes'],
				'render_callback' => array($this, 'render_tableberg_button_block'),
			)
		);
	}
}
