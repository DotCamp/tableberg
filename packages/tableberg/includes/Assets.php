<?php

/**
 * The file register assets for the plugin
 *
 *  @package Tableberg
 */

namespace Tableberg;
use Tableberg\Utils\Vite;

/**
 * Handle plugin assets
 */
class Assets
{

	public static function enqueue() {
		add_filter( 'wp_script_attributes', function( $attributes ){
		    if ( isset($attributes['id']) && str_starts_with($attributes['id'], 'tableberg') ) {
		        $attributes['type'] = 'module';
		    }
		    return $attributes;
		}, 10, 3 );

		add_filter( 'script_loader_tag', function( $tag, $handle, $source ){
		    if ( str_starts_with($handle, 'preload_tableberg') ) {
		        $tag = '<link rel="modulepreload" href="' . $source . '" id="'.$handle.'"/>'.PHP_EOL;
		    }
		
		    return $tag;
		}, 10, 3 );

		add_action('enqueue_block_editor_assets', function(){
			Assets::enqueue_blocks_assets();
		});

		if (!is_admin()) {
			Assets::enqueue_frontend_assets();
		}
	}

	public static function enqueue_frontend_assets() {
		Vite::enqueue_asset('tableberg_frontend', 'src/frontend/index.ts');
	}
	
	public static function enqueue_blocks_assets()
	{
		Vite::enqueue_asset('tableberg_table', 'src/index.tsx');
		Vite::enqueue_asset('tableberg_cell', 'src/cell/index.tsx');
		Vite::enqueue_asset('tableberg_button', 'src/button/index.tsx');
		Vite::enqueue_asset('tableberg_image', 'src/image/index.tsx');
	}
	
}
