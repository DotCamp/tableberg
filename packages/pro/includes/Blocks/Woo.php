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
        $page = $request->get_param('page');
        $featured = $request->get_param('featured');
        $on_sale = $request->get_param('on_sale');

        $fields = explode(',', $request->get_param('_fields'));

        if (sizeof($fields) === 1 && $fields[0] === '') {
            $fields = [];
        }

        $additional_fields = ['id', 'permalink', 'name'];
        $merged_fields = array_merge($fields, $additional_fields);

        $params = [
            'per_page' => $per_page,
            'page' => $page,
            '_fields' => empty($fields) ? '' : implode(',', $merged_fields),
        ];

        if ($featured) {
            $params['featured'] = true;
        }

        if ($on_sale) {
            $params['on_sale'] = true;
        }

        $request = new \WP_REST_Request('GET', '/wc/v3/products');
        $request->set_query_params($params);
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
            $product['variation_picker'] = $this->get_product_variations($product['id']);
        }

        return $products;
    }

    public function get_product_variations($id) {
        $product = wc_get_product($id);

        if (!$product->is_type('variable')) {
            return [];
        }

        $options = $product->get_variation_attributes();

        $variation_props = [];

        foreach ($options as $attribute => $variations) {
            $attr_label = wc_attribute_label($attribute);

            $variation_props['attributes'][] = [
                'slug' => $attribute,
                'label' => $attr_label,
                'options' => $this->get_term_objects($variations, $attribute)
            ];
        }

        $variations = $product->get_available_variations();

        foreach ($variations as $variation) {
            $attributes = [];
            foreach ($variation['attributes'] as $attribute => $value) {
                if ($value === '') {
                    $value = '*';
                }

                $attr_slug = str_replace('attribute_', '', $attribute);
                $attributes[$attr_slug] = $value;
            }

            $variation_props['variations'][] = [
                'id' => $variation['variation_id'],
                'attributes' => $attributes,
            ];
        }

        return $variation_props;
    }

    private function get_term_objects($variations, $attribute) {
        $term_objects = array_map(function($variation) use ($attribute) {
            $terms = get_terms([
                'taxonomy' => $attribute,
                'hide_empty' => false,
            ]);

            if (is_wp_error($terms) || empty($terms)) {
                return [
                    'slug' => $variation,
                    'name' => $variation,
                ];
            }

            $term = array_values(
                array_filter($terms, function($term) use ($variation) {
                    return $term->slug === $variation;
                })
            )[0];

            return [
                'slug' => $variation,
                'name' => $term->name,
            ];
        }, $variations);

        return array_values($term_objects);
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
                        $product[$key] = html_entity_decode(get_woocommerce_currency_symbol()) . $value;
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
