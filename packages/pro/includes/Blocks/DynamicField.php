<?php

namespace Tableberg\Pro\Blocks;

/**
 *
 *@package Tableberg_pro
 */

class DynamicField {
    public function __construct() {
        add_action('init', [$this, 'register_block']);
    }

    public function register_block() {
        $json = TABLEBERG_PRO_DIR_PATH . 'dist/blocks/dynamic-field/block.json';
        $attrs = json_decode(file_get_contents($json), true)['attributes'];

        register_block_type_from_metadata(
            $json,
            [
                'attributes' => $attrs,
                'render_callback' => [$this, 'render_block'],
            ]
        );
    }

    public function render_block($attrs, $content, $block) {
        if (!isset($attrs['fetchParams'])) {
            return $content;
        }

        $fetchParams = explode(':', $attrs['fetchParams']);
        $field = $fetchParams[0];
        $offset = $fetchParams[1];
        $featured = $fetchParams[2];
        $on_sale = $fetchParams[3];

        $params = [
            'per_page' => 1,
            'page' => $offset + 1,
            '_fields' => $field,
        ];

        if ($featured === 'true') {
            $params['featured'] = true;
        }

        if ($on_sale === 'true') {
            $params['on_sale'] = true;
        }

        $request = new \WP_REST_Request('GET', '/tableberg/v1/woo/products');
        $request->set_query_params($params);

        $value = rest_do_request($request)->get_data()[0][$field];

        $target = $block->parsed_block['attrs']['target'] ?? '';

        $dom = new \DOMDocument();
        $dom->loadHTML($content, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        $tags = new \DOMXPath($dom);

        if (empty($target)) {
            $pTag = $tags->query('//p')[0];

            $this->setInnerHTML($pTag, $value);

            return $dom->saveHTML();
        }

        if ($target === 'tableberg/image') {
            $url = $value['url'];

            $imgTag = $tags->query('//img')[0];
            if (!empty($imgTag)) {
                $imgTag->setAttribute('src', $url);
            }

            return $dom->saveHTML();
        }

        if ($target === 'tableberg/button') {
            $buttonDiv = $tags->query("//div[contains(@class, 'wp-block-tableberg-button')]")[0];
            if (!empty($buttonDiv)) {
                $buttonDiv->setAttribute('data-tableberg-woo-product-id', $value);
            }

            return $dom->saveHTML();
        }

        if ($target === 'tableberg-pro/woo-variation-picker') {
            $pickerDiv = $tags->query("//div[contains(@class, 'tableberg-woo-variation-picker')]")[0];
            if (!empty($pickerDiv)) {
                $pickerDiv->setAttribute('data-tableberg-woo-variation-props', json_encode($value));
            }

            return $dom->saveHTML();
        }

        return $content;
    }

    private function setInnerHTML($element, $html) {
        $fragment = $element->ownerDocument->createDocumentFragment();
        $fragment->appendXML($html);
        $clone = $element->cloneNode();
        $clone->appendChild($fragment);
        $element->parentNode->replaceChild($clone, $element);
    }
}
