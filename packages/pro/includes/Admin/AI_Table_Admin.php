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
     * Constructor
     */
    public function __construct() {
        add_action('wp_ajax_tableberg_test_ai_connection', array($this, 'test_ai_connection'));
        add_action('wp_ajax_tableberg_save_ai_settings', array($this, 'save_ai_settings'));
        add_filter('tableberg/filter/admin_settings_menu_data', array($this, 'add_ai_settings_data'), 10, 1);
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
                'api_key' => '',
                'enabled' => false
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
        $enabled = isset($settings['enabled']) ? (bool) $settings['enabled'] : false;
        
        // Encrypt API key before saving
        $encrypted_key = !empty($api_key) ? $this->encrypt_api_key($api_key) : '';
        
        $saved_settings = array(
            'api_key' => $encrypted_key,
            'enabled' => $enabled
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
}