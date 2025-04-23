<?php

namespace Tableberg\Pro\Blocks;

/**
 *
 *@package Tableberg_pro 
 */

class Woo
{

    public function __construct()
    {
        add_action("init", [$this, "register_block"]);
    }

    public function register_block()
    {
        $json = TABLEBERG_PRO_DIR_PATH . 'dist/blocks/woo/block.json';
        $attrs = json_decode(file_get_contents($json), true)['attributes'];

        register_block_type_from_metadata(
            $json,
            [
                "attributes" => $attrs,
                "render_callback" => [$this, "render_toggle_block"]
            ]
        );
    }
}
