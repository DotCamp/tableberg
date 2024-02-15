import { HeightControl, InspectorControls } from "@wordpress/block-editor";
import { __ } from "@wordpress/i18n";
import {
    __experimentalToolsPanel as ToolsPanel,
    __experimentalToolsPanelItem as ToolsPanelItem,
} from "@wordpress/components";

interface CellSizeControlProps {
    width: string;
    height: string;
    setWidth: (newWidth: string) => void;
    setHeight: (newHeight: string) => void;
}

export default function CellControls({
    height,
    width,
    setHeight,
    setWidth,
}: CellSizeControlProps) {
    return (
        <InspectorControls group="styles">
            <ToolsPanel
                label={__("Cell Settings", "tableberg")}
                resetAll={() => {
                    setHeight("");
                    setWidth("");
                }}
            >
                <ToolsPanelItem
                    label={__("Column Width", "tableberg")}
                    hasValue={() => true}
                >
                    <HeightControl
                        value={width as any}
                        label={__("Column Width", "tableberg")}
                        onChange={setWidth}
                    />
                </ToolsPanelItem>
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
