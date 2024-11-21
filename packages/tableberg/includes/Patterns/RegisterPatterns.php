<?php

namespace Tableberg\Patterns;

use function register_rest_field;
use function trailingslashit;

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
	 * Generate the tableberg pattern name from the pattern id.
	 *
	 * Tableberg patterns are registered with the format of tableberg/{upsell-}?pattern-{pattern_name}.
	 *
	 * @param string $pattern_id ID of the pattern as it is registered to patterns api.
	 *
	 * @return false | string The tableberg pattern name or false if id of pattern is not from tableberg.
	 */
	public static function generate_tableberg_pattern_name( $pattern_id ) {
		$generated_name           = false;
		$tableberg_prefix_matches = array();
		$match_status             = preg_match( '/^tableberg\/(.*)/', $pattern_id, $tableberg_prefix_matches );

		if ( $match_status ) {
			$generated_name = $tableberg_prefix_matches[1];

			// Check if the pattern is an upsell pattern.
			$upsell_name_matches = array();
			$is_upsell           = preg_match( '/^upsell\-(.*)/', $generated_name, $upsell_name_matches );
			if ( $is_upsell ) {
				$generated_name = $upsell_name_matches[1];
			}
		}

		return $generated_name;
	}

	/**
	 * Register custom rest fields for tableberg patterns.
	 *
	 * @param string $image_path_segment The path segment to the images directory relative to the plugin root.
	 */
	public static function register_pattern_custom_rest_fields( $image_path_segment ) {
		register_rest_field(
			'block-pattern',
			'tablebergPatternScreenshot',
			array(
				'get_callback' => function ( $pattern_obj ) use ( $image_path_segment ) {
					$screenshot_url = false;
					$pattern_name   = $pattern_obj['name'];

					$pattern_name = self::generate_tableberg_pattern_name( $pattern_name );

					// Only add rest field value if the pattern is from tableberg.
					if ( $pattern_name ) {
						$path_segment = sprintf( '%s/%s.png', $image_path_segment, $pattern_name );
						if ( file_exists( trailingslashit( TABLEBERG_DIR_PATH ) . $path_segment ) ) {
							$screenshot_url = trailingslashit( TABLEBERG_URL ) . $path_segment;
						}
					}
					return $screenshot_url;
				},
				'schema'       => array(
					'description' => 'The screenshot url of the tableberg pattern.',
					'type'        => 'string',
					'oneOf'       => array(
						array(
							'type'   => 'string',
							'format' => 'uri',
						),
						array(
							'type' => 'boolean',
							'enum' => false,
						),
					),
					'context'     => array( 'view' ),
				),
			)
		);
	}
}
