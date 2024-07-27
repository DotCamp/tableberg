<?php

namespace Tableberg;

class Freemius
{
    private static $tab_fs = null;

    public static function isPro()
    {
        return class_exists('\Tableberg\Pro\Freemeius') && \Tableberg\Pro\Freemeius::isActive();
    }

    public static function tab_fs()
    {

        if (is_null(self::$tab_fs)) {
            require_once __DIR__ . '/freemius/start.php';

            self::$tab_fs = fs_dynamic_init(
                [
                    'id' => '14649',
                    'slug' => 'tableberg',
                    'type' => 'plugin',
                    'public_key' => 'pk_8043aa788c004c4b385af8384c74b',
                    'is_premium' => false,
                    'has_addons' => true,
                    'has_paid_plans' => false,
                    'menu' => [
                        'slug' => 'tableberg-settings',
                        'first-path' => 'admin.php?page=tableberg-settings&route=welcome',
                    ]
                ]
            );

            do_action('tab_fs_loaded');
        }
        return self::$tab_fs;
    }
}