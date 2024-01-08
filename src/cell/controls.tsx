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
                label={__("Cell Size", "tableberg")}
                resetAll={() =>
                    setAttributes({
                        height: 0,
                        width: 0,
                    })
                }
            >
                <ToolsPanelItem
                    label={__("Cell Width", "tableberg")}
                    hasValue={() => true}
                >
                    <HeightControl
                        value={attributes.width as any}
                        label={__("Cell Width", "tableberg")}
                        onChange={(newValue: string) =>
                            setAttributes({ width: parseInt(newValue) })
                        }
                    />
                </ToolsPanelItem>
                <ToolsPanelItem
                    label={__("Cell Height", "tableberg")}
                    hasValue={() => true}
                >
                    <HeightControl
                        value={attributes.height as any}
                        label={__("Cell Height", "tableberg")}
                        onChange={(newValue: string) =>
                            setAttributes({ height: parseInt(newValue) })
                        }
                    />
                </ToolsPanelItem>
            </ToolsPanel>
        </InspectorControls>
    );
}
