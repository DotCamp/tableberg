import "@wordpress/block-editor";

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

    const useBlockEditContext: () => {
        name: string;
        isSelected: boolean;
        clientId: string;
    };
}
