<?php
/**
 * AI Table Service for generating tables using OpenAI.
 *
 * @package tableberg-pro
 */

namespace Tableberg\Pro;

use Tableberg\Pro\Admin\AI_Table_Admin;
use Tableberg\Pro\Debug\AI_Debug_Logger;

/**
 * AI Table Service Class
 */
class AI_Table_Service {
    
    /**
     * OpenAI API endpoint
     */
    const API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
    
    /**
     * Get decrypted API key
     *
     * @return string|false API key or false if not set
     */
    private function get_api_key() {
        $settings = get_option('tableberg_ai_settings', array());
        
        if (empty($settings['api_key'])) {
            return false;
        }
        
        // Use the AI_Table_Admin class to decrypt the key
        $admin = new AI_Table_Admin();
        $reflection = new \ReflectionClass($admin);
        $method = $reflection->getMethod('decrypt_api_key');
        $method->setAccessible(true);
        
        return $method->invoke($admin, $settings['api_key']);
    }
    
    /**
     * Make API request with retry mechanism and proper error handling
     *
     * @param string $api_key OpenAI API key
     * @param string $system_prompt System prompt for the AI
     * @param string $user_prompt User prompt for the AI
     * @param int $max_retries Maximum number of retry attempts
     * @param string $type Request type (prompt|content)
     * @return array|WP_Error API response or error
     */
    private function make_api_request($api_key, $system_prompt, $user_prompt, $max_retries = 2, $type = 'prompt') {
        $debug_logger = AI_Debug_Logger::get_instance();
        $start_time = microtime(true);
        
        // Log the request start
        $messages = [
            ['role' => 'system', 'content' => $system_prompt],
            ['role' => 'user', 'content' => $user_prompt]
        ];
        
        $log_id = $debug_logger->log_ai_request([
            'type' => $type,
            'prompt' => $user_prompt,
            'content' => $type === 'content' ? $user_prompt : '',
            'model' => 'gpt-4o',
            'max_tokens' => 2000,
            'temperature' => 0.3,
            'full_messages' => $messages
        ]);
        
        $attempt = 0;
        
        while ($attempt <= $max_retries) {
            $attempt++;
            
            // Calculate timeout based on attempt (progressive backoff)
            $timeout = 60 + ($attempt * 20); // 60s, 80s, 100s
            
            $response = wp_remote_post(self::API_ENDPOINT, array(
                'timeout' => $timeout,
                'headers' => array(
                    'Authorization' => 'Bearer ' . $api_key,
                    'Content-Type' => 'application/json',
                ),
                'body' => json_encode(array(
                    'model' => 'gpt-4o',
                    'messages' => array(
                        array(
                            'role' => 'system',
                            'content' => $system_prompt
                        ),
                        array(
                            'role' => 'user',
                            'content' => $user_prompt
                        )
                    ),
                    'temperature' => 0.3,
                    'max_tokens' => 2000,
                )),
            ));
            
            // Check for WordPress errors
            if (is_wp_error($response)) {
                $error_message = $response->get_error_message();
                
                // Check if it's a timeout error
                if (strpos($error_message, 'cURL error 28') !== false || 
                    strpos($error_message, 'Operation timed out') !== false ||
                    strpos($error_message, 'timeout') !== false) {
                    
                    // If we haven't reached max retries, continue to next attempt
                    if ($attempt <= $max_retries) {
                        error_log("AI Table API timeout on attempt {$attempt}, retrying...");
                        sleep(2); // Wait 2 seconds before retry
                        continue;
                    }
                    
                    // All retries failed, return timeout-specific error
                    return new \WP_Error(
                        'ai_table_timeout',
                        __('The AI service is taking longer than expected to respond. This can happen with large content or high server load. Please try again with shorter content or try again later.', 'tableberg')
                    );
                }
                
                // For other errors, return immediately
                return new \WP_Error(
                    'ai_table_request_failed',
                    sprintf(__('Failed to connect to AI service: %s', 'tableberg'), $error_message)
                );
            }
            
            // Check HTTP status code
            $status_code = wp_remote_retrieve_response_code($response);
            
            if ($status_code >= 500 && $attempt <= $max_retries) {
                // Server error, retry
                error_log("AI Table API server error ({$status_code}) on attempt {$attempt}, retrying...");
                sleep(2);
                continue;
            }
            
            if ($status_code === 429 && $attempt <= $max_retries) {
                // Rate limit, wait longer and retry
                error_log("AI Table API rate limit on attempt {$attempt}, retrying...");
                sleep(5);
                continue;
            }
            
            // Success or non-retryable error
            $end_time = microtime(true);
            $duration_ms = round(($end_time - $start_time) * 1000);
            
            // Log response
            if (is_wp_error($response)) {
                $debug_logger->log_ai_response($log_id, [
                    'success' => false,
                    'error' => $response->get_error_message(),
                    'duration_ms' => $duration_ms,
                    'table_generated' => false
                ]);
            } else {
                $body = wp_remote_retrieve_body($response);
                $data = json_decode($body, true);
                
                $debug_logger->log_ai_response($log_id, [
                    'success' => wp_remote_retrieve_response_code($response) === 200,
                    'response' => $data,
                    'duration_ms' => $duration_ms,
                    'table_generated' => wp_remote_retrieve_response_code($response) === 200 && isset($data['choices'][0]['message']['content'])
                ]);
            }
            
            return $response;
        }
        
        // Should not reach here, but just in case
        $end_time = microtime(true);
        $duration_ms = round(($end_time - $start_time) * 1000);
        
        $error = new \WP_Error(
            'ai_table_max_retries',
            __('Maximum retry attempts reached. Please try again later.', 'tableberg')
        );
        
        $debug_logger->log_ai_response($log_id, [
            'success' => false,
            'error' => $error->get_error_message(),
            'duration_ms' => $duration_ms,
            'table_generated' => false
        ]);
        
        return $error;
    }
    
