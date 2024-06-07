<?php

namespace Tableberg\Patterns;

class RegisterPatterns
{

    public static function all()
    {

        $files = scandir(__DIR__ . '/data');
        foreach ($files as $file) {
            if ($file == '.' || $file == '..') {
                continue;
            }
            $content = json_decode(file_get_contents(__DIR__ . '/data/' . $file), true);
            register_block_pattern('tableberg/pattern-' . str_replace('.json', '', $file), $content);
        }
    }

    public static function categories()
    {
        register_block_pattern_category('tableberg', array('label' => 'Tableberg'));
        register_block_pattern_category('pricing', array('label' => 'Pricing'));
    }
}