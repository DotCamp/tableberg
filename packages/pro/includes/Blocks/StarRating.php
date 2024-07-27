<?php

namespace Tableberg\Pro\Blocks;


use Tableberg\Pro\Common;
use Tableberg\Utils\Utils;

/**
 * Register Star rating block
 *
 * @package Tableberg_Pro
 */

/**
 * Manage star rating block registration.
 */
class StarRating
{

	/**
	 * Constructor
	 *
	 * @return void
	 */
	public function __construct()
	{
		add_action('init', array($this, 'star_rating_block_registration'));
	}
	/**
	 * Get block styles.
	 *
	 * @param array $attributes - block attributes.
	 * @return string Generated CSS styles.
	 */
	public static function get_styles($attributes)
	{

		$padding = Utils::get_spacing_css($attributes['padding']);
		$margin = Utils::get_spacing_css($attributes['margin']);

		$styles = array(
			'padding-top' => $padding['top'] ?? '',
			'padding-right' => $padding['right'] ?? '',
			'padding-bottom' => $padding['bottom'] ?? '',
			'padding-left' => $padding['left'] ?? '',
			'margin-top' => $margin['top'] ?? '',
			'margin-right' => $margin['right'] ?? '',
			'margin-bottom' => $margin['bottom'] ?? '',
			'margin-left' => $margin['left'] ?? '',
		);

		return Utils::generate_css_string($styles);
	}
	/**
	 * Renders the custom cell block on the server.
	 *
	 * @param array    $attributes The block attributes.
	 * @param string   $content    The block content.
	 * @param WP_Block $block      The block object.
	 * @return string Returns the HTML content for the custom cell block.
	 */
	public function render_star_rating_block($attributes, $content, $block)
	{

		$style = self::get_styles($attributes);
		$starsClassName = 'tableberg-stars';

		if (isset($attributes['starAlign'])) {
			$align = $attributes['starAlign'];
			if ($align !== 'left') {
				$starsClassName .= ' tableberg-stars-' . $align;
			}
		}

		$reviewText = '';

		if ($attributes['reviewText']) {
			$textStyle = '';
			if (isset($attributes['reviewText'])) {
				$reviewText = wp_kses_data($attributes['reviewText']);
			}

			if (isset($attributes['reviewTextAlign'])) {
				$textStyle .= 'text-align:' . esc_attr($attributes['reviewTextAlign']) . ';';
			}
			if (isset($attributes['reviewTextColor'])) {
				$textStyle .= 'color:' . esc_attr($attributes['reviewTextColor']) . ';';
			}
			$reviewText = '<div style="' . $textStyle . '">' . $reviewText . '</div>';

		}

		$stars = Common::generate_star_display(
			esc_attr($attributes['selectedStars']),
			esc_attr($attributes['starCount']),
			'none',
			esc_attr($attributes['starColor']),
			esc_attr($attributes['starColor']),
			esc_attr($attributes['starSize'])
		);


		$content = '
		<div class="tableberg-star-rating" style="' . $style . '">
            <div class="' . $starsClassName . '">
                ' . $stars . '
            </div>
            ' . $reviewText . '
        </div>
		';
		return $content;
	}

	/**
	 * Register the block.
	 */
	public function star_rating_block_registration()
	{
		$jsonPath = TABLEBERG_PRO_DIR_PATH . 'dist/blocks/star-rating/block.json';
		$attrs = json_decode(file_get_contents($jsonPath), true)['attributes'];

		register_block_type_from_metadata(
			$jsonPath,
			[
				'attributes' => $attrs,
				'render_callback' => array($this, 'render_star_rating_block'),
			]
		);
	}
}
