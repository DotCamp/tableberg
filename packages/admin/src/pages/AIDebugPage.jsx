import React, { useState, useEffect } from "react";
import "./AIDebugPage.css";

const AIDebugPage = () => {
    const [debugLogs, setDebugLogs] = useState([]);
    const [debugStats, setDebugStats] = useState({});
    const [debugEnabled, setDebugEnabled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedLog, setSelectedLog] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const logsPerPage = 20;

    useEffect(() => {
        fetchDebugLogs();
        fetchDebugStats();
    }, [currentPage]);

    const fetchDebugLogs = async () => {
        setLoading(true);
        try {
            const debugEndpoint = window.tablebergAdminMenuData?.ai_settings?.ajax?.debugLogs;
            if (!debugEndpoint) {
                throw new Error('Debug endpoint not available');
            }

            const formData = new FormData();
            formData.append('action', debugEndpoint.action);
            formData.append('_ajax_nonce', debugEndpoint.nonce);
            formData.append('limit', logsPerPage);
            formData.append('offset', (currentPage - 1) * logsPerPage);

            const response = await fetch(debugEndpoint.url, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            if (data.success) {
                setDebugLogs(data.data.logs);
                setTotalCount(data.data.total_count);
                setDebugEnabled(data.data.debug_enabled);
            }
        } catch (error) {
            console.error('Error fetching debug logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDebugStats = async () => {
        try {
            const statsEndpoint = window.tablebergAdminMenuData?.ai_settings?.ajax?.debugStats;
            if (!statsEndpoint) {
                throw new Error('Debug stats endpoint not available');
            }

            const formData = new FormData();
            formData.append('action', statsEndpoint.action);
            formData.append('_ajax_nonce', statsEndpoint.nonce);

            const response = await fetch(statsEndpoint.url, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            if (data.success) {
                setDebugStats(data.data);
            }
        } catch (error) {
            console.error('Error fetching debug stats:', error);
        }
    };

    const handleToggleDebug = async () => {
        try {
            const toggleEndpoint = window.tablebergAdminMenuData?.ai_settings?.ajax?.toggleDebug;
            
            if (!toggleEndpoint) {
                alert('Toggle debug endpoint not available. Make sure you are a Pro user.');
                return;
            }

            const formData = new FormData();
            formData.append('action', toggleEndpoint.action);
            formData.append('_ajax_nonce', toggleEndpoint.nonce);

            const response = await fetch(toggleEndpoint.url, {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                setDebugEnabled(data.data.debug_enabled);
            } else {
                alert('Failed to toggle debug mode: ' + (data.data?.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error toggling debug mode:', error);
            alert('Error toggling debug mode: ' + error.message);
        }
    };

    const handleClearLogs = async () => {
        if (!confirm('Are you sure you want to clear all debug logs?')) {
            return;
        }

        try {
            const clearEndpoint = window.tablebergAdminMenuData?.ai_settings?.ajax?.clearDebugLogs;
            if (!clearEndpoint) {
                throw new Error('Clear logs endpoint not available');
            }

            const formData = new FormData();
            formData.append('action', clearEndpoint.action);
            formData.append('_ajax_nonce', clearEndpoint.nonce);

            const response = await fetch(clearEndpoint.url, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            if (data.success) {
                setDebugLogs([]);
                setTotalCount(0);
                setCurrentPage(1);
                fetchDebugStats();
            }
        } catch (error) {
            console.error('Error clearing debug logs:', error);
        }
    };

    const handleViewDetails = (log) => {
        setSelectedLog(log);
        setShowModal(true);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const formatDuration = (ms) => {
        if (ms < 1000) return `${ms}ms`;
        return `${(ms / 1000).toFixed(2)}s`;
    };

    const getStatusBadge = (success) => {
        return (
            <span className={`ai-debug-badge ${success ? 'success' : 'error'}`}>
                {success ? 'Success' : 'Error'}
            </span>
        );
    };

    const getTypeBadge = (type) => {
        return (
            <span className={`ai-debug-badge type-${type}`}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
            </span>
        );
    };

    const totalPages = Math.ceil(totalCount / logsPerPage);

    return (
        <div className="ai-debug-page">
            <div className="ai-debug-header">
                <h1>AI Table Generation Debug</h1>
                <div className="ai-debug-controls">
                    <button
                        onClick={handleToggleDebug}
                        className={`ai-debug-toggle ${debugEnabled ? 'enabled' : 'disabled'}`}
                    >
                        {debugEnabled ? 'Disable Debug' : 'Enable Debug'}
                    </button>
                    <button
                        onClick={handleClearLogs}
                        className="ai-debug-clear"
                        disabled={debugLogs.length === 0}
                    >
                        Clear Logs
                    </button>
                </div>
            </div>

            {!debugEnabled && (
                <div className="ai-debug-notice">
                    <p>Debug mode is currently disabled. Enable it to start collecting AI generation logs.</p>
                </div>
            )}

            {/* Statistics Cards */}
            <div className="ai-debug-stats">
                <div className="ai-debug-stat-card">
                    <h3>Total Requests</h3>
                    <span className="ai-debug-stat-value">{debugStats.total_requests || 0}</span>
                </div>
                <div className="ai-debug-stat-card">
                    <h3>Success Rate</h3>
                    <span className="ai-debug-stat-value">{debugStats.success_rate || 0}%</span>
                </div>
                <div className="ai-debug-stat-card">
                    <h3>Avg Response Time</h3>
                    <span className="ai-debug-stat-value">{formatDuration(debugStats.avg_response_time || 0)}</span>
                </div>
                <div className="ai-debug-stat-card">
                    <h3>Total Tokens Used</h3>
                    <span className="ai-debug-stat-value">{debugStats.total_tokens_used || 0}</span>
                </div>
            </div>

            {/* Debug Logs Table */}
            <div className="ai-debug-logs">
                <h2>Debug Logs</h2>
                {loading ? (
                    <div className="ai-debug-loading">Loading...</div>
                ) : debugLogs.length === 0 ? (
                    <div className="ai-debug-empty">No debug logs available</div>
                ) : (
                    <>
                        <table className="ai-debug-table">
                            <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th>Duration</th>
                                    <th>Tokens</th>
                                    <th>Table Generated</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {debugLogs.map((log) => (
                                    <tr key={log.id}>
                                        <td>{formatDate(log.timestamp)}</td>
                                        <td>{getTypeBadge(log.type)}</td>
                                        <td>{getStatusBadge(log.success)}</td>
                                        <td>{formatDuration(log.timing?.duration_ms || 0)}</td>
                                        <td>{log.response?.usage?.total_tokens || 'N/A'}</td>
                                        <td>{log.table_generated ? '✓' : '✗'}</td>
                                        <td>
                                            <button
                                                onClick={() => handleViewDetails(log)}
                                                className="ai-debug-view-btn"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="ai-debug-pagination">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>
                                <span>Page {currentPage} of {totalPages}</span>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal for viewing details */}
            {showModal && selectedLog && (
                <div className="ai-debug-modal">
                    <div className="ai-debug-modal-backdrop" onClick={() => setShowModal(false)}></div>
                    <div className="ai-debug-modal-content">
                        <div className="ai-debug-modal-header">
                            <h3>Debug Log Details</h3>
                            <button onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <div className="ai-debug-modal-body">
                            <div className="ai-debug-detail-section">
                                <h4>Request Information</h4>
                                <div className="ai-debug-detail-grid">
                                    <div><strong>ID:</strong> {selectedLog.id}</div>
                                    <div><strong>Timestamp:</strong> {formatDate(selectedLog.timestamp)}</div>
                                    <div><strong>Type:</strong> {getTypeBadge(selectedLog.type)}</div>
                                    <div><strong>User ID:</strong> {selectedLog.user_id}</div>
                                    <div><strong>Model:</strong> {selectedLog.request?.model || 'N/A'}</div>
                                    <div><strong>Max Tokens:</strong> {selectedLog.request?.max_tokens || 'N/A'}</div>
                                    <div><strong>Temperature:</strong> {selectedLog.request?.temperature || 'N/A'}</div>
                                    <div><strong>Duration:</strong> {formatDuration(selectedLog.timing?.duration_ms || 0)}</div>
                                </div>
                            </div>

                            <div className="ai-debug-detail-section">
                                <h4>User Prompt</h4>
                                <pre className="ai-debug-code">{selectedLog.request?.prompt || 'N/A'}</pre>
                            </div>

                            {selectedLog.request?.full_messages && (
                                <div className="ai-debug-detail-section">
                                    <h4>Full Messages</h4>
                                    <pre className="ai-debug-code">{JSON.stringify(selectedLog.request.full_messages, null, 2)}</pre>
                                </div>
                            )}

                            {selectedLog.response && (
                                <div className="ai-debug-detail-section">
                                    <h4>AI Response</h4>
                                    <div className="ai-debug-detail-grid">
                                        <div><strong>Success:</strong> {selectedLog.success ? 'Yes' : 'No'}</div>
                                        <div><strong>Table Generated:</strong> {selectedLog.table_generated ? 'Yes' : 'No'}</div>
                                        {selectedLog.response.usage && (
                                            <>
                                                <div><strong>Prompt Tokens:</strong> {selectedLog.response.usage.prompt_tokens}</div>
                                                <div><strong>Completion Tokens:</strong> {selectedLog.response.usage.completion_tokens}</div>
                                                <div><strong>Total Tokens:</strong> {selectedLog.response.usage.total_tokens}</div>
                                            </>
                                        )}
                                    </div>
                                    {selectedLog.response.choices && selectedLog.response.choices[0] && (
                                        <div>
                                            <strong>AI Response Content:</strong>
                                            <pre className="ai-debug-code">{selectedLog.response.choices[0].message?.content || 'N/A'}</pre>
                                        </div>
                                    )}
                                </div>
                            )}

                            {selectedLog.error && (
                                <div className="ai-debug-detail-section">
                                    <h4>Error Details</h4>
                                    <pre className="ai-debug-code ai-debug-error">{selectedLog.error}</pre>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIDebugPage;