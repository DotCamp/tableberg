<?php

namespace Tableberg\Patterns;

use function register_rest_field;

class RegisterPatterns {

	public static function from_dir( $dir ) {
		if ( ! file_exists( $dir ) ) {
			return;
		}
		$files = scandir( $dir );
		foreach ( $files as $file ) {
			if ( $file == '.' || $file == '..' ) {
				continue;
			}
			$content = json_decode( file_get_contents( $dir . '/' . $file ), true );
			register_block_pattern( 'tableberg/' . str_replace( '.json', '', $file ), $content );
		}
	}

	public static function upsells() {
		$dir = __DIR__ . '/upsells';
		if ( ! file_exists( $dir ) ) {
			return;
		}
		$files = scandir( $dir );
		foreach ( $files as $file ) {
			if ( $file == '.' || $file == '..' ) {
				continue;
			}
			$content            = json_decode( file_get_contents( $dir . '/' . $file ), true );
			$content['content'] = str_replace( '::PLUGIN_URL::', TABLEBERG_URL, $content['content'] );
			register_block_pattern( 'tableberg/' . str_replace( '.json', '', $file ), $content );
		}
	}

	public static function categories() {
		register_block_pattern_category( 'tableberg', array( 'label' => 'Tableberg' ) );

		register_block_pattern_category( 'comparison-table', array( 'label' => 'Comparison Table' ) );
		register_block_pattern_category( 'featured-box', array( 'label' => 'Featured Box' ) );
		register_block_pattern_category( 'pricing-table', array( 'label' => 'Pricing Table' ) );
		register_block_pattern_category( 'pros-cons', array( 'label' => 'Pros & Cons' ) );

		register_block_pattern_category( 'other', array( 'label' => 'Other' ) );
	}

	/**
	 * Register custom rest fields for tableberg patterns.
	 *
	 * @param string $image_path_segment The path segment to the images directory relative to the plugin root.
	 */
	public static function register_pattern_custom_rest_fields( $image_path_segment ) {
		register_rest_field(
			'block-pattern',
			'tableberg_pattern_screenshot',
			array(
				'get_callback' => function ( $pattern_obj ) use ( $image_path_segment ) {
					$screenshot_url = false;
					$pattern_name   = $pattern_obj['name'];

					$tableberg_prefix_matches = array();
					$match_status             = preg_match( '/tableberg\/(.*)/', $pattern_name, $tableberg_prefix_matches );

					// Only add rest field value if the pattern is from tableberg.
					if ( $match_status ) {
						$pattern_name = $tableberg_prefix_matches[1];

						// Check if the pattern is an upsell pattern.
						$upsell_name_matches = array();
						$is_upsell           = preg_match( '/upsell\-(.*)/', $pattern_name, $upsell_name_matches );
						if ( $is_upsell ) {
							$pattern_name = $upsell_name_matches[1];
						}

						$path_segment = sprintf( '/%s/%s.png', $image_path_segment, $pattern_name );
						if ( file_exists( stripslashes( TABLEBERG_DIR_PATH ) . $path_segment ) ) {
							$screenshot_url = stripslashes( TABLEBERG_URL ) . $path_segment;
						}
					}

					return $screenshot_url;
				},
			)
		);
	}
}
