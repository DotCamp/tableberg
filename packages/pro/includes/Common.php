<?php

namespace Tableberg\Pro;

/**
 * Common functions and variables.
 *
 * @package Tableberg_Pro
 */

/**
 *
 * Provides the common functions and variables
 */
class Common
{

	private static $count = 0;

	/**
	 * Generate the star for star rating block.
	 *
	 * @param int    $value selected stars.
	 * @param int    $limit stars count.
	 * @param string $id    star icon id.
	 * @param string $inactive_star_color inactive stars color.
	 * @param string $active_star_color active stars color.
	 * @param string $star_outline_color stars outline color.
	 * @param string $class_name star icon class.
	 * @param string $mask_name star mask name.
	 * @param string $size stars size.
	 */
	public static function generate_star_display(
		$value,
		$limit,
		$inactive_star_color,
		$active_star_color = '#eeee00',
		$star_outline_color = '#000000',
		$size = 20
	) {
		$stars = '';

		$id = 'tableberg_star_' . (++self::$count);

		$star_route = 'm0.75,56.89914l56.02207,0l17.31126,-56.14914l17.31126,56.14914l56.02206,0l-45.32273,34.70168l17.31215,56.14914l-45.32274,-34.70262l-45.32274,34.70262l17.31215,-56.14914l-45.32274,-34.70168z';

		foreach (range(0, $limit - 1) as $current) {
			$width = ($value - $current > 0 ?
				($value - $current < 1 ? $value - $current : 1) : 0) * 150;
			$stars .= '
			<svg xmlns="http://www.w3.org/2000/svg" height="' . $size . '" width="' . $size . '" viewBox="0 0 150 150">
			    <defs>
				    <mask id="' . $id . '-' . $current . '">
				        <rect height="150" width="' . $width . '" y="0" x="0" fill="#fff"/>
					</mask>
				</defs>
				<path
					fill="' . $inactive_star_color . '"
					stroke-width="2.5"
					d="' . $star_route . '"
					stroke="' . $star_outline_color . '
				"/>
				<path
					class="star"
					id="star' . $current . '"
					mask="url(#' . $id . '-' . $current . ')"
					fill="' . $active_star_color . '"
					strokeWidth="2.5"
					d="' . $star_route . '"
					stroke="' . $star_outline_color . '
				"/>
			</svg>';
		}

		return $stars;
	}

	private static function get_wp_icon_svg(array $icon, array $custom_attrs): string
	{
		if (isset($icon['type'])) {
			$tag = strtolower($icon['type']['displayName']);
		} else {
			$tag = 'path';
		}


		$attrs = '';
		$childrenStr = false;
		foreach ($icon['props'] as $attr => $val) {
			if ($attr == 'children') {
				$childrenStr = self::get_wp_icon_svg($val, []);
				continue;
			}
			$attrs .= ' ' . $attr . '="' . esc_attr($val) . '"';
		}

		foreach ($custom_attrs as $attr => $val) {
			$attrs .= ' ' . $attr . '="' . $val . '"';
		}


		if ($childrenStr) {
			return '<' . $tag . $attrs . '>' . $childrenStr . '</' . $tag . '>';
		}
		return '<' . $tag . $attrs . '/>';
	}


	private static function get_fontawesome_icon_svg(array $icon, array $custom_attrs): string
	{
		$attrs = '';
		$childrenStr = false;
		foreach ($icon['props'] as $attr => $val) {
			if ($attr == 'children') {
				$childrenStr = self::get_fontawesome_icon_svg($val, []);
				continue;
			}
			$attrs .= ' ' . $attr . '="' . esc_attr($val) . '"';
		}

		foreach ($custom_attrs as $attr => $val) {
			$attrs .= ' ' . $attr . '="' . $val . '"';
		}

		$tag = $icon['type'];
		if ($childrenStr) {
			return '<' . $tag . $attrs . '>' . $childrenStr . '</' . $tag . '>';
		}
		return '<' . $tag . $attrs . '/>';
	}

	public static function get_icon_svg(array $attrs, array $custom_attrs = [])
	{
		if (!isset($attrs['icon']) || !isset($attrs['icon']['icon'])) {
			return '';
		}
		$icon = $attrs['icon'];
		if ($icon['type'] === 'wordpress') {
			return self::get_wp_icon_svg($icon['icon'], $custom_attrs);
		}
		return self::get_fontawesome_icon_svg($icon['icon'], $custom_attrs);
	}
}