    /**
     * Validate content length to prevent oversized requests
     *
     * @param string $content Content to validate
     * @return bool|WP_Error True if valid, WP_Error if too large
     */
    private function validate_content_length($content) {
        $word_count = str_word_count($content);
        $max_words = 3000; // Approximately 4000 tokens
        
        if ($word_count > $max_words) {
            return new \WP_Error(
                'ai_table_content_too_large',
                sprintf(
                    __('Content is too large (%d words). Please reduce content to under %d words or use shorter excerpts.', 'tableberg'),
                    $word_count,
                    $max_words
                )
            );
        }
        
        return true;
    }
    
    /**
     * Generate table from page content
     *
     * @param string $content Page/post content to analyze
     * @param int    $post_id Optional post ID for context
     * @param array  $options Additional options
     * @return array|WP_Error Generated table data or error
     */
    public function generate_table_from_content($content, $post_id = null, $options = array()) {
        $api_key = $this->get_api_key();
        
        if (!$api_key) {
            return new \WP_Error('no_api_key', __('OpenAI API key not configured', 'tableberg'));
        }
        
        // Process content for AI analysis
        $processed_content = $this->prepare_content_for_ai($content);
        
        if (empty($processed_content)) {
            return new \WP_Error('empty_content', __('No usable content found for table generation', 'tableberg'));
        }
        
        // Validate content length to prevent oversized requests
        $validation_result = $this->validate_content_length($processed_content);
        if (is_wp_error($validation_result)) {
            return $validation_result;
        }
        
        // Get content-specific system prompt
        $system_prompt = $this->get_content_analysis_prompt();
        
        // Create enhanced prompt with processed content
        $enhanced_prompt = $this->create_content_prompt($processed_content);
        
        // Make API request with retry mechanism
        $response = $this->make_api_request($api_key, $system_prompt, $enhanced_prompt, 2, 'content');
        
        if (is_wp_error($response)) {
            return $response;
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if (wp_remote_retrieve_response_code($response) !== 200) {
            $error_message = isset($data['error']['message']) 
                ? $data['error']['message'] 
                : __('Failed to generate table from content', 'tableberg');
                
            return new \WP_Error('api_error', $error_message);
        }
        
        if (!isset($data['choices'][0]['message']['content'])) {
            return new \WP_Error('invalid_response', __('Invalid API response', 'tableberg'));
        }
        
        // Parse the AI response
        $table_data = $this->parse_ai_response($data['choices'][0]['message']['content']);
        
        if (is_wp_error($table_data)) {
            return $table_data;
        }
        
        // Convert to Tableberg blocks
        return $this->convert_to_blocks($table_data);
    }
    
    /**
     * Generate table from user prompt
     *
     * @param string $prompt User's table description
     * @param array  $options Additional options
     * @return array|WP_Error Generated table data or error
     */
    public function generate_table_from_prompt($prompt, $options = array()) {
        $api_key = $this->get_api_key();
        
        if (!$api_key) {
            return new \WP_Error('no_api_key', __('OpenAI API key not configured', 'tableberg'));
        }
        
        // Prepare the system prompt
        $system_prompt = $this->get_system_prompt();
        
        // Enhance user prompt with structure requirements
        $enhanced_prompt = $this->enhance_user_prompt($prompt);
        
        // Make API request with retry mechanism
        $response = $this->make_api_request($api_key, $system_prompt, $enhanced_prompt, 2, 'prompt');
        
        if (is_wp_error($response)) {
            return $response;
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if (wp_remote_retrieve_response_code($response) !== 200) {
            $error_message = isset($data['error']['message']) 
                ? $data['error']['message'] 
                : __('Failed to generate table', 'tableberg');
                
            return new \WP_Error('api_error', $error_message);
        }
        
        if (!isset($data['choices'][0]['message']['content'])) {
            return new \WP_Error('invalid_response', __('Invalid API response', 'tableberg'));
        }
        
        // Parse the AI response
        $table_data = $this->parse_ai_response($data['choices'][0]['message']['content']);
        
        if (is_wp_error($table_data)) {
            return $table_data;
        }
        
        // Convert to Tableberg blocks
        return $this->convert_to_blocks($table_data);
    }
    
    /**
     * Get content-specific system prompt for table generation
     *
     * @return string
     */
    private function get_content_analysis_prompt() {
        return "You are analyzing WordPress post content to create a relevant table that organizes this information effectively.

CONTENT ANALYSIS RULES:
- Look for lists, comparisons, data points, schedules, or structured information
- If content contains comparisons, use COLUMN-ORIENTED layout (each option/plan/service as column)
- If content contains data/schedules, use ROW-ORIENTED layout (each item as row)
- If content is general, create a content outline or summary table
- Focus on the most structured and tabular parts of the content
- Use only the provided content - do not add external information

RESPONSE FORMAT: Respond with ONLY a JSON object in this format:
{
    \"headers\": [\"Column 1\", \"Column 2\", \"Column 3\"],
    \"rows\": [
        [
            {\"type\": \"text\", \"content\": \"Content from post\"},
            {\"type\": \"text\", \"content\": \"More content\"},
            {\"type\": \"text\", \"content\": \"Additional info\"}
        ]
    ]
}

AVAILABLE BLOCK TYPES:
1. \"text\" - Regular paragraph content
2. \"button\" - Call-to-action buttons (use for pricing, purchasing, contact actions)
3. \"image\" - Product photos, logos, avatars (include alt text and width)
4. \"styled_list\" - Feature lists, specifications (include icon type)
5. \"icon\" - Yes/no indicators, status symbols (specify icon name and color)
6. \"star_rating\" - Reviews, quality scores (include rating value and max stars)

INTELLIGENT BLOCK SELECTION:
- Use \"styled_list\" for feature lists or specifications from content
- Use \"icon\" for yes/no values or status indicators mentioned in content
- Use \"star_rating\" for any numerical ratings or quality scores found
- Use \"button\" for purchase/contact actions mentioned in content
- Use \"text\" for general informational content

IMPORTANT RULES:
- Extract information exactly as presented in the content
- Do not fabricate or assume information not present
- Maintain the structure and relationships from the original content
- Ensure all rows have the same number of columns as headers
- Do not include any text outside the JSON object";
    }
    
    /**
     * Get system prompt for table generation
     *
     * @return string
     */
    private function get_system_prompt() {
        return "You are an expert table creator that generates modern, conversion-focused tables using advanced block types.

        RESPONSE FORMAT: Respond with ONLY a JSON object in this format:
        {
            \"headers\": [\"Column 1\", \"Column 2\", \"Column 3\"],
            \"rows\": [
                [
                    {\"type\": \"text\", \"content\": \"Regular text\"},
                    {\"type\": \"button\", \"text\": \"Buy Now\", \"style\": \"primary\"},
                    {\"type\": \"icon\", \"icon\": \"check\", \"color\": \"green\"}
                ],
                [
                    {\"type\": \"styled_list\", \"items\": [\"Feature 1\", \"Feature 2\"], \"icon\": \"check\"},
                    {\"type\": \"star_rating\", \"rating\": 4.5, \"max\": 5},
                    {\"type\": \"image\", \"alt\": \"Product photo\", \"width\": \"150px\"}
                ]
            ]
        }

        TABLE LAYOUT GUIDELINES:
        - For COMPARISON TABLES (pricing, services, products): Use COLUMN-ORIENTED layout
          * Each plan/service/product should be a COLUMN (header)
          * Each feature/attribute should be a ROW
          * Example: Headers = [\"Basic Plan\", \"Pro Plan\", \"Enterprise Plan\"], Rows = [\"Price\", \"Features\", \"Support\"]
        
        - For DATA TABLES (schedules, lists, information): Use ROW-ORIENTED layout
          * Each item should be a ROW
          * Each attribute should be a COLUMN
          * Example: Headers = [\"Day\", \"Time\", \"Activity\"], Rows = [\"Monday\", \"Tuesday\", \"Wednesday\"]

        AVAILABLE BLOCK TYPES:
        1. \"text\" - Regular paragraph content
        2. \"button\" - Call-to-action buttons (use for pricing, purchasing, contact actions)
        3. \"image\" - Product photos, logos, avatars (include alt text and width)
        4. \"styled_list\" - Feature lists, specifications (include icon type)
        5. \"icon\" - Yes/no indicators, status symbols (specify icon name and color)
        6. \"star_rating\" - Reviews, quality scores (include rating value and max stars)

        INTELLIGENT BLOCK SELECTION RULES:
        - PRICING/ACTIONS: Always use \"button\" type for purchase, contact, or action items
        - FEATURES/SPECS: Use \"styled_list\" with appropriate icons (check, star, arrow, etc.)
        - YES/NO VALUES: Use \"icon\" type with check/close icons instead of text
        - RATINGS/SCORES: Use \"star_rating\" for any numerical ratings or quality indicators  
        - PRODUCTS/PEOPLE: Use \"image\" type for visual representation
        - REGULAR INFO: Use \"text\" type only for basic informational content

        BUTTON GUIDELINES:
        - Use compelling action text: \"Buy Now\", \"Get Started\", \"Learn More\", \"Contact Us\"
        - Set style to \"primary\" for main actions, \"secondary\" for alternative actions

        STYLED LIST GUIDELINES:
        - For included features: use \"check\" icon
        - For excluded features: use \"close\" icon  
        - For premium features: use \"star\" icon
        - For technical specs: use \"gear\" icon
        - For benefits: use \"arrow-right\" icon

        ICON GUIDELINES:
        - Available icons: check, close, star, arrow-right, gear, shield, heart, thumbs-up
        - Use green color for positive (check, thumbs-up)
        - Use red color for negative (close)
        - Use blue color for neutral (gear, shield)

        STAR RATING GUIDELINES:
        - Use realistic ratings between 1.0 and 5.0
        - Include decimal values for precision (e.g., 4.2, 3.8)
        - Always set max to 5

        IMAGE GUIDELINES:
        - Include descriptive alt text
        - Set appropriate width (\"100px\" for small, \"150px\" for medium, \"200px\" for large)
        - Use for product photos, team members, logos, or visual elements

        IMPORTANT RULES:
        - Create conversion-focused tables that guide users toward actions
        - Use visual hierarchy with appropriate block types
        - Ensure every pricing table has button elements
        - Convert feature lists to styled_list blocks
        - Replace yes/no text with icon blocks
        - Include star ratings for any quality/review mentions
        - Do not include any text outside the JSON object
        - Ensure all rows have the same number of columns as headers
        - For comparison tables, put each option (plan/service/product) as a COLUMN, not a row";
    }
    
    /**
     * Enhance user prompt with additional instructions
     *
     * @param string $prompt Original user prompt
     * @return string Enhanced prompt
     */
    private function enhance_user_prompt($prompt) {
        $enhanced_prompt = $prompt;
        
        // Detect comparison-related keywords and add column-oriented guidance
        $comparison_keywords = array('pricing', 'price', 'plan', 'tier', 'package', 'service', 'product', 'compare', 'comparison', 'vs', 'versus', 'option', 'choice');
        $prompt_lower = strtolower($prompt);
        
        $has_comparison_keywords = false;
        foreach ($comparison_keywords as $keyword) {
            if (strpos($prompt_lower, $keyword) !== false) {
                $has_comparison_keywords = true;
                break;
            }
        }
        
        if ($has_comparison_keywords) {
            $enhanced_prompt .= "\n\nIMPORTANT: Use COLUMN-ORIENTED layout for this comparison table. Each option/plan/service should be a COLUMN header, and each feature/attribute should be a ROW.";
        }
        
        $enhanced_prompt .= "\n\nRemember to respond with ONLY the JSON object, no additional text.";
        
        return $enhanced_prompt;
    }
    
    /**
     * Parse AI response to extract table data
     *
     * @param string $response AI response
     * @return array|WP_Error Parsed table data or error
     */
    private function parse_ai_response($response) {
        // Try to extract JSON from the response
        $json_start = strpos($response, '{');
        $json_end = strrpos($response, '}');
        
        if ($json_start === false || $json_end === false) {
            return new \WP_Error('parse_error', __('Could not find JSON in response', 'tableberg'));
        }
        
        $json_string = substr($response, $json_start, $json_end - $json_start + 1);
        $data = json_decode($json_string, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            return new \WP_Error('json_error', __('Invalid JSON in response', 'tableberg'));
        }
        
        // Validate structure
        if (!isset($data['headers']) || !isset($data['rows'])) {
            return new \WP_Error('invalid_structure', __('Missing headers or rows in response', 'tableberg'));
        }
        
        if (!is_array($data['headers']) || !is_array($data['rows'])) {
            return new \WP_Error('invalid_types', __('Headers and rows must be arrays', 'tableberg'));
        }
        
        // Process enhanced format with block types
        $data = $this->process_enhanced_table_data($data);
        
        // Validate processed data
        $validation_result = $this->validate_table_data($data);
        if (is_wp_error($validation_result)) {
            return $validation_result;
        }
        
        return $data;
    }
    
    /**
     * Process enhanced table data with block type analysis
     *
     * @param array $data Raw table data from AI
     * @return array Processed table data
     */
    private function process_enhanced_table_data($data) {
        // Normalize headers (they should remain as simple strings)
        $processed_data = array(
            'headers' => $data['headers'],
            'rows' => array()
        );
        
        // Process each row to analyze and normalize block types
        foreach ($data['rows'] as $row) {
            $processed_row = array();
            
            foreach ($row as $cell) {
                // If cell is already an object with type, keep it
                if (is_array($cell) && isset($cell['type'])) {
                    $processed_row[] = $this->normalize_block_data($cell);
                } else {
                    // If cell is just a string, analyze content to suggest block type
                    $processed_row[] = $this->analyze_content_for_block_type($cell);
                }
            }
            
            $processed_data['rows'][] = $processed_row;
        }
        
        return $processed_data;
    }
    
    /**
     * Analyze content to determine appropriate block type
     *
     * @param string $content Cell content
     * @return array Block data with type
     */
    private function analyze_content_for_block_type($content) {
        $content = trim($content);
        
        // Detect button content (pricing actions, CTAs)
        if ($this->is_button_content($content)) {
            return array(
                'type' => 'button',
                'text' => $content,
                'style' => $this->get_button_style($content)
            );
        }
        
        // Detect yes/no or boolean content for icons
        if ($this->is_icon_content($content)) {
            return array(
                'type' => 'icon',
                'icon' => $this->get_icon_for_content($content),
                'color' => $this->get_icon_color($content)
            );
        }
        
        // Detect rating content
        if ($this->is_rating_content($content)) {
            return array(
                'type' => 'star_rating',
                'rating' => $this->extract_rating($content),
                'max' => 5
            );
        }
        
        // Detect list content (multiple items or features)
        if ($this->is_list_content($content)) {
            return array(
                'type' => 'styled_list',
                'items' => $this->extract_list_items($content),
                'icon' => $this->get_list_icon($content)
            );
        }
        
        // Detect image content
        if ($this->is_image_content($content)) {
            return array(
                'type' => 'image',
                'alt' => $content,
                'width' => '150px'
            );
        }
        
        // Default to text
        return array(
            'type' => 'text',
            'content' => $content
        );
    }
    
    /**
     * Normalize block data from AI response
     *
     * @param array $block_data Block data from AI
     * @return array Normalized block data
     */
    private function normalize_block_data($block_data) {
        // Ensure required fields exist for each block type
        switch ($block_data['type']) {
            case 'button':
                return array(
                    'type' => 'button',
                    'text' => isset($block_data['text']) ? $block_data['text'] : 'Click Here',
                    'style' => isset($block_data['style']) ? $block_data['style'] : 'primary'
                );
                
            case 'icon':
                return array(
                    'type' => 'icon',
                    'icon' => isset($block_data['icon']) ? $block_data['icon'] : 'check',
                    'color' => isset($block_data['color']) ? $block_data['color'] : 'green'
                );
                
            case 'star_rating':
                return array(
                    'type' => 'star_rating',
                    'rating' => isset($block_data['rating']) ? floatval($block_data['rating']) : 5.0,
                    'max' => isset($block_data['max']) ? intval($block_data['max']) : 5
                );
                
            case 'styled_list':
                return array(
                    'type' => 'styled_list',
                    'items' => isset($block_data['items']) ? $block_data['items'] : array('Item 1'),
                    'icon' => isset($block_data['icon']) ? $block_data['icon'] : 'check'
                );
                
            case 'image':
                return array(
                    'type' => 'image',
                    'alt' => isset($block_data['alt']) ? $block_data['alt'] : 'Image',
                    'width' => isset($block_data['width']) ? $block_data['width'] : '150px'
                );
                
            default:
                return array(
                    'type' => 'text',
                    'content' => isset($block_data['content']) ? $block_data['content'] : 
                               (isset($block_data['text']) ? $block_data['text'] : 'Content')
                );
        }
    }
    
    /**
     * Validate processed table data
     *
     * @param array $data Processed table data
     * @return bool|WP_Error True if valid, WP_Error if invalid
     */
    private function validate_table_data($data) {
        // Check basic structure
        if (!isset($data['headers']) || !isset($data['rows'])) {
            return new \WP_Error('missing_structure', __('Missing headers or rows', 'tableberg'));
        }
        
        $num_cols = count($data['headers']);
        
        // Validate each row
        foreach ($data['rows'] as $row_index => $row) {
            if (!is_array($row)) {
                return new \WP_Error('invalid_row', sprintf(__('Row %d is not an array', 'tableberg'), $row_index));
            }
            
            if (count($row) !== $num_cols) {
                return new \WP_Error('column_mismatch', sprintf(
                    __('Row %d has %d columns but expected %d', 'tableberg'), 
                    $row_index, 
                    count($row), 
                    $num_cols
                ));
            }
            
            // Validate each cell in the row
            foreach ($row as $col_index => $cell) {
                $cell_validation = $this->validate_cell_data($cell, $row_index, $col_index);
                if (is_wp_error($cell_validation)) {
                    return $cell_validation;
                }
            }
        }
        
        return true;
    }
    
    /**
     * Validate individual cell data
     *
     * @param array $cell Cell data
     * @param int $row_index Row index for error reporting
     * @param int $col_index Column index for error reporting
     * @return bool|WP_Error True if valid, WP_Error if invalid
     */
    private function validate_cell_data($cell, $row_index, $col_index) {
        if (!is_array($cell) || !isset($cell['type'])) {
            return new \WP_Error('invalid_cell', sprintf(
                __('Cell at row %d, column %d is missing type', 'tableberg'), 
                $row_index, 
                $col_index
            ));
        }
        
        $valid_types = array('text', 'button', 'icon', 'star_rating', 'styled_list', 'image');
        if (!in_array($cell['type'], $valid_types)) {
            return new \WP_Error('invalid_type', sprintf(
                __('Cell at row %d, column %d has invalid type: %s', 'tableberg'), 
                $row_index, 
                $col_index, 
                $cell['type']
            ));
        }
        
        // Type-specific validation
        switch ($cell['type']) {
            case 'button':
                if (empty($cell['text'])) {
                    return new \WP_Error('missing_button_text', sprintf(
                        __('Button at row %d, column %d is missing text', 'tableberg'), 
                        $row_index, 
                        $col_index
                    ));
                }
                break;
                
            case 'icon':
                if (empty($cell['icon'])) {
                    return new \WP_Error('missing_icon', sprintf(
                        __('Icon at row %d, column %d is missing icon name', 'tableberg'), 
                        $row_index, 
                        $col_index
                    ));
                }
                break;
                
            case 'star_rating':
                if (!isset($cell['rating']) || !is_numeric($cell['rating'])) {
                    return new \WP_Error('invalid_rating', sprintf(
                        __('Star rating at row %d, column %d has invalid rating value', 'tableberg'), 
                        $row_index, 
                        $col_index
                    ));
                }
                
                $rating = floatval($cell['rating']);
                if ($rating < 0 || $rating > 5) {
                    return new \WP_Error('rating_out_of_range', sprintf(
                        __('Star rating at row %d, column %d must be between 0 and 5', 'tableberg'), 
                        $row_index, 
                        $col_index
                    ));
                }
                break;
                
            case 'styled_list':
                if (empty($cell['items']) || !is_array($cell['items'])) {
                    return new \WP_Error('invalid_list_items', sprintf(
                        __('Styled list at row %d, column %d has invalid items', 'tableberg'), 
                        $row_index, 
                        $col_index
                    ));
                }
                
                if (count($cell['items']) > 10) {
                    // Limit list items to prevent oversized cells
                    $cell['items'] = array_slice($cell['items'], 0, 10);
                }
                break;
                
            case 'image':
                if (empty($cell['alt'])) {
                    return new \WP_Error('missing_image_alt', sprintf(
                        __('Image at row %d, column %d is missing alt text', 'tableberg'), 
                        $row_index, 
                        $col_index
                    ));
                }
                break;
                
            case 'text':
                if (!isset($cell['content'])) {
                    return new \WP_Error('missing_text_content', sprintf(
                        __('Text at row %d, column %d is missing content', 'tableberg'), 
                        $row_index, 
                        $col_index
                    ));
                }
                break;
        }
        
        return true;
    }
    
    /**
     * Check if content should be a button
     *
     * @param string $content
     * @return bool
     */
    private function is_button_content($content) {
        $button_patterns = array(
            '/buy\s*now/i', '/get\s*started/i', '/learn\s*more/i', '/contact\s*us/i',
            '/sign\s*up/i', '/subscribe/i', '/purchase/i', '/order\s*now/i',
            '/book\s*now/i', '/try\s*free/i', '/download/i', '/view\s*details/i',
            '/compare/i', '/choose\s*plan/i', '/upgrade/i'
        );
        
        foreach ($button_patterns as $pattern) {
            if (preg_match($pattern, $content)) {
                return true;
            }
        }
        
        // Check for price mentions with currency
        if (preg_match('/\$\d+/', $content) && strlen($content) < 50) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Get button style based on content
     *
     * @param string $content
     * @return string
     */
    private function get_button_style($content) {
        $primary_patterns = array('/buy/i', '/purchase/i', '/order/i', '/get\s*started/i');
        
        foreach ($primary_patterns as $pattern) {
            if (preg_match($pattern, $content)) {
                return 'primary';
            }
        }
        
        return 'secondary';
    }
    
    /**
     * Check if content should be an icon
     *
     * @param string $content
     * @return bool
     */
    private function is_icon_content($content) {
        $content_lower = strtolower(trim($content));
        
        $icon_indicators = array(
            'yes', 'no', 'included', 'not included', 'available', 'unavailable',
            'supported', 'not supported', 'enabled', 'disabled', 'active', 'inactive',
            '✓', '✗', '×', 'check', 'cross', 'true', 'false'
        );
        
        return in_array($content_lower, $icon_indicators) || 
               (strlen($content) <= 3 && preg_match('/^[✓✗×]$/', $content));
    }
    
    /**
     * Get appropriate icon for content
     *
     * @param string $content
     * @return string
     */
    private function get_icon_for_content($content) {
        $content_lower = strtolower(trim($content));
        
        $positive_values = array('yes', 'included', 'available', 'supported', 'enabled', 'active', '✓', 'check', 'true');
        $negative_values = array('no', 'not included', 'unavailable', 'not supported', 'disabled', 'inactive', '✗', '×', 'cross', 'false');
        
        if (in_array($content_lower, $positive_values)) {
            return 'check';
        } elseif (in_array($content_lower, $negative_values)) {
            return 'close';
        }
        
        return 'check'; // Default
    }
    
    /**
     * Get icon color based on content
     *
     * @param string $content
     * @return string
     */
    private function get_icon_color($content) {
        $content_lower = strtolower(trim($content));
        
        $positive_values = array('yes', 'included', 'available', 'supported', 'enabled', 'active', '✓', 'check', 'true');
        $negative_values = array('no', 'not included', 'unavailable', 'not supported', 'disabled', 'inactive', '✗', '×', 'cross', 'false');
        
        if (in_array($content_lower, $positive_values)) {
            return 'green';
        } elseif (in_array($content_lower, $negative_values)) {
            return 'red';
        }
        
        return 'blue'; // Default neutral
    }
    
    /**
     * Check if content should be a star rating
     *
     * @param string $content
     * @return bool
     */
    private function is_rating_content($content) {
        // Check for rating patterns like "4.5/5", "4.5 stars", "4.5 out of 5"
        return preg_match('/\d+\.?\d*\s*(?:\/|out\s*of|stars?)\s*\d*/', $content) ||
               preg_match('/\d+\.?\d*\s*★/', $content) ||
               (preg_match('/^\d+\.?\d*$/', trim($content)) && floatval($content) <= 5);
    }
    
    /**
     * Extract rating value from content
     *
     * @param string $content
     * @return float
     */
    private function extract_rating($content) {
        if (preg_match('/(\d+\.?\d*)/', $content, $matches)) {
            $rating = floatval($matches[1]);
            return min(5.0, max(1.0, $rating)); // Clamp between 1-5
        }
        
        return 4.0; // Default rating
    }
    
    /**
     * Check if content should be a styled list
     *
     * @param string $content
     * @return bool
     */
    private function is_list_content($content) {
        // Check for list indicators
        return strpos($content, ',') !== false ||
               strpos($content, '•') !== false ||
               strpos($content, '-') !== false ||
               strpos($content, '\n') !== false ||
               (strlen($content) > 50 && str_word_count($content) > 6);
    }
    
    /**
     * Extract list items from content
     *
     * @param string $content
     * @return array
     */
    private function extract_list_items($content) {
        // Split by common delimiters
        $items = array();
        
        if (strpos($content, ',') !== false) {
            $items = array_map('trim', explode(',', $content));
        } elseif (strpos($content, '•') !== false) {
            $items = array_map('trim', explode('•', $content));
            $items = array_filter($items); // Remove empty items
        } elseif (strpos($content, '-') !== false) {
            $items = array_map('trim', explode('-', $content));
            $items = array_filter($items);
        } else {
            // Split long content into sentences or phrases
            $sentences = preg_split('/[.!?]/', $content);
            $items = array_filter(array_map('trim', $sentences));
        }
        
        // If we couldn't split properly, return as single item
        if (empty($items) || (count($items) == 1 && empty($items[0]))) {
            return array($content);
        }
        
        return array_slice($items, 0, 5); // Limit to 5 items max
    }
    
    /**
     * Get appropriate icon for list content
     *
     * @param string $content
     * @return string
     */
    private function get_list_icon($content) {
        $content_lower = strtolower($content);
        
        if (strpos($content_lower, 'feature') !== false || strpos($content_lower, 'include') !== false) {
            return 'check';
        } elseif (strpos($content_lower, 'spec') !== false || strpos($content_lower, 'technical') !== false) {
            return 'gear';
        } elseif (strpos($content_lower, 'benefit') !== false || strpos($content_lower, 'advantage') !== false) {
            return 'arrow-right';
        } elseif (strpos($content_lower, 'premium') !== false || strpos($content_lower, 'pro') !== false) {
            return 'star';
        }
        
        return 'check'; // Default
    }
    
    /**
     * Check if content should be an image
     *
     * @param string $content
     * @return bool
     */
    private function is_image_content($content) {
        $content_lower = strtolower($content);
        
        $image_indicators = array(
            'photo', 'image', 'picture', 'logo', 'avatar', 'profile',
            'product image', 'thumbnail', 'screenshot', 'icon'
        );
        
        foreach ($image_indicators as $indicator) {
            if (strpos($content_lower, $indicator) !== false) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Convert parsed data to Tableberg block structure
     *
     * @param array $table_data Parsed table data
     * @return array Block structure
     */
    private function convert_to_blocks($table_data) {
        $headers = $table_data['headers'];
        $rows = $table_data['rows'];
        
        // Validate data structure
        if (empty($headers) || empty($rows)) {
            return new \WP_Error('empty_data', __('Table data is empty', 'tableberg'));
        }
        
        // Calculate dimensions
        $num_cols = count($headers);
        $num_rows = count($rows) + 1; // +1 for header row
        $total_cells = $num_cols * $num_rows;
        
        // Create the main table block
        $table_block = array(
            'name' => 'tableberg/table',
            'attributes' => array(
                'rows' => $num_rows,
                'cols' => $num_cols,
                'cells' => $total_cells,
                'version' => '0.6.3', // Updated version
                'hasHeader' => true,
                'headerType' => 'row',
                'enableTableHeader' => 'converted', // Indicates first row is header
            ),
            'innerBlocks' => array()
        );
        
        // Add header cells
        foreach ($headers as $col_index => $header) {
            $table_block['innerBlocks'][] = $this->create_cell_block(
                0, 
                $col_index, 
                $header,
                true // isHeader
            );
        }
        
        // Add data cells with enhanced block support
        foreach ($rows as $row_index => $row) {
            // Ensure row has correct number of columns
            if (count($row) !== $num_cols) {
                // Pad or trim row to match header count
                if (count($row) < $num_cols) {
                    $row = array_pad($row, $num_cols, array('type' => 'text', 'content' => ''));
                } else {
                    $row = array_slice($row, 0, $num_cols);
                }
            }
            
            foreach ($row as $col_index => $cell_content) {
                $table_block['innerBlocks'][] = $this->create_cell_block(
                    $row_index + 1, // +1 because row 0 is header
                    $col_index,
                    $cell_content,
                    false // not header
                );
            }
        }
        
        return $table_block;
    }
    
    /**
     * Create a cell block with intelligent inner block selection
     *
     * @param int    $row Row index
     * @param int    $col Column index
     * @param mixed  $content Cell content (string or block data array)
     * @param bool   $is_header Whether this is a header cell
     * @return array Cell block structure
     */
    private function create_cell_block($row, $col, $content, $is_header = false) {
        $cell_block = array(
            'name' => 'tableberg/cell',
            'attributes' => array(
                'row' => $row,
                'col' => $col,
                'isHeader' => $is_header,
                'tagName' => $is_header ? 'th' : 'td',
            ),
            'innerBlocks' => array()
        );
        
        // For headers, always use paragraph
        if ($is_header) {
            $cell_block['innerBlocks'][] = array(
                'name' => 'core/paragraph',
                'attributes' => array(
                    'content' => esc_html(is_string($content) ? $content : $content['content']),
                ),
                'innerBlocks' => array()
            );
        } else {
            // For data cells, use intelligent block selection
            if (is_array($content) && isset($content['type'])) {
                $cell_block['innerBlocks'][] = $this->create_inner_block_by_type($content);
            } else {
                // Fallback to paragraph for plain text
                $cell_block['innerBlocks'][] = array(
                    'name' => 'core/paragraph',
                    'attributes' => array(
                        'content' => esc_html($content),
                    ),
                    'innerBlocks' => array()
                );
            }
        }
        
        return $cell_block;
    }
    
    /**
     * Create inner block based on block type
     *
     * @param array $block_data Block data with type
     * @return array Block structure
     */
    private function create_inner_block_by_type($block_data) {
        switch ($block_data['type']) {
            case 'button':
                return $this->create_button_block($block_data);
            case 'icon':
                return $this->create_icon_block($block_data);
            case 'star_rating':
                return $this->create_star_rating_block($block_data);
            case 'styled_list':
                return $this->create_styled_list_block($block_data);
            case 'image':
                return $this->create_image_block($block_data);
            default:
                return $this->create_text_block($block_data);
        }
    }
    
    /**
     * Create a button block
     *
     * @param array $data Button data
     * @return array Button block structure
     */
    private function create_button_block($data) {
        return array(
            'name' => 'tableberg/button',
            'attributes' => array(
                'text' => esc_html($data['text']),
                'align' => 'center',
                'backgroundColor' => $data['style'] === 'primary' ? '#0073aa' : '#f0f0f0',
                'textColor' => $data['style'] === 'primary' ? '#ffffff' : '#333333',
                'width' => 80
            ),
            'innerBlocks' => array()
        );
    }
    
    /**
     * Create an icon block
     *
     * @param array $data Icon data
     * @return array Icon block structure
     */
    private function create_icon_block($data) {
        // Get the appropriate icon structure based on icon name
        $icon_svg = $this->get_icon_svg($data['icon']);
        
        return array(
            'name' => 'tableberg/icon',
            'attributes' => array(
                'icon' => array(
                    'iconName' => $data['icon'],
                    'type' => 'font-awesome',
                    'icon' => $icon_svg
                ),
                'size' => '24px',
                'justify' => 'center',
                'color' => $data['color']
            ),
            'innerBlocks' => array()
        );
    }
    
    /**
     * Create a star rating block
     *
     * @param array $data Star rating data
     * @return array Star rating block structure
     */
    private function create_star_rating_block($data) {
        return array(
            'name' => 'tableberg/star-rating',
            'attributes' => array(
                'starCount' => intval($data['max']),
                'selectedStars' => floatval($data['rating']),
                'starSize' => 20,
                'starColor' => '#FF912C',
                'starAlign' => 'center'
            ),
            'innerBlocks' => array()
        );
    }
    
    /**
     * Create a styled list block
     *
     * @param array $data Styled list data
     * @return array Styled list block structure
     */
    private function create_styled_list_block($data) {
        $icon_svg = $this->get_icon_svg($data['icon']);
        
        $list_block = array(
            'name' => 'tableberg/styled-list',
            'attributes' => array(
                'icon' => array(
                    'iconName' => $data['icon'],
                    'type' => 'font-awesome',
                    'icon' => $icon_svg
                ),
                'iconSize' => '16px',
                'iconColor' => '#000000',
                'alignment' => 'left'
            ),
            'innerBlocks' => array()
        );
        
        // Add list items as inner blocks
        foreach ($data['items'] as $item) {
            $list_block['innerBlocks'][] = array(
                'name' => 'tableberg/styled-list-item',
                'attributes' => array(
                    'text' => esc_html(trim($item))
                ),
                'innerBlocks' => array()
            );
        }
        
        return $list_block;
    }
    
    /**
     * Create an image block
     *
     * @param array $data Image data
     * @return array Image block structure
     */
    private function create_image_block($data) {
        return array(
            'name' => 'tableberg/image',
            'attributes' => array(
                'media' => array(), // Empty media object - will be placeholder
                'alt' => esc_html($data['alt']),
                'width' => $data['width'],
                'align' => 'center',
                'isExample' => false // Allow proper image block functionality
            ),
            'innerBlocks' => array()
        );
    }
    
    /**
     * Create a text block (paragraph)
     *
     * @param array $data Text data
     * @return array Paragraph block structure
     */
    private function create_text_block($data) {
        return array(
            'name' => 'core/paragraph',
            'attributes' => array(
                'content' => esc_html($data['content']),
            ),
            'innerBlocks' => array()
        );
    }
    
    /**
     * Get SVG structure for icon
     *
     * @param string $icon_name Icon name
     * @return array SVG structure
     */
    private function get_icon_svg($icon_name) {
        $icons = array(
            'check' => array(
                'type' => 'svg',
                'props' => array(
                    'xmlns' => 'http://www.w3.org/2000/svg',
                    'viewBox' => '0 0 512 512',
                    'children' => array(
                        'type' => 'path',
                        'props' => array(
                            'd' => 'M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z'
                        )
                    )
                )
            ),
            'close' => array(
                'type' => 'svg',
                'props' => array(
                    'xmlns' => 'http://www.w3.org/2000/svg',
                    'viewBox' => '0 0 24 24',
                    'children' => array(
                        'type' => 'path',
                        'props' => array(
                            'd' => 'M13 11.8l6.1-6.3-1-1-6.1 6.2-6.1-6.2-1 1 6.1 6.3-6.5 6.7 1 1 6.5-6.6 6.5 6.6 1-1z'
                        )
                    )
                )
            ),
            'star' => array(
                'type' => 'svg',
                'props' => array(
                    'xmlns' => 'http://www.w3.org/2000/svg',
                    'viewBox' => '0 0 576 512',
                    'children' => array(
                        'type' => 'path',
                        'props' => array(
                            'd' => 'M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z'
                        )
                    )
                )
            ),
            'arrow-right' => array(
                'type' => 'svg',
                'props' => array(
                    'xmlns' => 'http://www.w3.org/2000/svg',
                    'viewBox' => '0 0 448 512',
                    'children' => array(
                        'type' => 'path',
                        'props' => array(
                            'd' => 'M190.5 66.9l22.2-22.2c9.4-9.4 24.6-9.4 33.9 0L441 239c9.4 9.4 9.4 24.6 0 33.9L246.6 467.3c-9.4 9.4-24.6 9.4-33.9 0l-22.2-22.2c-9.5-9.5-9.3-25 .4-34.3L311.4 296H24c-13.3 0-24-10.7-24-24v-32c0-13.3 10.7-24 24-24h287.4L190.9 101.2c-9.8-9.3-10-24.8-.4-34.3z'
                        )
                    )
                )
            ),
            'gear' => array(
                'type' => 'svg',
                'props' => array(
                    'xmlns' => 'http://www.w3.org/2000/svg',
                    'viewBox' => '0 0 512 512',
                    'children' => array(
                        'type' => 'path',
                        'props' => array(
                            'd' => 'M487.4 315.7l-42.6-24.6c4.3-23.2 4.3-47.6 0-70.8l42.6-24.6c4.9-2.8 7.1-8.6 5.5-14-11.1-35.6-30-67.8-54.7-94.6-3.8-4.1-10.2-5.1-15.8-2.3L380 110.4c-17.9-15.4-38.5-27.3-60.8-35.1V24.9c0-6.2-3.4-11.8-8.9-14.8-35.2-19.4-76.3-19.4-111.5 0-5.5 3-8.9 8.6-8.9 14.8v50.4c-22.3 7.8-42.9 19.7-60.8 35.1L87.7 84.8c-5.6-2.8-12-1.9-15.8 2.3-24.7 26.7-43.6 58.9-54.7 94.6-1.7 5.4.6 11.2 5.5 14L64.1 220.3c-4.3 23.2-4.3 47.6 0 70.8L21.5 315.7c-4.9 2.8-7.1 8.6-5.5 14 11.1 35.6 30 67.8 54.7 94.6 3.8 4.1 10.2 5.1 15.8 2.3L128 396.2c17.9 15.4 38.5 27.3 60.8 35.1v50.4c0 6.2 3.4 11.8 8.9 14.8 35.2 19.4 76.3 19.4 111.5 0 5.5-3 8.9-8.6 8.9-14.8v-50.4c22.3-7.8 42.9-19.7 60.8-35.1l41.4 25.6c5.6 2.8 12 1.9 15.8-2.3 24.7-26.7 43.6-58.9 54.7-94.6 1.7-5.4-.6-11.2-5.5-14zM256 336c-44.1 0-80-35.9-80-80s35.9-80 80-80 80 35.9 80 80-35.9 80-80 80z'
                        )
                    )
                )
            )
        );
        
        return isset($icons[$icon_name]) ? $icons[$icon_name] : $icons['check'];
    }
    
    /**
     * Prepare content for AI analysis
     *
     * @param string $content Raw content
     * @param int    $max_tokens Maximum tokens to send to AI (unused for now)
     * @return string Processed content
     */
    private function prepare_content_for_ai($content, $max_tokens = 4000) {
        // Content is already clean from JavaScript block editor API - minimal processing
        $content = trim($content);
        
        // Decode HTML entities if any remain
        $content = html_entity_decode($content, ENT_QUOTES, 'UTF-8');
        
        // Only basic whitespace normalization
        $content = $this->normalize_whitespace($content);
        
        return $content;
    }
    
    /**
     * Normalize whitespace while preserving structure
     *
     * @param string $content Content to normalize
     * @return string Normalized content
     */
    private function normalize_whitespace($content) {
        // Replace multiple spaces with single space
        $content = preg_replace('/[ \t]+/', ' ', $content);
        
        // Preserve paragraph breaks (double newlines)
        $content = preg_replace('/\n\s*\n/', "\n\n", $content);
        
        // Remove excessive newlines (more than 2)
        $content = preg_replace('/\n{3,}/', "\n\n", $content);
        
        return trim($content);
    }
    
    
    
    /**
     * Create content-specific prompt
     *
     * @param string $content Processed content
     * @return string Formatted prompt
     */
    private function create_content_prompt($content) {
        return "Please analyze the following content and create a relevant table that organizes this information effectively:\n\n" . $content;
    }
    
    /**
     * Get predefined prompt templates
     *
     * @return array Templates array
     */
    public function get_prompt_templates() {
        return array(
            'comparison' => __('Create a modern product comparison table with 3 competing products as COLUMNS. Include product images, star ratings for reviews, feature lists with checkmarks, and "Buy Now" buttons. Use icons for yes/no features and make it conversion-focused. Each product should be a column header.', 'tableberg'),
            'pricing' => __('Create a professional pricing table with 3 tiers as COLUMNS: Basic ($19/mo), Pro ($49/mo), and Enterprise ($99/mo). Include feature lists with checkmarks, highlight the Pro plan, add "Get Started" buttons, and use star ratings for customer satisfaction scores. Each plan should be a column header.', 'tableberg'),
            'schedule' => __('Create a weekly schedule table for Monday through Friday with time slots from 9am to 5pm. Use styled lists for detailed activities and icons to indicate availability or special events.', 'tableberg'),
            'features' => __('Create a feature comparison table with checkmark icons for included features, X icons for missing features, star icons for premium features, and styled lists for detailed specifications. Include action buttons. Use column-oriented layout with each option as a column.', 'tableberg'),
            'data' => __('Create a professional data table with appropriate visual elements. Use star ratings for scores, icons for status indicators, styled lists for multi-item data, and buttons for actions. Make it scannable and modern.', 'tableberg'),
            'products' => __('Create a product showcase table with 3 products as COLUMNS. Include product images, star ratings for reviews, styled feature lists, pricing with "Order Now" buttons, and visual indicators for key specifications. Each product should be a column header.', 'tableberg'),
            'services' => __('Create a service comparison table with 3 service packages as COLUMNS. Use styled lists for what\'s included, star ratings for quality scores, checkmark icons for features, and "Contact Us" buttons for each service. Each service should be a column header.', 'tableberg'),
            'team' => __('Create a team members table with profile images, star ratings for expertise levels, styled lists for skills and specialties, and "Contact" buttons for each team member.', 'tableberg')
        );
    }
}