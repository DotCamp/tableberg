<?php

use Yoast\WPTestUtils\WPIntegration\TestCase;

class RegisterPatternsTest extends TestCase {

	public function setUp(): void {
		parent::setUp();

		// Create a user with admin role.
		$user_id = $this->factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $user_id );
	}

	public function test_pattern_custom_field_registration() {
		$request  = new WP_REST_Request( 'GET', '/wp/v2/block-patterns/patterns' );
		$response = rest_get_server()->dispatch( $request );
		$data     = $response->get_data();

		// Check if the custom field is registered.
		$this->assertArrayHasKey( 'tablebergPatternScreenshot', $data[0] );

		return $data;
	}

	/**
	 * @depends test_pattern_custom_field_registration
	 */
	public function test_tableberg_pattern_registry( $patterns ) {
		$tableberg_patterns = array_reduce(
			$patterns,
			function ( $carry, $current ) {
				if ( preg_match( '/^tableberg\/(.+)/', $current['name'] ) ) {
					$carry[] = $current;
				}

				return $carry;
			},
			array()
		);

		// Check if tableberg patterns are present.
		$this->assertNotEquals( 0, count( $tableberg_patterns ) );

		return $tableberg_patterns;
	}


	/**
	 * @depends test_tableberg_pattern_registry
	 */
	public function test_tableberg_pattern_screenshot_field( $tableberg_patterns ) {
		foreach ( $tableberg_patterns as $pattern ) {
			$this->assertIsString( $pattern['tablebergPatternScreenshot'] );
		}
	}
}
