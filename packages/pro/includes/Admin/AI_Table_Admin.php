<?php
/**
 * AI Table Admin functionality for Pro version.
 *
 * @package tableberg-pro
 */

namespace Tableberg\Pro\Admin;

use Tableberg\Pro\Debug\AI_Debug_Logger;

/**
 * AI Table Admin Class
 */
class AI_Table_Admin {
    
    /**
     * Flag to track if REST routes have been registered
     * @var bool
     */
    private static $rest_routes_registered = false;
    
    /**
     * Constructor
     */
    public function __construct() {
        add_action('wp_ajax_tableberg_test_ai_connection', array($this, 'test_ai_connection'));
        add_action('wp_ajax_tableberg_save_ai_settings', array($this, 'save_ai_settings'));
        add_action('wp_ajax_tableberg_generate_ai_table', array($this, 'generate_ai_table'));
        add_action('wp_ajax_tableberg_get_ai_debug_logs', array($this, 'get_ai_debug_logs'));
        add_action('wp_ajax_tableberg_clear_ai_debug_logs', array($this, 'clear_ai_debug_logs'));
        add_action('wp_ajax_tableberg_toggle_ai_debug', array($this, 'toggle_ai_debug'));
        add_action('wp_ajax_tableberg_get_ai_debug_stats', array($this, 'get_ai_debug_stats'));
        add_filter('tableberg/filter/admin_settings_menu_data', array($this, 'add_ai_settings_data'), 10, 1);
        // Register REST routes with high priority to ensure they're available early
        add_action('rest_api_init', array($this, 'register_rest_routes'), 5);
    }
    
    /**
     * Add AI settings data to admin menu data
     *
     * @param array $data Admin menu data
     * @return array Modified admin menu data
     */
    public function add_ai_settings_data($data) {
        global $tp_fs;
        
        // Check if Pro is active
        $is_pro = isset($tp_fs) && $tp_fs->is__premium_only() && $tp_fs->can_use_premium_code();
        
        $data['is_pro'] = $is_pro;
        
        if ($is_pro) {
            // Get saved AI settings
            $ai_settings = get_option('tableberg_ai_settings', array(
                'api_key' => ''
            ));
            
            // Decrypt API key for display (if it exists)
            if (!empty($ai_settings['api_key'])) {
                $ai_settings['api_key'] = $this->decrypt_api_key($ai_settings['api_key']);
            }
            
            $data['ai_settings'] = array_merge($ai_settings, array(
                'ajax' => array(
                    'testConnection' => array(
                        'url'    => admin_url('admin-ajax.php'),
                        'action' => 'tableberg_test_ai_connection',
                        'nonce'  => wp_create_nonce('tableberg_test_ai_connection'),
                    ),
                    'saveSettings' => array(
                        'url'    => admin_url('admin-ajax.php'),
                        'action' => 'tableberg_save_ai_settings',
                        'nonce'  => wp_create_nonce('tableberg_save_ai_settings'),
                    ),
                    'generateTable' => array(
                        'url'    => admin_url('admin-ajax.php'),
                        'action' => 'tableberg_generate_ai_table',
                        'nonce'  => wp_create_nonce('tableberg_generate_ai_table'),
                    ),
                    'debugLogs' => array(
                        'url'    => admin_url('admin-ajax.php'),
                        'action' => 'tableberg_get_ai_debug_logs',
                        'nonce'  => wp_create_nonce('tableberg_get_ai_debug_logs'),
                    ),
                    'clearDebugLogs' => array(
                        'url'    => admin_url('admin-ajax.php'),
                        'action' => 'tableberg_clear_ai_debug_logs',
                        'nonce'  => wp_create_nonce('tableberg_clear_ai_debug_logs'),
                    ),
                    'toggleDebug' => array(
                        'url'    => admin_url('admin-ajax.php'),
                        'action' => 'tableberg_toggle_ai_debug',
                        'nonce'  => wp_create_nonce('tableberg_toggle_ai_debug'),
                    ),
                    'debugStats' => array(
                        'url'    => admin_url('admin-ajax.php'),
                        'action' => 'tableberg_get_ai_debug_stats',
                        'nonce'  => wp_create_nonce('tableberg_get_ai_debug_stats'),
                    ),
                ),
            ));
        }
        
        return $data;
    }
    
