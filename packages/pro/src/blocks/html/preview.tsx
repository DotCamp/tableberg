/**
 * WordPress dependencies
 */
import { useMemo } from "@wordpress/element";
import {
    transformStyles,
    store as blockEditorStore,
} from "@wordpress/block-editor";
import { SandBox } from "@wordpress/components";
import { useSelect } from "@wordpress/data";
import { __ } from "@wordpress/i18n";

// Default styles used to unset some of the styles
// that might be inherited from the editor style.
const DEFAULT_STYLES = `
	html,body,:root {
		margin: 0 !important;
		padding: 0 !important;
		overflow: visible !important;
		min-height: auto !important;
	}
`;
interface PreviewType {
    content: string;
    isSelected: boolean;
}

export default function HTMLEditPreview({ content, isSelected }: PreviewType) {
    const settingStyles = useSelect(
        (select) => select(blockEditorStore).getSettings().styles,
    );

    const styles = useMemo(
        () => [
            DEFAULT_STYLES,
            ...transformStyles(settingStyles.filter((style) => style.css)),
        ],
        [settingStyles],
    );

    return (
        <>
            <SandBox
                html={content}
                styles={styles}
                title={__("Custom HTML Preview", "tableberg-pro")}
                tabIndex={-1}
            />
            {!isSelected && <div className="tb-custom-html-preview"></div>}
        </>
    );
}
