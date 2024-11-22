<?php
/**
 * Tableberg integration testing bootstrap file.
 *
 * @package tableberg
 */

require dirname( __DIR__, 1 ) . '/common/autoload.php';

$wordpress_development_dir = __DIR__ . '/wp';

if ( ! file_exists( $wordpress_development_dir ) ) {
	fwrite( STDERR, "Couldn't find the WordPress development installation at " . __DIR__ . "/wp\n" );
	exit( 1 );
}

$force_setup = isset( $_ENV['FORCE_INTEGRATION_SETUP'] ) ? $_ENV['FORCE_INTEGRATION_SETUP'] : false;

$config_file_status = file_exists( $wordpress_development_dir . '/tests/phpunit/wp-tests-config.php' );
if ( ! $config_file_status || $force_setup ) {
	if ( $config_file_status && $force_setup ) {
		fwrite( STDOUT, "\033[32mReinitializing integration tests setup...\033[0m\n" );	}

	copy( $wordpress_development_dir . '/wp-tests-config-sample.php', $wordpress_development_dir . '/tests/phpunit/wp-tests-config.php' );
}
