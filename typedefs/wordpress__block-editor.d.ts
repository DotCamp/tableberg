import "@wordpress/block-editor";
import { BlockAttributes } from "@wordpress/blocks";
import { WPUnitControlUnit } from "@wordpress/components/build-types/unit-control/types";
import { ComponentType, HTMLProps, ReactNode } from "react";

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

    const HeightControl: ComponentType<HeightControl.Props>;

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

    const AlignmentControl: ComponentType<AlignmentControl.Props>;

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

    const __experimentalLinkControl: ComponentType<__experimentalLinkControl.Props>;

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

    const __experimentalBorderRadiusControl: ComponentType<__experimentalBorderRadiusControl.Props>;

    namespace __experimentalSpacingSizesControl {
        interface Props {
            children?: never | undefined;
            label: string;
            onMouseOver?: () => void;
            onMouseOut?: () => void;
            onChange: (newValue: any) => void;
            allowReset?: boolean;
            min?: number;
            splitOnAxis?: boolean;
            showSideInLabel?: boolean;
            units?: WPUnitControlUnit[];
            values: Record<string, any>;
            sides?: string[];
        }
    }

    const __experimentalSpacingSizesControl: ComponentType<__experimentalSpacingSizesControl.Props>;

    namespace __experimentalColorGradientSettingsDropdown {
        interface Props {
            children?: never | undefined;
            enableAlpha?: boolean;
            panelId?: string;
            title?: string;
            popoverProps?: Record<string, any>;
            settings?: Record<string, any>;
        }
    }

    const __experimentalColorGradientSettingsDropdown: ComponentType<__experimentalColorGradientSettingsDropdown.Props>;

    namespace MediaReplaceFlow {
        interface Props {
            mediaURL: string;
            mediaId: number;
            onSelect: (newMedia: any) => void;
            name?: string;
        }
    }

    const MediaReplaceFlow: ComponentType<MediaReplaceFlow.Props>;

    namespace __experimentalImageURLInputUI {
        interface Props {
            url: string;
            onChangeUrl: (props: any) => void;
            linkDestination: string;
            mediaUrl: string;
            mediaLink: string;
            linkTarget: string;
            linkClass: string;
            rel: string;
        }
    }

    const __experimentalImageURLInputUI: ComponentType<__experimentalImageURLInputUI.Props>;

    namespace __experimentalImageEditor {
        interface Props {
            id: number | string;
            url: string;
            width?: number;
            height?: number;
            clientWidth?: number;
            naturalHeight?: number;
            naturalWidth?: number;
            onSaveImage: (imageAttributes: { id: number; url: string }) => void;
            onFinishEditing: () => void;
        }
    }

    const __experimentalImageEditor: ComponentType<__experimentalImageEditor.Props>;

    namespace MediaPlaceholder {
        interface Props<T extends boolean> {
            placeholder: (content: ReactNode) => JSX.Element;
        }
    }

    namespace RichText {
        interface Props<T extends keyof HTMLElementTagNameMap>
            extends Omit<HTMLProps<T>, "onChange"> {
            withoutInteractiveFormatting?: boolean;
        }
    }

    namespace BlockControls {
        interface Props {
            __experimentalShareWithChildBlocks?: boolean;
        }
    }

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

    /**
     * Type may be incomplete or incorrect
     */
    interface EditorSettings {
        __experimentalFeatures: {
            appearanceTools: boolean;
            useRootPaddingAwareAlignments: boolean;
            border: {
                color: boolean;
                radius: boolean;
                style: boolean;
                width: boolean;
            };
            color: {
                background: boolean;
                button: boolean;
                caption: boolean;
                customDuotone: boolean;
                defaultDuotone: boolean;
                defaultGradients: boolean;
                defaultPalette: boolean;
                duotone: {
                    default: {
                        name: string;
                        colors: string[];
                        slug: string;
                    }[];
                };
                gradients: {
                    default: {
                        name: string;
                        gradient: string;
                        slug: string;
                    }[];
                    theme: {
                        name: string;
                        gradient: string;
                        slug: string;
                    }[];
                };
                heading: boolean;
                link: boolean;
                palette: {
                    default: {
                        name: string;
                        slug: string;
                        color: string;
                    }[];
                    theme: {
                        name: string;
                        slug: string;
                        color: string;
                    }[];
                };
                text: boolean;
            };
            shadow: {
                defaultPresets: boolean;
                presets: {
                    default: {
                        name: string;
                        slug: string;
                        shadow: string;
                    }[];
                };
            };
            spacing: {
                blockGap: boolean;
                margin: boolean;
                spacingScale: {
                    operator: string;
                    increment: number;
                    steps: number;
                    mediumStep: number;
                    unit: string;
                };
                spacingSizes: {
                    theme: {
                        name: string;
                        size: string;
                        slug: string;
                    }[];
                    default: {
                        name: string;
                        slug: string;
                        size: string;
                    }[];
                };
            };
            typography: {
                dropCap: boolean;
                fontSizes: {
                    default: {
                        name: string;
                        slug: string;
                        size: string;
                    }[];
                    theme: {
                        name: string;
                        size: string;
                        slug: string;
                        fluid: {
                            min: string;
                            max: string;
                        };
                    }[];
                };
                fontStyle: boolean;
                fontWeight: boolean;
                letterSpacing: boolean;
                textDecoration: boolean;
                textTransform: boolean;
                writingMode: boolean;
                fluid: boolean;
                fontFamilies: {
                    theme: {
                        fontFamily: string;
                        name: string;
                        slug: string;
                        fontFace?: {
                            fontFamily: string;
                            fontStretch: string;
                            fontStyle: string;
                            fontWeight: string;
                            src: [string];
                        }[];
                    }[];
                };
            };
            blocks: Record<string, any>;
            custom: {
                fontWeight: {
                    light: number;
                    regular: number;
                    medium: number;
                    "semi-bold": number;
                    bold: number;
                    "extra-bold": number;
                    black: number;
                };
                lineHeight: {
                    body: number;
                    heading: number;
                    medium: number;
                    one: number;
                };
                spacing: {
                    gap: string;
                };
            };
            layout: {
                contentSize: string;
                wideSize: string;
            };
            background: {
                backgroundImage: boolean;
            };
            dimensions: {
                minHeight: boolean;
            };
            position: {
                sticky: boolean;
            };
        };
    }
}
