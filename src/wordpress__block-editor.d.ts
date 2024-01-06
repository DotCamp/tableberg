import "@wordpress/block-editor";
import { BlockAttributes } from "@wordpress/blocks";

declare module "@wordpress/block-editor" {
    namespace InspectorControls {
        interface Props {
            group?:
                | "default"
                | "settings"
                | "advanced"
                | "position"
                | "border"
                | "color"
                | "dimensions"
                | "typography"
                | "styles"
                | "list";
        }
    }

    namespace BlockControls {
        interface Props {
            group?: "block" | "other";
        }
    }

    namespace HeightControl {
        interface Props {
            children?: never | undefined;
            onChange(newValue: string | undefined): void;
            value: string | undefined;
            label?: string;
        }
    }

    const HeightControl: import("react").ComponentType<HeightControl.Props>;

    namespace AlignmentControl {
        interface Props {
            children?: never | undefined;
            onChange(newValue: string | undefined): void;
            value: string | undefined;
            label?: string;
            alignmentControls?: {
                align: string;
                icon: JSX.Element;
                title: string;
            }[];
            describedBy?: string;
            isCollapsed?: boolean;
            isToolbar?: boolean;
        }
    }

    const AlignmentControl: import("react").ComponentType<AlignmentControl.Props>;

    namespace __experimentalLinkControl {
        interface LinkControlValue {
            url?: string;
            opensInNewTab?: boolean;
        }
        interface Props {
            children?: never | undefined;
            searchInputPlaceholder?: string;
            value: LinkControlValue;
            settings?: {
                id: string;
                title: string;
            };
            onChange?: (newValue: LinkControlValue) => void;
            onRemove?: () => void;
            onCancel?: () => void;
            noDirectEntry?: boolean;
            showSuggestions?: boolean;
            showInitialSuggestions?: boolean;
            forceIsEditingLink?: boolean;
            createSuggestion?: boolean;
            withCreateSuggestion?: boolean;
            inputValue?: string;
            suggestionsQuery?: object;
            noURLSuggestion?: boolean;
            createSuggestionButtonText?: string | (() => string);
            hasRichPreviews?: boolean;
            hasTextControl?: boolean;
            renderControlBottom?: any;
        }
    }

    const __experimentalLinkControl: import("react").ComponentType<__experimentalLinkControl.Props>;

    namespace __experimentalBorderRadiusControl {
        interface Props {
            children?: never | undefined;
            values:
                | string
                | {
                      topLeft: string;
                      topRight: string;
                      bottomLeft: string;
                      bottomRight: string;
                  };
            onChange: (newValue: object) => void;
        }
    }

    namespace MediaPlaceholder {
        interface Props<T extends boolean> {
            placeholder: (content: import("react").ReactNode) => JSX.Element;
        }
    }

    const __experimentalBorderRadiusControl: import("react").ComponentType<__experimentalBorderRadiusControl.Props>;

    const useBlockEditContext: () => {
        name: string;
        isSelected: boolean;
        clientId: string;
    };

    const __experimentalUseBorderProps: (attributes: BlockAttributes) => {
        className: string;
        style: {
            [key: string]: string;
        };
    };

    const __experimentalUseMultipleOriginColorsAndGradients: () => {
        colors: {
            name: string;
            colors: {
                name: string;
                slug: string;
                color: string;
            }[];
        }[];
        disableCustomColors: boolean;
        disableCustomGradients: boolean;
        gradients: {
            name: string;
            gradients: {
                gradient: string;
                name: string;
                slug: string;
            }[];
        }[];
        hasColorsOrGradients: boolean;
    };

    const __experimentalGetElementClassName: (element: string) => string;
}
