<?php
/**
 * AI Table Admin functionality for Pro version.
 *
 * @package tableberg-pro
 */

namespace Tableberg\Pro\Admin;

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
                'model' => 'gpt-3.5-turbo',
                'messages' => array(
                    array(
                        'role' => 'user',
                        'content' => 'Test'
                    )
                ),
                'max_tokens' => 5
            )),
            'timeout' => 15,
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
                    'required' => true,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                ),
                'method' => array(
                    'required' => false,
                    'type' => 'string',
                    'default' => 'prompt',
                    'sanitize_callback' => 'sanitize_text_field',
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
    }
    
    /**
     * REST API handler for table generation
     */
    public function rest_generate_table($request) {
        $prompt = $request->get_param('prompt');
        $method = $request->get_param('method');
        
        if (empty($prompt) && $method === 'prompt') {
            return new \WP_Error(
                'missing_prompt',
                __('Please provide a table description', 'tableberg'),
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
}