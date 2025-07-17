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
        prompt: __("Create a modern product comparison table with 3 competing products. Include product images, star ratings for reviews, feature lists with checkmarks, and \"Buy Now\" buttons. Use icons for yes/no features and make it conversion-focused.", "tableberg"),
    },
    {
        id: "pricing",
        label: __("Pricing", "tableberg"),
        prompt: __("Create a professional pricing table with 3 tiers: Basic ($19/mo), Pro ($49/mo), and Enterprise ($99/mo). Include feature lists with checkmarks, highlight the Pro plan, add \"Get Started\" buttons, and use star ratings for customer satisfaction scores.", "tableberg"),
    },
    {
        id: "features",
        label: __("Features", "tableberg"),
        prompt: __("Create a feature comparison table with checkmark icons for included features, X icons for missing features, star icons for premium features, and styled lists for detailed specifications. Include action buttons.", "tableberg"),
    },
    {
        id: "products",
        label: __("Products", "tableberg"),
        prompt: __("Create a product showcase table with 3 products. Include product images, star ratings for reviews, styled feature lists, pricing with \"Order Now\" buttons, and visual indicators for key specifications.", "tableberg"),
    },
    {
        id: "services",
        label: __("Services", "tableberg"),
        prompt: __("Create a service comparison table with 3 service packages. Use styled lists for what's included, star ratings for quality scores, checkmark icons for features, and \"Contact Us\" buttons for each service.", "tableberg"),
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
                    <li>{__("Compare iPhone 15, 15 Pro, and 15 Pro Max with images, star ratings, feature lists, and buy buttons", "tableberg")}</li>
                    <li>{__("Team directory with profile photos, expertise ratings, skill lists, and contact buttons", "tableberg")}</li>
                    <li>{__("SaaS pricing table with feature checkmarks, star ratings, and signup buttons", "tableberg")}</li>
                </ul>
            </div>
        </div>
    );
}