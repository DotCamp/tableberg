<?php
/**
 * PHPUnit autoload file.
 *
 * @package tableberg
 */

require_once __DIR__ . '/functions.php';

// Get the absolute path to the root directory.
$abs_path = dirname( __DIR__, 4 );

// Default autoload file.
$autoload_file = $abs_path . '/vendor/autoload.php';

$test_suite = get_test_suite();
fwrite( STDOUT, sprintf( "\033[32mRunning test suite: \033[34m%s\033[0m\n", is_null( $test_suite ) ? 'no test suit provided' : $test_suite ) );

// Decide which autoload file to use based on the test suite.
if ( isset( $_ENV['PHPUNIT_TABLEBERG_AUTOLOAD'] ) && 'tableberg' === $test_suite ) {
	$autoload_file = sprintf( '%s/%s', $abs_path, $_ENV['PHPUNIT_TABLEBERG_AUTOLOAD'] );
} elseif ( isset( $_ENV['PHPUNIT_TABLEBERG_PRO_AUTOLOAD'] ) && 'tableberg_pro' === $test_suite ) {
	$autoload_file = sprintf( '%s/%s', $abs_path, $_ENV['PHPUNIT_TABLEBERG_AUTOLOAD'] );
}

if ( file_exists( $autoload_file ) ) {
	fwrite( STDOUT, "\033[32mAutoload file: \033[34m$autoload_file\033[0m\n" );
	require_once $autoload_file;
} else {
	tableberg_echo_error( "Couldn't find autoload file at $autoload_file" );
	exit( 1 );
}
