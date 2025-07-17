import { useState, useEffect } from "react";
import {
    Button,
    TextareaControl,
    Notice,
    Spinner,
} from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import apiFetch from "@wordpress/api-fetch";
import { createBlock } from "@wordpress/blocks";
import LoadingState from "./components/LoadingState";
import PromptInput from "./components/PromptInput";
import CustomModal from "../../components/CustomModal";
import "./ai-table-modal.scss";

interface Props {
    onClose: () => void;
    onInsert: (block: any) => void;
}

type GenerationMethod = "prompt" | "context" | "image";
type ModalState = "method-selection" | "input" | "processing" | "error";

interface AISettings {
    api_key?: string;
    enabled?: boolean;
    ajax?: {
        generateTable?: {
            url: string;
            action: string;
            nonce: string;
        };
    };
}

declare global {
    interface Window {
        tablebergAdminMenuData?: {
            ai_settings?: AISettings;
        };
    }
}

interface AIStatus {
    configured: boolean;
    is_pro: boolean;
    has_api_key?: boolean;
    enabled?: boolean;
    message: string;
}

export default function AITableModal({ onClose, onInsert }: Props) {
    const [method, setMethod] = useState<GenerationMethod | null>(null);
    const [state, setState] = useState<ModalState>("method-selection");
    const [prompt, setPrompt] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);
    const [isCheckingStatus, setIsCheckingStatus] = useState(true);

    // Check AI configuration status on mount
    useEffect(() => {
        const checkAIStatus = async () => {
            try {
                const status = (await apiFetch({
                    path: "/tableberg/v1/ai/status",
                    method: "GET",
                })) as AIStatus;
                setAiStatus(status);
            } catch (err) {
                console.error("Failed to check AI status:", err);
                // Fallback to checking if user is Pro
                setAiStatus({
                    configured: TABLEBERG_CFG.IS_PRO,
                    is_pro: TABLEBERG_CFG.IS_PRO,
                    message: TABLEBERG_CFG.IS_PRO
                        ? __("AI Table is available", "tableberg")
                        : __("AI Table requires Tableberg Pro", "tableberg"),
                });
            } finally {
                setIsCheckingStatus(false);
            }
        };

        checkAIStatus();
    }, []);

    const generateTable = async () => {
        if (!prompt.trim()) {
            setError(__("Please enter a table description", "tableberg"));
            return;
        }

        setState("processing");
        setIsGenerating(true);
        setError(null);

        try {
            const response = (await apiFetch({
                path: "/tableberg/v1/ai/generate-table",
                method: "POST",
                data: {
                    prompt: prompt,
                    method: method,
                },
            })) as any;

            console.log("AI Table API Response:", response);

            if (response.success && response.block) {
                // Recursively create blocks from the response
                const createBlocksFromData = (blockData: any): any => {
                    if (!blockData) return null;

                    // If it's an array, process each item
                    if (Array.isArray(blockData)) {
                        return blockData.map((block) =>
                            createBlocksFromData(block),
                        );
                    }

                    // Create innerBlocks recursively
                    const innerBlocks = blockData.innerBlocks
                        ? createBlocksFromData(blockData.innerBlocks).filter(
                              Boolean,
                          )
                        : [];

                    // Create the block with proper structure
                    return createBlock(
                        blockData.name,
                        blockData.attributes || {},
                        innerBlocks,
                    );
                };

                const block = createBlocksFromData(response.block);
                console.log("Created block:", block);

                if (block) {
                    onInsert(block);
                    onClose();
                } else {
                    throw new Error(
                        __("Failed to create block from response", "tableberg"),
                    );
                }
            } else {
                throw new Error(
                    response.message ||
                        __("Failed to generate table", "tableberg"),
                );
            }
        } catch (err: any) {
            console.error("AI Table generation error:", err);
            setState("error");

            // Check for specific error types
            if (
                err.code === "invalid_json" ||
                err.message?.includes("Unexpected token")
            ) {
                setError(
                    __(
                        "Invalid response from server. Please make sure the AI Table add-on is properly activated.",
                        "tableberg",
                    ),
                );
            } else if (err.code === "rest_no_route") {
                setError(
                    __(
                        "AI Table service not available. Please make sure the Pro version is activated and refresh the page.",
                        "tableberg",
                    ),
                );
            } else {
                setError(
                    err.message ||
                        __(
                            "An error occurred while generating the table",
                            "tableberg",
                        ),
                );
            }
        } finally {
            setIsGenerating(false);
        }
    };

    const renderMethodSelection = () => (
        <div className="tableberg-ai-modal-methods">
            <h3>
                {__("How would you like to create your table?", "tableberg")}
            </h3>
            <div className="tableberg-ai-modal-method-grid">
                <button
                    className="tableberg-ai-modal-method"
                    onClick={() => {
                        setMethod("prompt");
                        setState("input");
                    }}
                >
                    <span className="tableberg-ai-modal-method-icon">✏️</span>
                    <span className="tableberg-ai-modal-method-title">
                        {__("From Prompt", "tableberg")}
                    </span>
                    <span className="tableberg-ai-modal-method-desc">
                        {__("Describe the table you want", "tableberg")}
                    </span>
                </button>

                <button
                    className="tableberg-ai-modal-method tableberg-ai-modal-method--disabled"
                    disabled
                    title={__("Coming soon", "tableberg")}
                >
                    <span className="tableberg-ai-modal-method-icon">📄</span>
                    <span className="tableberg-ai-modal-method-title">
                        {__("From Page Content", "tableberg")}
                    </span>
                    <span className="tableberg-ai-modal-method-desc">
                        {__("Analyze current page", "tableberg")}
                    </span>
                </button>

                <button
                    className="tableberg-ai-modal-method tableberg-ai-modal-method--disabled"
                    disabled
                    title={__("Coming soon", "tableberg")}
                >
                    <span className="tableberg-ai-modal-method-icon">🖼️</span>
                    <span className="tableberg-ai-modal-method-title">
                        {__("From Image", "tableberg")}
                    </span>
                    <span className="tableberg-ai-modal-method-desc">
                        {__("Upload a screenshot", "tableberg")}
                    </span>
                </button>
            </div>
        </div>
    );

    const renderInput = () => {
        if (method === "prompt") {
            return (
                <PromptInput
                    value={prompt}
                    onChange={setPrompt}
                    onGenerate={generateTable}
                    isGenerating={isGenerating}
                />
            );
        }

        // TODO: Add other input methods
        return null;
    };

    const renderHeader = () => {
        if (isCheckingStatus || !aiStatus?.is_pro || !aiStatus?.configured) {
            return null;
        }

        return (
            <div className="tableberg-ai-modal-header">
                {state === "input" && (
                    <Button
                        variant="tertiary"
                        onClick={() => {
                            setState("method-selection");
                            setMethod(null);
                            setError(null);
                        }}
                        className="tableberg-ai-modal-back"
                    >
                        ← {__("Back to methods", "tableberg")}
                    </Button>
                )}
                
                <div className="tableberg-ai-modal-breadcrumb">
                    {state === "method-selection" && (
                        <span className="tableberg-ai-modal-breadcrumb-current">
                            {__("Choose Method", "tableberg")}
                        </span>
                    )}
                    {state === "input" && method && (
                        <>
                            <span className="tableberg-ai-modal-breadcrumb-step">
                                {__("Choose Method", "tableberg")}
                            </span>
                            <span className="tableberg-ai-modal-breadcrumb-separator">›</span>
                            <span className="tableberg-ai-modal-breadcrumb-current">
                                {method === "prompt" && __("From Prompt", "tableberg")}
                                {method === "context" && __("From Page Content", "tableberg")}
                                {method === "image" && __("From Image", "tableberg")}
                            </span>
                        </>
                    )}
                    {(state === "processing" || state === "error") && method && (
                        <>
                            <span className="tableberg-ai-modal-breadcrumb-step">
                                {__("Choose Method", "tableberg")}
                            </span>
                            <span className="tableberg-ai-modal-breadcrumb-separator">›</span>
                            <span className="tableberg-ai-modal-breadcrumb-step">
                                {method === "prompt" && __("From Prompt", "tableberg")}
                                {method === "context" && __("From Page Content", "tableberg")}
                                {method === "image" && __("From Image", "tableberg")}
                            </span>
                            <span className="tableberg-ai-modal-breadcrumb-separator">›</span>
                            <span className="tableberg-ai-modal-breadcrumb-current">
                                {state === "processing" && __("Generating", "tableberg")}
                                {state === "error" && __("Error", "tableberg")}
                            </span>
                        </>
                    )}
                </div>
            </div>
        );
    };

    const renderContent = () => {
        if (isCheckingStatus) {
            return (
                <div className="tableberg-ai-modal-loading">
                    <Spinner />
                    <p>{__("Checking AI configuration...", "tableberg")}</p>
                </div>
            );
        }

        if (!aiStatus?.is_pro) {
            return (
                <div className="tableberg-ai-modal-configure">
                    <Notice status="warning" isDismissible={false}>
                        {__(
                            "AI Table feature requires Tableberg Pro",
                            "tableberg",
                        )}
                    </Notice>
                    <p>
                        {__(
                            "Upgrade to Tableberg Pro to unlock AI-powered table generation and other premium features.",
                            "tableberg",
                        )}
                    </p>
                    <Button
                        variant="primary"
                        href="https://dotcamp.com/tableberg"
                        target="_blank"
                    >
                        {__("Upgrade to Pro", "tableberg")}
                    </Button>
                </div>
            );
        }

        if (!aiStatus?.configured) {
            return (
                <div className="tableberg-ai-modal-configure">
                    <Notice status="warning" isDismissible={false}>
                        {aiStatus.message ||
                            __(
                                "AI Table generation requires configuration.",
                                "tableberg",
                            )}
                    </Notice>
                    <p>
                        {__(
                            "Please configure your OpenAI API key in the Tableberg settings to use AI features.",
                            "tableberg",
                        )}
                    </p>
                    <Button
                        variant="primary"
                        href={`${window.location.origin}/wp-admin/admin.php?page=tableberg-settings&route=settings`}
                        target="_blank"
                    >
                        {__("Go to Settings", "tableberg")}
                    </Button>
                </div>
            );
        }

        return (
            <>
                {renderHeader()}
                <div className="tableberg-ai-modal-content">
                    {(() => {
                        switch (state) {
                            case "method-selection":
                                return renderMethodSelection();

                            case "input":
                                return renderInput();

                            case "processing":
                                return (
                                    <LoadingState
                                        message={__("Creating your table...", "tableberg")}
                                    />
                                );

                            case "error":
                                return (
                                    <div className="tableberg-ai-modal-error">
                                        <Notice status="error" isDismissible={false}>
                                            {error}
                                        </Notice>
                                        <div className="tableberg-ai-modal-actions">
                                            <Button
                                                variant="secondary"
                                                onClick={() => {
                                                    setState("input");
                                                    setError(null);
                                                }}
                                            >
                                                {__("Try Again", "tableberg")}
                                            </Button>
                                            <Button 
                                                variant="tertiary" 
                                                onClick={() => {
                                                    setState("method-selection");
                                                    setMethod(null);
                                                    setError(null);
                                                }}
                                            >
                                                {__("Choose Different Method", "tableberg")}
                                            </Button>
                                        </div>
                                    </div>
                                );

                            default:
                                return null;
                        }
                    })()}
                </div>
                <div className="tableberg-ai-modal-footer">
                    <Button
                        variant="primary"
                        onClick={generateTable}
                        disabled={isGenerating || !prompt.trim()}
                    >
                        {isGenerating
                            ? __("Generating...", "tableberg")
                            : __("Generate & Insert Table", "tableberg")}
                    </Button>
                </div>
            </>
        );
    };

    return (
        <CustomModal
            title={__("AI Table", "tableberg")}
            onRequestClose={onClose}
            className="tableberg-ai-modal"
            isDismissible={!isGenerating}
            shouldCloseOnClickOutside={!isGenerating}
        >
            {renderContent()}
        </CustomModal>
    );
}
