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
}
