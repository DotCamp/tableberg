<?php
/**
 * AI Table Service for generating tables using OpenAI.
 *
 * @package tableberg-pro
 */

namespace Tableberg\Pro;

use Tableberg\Pro\Admin\AI_Table_Admin;

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
        
        // Make API request
        $response = wp_remote_post(self::API_ENDPOINT, array(
            'timeout' => 30,
            'headers' => array(
                'Authorization' => 'Bearer ' . $api_key,
                'Content-Type' => 'application/json',
            ),
            'body' => json_encode(array(
                'model' => 'gpt-3.5-turbo',
                'messages' => array(
                    array(
                        'role' => 'system',
                        'content' => $system_prompt
                    ),
                    array(
                        'role' => 'user',
                        'content' => $enhanced_prompt
                    )
                ),
                'temperature' => 0.7,
                'max_tokens' => 1000,
            )),
        ));
        
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
     * Get system prompt for table generation
     *
     * @return string
     */
    private function get_system_prompt() {
        return "You are a helpful assistant that creates well-structured tables. 
        When asked to create a table, you must respond with ONLY a JSON object in this exact format:
        {
            \"headers\": [\"Column 1\", \"Column 2\", \"Column 3\"],
            \"rows\": [
                [\"Row 1 Col 1\", \"Row 1 Col 2\", \"Row 1 Col 3\"],
                [\"Row 2 Col 1\", \"Row 2 Col 2\", \"Row 2 Col 3\"]
            ]
        }
        
        Important rules:
        - Always include headers
        - Keep content concise and clear
        - Use appropriate data for the requested table type
        - Do not include any text outside the JSON object
        - Ensure all rows have the same number of columns as headers";
    }
    
    /**
     * Enhance user prompt with additional instructions
     *
     * @param string $prompt Original user prompt
     * @return string Enhanced prompt
     */
    private function enhance_user_prompt($prompt) {
        return $prompt . "\n\nRemember to respond with ONLY the JSON object, no additional text.";
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
        
        return $data;
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
                'version' => '0.5.1', // From block.json
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
        
        // Add data cells
        foreach ($rows as $row_index => $row) {
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
     * Create a cell block
     *
     * @param int    $row Row index
     * @param int    $col Column index
     * @param string $content Cell content
     * @param bool   $is_header Whether this is a header cell
     * @return array Cell block structure
     */
    private function create_cell_block($row, $col, $content, $is_header = false) {
        return array(
            'name' => 'tableberg/cell',
            'attributes' => array(
                'row' => $row,
                'col' => $col,
                'isHeader' => $is_header,
                'tagName' => $is_header ? 'th' : 'td', // Set proper tag name
            ),
            'innerBlocks' => array(
                array(
                    'name' => 'core/paragraph',
                    'attributes' => array(
                        'content' => esc_html($content),
                    ),
                    'innerBlocks' => array()
                )
            )
        );
    }
    
    /**
     * Get predefined prompt templates
     *
     * @return array Templates array
     */
    public function get_prompt_templates() {
        return array(
            'comparison' => __('Create a comparison table for {products} with features like {features}', 'tableberg'),
            'pricing' => __('Create a pricing table with 3 tiers: Basic, Pro, and Enterprise', 'tableberg'),
            'schedule' => __('Create a weekly schedule table for Monday through Friday', 'tableberg'),
            'features' => __('Create a feature comparison table with checkmarks', 'tableberg'),
            'data' => __('Create a data table with columns for {columns}', 'tableberg'),
        );
    }
}