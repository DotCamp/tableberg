<?php
/**
 * Tableberg integration testing bootstrap file.
 *
 * @package tableberg
 */

require dirname( __DIR__, 1 ) . '/common/autoload.php';
require_once dirname( __DIR__, 1 ) . '/common/functions.php';

$wordpress_development_dir = __DIR__ . '/wp';

if ( ! file_exists( $wordpress_development_dir ) ) {
	tableberg_echo_error( 'WordPress development directory not found.' );
	exit( 1 );
}

$force_setup        = isset( $_ENV['FORCE_INTEGRATION_SETUP'] ) ? $_ENV['FORCE_INTEGRATION_SETUP'] : false;
$config_file_status = file_exists( $wordpress_development_dir . '/tests/phpunit/wp-tests-config.php' );
if ( ! $config_file_status || $force_setup ) {
	if ( $config_file_status && $force_setup ) {
		fwrite( STDOUT, "\033[32mReinitializing integration tests setup...\033[0m\n" );
	}

	$test_config_path = $wordpress_development_dir . '/tests/phpunit/wp-tests-config.php';
	copy( $wordpress_development_dir . '/wp-tests-config-sample.php', $test_config_path );

	$test_config_contents = file_get_contents( $test_config_path );
	$test_config_contents = str_replace( "define( 'ABSPATH', dirname( __FILE__ ) . '/src/' )", "define( 'ABSPATH', dirname( __FILE__, 3 ) . '/src/' )", $test_config_contents );
	$test_config_contents = str_replace( 'youremptytestdbnamehere', $_SERVER['DB_NAME'], $test_config_contents );
	$test_config_contents = str_replace( 'yourusernamehere', $_SERVER['DB_USER'], $test_config_contents );
	$test_config_contents = str_replace( 'yourpasswordhere', $_SERVER['DB_PASS'], $test_config_contents );
	$test_config_contents = str_replace( 'localhost', $_SERVER['DB_HOST'], $test_config_contents );

	file_put_contents( $test_config_path, $test_config_contents );
}

require_once $wordpress_development_dir . '/tests/phpunit/includes/functions.php';

function load_tableberg() {
	require dirname( __DIR__, 4 ) . '/packages/tableberg/tableberg.php';
}

tests_add_filter( 'muplugins_loaded', 'load_tableberg' );

require_once $wordpress_development_dir . '/tests/phpunit/includes/bootstrap.php';
