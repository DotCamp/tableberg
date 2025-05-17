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
        add_action("rest_api_init", [$this, "register_rest_routes"]);
    }

    public function register_block()
    {
        $json = TABLEBERG_PRO_DIR_PATH . 'dist/blocks/woo/block.json';
        $attrs = json_decode(file_get_contents($json), true)['attributes'];

        register_block_type_from_metadata(
            $json,
            [
                "attributes" => $attrs,
            ]
        );
    }

    /**
     * Register REST API routes for WooCommerce data
     */
    public function register_rest_routes() {
        register_rest_route('tableberg/v1', '/woo/products', [
            'methods' => 'GET',
            'callback' => [$this, 'get_woo_products'],
            'permission_callback' => '__return_true',
            'args' => [
                'per_page' => [
                    'default' => 10,
                    'sanitize_callback' => 'absint',
                    'validate_callback' => function($param) {
                        return is_numeric($param) && $param > 0;
                    }
                ],
                'page' => [
                    'default' => 1,
                    'sanitize_callback' => 'absint',
                    'validate_callback' => function($param) {
                        return is_numeric($param) && $param > 0;
                    }
                ],
                '_fields' => [
                    'default' => '',
                    'sanitize_callback' => function($param) {
                        return sanitize_text_field($param);
                    }
                ],
                'featured' => [
                    'default' => false,
                    'sanitize_callback' => function($param) {
                        return filter_var($param, FILTER_VALIDATE_BOOLEAN);
                    }
                ],
                'on_sale' => [
                    'default' => false,
                    'sanitize_callback' => function($param) {
                        return filter_var($param, FILTER_VALIDATE_BOOLEAN);
                    }
                ]
            ]
        ]);
    }

    /**
     * Get WooCommerce products data
     * 
     * @param \WP_REST_Request $request The request object
     * @return \WP_REST_Response
     */
    public function get_woo_products($request) {
        if (!class_exists('WooCommerce')) {
            return new \WP_REST_Response([
                'error' => 'WooCommerce is not active'
            ], 400);
        }

        $per_page = $request->get_param('per_page');
        $featured = $request->get_param('featured');
        $on_sale = $request->get_param('on_sale');

        $fields = explode(',', $request->get_param('_fields'));

        if (sizeof($fields) === 1 && $fields[0] === '') {
            $fields = [];
        }

        $additional_fields = ['id', 'permalink', 'name'];
        $merged_fields = array_merge($fields, $additional_fields);

        $request = new \WP_REST_Request('GET', '/wc/v3/products');
        $request->set_query_params([
            'per_page' => $per_page,
            '_fields' => empty($fields) ? '' : implode(',', $merged_fields),
            'featured' => $featured,
            'on_sale' => $on_sale,
        ]);
        $products = rest_do_request($request)->get_data();

        $products = $this->add_additional_fields($products);
        $products = $this->transform_fields($products);
        $products = $this->remove_unwanted_fields($products, $fields);

        return new \WP_REST_Response($products, 200);
    }

    private function remove_unwanted_fields($products, $fields) {
        if (empty($fields)) {
            return $products;
        }

        foreach ($products as &$product) {
            foreach ($product as $key => $value) {
                if (!in_array($key, $fields)) {
                    unset($product[$key]);
                }
            }
        }

        return $products;
    }

    private function add_additional_fields($products) {
        foreach ($products as &$product) {
            $product['add_to_cart'] = strval($product['id']);
            $product['name_with_link'] = '<a href="' . $product['permalink'] . '">' . $product['name'] . '</a>';
        }

        return $products;
    }

    private function transform_fields($products) {
        foreach ($products as &$product) {
            foreach ($product as $key => $value) {
                switch ($key) {
                    case "images":
                        $product[$key] = sizeof($value) > 0 ?
                            [ 'url' => $value[0]['src'] ] :
                            [ 'url' => '' ];
                        break;
                    case "price":
                        $product[$key] = get_woocommerce_currency_symbol() . $value;
                        break;
                    default:
                        if (!is_array($value) && !is_object($value)) {
                            $product[$key] = strval($value);
                        }
                }
            }
        }

        return $products;
    }
}
