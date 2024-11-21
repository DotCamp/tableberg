<?php

use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tableberg\Patterns\RegisterPatterns;

class RegisterPatternsTest extends TestCase {

	public static function patternIdProvider() {
		return array(
			array( 'tableberg/pattern-01', 'pattern-01' ),
			array( 'tableberg/pattern-02', 'pattern-02' ),
			array( 'tableberg/upsell-pattern-03', 'pattern-03' ),
			array( 'tableberg/pattern-not-upsell-04', 'pattern-not-upsell-04' ),
			array( 'not-tableberg/pattern-05', false ),
		);
	}

	#[DataProvider( 'patternIdProvider' )]
	public function test_generate_tableberg_pattern_name( $pattern_id, $expected ) {
		$this->assertEquals( $expected, RegisterPatterns::generate_tableberg_pattern_name( $pattern_id ) );
	}
}
