<?php

namespace Tableberg\Patterns;

class RegisterPatterns
{

    public static function from_dir($dir)
    {
        if (!file_exists($dir)) {
            return;
        }
        $files = scandir($dir);
        foreach ($files as $file) {
            if ($file == '.' || $file == '..') {
                continue;
            }
            $content = json_decode(file_get_contents($dir . '/' . $file), true);
            register_block_pattern('tableberg/' . str_replace('.json', '', $file), $content);
        }
    }

    public static function upsells()
    {
        $dir = __DIR__ . '/upsells';
        if (!file_exists($dir)) {
            return;
        }
        $files = scandir($dir);
        foreach ($files as $file) {
            if ($file == '.' || $file == '..') {
                continue;
            }
            $content = json_decode(file_get_contents($dir . '/' . $file), true);
            $content['content'] = str_replace('::PLUGIN_URL::', TABLEBERG_URL, $content['content']);
            register_block_pattern('tableberg/' . str_replace('.json', '', $file), $content);
        }
    }

    public static function categories()
    {
        register_block_pattern_category('tableberg', array('label' => 'Tableberg'));
        
        register_block_pattern_category('comparison-table', array('label' => 'Comparison Table'));
        register_block_pattern_category('featured-box', array('label' => 'Featured Box'));
        register_block_pattern_category('pricing-table', array('label' => 'Pricing Table'));
        register_block_pattern_category('pros-cons', array('label' => 'Pros & Cons'));

        register_block_pattern_category('other', array('label' => 'Other'));
    }
}