<?php

namespace Tableberg\Pro\Blocks;

/**
 *
 *@package Tableberg_pro
 */

class Button {
    public function __construct() {
        add_filter('tableberg/button/add-to-cart', [$this, 'add_to_cart'], 10, 2);
    }

    public function add_to_cart($_, $attributes) {
        if (isset($attributes['wooCartButtonId']) && $attributes['wooCartButtonId']) {
            return 'data-tableberg-woo-product-id=' . esc_attr($attributes['wooCartButtonId']);
        }

        return '';
    }
}
