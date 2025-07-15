import React from "react";
import { __ } from "@wordpress/i18n";
import AITableSettings from "../components/AITableSettings";
import "../components/AITableSettings.css";

/* global tablebergAdminMenuData */

/**
 * Settings content.
 *
 * @class
 */
function SettingsContent() {
    const aiSettings = tablebergAdminMenuData?.ai_settings;
    const isPro = tablebergAdminMenuData?.is_pro;

    return (
        <div className="tableberg-settings-content">
            { isPro ? (
                <AITableSettings
                    apiKey={ aiSettings?.api_key || "" }
                    onSettingsChange={ ( newSettings ) => {
                        // Handle settings change if needed
                        // Settings updated
                    } }
                />
            ) : (
                <div className="tableberg-pro-notice">
                    <h3>{ __( "AI Table Settings", "tableberg" ) }</h3>
                    <p>
                        { __(
                            "AI Table features are available in Tableberg Pro. Upgrade to unlock AI-powered table generation.",
                            "tableberg"
                        ) }
                    </p>
                    <a
                        href="https://tableberg.com/pricing"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tableberg-button tableberg-button-primary"
                    >
                        { __( "Upgrade to Pro", "tableberg" ) }
                    </a>
                </div>
            ) }
        </div>
    );
}

/**
 * @module SettingsContent
 */
export default SettingsContent;
