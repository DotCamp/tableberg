<?php

namespace Tableberg\Utils;

use Tableberg\Constants;

class Vite
{


    private static int $preload_count = 0;
    private static ?string $baseUrl = null;
    private static ?array $manifest = null;


    public static function enqueue_asset(string $handle, string $srcFile)
    {
        if (!self::$baseUrl) {
            self::setBaseUrlAndManifest();
        }
        $srcFile = ltrim($srcFile, './');
        if (!is_null(self::$manifest)) {
            if (!isset(self::$manifest[$srcFile])) {
                return;
            }
            $entry = self::$manifest[$srcFile];
            self::enqueue_styles($entry);
            $deps = self::register_preloads($entry);
            wp_enqueue_script(
                $handle,
                self::$baseUrl . $entry['file'],
                $deps,
                Constants::PLUGIN_VERSION
            );
        }
    }


    private static function setBaseUrlAndManifest()
    {
        $hotfile = TABLEBERG_DIR_PATH . '.hotfile';
        if (file_exists($hotfile)) {
            self::$baseUrl = trim(file_get_contents($hotfile));
            self::$manifest = null;
            return;
        }
        $manifest = TABLEBERG_DIR_PATH . 'build/.vite/manifest.json';

        if (!file_exists($manifest)) {
            die("[TABLEBERG] Assets haven't been built, neither the dev server is running!");
        }
        self::$manifest = json_decode(file_get_contents($manifest), true);
        self::$baseUrl = TABLEBERG_URL.'build/';
    }

    private static function register_preloads(array $entry): array
    {
        if (!isset($entry['imports'])) {
            return [];
        }

        $deps = [];

        foreach ($entry['imports'] as $name) {
            $import = &self::$manifest[$name];
            if (isset($import['_wp_handle'])) {
                $deps[] = $import['_wp_handle'];
                continue;
            }
            self::$preload_count += 1;
            $handle = 'preload_tableberg_' . self::$preload_count;
            $import['_wp_handle'] = $handle;
            wp_register_script(
                $handle,
                self::$baseUrl . $import['file'],
                [],
                Constants::PLUGIN_VERSION
            );
            $deps[] = $handle;
        }
        return $deps;
    }

    private static function enqueue_styles(array $entry)
    {
        if (!isset($entry['css'])) {
            return;
        }
        foreach ($entry['css'] as $css) {
            self::$preload_count += 1;
            $handle = 'tableberg_css_' . self::$preload_count;
            wp_enqueue_style(
                $handle,
                self::$baseUrl . $css,
                [],
                Constants::PLUGIN_VERSION
            );
        }
    }
}