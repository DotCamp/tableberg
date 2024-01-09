import { HeightControl, InspectorControls } from "@wordpress/block-editor";
import { __ } from "@wordpress/i18n";
import {
    __experimentalToolsPanel as ToolsPanel,
    __experimentalToolsPanelItem as ToolsPanelItem,
} from "@wordpress/components";

interface RowSizeControlProps {
    height: string;
    setHeight: (newHeight: string) => void;
}

export default function RowControls({
    height,
    setHeight,
}: RowSizeControlProps) {
    return (
        <InspectorControls group="styles">
            <ToolsPanel
                label={__("Row Settings", "tableberg")}
                resetAll={() => {
                    setHeight("");
                }}
            >
                <ToolsPanelItem
                    label={__("Row Height", "tableberg")}
                    hasValue={() => true}
                >
                    <HeightControl
                        value={height as any}
                        label={__("Row Height", "tableberg")}
                        onChange={setHeight}
                    />
                </ToolsPanelItem>
            </ToolsPanel>
        </InspectorControls>
    );
}
