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