    /**
     * Test AI connection with provided API key
     */
    public function test_ai_connection() {
        check_ajax_referer('tableberg_test_ai_connection');
        
        if (!current_user_can('manage_options')) {
            wp_die(__('Unauthorized', 'tableberg'));
        }
        
        $api_key = isset($_POST['api_key']) ? sanitize_text_field($_POST['api_key']) : '';
        
        if (empty($api_key)) {
            wp_send_json_error(array(
                'message' => __('Please provide an API key', 'tableberg')
            ));
        }
        
        // Test the API key with a simple completion request
        $response = wp_remote_post('https://api.openai.com/v1/chat/completions', array(
            'headers' => array(
                'Authorization' => 'Bearer ' . $api_key,
                'Content-Type' => 'application/json',
            ),
            'body' => json_encode(array(
                'model' => 'gpt-4',
                'messages' => array(
                    array(
                        'role' => 'user',
                        'content' => 'Test'
                    )
                ),
                'max_tokens' => 5
            )),
            'timeout' => 30,
        ));
        
        if (is_wp_error($response)) {
            wp_send_json_error(array(
                'message' => __('Connection failed. Please check your internet connection.', 'tableberg')
            ));
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if (wp_remote_retrieve_response_code($response) === 200 && isset($data['choices'])) {
            wp_send_json_success(array(
                'message' => __('Connection successful! Your API key is valid.', 'tableberg')
            ));
        } else {
            $error_message = isset($data['error']['message']) 
                ? $data['error']['message'] 
                : __('Invalid API key. Please check your key and try again.', 'tableberg');
            
            wp_send_json_error(array(
                'message' => $error_message
            ));
        }
    }
    
    /**
     * Save AI settings
     */
    public function save_ai_settings() {
        check_ajax_referer('tableberg_save_ai_settings');
        
        if (!current_user_can('manage_options')) {
            wp_die(__('Unauthorized', 'tableberg'));
        }
        
        $settings = isset($_POST['settings']) ? json_decode(stripslashes($_POST['settings']), true) : array();
        
        if (!is_array($settings)) {
            wp_send_json_error(array(
                'message' => __('Invalid settings data', 'tableberg')
            ));
        }
        
        $api_key = isset($settings['api_key']) ? sanitize_text_field($settings['api_key']) : '';
        
        // Encrypt API key before saving
        $encrypted_key = !empty($api_key) ? $this->encrypt_api_key($api_key) : '';
        
        $saved_settings = array(
            'api_key' => $encrypted_key
        );
        
        update_option('tableberg_ai_settings', $saved_settings);
        
        wp_send_json_success(array(
            'message' => __('Settings saved successfully!', 'tableberg')
        ));
    }
    
    /**
     * Encrypt API key for storage
     *
     * @param string $api_key Plain API key
     * @return string Encrypted API key
     */
    private function encrypt_api_key($api_key) {
        // Use OpenSSL if available for better security
        if (function_exists('openssl_encrypt')) {
            $method = 'AES-256-CBC';
            $key = substr(hash('sha256', wp_salt('auth')), 0, 32);
            $iv = substr(hash('sha256', wp_salt('secure_auth')), 0, 16);
            
            $encrypted = openssl_encrypt($api_key, $method, $key, 0, $iv);
            return 'ssl:' . $encrypted; // Prefix to identify encryption method
        }
        
        // Fallback to simple obfuscation
        $key = wp_salt('auth');
        $key_hash = md5($key);
        
        // Simple obfuscation: reverse the string and base64 encode
        $obfuscated = base64_encode(strrev($api_key) . '::' . $key_hash);
        return 'b64:' . $obfuscated;
    }
    
    /**
     * Decrypt API key for use
     *
     * @param string $encrypted_key Encrypted API key
     * @return string Plain API key
     */
    private function decrypt_api_key($encrypted_key) {
        // Check encryption method
        if (strpos($encrypted_key, 'ssl:') === 0 && function_exists('openssl_decrypt')) {
            $encrypted = substr($encrypted_key, 4);
            $method = 'AES-256-CBC';
            $key = substr(hash('sha256', wp_salt('auth')), 0, 32);
            $iv = substr(hash('sha256', wp_salt('secure_auth')), 0, 16);
            
            $decrypted = openssl_decrypt($encrypted, $method, $key, 0, $iv);
            return $decrypted !== false ? $decrypted : '';
        }
        
        // Fallback to simple deobfuscation
        if (strpos($encrypted_key, 'b64:') === 0) {
            $obfuscated = substr($encrypted_key, 4);
            $decoded = base64_decode($obfuscated);
            
            $key = wp_salt('auth');
            $key_hash = md5($key);
            
            // Remove the key hash and reverse the string
            $parts = explode('::', $decoded);
            if (count($parts) === 2 && $parts[1] === $key_hash) {
                return strrev($parts[0]);
            }
        }
        
        // If no prefix or unknown format, return empty
        return '';
    }
    
    /**
     * Handle AI table generation request
     */
    public function generate_ai_table() {
        check_ajax_referer('tableberg_generate_ai_table');
        
        if (!current_user_can('edit_posts')) {
            wp_die(__('Unauthorized', 'tableberg'));
        }
        
        $prompt = isset($_POST['prompt']) ? sanitize_text_field($_POST['prompt']) : '';
        $method = isset($_POST['method']) ? sanitize_text_field($_POST['method']) : 'prompt';
        
        if (empty($prompt) && $method === 'prompt') {
            wp_send_json_error(array(
                'message' => __('Please provide a table description', 'tableberg')
            ));
        }
        
        // Check if API is configured
        $settings = get_option('tableberg_ai_settings', array());
        if (empty($settings['api_key'])) {
            wp_send_json_error(array(
                'message' => __('Please configure your OpenAI API key first', 'tableberg')
            ));
        }
        
        // Use the AI service to generate table
        $service = new \Tableberg\Pro\AI_Table_Service();
        
        switch ($method) {
            case 'prompt':
                $result = $service->generate_table_from_prompt($prompt);
                break;
                
            // TODO: Add other methods (context, screenshot) in future phases
            default:
                wp_send_json_error(array(
                    'message' => __('Invalid generation method', 'tableberg')
                ));
                return;
        }
        
        if (is_wp_error($result)) {
            wp_send_json_error(array(
                'message' => $result->get_error_message()
            ));
        }
        
        wp_send_json_success(array(
            'message' => __('Table generated successfully!', 'tableberg'),
            'block' => $result
        ));
    }
    
    /**
     * Register REST API routes
     */
    public function register_rest_routes() {
        // Prevent duplicate registration
        if (self::$rest_routes_registered) {
            return;
        }
        
        self::$rest_routes_registered = true;
        
        register_rest_route('tableberg/v1', '/ai/generate-table', array(
            'methods' => 'POST',
            'callback' => array($this, 'rest_generate_table'),
            'permission_callback' => function() {
                return current_user_can('edit_posts');
            },
            'args' => array(
                'prompt' => array(
                    'required' => false,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                ),
                'method' => array(
                    'required' => false,
                    'type' => 'string',
                    'default' => 'prompt',
                    'sanitize_callback' => 'sanitize_text_field',
                ),
                'content' => array(
                    'required' => false,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_textarea_field',
                ),
                'post_id' => array(
                    'required' => false,
                    'type' => 'integer',
                    'sanitize_callback' => 'absint',
                ),
            ),
        ));
        
        // Add endpoint to check AI configuration status
        register_rest_route('tableberg/v1', '/ai/status', array(
            'methods' => 'GET',
            'callback' => array($this, 'rest_get_ai_status'),
            'permission_callback' => function() {
                return current_user_can('edit_posts');
            },
        ));
        
        // Add endpoint for server-side block content extraction
        register_rest_route('tableberg/v1', '/ai/extract-blocks', array(
            'methods' => 'POST',
            'callback' => array($this, 'rest_extract_blocks_content'),
            'permission_callback' => function() {
                return current_user_can('edit_posts');
            },
            'args' => array(
                'blocks' => array(
                    'required' => true,
                    'type' => 'array',
                ),
            ),
        ));
    }
    
    /**
     * REST API handler for table generation
     */
    public function rest_generate_table($request) {
        $prompt = $request->get_param('prompt');
        $method = $request->get_param('method');
        $content = $request->get_param('content');
        $post_id = $request->get_param('post_id');
        
        // Validate input based on method
        if ($method === 'prompt' && empty($prompt)) {
            return new \WP_Error(
                'missing_prompt',
                __('Please provide a table description', 'tableberg'),
                array('status' => 400)
            );
        }
        
        if ($method === 'content' && empty($content) && empty($post_id)) {
            return new \WP_Error(
                'missing_content',
                __('Please provide content or post ID for content-based generation', 'tableberg'),
                array('status' => 400)
            );
        }
        
        // Check if API is configured
        $settings = get_option('tableberg_ai_settings', array());
        if (empty($settings['api_key'])) {
            return new \WP_Error(
                'not_configured',
                __('Please configure your OpenAI API key first', 'tableberg'),
                array('status' => 400)
            );
        }
        
        // Use the AI service to generate table
        $service = new \Tableberg\Pro\AI_Table_Service();
        
        switch ($method) {
            case 'prompt':
                $result = $service->generate_table_from_prompt($prompt);
                break;
                
            case 'content':
                // If no content provided, try to extract from post_id
                if (empty($content) && !empty($post_id)) {
                    $post = get_post($post_id);
                    if (!$post) {
                        return new \WP_Error(
                            'invalid_post',
                            __('Post not found', 'tableberg'),
                            array('status' => 404)
                        );
                    }
                    $content = $post->post_content;
                }
                
                $result = $service->generate_table_from_content($content, $post_id);
                break;
                
            default:
                return new \WP_Error(
                    'invalid_method',
                    __('Invalid generation method', 'tableberg'),
                    array('status' => 400)
                );
        }
        
        if (is_wp_error($result)) {
            return $result;
        }
        
        return array(
            'success' => true,
            'message' => __('Table generated successfully!', 'tableberg'),
            'block' => $result
        );
    }
    
    /**
     * REST API handler for AI status check
     */
    public function rest_get_ai_status() {
        global $tp_fs;
        
        // Check if Pro is active
        $is_pro = isset($tp_fs) && $tp_fs->is__premium_only() && $tp_fs->can_use_premium_code();
        
        if (!$is_pro) {
            return array(
                'configured' => false,
                'is_pro' => false,
                'message' => __('AI Table feature requires Tableberg Pro', 'tableberg')
            );
        }
        
        // Check if API key is configured
        $settings = get_option('tableberg_ai_settings', array());
        $has_api_key = !empty($settings['api_key']);
        
        return array(
            'configured' => $has_api_key,
            'is_pro' => true,
            'has_api_key' => $has_api_key,
            'message' => !$has_api_key 
                ? __('Please configure your OpenAI API key in Tableberg settings', 'tableberg')
                : __('AI Table is ready to use', 'tableberg')
        );
    }
    
    /**
     * REST API handler for server-side block content extraction
     */
    public function rest_extract_blocks_content($request) {
        $blocks = $request->get_param('blocks');
        
        if (!is_array($blocks)) {
            return new \WP_Error(
                'invalid_blocks',
                __('Invalid blocks data', 'tableberg'),
                array('status' => 400)
            );
        }
        
        $extracted_parts = array();
        
        foreach ($blocks as $block) {
            if (is_array($block)) {
                $block_content = $this->extract_single_block_content($block);
                if (!empty($block_content)) {
                    $extracted_parts[] = $block_content;
                }
            }
        }
        
        // Join content parts and clean/deduplicate
        $extracted_content = implode("\n\n", $extracted_parts);
        $extracted_content = $this->clean_and_deduplicate_content($extracted_content);
        
        return array(
            'success' => true,
            'content' => trim($extracted_content)
        );
    }
    
    /**
     * Extract content from a single block using server-side rendering
     *
     * @param array $block Block data
     * @return string Extracted content
     */
    private function extract_single_block_content($block) {
        $content = '';
        
        try {
            // Skip empty TableBerg blocks that only contain placeholder text
            if (isset($block['blockName']) && $block['blockName'] === 'tableberg/table' && $this->is_empty_tableberg_block($block)) {
                return '';
            }
            
            // Try to render the block server-side
            $rendered_block = render_block($block);
            
            if (!empty($rendered_block)) {
                // Enhanced HTML cleaning and content extraction
                $content = $this->clean_html_content($rendered_block);
                
                if ($this->is_valid_content($content)) {
                    $content = trim($content);
                    
                    // Only process inner blocks if parent has no meaningful content
                    if (!empty($block['innerBlocks']) && is_array($block['innerBlocks'])) {
                        $inner_content = '';
                        foreach ($block['innerBlocks'] as $inner_block) {
                            $inner_content .= $this->extract_single_block_content($inner_block);
                        }
                        
                        if (!empty($inner_content)) {
                            $content = $content . "\n\n" . trim($inner_content);
                        }
                    }
                    
                    return $content;
                }
            }
            
            // If no content found in parent, process inner blocks
            if (!empty($block['innerBlocks']) && is_array($block['innerBlocks'])) {
                $inner_contents = array();
                foreach ($block['innerBlocks'] as $inner_block) {
                    $inner_content = $this->extract_single_block_content($inner_block);
                    if (!empty($inner_content)) {
                        $inner_contents[] = $inner_content;
                    }
                }
                
                if (!empty($inner_contents)) {
                    return implode("\n\n", $inner_contents);
                }
            }
        } catch (Exception $e) {
            error_log('Error extracting block content: ' . $e->getMessage());
        }
        
        return $content;
    }
    
    /**
     * Clean HTML content and remove CSS/technical artifacts
     *
     * @param string $html_content HTML content to clean
     * @return string Cleaned content
     */
    private function clean_html_content($html_content) {
        if (empty($html_content)) {
            return '';
        }
        
        // Remove style and script tags first
        $html_content = preg_replace('/<style[^>]*>.*?<\/style>/is', '', $html_content);
        $html_content = preg_replace('/<script[^>]*>.*?<\/script>/is', '', $html_content);
        $html_content = preg_replace('/<link[^>]*>/i', '', $html_content);
        
        // Remove HTML comments
        $html_content = preg_replace('/<!--.*?-->/s', '', $html_content);
        
        // Strip HTML tags but preserve content
        $content = wp_strip_all_tags($html_content, true);
        
        // Decode HTML entities
        $content = html_entity_decode($content, ENT_QUOTES, 'UTF-8');
        
        // Clean up common CSS artifacts and technical strings
        $content = preg_replace('/\s*{\s*[^}]*\s*}/s', '', $content); // Remove CSS blocks
        $content = preg_replace('/\s*@[\w-]+\s*[^;]*;/', '', $content); // Remove CSS at-rules
        $content = preg_replace('/\s*[.#][\w-]+\s*[{:]/', '', $content); // Remove CSS selectors
        $content = preg_replace('/\s*[\w-]+\s*:\s*[^;]*;?/i', '', $content); // Remove CSS properties
        $content = preg_replace('/rgb\([^)]*\)/', '', $content); // Remove RGB colors
        $content = preg_replace('/#[0-9a-fA-F]{3,6}/', '', $content); // Remove hex colors
        $content = preg_replace('/\s*!important/i', '', $content); // Remove !important
        $content = preg_replace('/\s*(px|em|rem|vh|vw|%|pt|pc|in|cm|mm|ex|ch|vmin|vmax)\b/', '', $content); // Remove units
        $content = preg_replace('/\s*[\w-]+\s*=\s*["\'][^"\']*["\']/', '', $content); // Remove HTML attributes
        $content = preg_replace('/\s*(undefined|null|NaN)\s*/', ' ', $content); // Remove undefined/null/NaN
        $content = preg_replace('/\s*\[object\s+Object\]/', '', $content); // Remove [object Object]
        $content = preg_replace('/\s*function\s*\([^)]*\)\s*{[^}]*}/', '', $content); // Remove function definitions
        $content = preg_replace('/\s*(var|const|let)\s+[\w$]+\s*=\s*[^;]*;?/', '', $content); // Remove variable declarations
        $content = preg_replace('/\s*(document|window|console|jQuery)\s*\.[\w.()]*;?/', '', $content); // Remove JS references
        $content = preg_replace('/\s*\$\([^)]*\)\.[\w.()]*;?/', '', $content); // Remove jQuery selectors
        $content = preg_replace('/\s*addEventListener\s*\([^)]*\)\s*{[^}]*}/', '', $content); // Remove event listeners
        $content = preg_replace('/\s*on[\w]+\s*=\s*["\'][^"\']*["\']/', '', $content); // Remove event handlers
        $content = preg_replace('/\s*href\s*=\s*["\']javascript:[^"\']*["\']/', '', $content); // Remove javascript links
        $content = preg_replace('/\s*src\s*=\s*["\']data:[^"\']*["\']/', '', $content); // Remove data URLs
        
        // Remove TableBerg-specific placeholder text
        $content = preg_replace('/\s*TablebergBlock\s*\d+\s*of\s*\d+,?\s*Level\s*\d+/i', '', $content); // Remove "TablebergBlock X of Y, Level Z"
        $content = preg_replace('/\s*TablebergCreate\s*Blank\s*Table/i', '', $content); // Remove "TablebergCreate Blank Table"
        $content = preg_replace('/\s*Pre-Built\s*Table/i', '', $content); // Remove "Pre-Built Table"
        $content = preg_replace('/\s*WooCommerce\s*Table/i', '', $content); // Remove "WooCommerce Table"
        $content = preg_replace('/\s*Data\s*Table\s*\(CSV,\s*XML\)/i', '', $content); // Remove "Data Table (CSV, XML)"
        $content = preg_replace('/\s*AI\s*Table/i', '', $content); // Remove "AI Table"
        $content = preg_replace('/\s*Posts\s*Table/i', '', $content); // Remove "Posts Table"
        $content = preg_replace('/\s*Column\s*count/i', '', $content); // Remove "Column count"
        $content = preg_replace('/\s*Row\s*count/i', '', $content); // Remove "Row count"
        $content = preg_replace('/\s*Create\s*or/i', '', $content); // Remove "Create or"
        $content = preg_replace('/\s*Pro\s*$/i', '', $content); // Remove trailing "Pro"
        
        // Normalize whitespace
        $content = preg_replace('/\s+/', ' ', $content);
        
        return trim($content);
    }
    
    /**
     * Check if content is valid and meaningful
     *
     * @param string $content Content to validate
     * @return bool True if content is valid
     */
    private function is_valid_content($content) {
        if (empty($content) || strlen(trim($content)) < 3) {
            return false;
        }
        
        $trimmed_content = trim($content);
        
        // Check if content is mostly CSS/HTML artifacts
        $css_patterns = array(
            '/^[.#][\w-]+$/',  // CSS selectors
            '/^\s*[\w-]+\s*:\s*[^;]*;?$/',  // CSS properties
            '/^\s*@[\w-]+/',  // CSS at-rules
            '/^\s*{[^}]*}$/',  // CSS blocks
            '/^\s*[\w-]+\s*=\s*["\'][^"\']*["\']$/',  // HTML attributes
            '/^\s*(class|id|style|data-[\w-]*|aria-[\w-]*)\s*=\s*["\'][^"\']*["\']$/',  // Specific attributes
            '/^\s*(undefined|null|NaN|function|var|const|let)\s/',  // JavaScript keywords
            '/^\s*[0-9.]+\s*(px|em|rem|vh|vw|%|pt|pc|in|cm|mm|ex|ch|vmin|vmax)\s*$/',  // CSS units
            '/^\s*(rgb|rgba|hsl|hsla)\s*\(/',  // CSS color functions
            '/^\s*#[0-9a-fA-F]{3,6}\s*$/',  // Hex colors
            '/^\s*[\w-]+\s*{[^}]*}\s*$/',  // CSS rules
            '/^\s*\$\([^)]*\)/',  // jQuery selectors
            '/^\s*document\./',  // Document references
            '/^\s*window\./',  // Window references
            '/^\s*console\./',  // Console references
        );
        
        // Check if content matches any CSS/HTML pattern
        foreach ($css_patterns as $pattern) {
            if (preg_match($pattern, $trimmed_content)) {
                return false;
            }
        }
        
        // Check if content is mostly special characters or numbers
        $alpha_numeric_count = preg_match_all('/[a-zA-Z0-9]/', $trimmed_content);
        $total_length = strlen($trimmed_content);
        
        if ($alpha_numeric_count / $total_length < 0.6) {
            return false;
        }
        
        // Check for common non-content strings including TableBerg-specific ones
        $non_content_strings = array(
            'block-editor', 'wp-block', 'components-', 'editor-', 'gutenberg-',
            'undefined', 'null', 'NaN', 'true', 'false', 'function', 'return',
            'var', 'const', 'let', 'document', 'window', 'console', 'jQuery',
            'addEventListener', 'onclick', 'className', 'innerHTML', 'textContent',
            'querySelector', 'getElementById', 'getElementsBy', 'setAttribute',
            'getAttribute', 'classList', 'style', 'display', 'position',
            'margin', 'padding', 'border', 'background', 'color', 'font',
            'width', 'height', 'top', 'left', 'right', 'bottom', 'z-index',
            'transform', 'transition', 'animation', 'flex', 'grid', 'absolute',
            'relative', 'fixed', 'sticky', 'hidden', 'visible', 'overflow',
            'important', 'media', 'keyframes', 'rgba', 'rgb', 'hsl', 'hsla',
            // TableBerg-specific placeholder text
            'tablebergblock', 'tablebergcreate', 'tableberg', 'pre-built table',
            'woocommerce table', 'data table', 'csv', 'xml', 'ai table',
            'posts table', 'column count', 'row count', 'create blank table',
            'level 1', 'level 2', 'level 3', 'of 101', 'block placeholder'
        );
        
        $lower_content = strtolower($trimmed_content);
        $non_content_count = 0;
        
        foreach ($non_content_strings as $str) {
            if (strpos($lower_content, $str) !== false) {
                $non_content_count++;
            }
        }
        
        // If more than 30% of common non-content strings are found, likely not meaningful content
        if ($non_content_count > count($non_content_strings) * 0.3) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Clean and deduplicate extracted content
     *
     * @param string $content Content to clean and deduplicate
     * @return string Cleaned and deduplicated content
     */
    private function clean_and_deduplicate_content($content) {
        if (empty($content)) {
            return '';
        }
        
        // Split into lines and clean each line
        $lines = array_map('trim', explode("\n", $content));
        $lines = array_filter($lines, function($line) {
            return !empty($line) && $this->is_valid_content($line);
        });
        
        // Remove duplicate lines
        $unique_lines = array_unique($lines);
        
        // Remove lines that are substrings of other lines
        $filtered_lines = array();
        foreach ($unique_lines as $line) {
            $is_substring = false;
            foreach ($unique_lines as $other_line) {
                if ($line !== $other_line && strpos($other_line, $line) !== false && strlen($other_line) > strlen($line)) {
                    $is_substring = true;
                    break;
                }
            }
            if (!$is_substring) {
                $filtered_lines[] = $line;
            }
        }
        
        return implode("\n\n", $filtered_lines);
    }
    
    /**
     * Check if a TableBerg block is empty (only contains placeholder text)
     *
     * @param array $block Block data
     * @return bool True if the block is empty
     */
    private function is_empty_tableberg_block($block) {
        if (!isset($block['blockName']) || $block['blockName'] !== 'tableberg/table') {
            return false;
        }
        
        // Check if block has no inner blocks or only empty cells
        if (empty($block['innerBlocks']) || !is_array($block['innerBlocks'])) {
            return true;
        }
        
        // Check if all inner blocks are empty cells
        foreach ($block['innerBlocks'] as $inner_block) {
            if (isset($inner_block['blockName']) && $inner_block['blockName'] === 'tableberg/cell') {
                if (!empty($inner_block['innerBlocks']) && is_array($inner_block['innerBlocks'])) {
                    foreach ($inner_block['innerBlocks'] as $cell_block) {
                        if (isset($cell_block['blockName']) && $cell_block['blockName'] === 'core/paragraph') {
                            if (!empty($cell_block['attrs']['content']) && trim($cell_block['attrs']['content']) !== '') {
                                return false; // Found content, not empty
                            }
                        }
                    }
                }
            }
        }
        
        return true; // All cells are empty
    }
    
    /**
     * Get AI debug logs
     */
    public function get_ai_debug_logs() {
        check_ajax_referer('tableberg_get_ai_debug_logs');
        
        if (!current_user_can('manage_options')) {
            wp_die(__('Unauthorized', 'tableberg'));
        }
        
        $debug_logger = AI_Debug_Logger::get_instance();
        $limit = isset($_POST['limit']) ? intval($_POST['limit']) : 20;
        $offset = isset($_POST['offset']) ? intval($_POST['offset']) : 0;
        
        $logs = $debug_logger->get_logs($limit, $offset);
        $total_count = $debug_logger->get_logs_count();
        
        wp_send_json_success(array(
            'logs' => $logs,
            'total_count' => $total_count,
            'debug_enabled' => $debug_logger->is_debug_enabled()
        ));
    }
    
    /**
     * Clear AI debug logs
     */
    public function clear_ai_debug_logs() {
        check_ajax_referer('tableberg_clear_ai_debug_logs');
        
        if (!current_user_can('manage_options')) {
            wp_die(__('Unauthorized', 'tableberg'));
        }
        
        $debug_logger = AI_Debug_Logger::get_instance();
        $debug_logger->clear_logs();
        
        wp_send_json_success(array(
            'message' => __('Debug logs cleared successfully', 'tableberg')
        ));
    }
    
    /**
     * Toggle AI debug mode
     */
    public function toggle_ai_debug() {
        check_ajax_referer('tableberg_toggle_ai_debug');
        
        if (!current_user_can('manage_options')) {
            wp_die(__('Unauthorized', 'tableberg'));
        }
        
        $debug_logger = AI_Debug_Logger::get_instance();
        $new_state = $debug_logger->toggle_debug();
        
        wp_send_json_success(array(
            'debug_enabled' => $new_state,
            'message' => $new_state ? 
                __('Debug mode enabled', 'tableberg') : 
                __('Debug mode disabled', 'tableberg')
        ));
    }
    
    /**
     * Get AI debug statistics
     */
    public function get_ai_debug_stats() {
        check_ajax_referer('tableberg_get_ai_debug_stats');
        
        if (!current_user_can('manage_options')) {
            wp_die(__('Unauthorized', 'tableberg'));
        }
        
        $debug_logger = AI_Debug_Logger::get_instance();
        $stats = $debug_logger->get_debug_statistics();
        
        wp_send_json_success($stats);
    }
}