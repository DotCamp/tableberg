<?php

use Yoast\WPTestUtils\BrainMonkey\TestCase;

class IntegrationHealthTest extends TestCase {

	public function test_rest_api() {
		global $wp_rest_server;

		$server = $wp_rest_server = new WP_REST_Server();
		do_action( 'rest_api_init' );

		$routes = $server->get_routes();
		$this->assertIsArray( $routes );
		$this->assertArrayHasKey( '/wp/v2/posts', $routes );
	}

	public function test_global_backup() {
		global $wp_rest_server;

		$this->assertNotInstanceOf( 'WP_REST_Server', $wp_rest_server );
	}
}
