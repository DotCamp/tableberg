<?php
namespace Tableberg\Pro;


class Freemeius
{
    private static $isActive = -1;
    private static $tp_fs = null;

    public static function isActive()
    {
        if (self::$isActive === -1) {
            if (!class_exists('\\Tableberg\\Freemius')) {
                return 0;
            }
            \Tableberg\Freemius::tab_fs();
            self::check();
        }
        return self::$isActive;
    }

    public static function check()
    {
        $plugins_root = dirname(dirname(__DIR__));
        if (file_exists($plugins_root . '/tableberg/includes/freemius/start.php')) {
            // Try to load SDK from parent plugin folder.
            require_once $plugins_root . '/tableberg/includes/freemius/start.php';
        } else if (file_exists($plugins_root . '/tableberg-pro/includes/freemius/start.php')) {
            // Try to load SDK from premium parent plugin folder.
            require_once $plugins_root . '/tableberg-pro/includes/freemius/start.php';
        } else {
            require_once __DIR__ . '/freemius/start.php';
        }

        if (is_null(self::$tp_fs)) {
            self::$tp_fs = fs_dynamic_init([
                'id' => '14650',
                'slug' => 'tableberg-pro',
                'premium_slug' => 'tableberg-pro',
                'type' => 'plugin',
                'public_key' => 'pk_e89a9a631d5a65df8a50c74bc96e9',
                'is_premium' => true,
                'is_premium_only' => true,
                'has_paid_plans' => true,
                'is_org_compliant' => false,
                'parent' => [
                    'id' => '14649',
                    'slug' => 'tableberg',
                    'public_key' => 'pk_8043aa788c004c4b385af8384c74b',
                    'name' => 'Tableberg',
                ],
                'menu' => [
                    'slug' => 'tableberg-settings',
                    'first-path' => 'admin.php?page=tableberg-settings&route=welcome',
                ],
            ]);
            do_action('tp_fs_loaded');
        }

        self::$isActive = self::$tp_fs->can_use_premium_code();
    }
}