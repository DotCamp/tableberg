<?php
/**
 * Register Star rating block
 *
 * @package Tableberg_Pro
 */

/**
 * Manage star rating block registration.
 */
class Star_Rating {

	/**
	 * Constructor
	 *
	 * @return void
	 */
	public function __construct() {
		add_action( 'init', array( $this, 'star_rating_block_registration' ) );
	}
	/**
	 * Get block styles.
	 *
	 * @param array $attributes - block attributes.
	 * @return string Generated CSS styles.
	 */
	public static function get_styles( $attributes ) {
		require_once TABLEBERG_PRO_DIR_PATH . 'includes/class-tableberg-pro-utilities.php';

		$utils   = new Utils();
		$padding = $utils->get_spacing_css( $attributes['padding'] );
		$margin  = $utils->get_spacing_css( $attributes['margin'] );

		$styles = array(
			'padding-top'    => $padding['top'] ?? '',
			'padding-right'  => $padding['right'] ?? '',
			'padding-bottom' => $padding['bottom'] ?? '',
			'padding-left'   => $padding['left'] ?? '',
			'margin-top'     => $margin['top'] ?? '',
			'margin-right'   => $margin['right'] ?? '',
			'margin-bottom'  => $margin['bottom'] ?? '',
			'margin-left'    => $margin['left'] ?? '',
		);

		return $utils->generate_css_string( $styles );
	}
	/**
	 * Renders the custom cell block on the server.
	 *
	 * @param array    $attributes The block attributes.
	 * @param string   $content    The block content.
	 * @param WP_Block $block      The block object.
	 * @return string Returns the HTML content for the custom cell block.
	 */
	public function render_star_rating_block( $attributes, $content, $block ) {
		require_once TABLEBERG_PRO_DIR_PATH . 'includes/class-tableberg-pro-common.php';
		$common            = new Common();
		$selected_stars    = $attributes['selectedStars'];
		$star_count        = $attributes['starCount'];
		$star_color        = $attributes['starColor'];
		$block_id          = $attributes['blockID'];
		$star_size         = $attributes['starSize'];
		$star_align        = $attributes['starAlign'];
		$review_text       = $attributes['reviewText'];
		$class_name        = isset( $attributes['className'] ) ? $attributes['className'] : '';
		$review_text_align = $attributes['reviewTextAlign'];
		$review_text_color = $attributes['reviewTextColor'];

		$stars = $common->generate_star_display(
			$selected_stars,
			$star_count,
			$block_id,
			'none',
			$star_color,
			$star_color,
			'',
			'tb_star_rating_filter-',
			$star_size
		);

		if ( '' === $block_id ) {
			$stars = preg_replace_callback(
				'/<svg ([^>]+)>/',
				function( $svg_attributes ) {
					if ( preg_match( '/fill=\"([^"]+)\"/', $svg_attributes[1], $matches ) ) {
						return '<svg ' . $svg_attributes[1] . ' style="fill:' . $matches[1] . ';">';
					}
					return $svg_attributes[0];
				},
				$stars
			);
		}

		$styles = $this->get_styles( $attributes );
		return '<div class="tb-star-rating' . ( isset( $class_name ) ? ' ' . esc_attr( $class_name ) : '' ) .
			'" style="' . $styles . '" ' . ( '' === $block_id ? '' : ' id="tb-star-rating-' . $block_id . '"' ) . '>
                <div class="tb-star-outer-container"' .
					'  style="justify-content:' . ( 'center' === $star_align ? 'center' :
					( 'left' === 'flex-' . $star_align ? 'start' : 'end' ) ) . ';">
                    <div class="tb-star-inner-container">' . $stars . '</div>
                </div>' .
				( '' === $review_text ? '' : '<div class="tb-review-text" style="text-align:' . $review_text_align . ';color:' . $review_text_color . ';">' .
					$review_text
				. '</div>' ) .
			'</div>';
	}

	/**
	 * Register the block.
	 */
	public function star_rating_block_registration() {
		require_once TABLEBERG_PRO_DIR_PATH . 'includes/class-tableberg-pro-defaults-attributes.php';
		$defaults = new Defaults();

		register_block_type_from_metadata(
			TABLEBERG_PRO_DIR_PATH . 'dist/blocks/star-rating/block.json',
			array(
				'attributes'      => $defaults->get_default_attributes( 'tableberg/star-rating' ),
				'render_callback' => array( $this, 'render_star_rating_block' ),
			)
		);
	}
}
new Star_Rating();
