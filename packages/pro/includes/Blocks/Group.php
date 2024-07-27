<?php

namespace Tableberg\Pro\Blocks;


class Group
{


    public function __construct()
    {
        add_action('init', [$this, 'block_registration']);
    }

    public function render_block($attributes, $content)
    {
        return $content;
    }


    public function block_registration()
    {
        $jsonPath = TABLEBERG_PRO_DIR_PATH . 'dist/blocks/group/block.json';


        register_block_type_from_metadata(
            $jsonPath,
            [
                'attributes' => json_decode(file_get_contents($jsonPath), true)['attributes'],
                'render_callback' => [$this, 'render_block'],
            ]
        );
    }
}
