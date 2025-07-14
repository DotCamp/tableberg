import { TextareaControl, Button, Flex } from "@wordpress/components";
import { __ } from "@wordpress/i18n";

interface Props {
    value: string;
    onChange: (value: string) => void;
    onGenerate: () => void;
    isGenerating: boolean;
}

const templates = [
    {
        id: "comparison",
        label: __("Comparison", "tableberg"),
        prompt: __("Create a comparison table for [products] with features like [list key features]", "tableberg"),
    },
    {
        id: "pricing",
        label: __("Pricing", "tableberg"),
        prompt: __("Create a pricing table with 3 tiers: Basic, Pro, and Enterprise", "tableberg"),
    },
    {
        id: "schedule",
        label: __("Schedule", "tableberg"),
        prompt: __("Create a weekly schedule table for Monday through Friday", "tableberg"),
    },
    {
        id: "features",
        label: __("Features", "tableberg"),
        prompt: __("Create a feature comparison table with checkmarks", "tableberg"),
    },
    {
        id: "data",
        label: __("Data", "tableberg"),
        prompt: __("Create a data table with columns for [specify columns]", "tableberg"),
    },
];

export default function PromptInput({ value, onChange, onGenerate, isGenerating }: Props) {
    const applyTemplate = (template: string) => {
        onChange(template);
    };

    return (
        <div className="tableberg-ai-prompt-input">
            <TextareaControl
                label={__("Describe what table you need:", "tableberg")}
                value={value}
                onChange={onChange}
                placeholder={__(
                    "Example: Create a pricing comparison table with 3 plans...",
                    "tableberg"
                )}
                rows={6}
                disabled={isGenerating}
            />
            
            <div className="tableberg-ai-templates">
                <p className="tableberg-ai-templates-label">
                    {__("Quick Templates:", "tableberg")}
                </p>
                <Flex gap={2} wrap>
                    {templates.map((template) => (
                        <Button
                            key={template.id}
                            variant="secondary"
                            size="small"
                            onClick={() => applyTemplate(template.prompt)}
                            disabled={isGenerating}
                        >
                            {template.label}
                        </Button>
                    ))}
                </Flex>
            </div>

            <div className="tableberg-ai-examples">
                <p className="tableberg-ai-examples-label">
                    {__("Examples:", "tableberg")}
                </p>
                <ul>
                    <li>{__("Pricing table with Basic ($9), Pro ($29), Enterprise ($99)", "tableberg")}</li>
                    <li>{__("Compare iPhone 15, 15 Pro, and 15 Pro Max features", "tableberg")}</li>
                    <li>{__("Weekly schedule Monday to Friday, 9am to 5pm", "tableberg")}</li>
                </ul>
            </div>

            <div className="tableberg-ai-modal-actions">
                <Button
                    variant="primary"
                    onClick={onGenerate}
                    disabled={isGenerating || !value.trim()}
                >
                    {isGenerating
                        ? __("Generating...", "tableberg")
                        : __("Generate & Insert Table", "tableberg")}
                </Button>
            </div>
        </div>
    );
}