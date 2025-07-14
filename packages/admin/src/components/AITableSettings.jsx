import React, { useState } from "react";
import { __ } from "@wordpress/i18n";
import BoxContent from "./BoxContent/BoxContent";
import { testAIConnection, saveAISettings } from "../functions";
import "./AITableSettings.css";

function AITableSettings({ apiKey = "", enabled = false, onSettingsChange }) {
    const [localApiKey, setLocalApiKey] = useState(apiKey);
    const [showApiKey, setShowApiKey] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [testStatus, setTestStatus] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleTestConnection = async () => {
        if (!localApiKey) {
            setTestStatus({ success: false, message: __("Please enter an API key", "tableberg") });
            return;
        }

        setIsTesting(true);
        setTestStatus(null);

        try {
            const result = await testAIConnection(localApiKey);
            setTestStatus({
                success: result.success,
                message: result.message || (result.success 
                    ? __("Connection successful!", "tableberg")
                    : __("Connection failed. Please check your API key.", "tableberg"))
            });
        } catch (error) {
            setTestStatus({
                success: false,
                message: __("Error testing connection. Please try again.", "tableberg")
            });
        } finally {
            setIsTesting(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await saveAISettings({
                api_key: localApiKey,
                enabled: enabled
            });
            onSettingsChange && onSettingsChange({
                api_key: localApiKey,
                enabled: enabled
            });
        } catch (error) {
            console.error("Error saving AI settings:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="tableberg-ai-table-settings tableberg-settings-card">
            <BoxContent 
                title={__("AI Table Settings", "tableberg")}
                content={__("Configure your OpenAI API key to enable AI-powered table generation. This feature is available for Pro users only.", "tableberg")}
            >
                <div className="tableberg-ai-settings-content">
                    <div className="tableberg-api-key-field">
                        <label htmlFor="ai-api-key">
                            {__("OpenAI API Key", "tableberg")}
                        </label>
                        <div className="tableberg-api-key-input-wrapper">
                            <input
                                id="ai-api-key"
                                type={showApiKey ? "text" : "password"}
                                value={localApiKey}
                                onChange={(e) => setLocalApiKey(e.target.value)}
                                placeholder={__("sk-...", "tableberg")}
                                className="tableberg-api-key-input"
                            />
                            <button
                                type="button"
                                onClick={() => setShowApiKey(!showApiKey)}
                                className="tableberg-toggle-visibility"
                            >
                                {showApiKey ? __("Hide", "tableberg") : __("Show", "tableberg")}
                            </button>
                        </div>
                        <p className="tableberg-help-text">
                            {__("Get your API key from", "tableberg")}{" "}
                            <a 
                                href="https://platform.openai.com/api-keys" 
                                target="_blank" 
                                rel="noopener noreferrer"
                            >
                                {__("OpenAI Dashboard", "tableberg")}
                            </a>
                        </p>
                    </div>

                    {testStatus && (
                        <div className={`tableberg-test-status ${testStatus.success ? 'success' : 'error'}`}>
                            {testStatus.message}
                        </div>
                    )}

                    <div className="tableberg-ai-settings-actions">
                        <button
                            type="button"
                            onClick={handleTestConnection}
                            disabled={isTesting || !localApiKey}
                            className="tableberg-button tableberg-button-secondary"
                        >
                            {isTesting ? __("Testing...", "tableberg") : __("Test Connection", "tableberg")}
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={isSaving}
                            className="tableberg-button tableberg-button-primary"
                        >
                            {isSaving ? __("Saving...", "tableberg") : __("Save Settings", "tableberg")}
                        </button>
                    </div>
                </div>
            </BoxContent>
        </div>
    );
}

export default AITableSettings;