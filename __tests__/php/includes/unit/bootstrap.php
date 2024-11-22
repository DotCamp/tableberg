<?php
/**
 * PHPUnit bootstrap file
 *
 * @package tableberg
 */

// Get the absolute path to the root directory.
$abs_path = dirname( __DIR__, 4 );

// Default autoload file.
$autoload_file = $abs_path . '/vendor/autoload.php';

/**
 * Get the test suite name.
 *
 * @return string|null The test suite name or null if not found.
 */
function get_test_suite() {
	$argv = isset( $_SERVER['argv'] ) ? filter_var( $_SERVER['argv'], FILTER_DEFAULT, FILTER_REQUIRE_ARRAY ) : array();
	foreach ( $argv as $arg ) {
		$test_suite_matches = array();
		if ( preg_match( '/--testsuite=(.+)/', $arg, $test_suite_matches ) ) {
			return $test_suite_matches[1];
		}
	}

	return null;
}

$test_suite = get_test_suite();
fwrite( STDOUT, sprintf( "Running test suite: %s\n", is_null( $test_suite ) ? 'no test suit provided' : $test_suite ) );

// Decide which autoload file to use based on the test suite.
if ( isset( $_ENV['PHPUNIT_TABLEBERG_AUTOLOAD'] ) && 'tableberg:unit' === $test_suite ) {
	$autoload_file = sprintf( '%s/%s', $abs_path, $_ENV['PHPUNIT_TABLEBERG_AUTOLOAD'] );
} elseif ( isset( $_ENV['PHPUNIT_TABLEBERG_PRO_AUTOLOAD'] ) && 'tableberg_pro:unit' === $test_suite ) {
	$autoload_file = sprintf( '%s/%s', $abs_path, $_ENV['PHPUNIT_TABLEBERG_AUTOLOAD'] );
}

if ( file_exists( $autoload_file ) ) {
	require_once $autoload_file;
} else {
	fwrite( STDERR, "Couldn't find autoload file at $autoload_file\n" );
	exit( 1 );
}
