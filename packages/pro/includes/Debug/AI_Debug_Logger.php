<?php
namespace Tableberg\Pro\Debug;

if (!defined('ABSPATH')) {
    exit;
}

class AI_Debug_Logger {
    
    private const OPTION_NAME = 'tableberg_ai_debug_logs';
    private const MAX_LOGS = 100;
    
    private static $instance = null;
    
    public static function get_instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        // Private constructor to prevent direct instantiation
    }
    
    public function log_ai_request($data) {
        if (!$this->is_debug_enabled()) {
            return null;
        }
        
        $log_entry = $this->create_log_entry($data);
        return $this->store_log_entry($log_entry);
    }
    
    public function log_ai_response($request_id, $response_data) {
        if (!$this->is_debug_enabled() || !$request_id) {
            return;
        }
        
        $logs = $this->get_logs();
        
        // Find the request entry and update it with response data
        foreach ($logs as &$log) {
            if ($log['id'] === $request_id) {
                $log['response'] = $response_data['response'] ?? null;
                $log['timing']['end'] = current_time('mysql');
                $log['timing']['duration_ms'] = $response_data['duration_ms'] ?? 0;
                $log['success'] = $response_data['success'] ?? false;
                $log['error'] = $response_data['error'] ?? null;
                $log['table_generated'] = $response_data['table_generated'] ?? false;
                break;
            }
        }
        
        $this->store_logs($logs);
    }
    
    private function create_log_entry($data) {
        $log_id = uniqid('ai_debug_', true);
        
        return [
            'id' => $log_id,
            'timestamp' => current_time('mysql'),
            'type' => $data['type'] ?? 'unknown',
            'user_id' => get_current_user_id(),
            'request' => [
                'prompt' => $data['prompt'] ?? '',
                'content' => $data['content'] ?? '',
                'model' => $data['model'] ?? 'gpt-4o',
                'max_tokens' => $data['max_tokens'] ?? 2000,
                'temperature' => $data['temperature'] ?? 0.7,
                'full_messages' => $data['full_messages'] ?? []
            ],
            'response' => null,
            'timing' => [
                'start' => current_time('mysql'),
                'end' => null,
                'duration_ms' => 0
            ],
            'success' => false,
            'error' => null,
            'table_generated' => false
        ];
    }
    
    private function store_log_entry($log_entry) {
        $logs = $this->get_logs();
        
        // Add new entry at the beginning
        array_unshift($logs, $log_entry);
        
        // Keep only the last MAX_LOGS entries
        if (count($logs) > self::MAX_LOGS) {
            $logs = array_slice($logs, 0, self::MAX_LOGS);
        }
        
        $this->store_logs($logs);
        
        return $log_entry['id'];
    }
    
    private function store_logs($logs) {
        update_option(self::OPTION_NAME, $logs);
    }
    
    public function get_logs($limit = null, $offset = 0) {
        $logs = get_option(self::OPTION_NAME, []);
        
        if (!is_array($logs)) {
            $logs = [];
        }
        
        if ($limit !== null) {
            return array_slice($logs, $offset, $limit);
        }
        
        return $logs;
    }
    
    public function get_log_by_id($log_id) {
        $logs = $this->get_logs();
        
        foreach ($logs as $log) {
            if ($log['id'] === $log_id) {
                return $log;
            }
        }
        
        return null;
    }
    
    public function clear_logs() {
        delete_option(self::OPTION_NAME);
    }
    
    public function get_logs_count() {
        $logs = $this->get_logs();
        return count($logs);
    }
    
    public function get_debug_statistics() {
        $logs = $this->get_logs();
        
        if (empty($logs)) {
            return [
                'total_requests' => 0,
                'successful_requests' => 0,
                'failed_requests' => 0,
                'success_rate' => 0,
                'avg_response_time' => 0,
                'total_tokens_used' => 0,
                'avg_tokens_per_request' => 0,
                'tables_generated' => 0
            ];
        }
        
        $total_requests = count($logs);
        $successful_requests = 0;
        $failed_requests = 0;
        $total_response_time = 0;
        $total_tokens_used = 0;
        $tables_generated = 0;
        $valid_timing_count = 0;
        
        foreach ($logs as $log) {
            if ($log['success']) {
                $successful_requests++;
            } else {
                $failed_requests++;
            }
            
            if ($log['table_generated']) {
                $tables_generated++;
            }
            
            if (isset($log['timing']['duration_ms']) && $log['timing']['duration_ms'] > 0) {
                $total_response_time += $log['timing']['duration_ms'];
                $valid_timing_count++;
            }
            
            if (isset($log['response']['usage']['total_tokens'])) {
                $total_tokens_used += $log['response']['usage']['total_tokens'];
            }
        }
        
        $success_rate = $total_requests > 0 ? ($successful_requests / $total_requests) * 100 : 0;
        $avg_response_time = $valid_timing_count > 0 ? $total_response_time / $valid_timing_count : 0;
        $avg_tokens_per_request = $successful_requests > 0 ? $total_tokens_used / $successful_requests : 0;
        
        return [
            'total_requests' => $total_requests,
            'successful_requests' => $successful_requests,
            'failed_requests' => $failed_requests,
            'success_rate' => round($success_rate, 2),
            'avg_response_time' => round($avg_response_time, 2),
            'total_tokens_used' => $total_tokens_used,
            'avg_tokens_per_request' => round($avg_tokens_per_request, 2),
            'tables_generated' => $tables_generated
        ];
    }
    
    public function is_debug_enabled() {
        return get_option('tableberg_ai_debug_enabled', false);
    }
    
    public function enable_debug() {
        update_option('tableberg_ai_debug_enabled', true);
    }
    
    public function disable_debug() {
        update_option('tableberg_ai_debug_enabled', false);
    }
    
    public function toggle_debug() {
        $current_state = $this->is_debug_enabled();
        update_option('tableberg_ai_debug_enabled', !$current_state);
        return !$current_state;
    }
}