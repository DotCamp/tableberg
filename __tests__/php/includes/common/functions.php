<?php declare( strict_types=1 );
/**
 * Common functions for tableberg tests.
 *
 * @package tableberg
 */

/**
 * Echo an error message.
 *
 * @param string $message The error message.
 */
function tableberg_echo_error( string $message ) {
	fwrite( STDERR, sprintf( "\33[31m%s\33[0m\n", $message ) );
}

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
