<?php

use Dotcamp\Tableberg\Tests\includes\common\TablebergIntegrationTestCase;

class IntegrationHealthTest extends TablebergIntegrationTestCase {

	public function test_rest_api() {
		global $wp_rest_server;

		$server = $wp_rest_server = new WP_REST_Server();
		do_action( 'rest_api_init' );

		$routes = $server->get_routes();
		$this->assertIsArray( $routes );
		$this->assertArrayHasKey( '/wp/v2/posts', $routes );
	}
}
