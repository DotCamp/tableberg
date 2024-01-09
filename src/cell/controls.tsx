import { HeightControl, InspectorControls } from "@wordpress/block-editor";
import { BlockEditProps } from "@wordpress/blocks";
import { __ } from "@wordpress/i18n";
import { TablebergCellBlockAttrs } from ".";
import {
    __experimentalToolsPanel as ToolsPanel,
    __experimentalToolsPanelItem as ToolsPanelItem,
} from "@wordpress/components";

export default function CellControls(
    props: BlockEditProps<TablebergCellBlockAttrs>
) {
    const { attributes, setAttributes } = props;
    return (
        <InspectorControls group="styles">
            <ToolsPanel
                label={__("Cell Settings", "tableberg")}
                resetAll={() =>
                    setAttributes({
                        height: '',
                        width: '',
                    })
                }
            >
                <ToolsPanelItem
                    label={__("Column Width", "tableberg")}
                    hasValue={() => true}
                >
                    <HeightControl
                        value={attributes.width as any}
                        label={__("Column Width", "tableberg")}
                        onChange={(newValue: string) =>
                            setAttributes({ width: newValue })
                        }
                    />
                </ToolsPanelItem>
                <ToolsPanelItem
                    label={__("Row Height", "tableberg")}
                    hasValue={() => true}
                >
                    <HeightControl
                        value={attributes.height as any}
                        label={__("Row Height", "tableberg")}
                        onChange={(newValue: string) =>
                            setAttributes({ height: newValue })
                        }
                    />
                </ToolsPanelItem>
            </ToolsPanel>
        </InspectorControls>
    );
}
