import { Spinner } from "@wordpress/components";
import { __ } from "@wordpress/i18n";

interface Props {
    message?: string;
}

export default function LoadingState({ message = __("Loading...", "tableberg") }: Props) {
    return (
        <div className="tableberg-ai-loading">
            <Spinner />
            <p>{message}</p>
            <div className="tableberg-ai-loading-steps">
                <span>✨ {__("Analyzing your request", "tableberg")}</span>
                <span>🤖 {__("Generating table structure", "tableberg")}</span>
                <span>📊 {__("Creating table blocks", "tableberg")}</span>
            </div>
        </div>
    );
}