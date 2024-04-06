import { BlockEditProps, registerBlockType } from "@wordpress/blocks";

import metadata from "./block.json";
import blockIcon from "./icon";
import {
    AlignmentToolbar,
    BlockControls,
    InspectorControls,
    useBlockProps,
    useInnerBlocksProps,
} from "@wordpress/block-editor";
import { getStyles } from "./get-styles";
import { ColorControl, SpacingControl } from "@tableberg/components";
import { __ } from "@wordpress/i18n";
import {
    BaseControl,
    PanelBody,
    SelectControl,
    ToggleControl,
} from "@wordpress/components";

interface StyledListProps {
    isOrdered: boolean;
    icon: any;
    alignment: string;
    iconColor: string;
    iconSize: number;
    fontSize: number;
    itemSpacing: number;
    textColor: string;
    backgroundColor: string;
    padding: object;
    margin: object;
}

const ALLOWED_BLOCKS = ["tableberg/styled-list-item"];

function edit(props: BlockEditProps<StyledListProps>) {
    const { attributes, setAttributes } = props;

    const blockProps = useBlockProps({
        style: getStyles(attributes),
    });

    const innerBlocksProps = useInnerBlocksProps(blockProps as any, {
        allowedBlocks: ALLOWED_BLOCKS,
        template: [["tableberg/styled-list-item"]],
    });

    const TagName = attributes.isOrdered ? "ol" : "ul";

    return (
        <>
            <TagName {...innerBlocksProps} />

            <BlockControls>
                <AlignmentToolbar
                    value={attributes.alignment}
                    onChange={(value) => setAttributes({ alignment: value })}
                />
            </BlockControls>

            <InspectorControls group="color">
                <ColorControl
                    label={__("Icon Color", "tableberg-pro")}
                    colorValue={attributes.iconColor}
                    onColorChange={(iconColor: any) =>
                        setAttributes({ iconColor })
                    }
                    onDeselect={() => setAttributes({ iconColor: undefined })}
                />
                <ColorControl
                    label={__("List Text Color", "tableberg-pro")}
                    colorValue={attributes.textColor}
                    onColorChange={(textColor: any) =>
                        setAttributes({ textColor })
                    }
                    onDeselect={() => setAttributes({ textColor: undefined })}
                />
                <ColorControl
                    label={__("List Background Color", "tableberg-pro")}
                    colorValue={attributes.backgroundColor}
                    onColorChange={(backgroundColor: any) =>
                        setAttributes({ backgroundColor })
                    }
                    onDeselect={() =>
                        setAttributes({ backgroundColor: undefined })
                    }
                />
            </InspectorControls>
            <InspectorControls group="dimensions">
                <SpacingControl
                    label={__("Padding", "tableberg-pro")}
                    value={attributes.padding}
                    onChange={(padding) => setAttributes({ padding })}
                    onDeselect={() => setAttributes({ padding: undefined })}
                />
                <SpacingControl
                    label={__("Margin", "tableberg-pro")}
                    value={attributes.margin}
                    onChange={(margin) => setAttributes({ margin })}
                    onDeselect={() => setAttributes({ margin: undefined })}
                />
            </InspectorControls>

            <InspectorControls group="settings">
                <PanelBody title="List Settings" initialOpen={true}>
                    <BaseControl __nextHasNoMarginBottom>
                        <SelectControl
                            label="List Type"
                            value={attributes.isOrdered ? "1" : "0"}
                            options={[
                                { label: "Orderded", value: "1" },
                                { label: "Unordered", value: "0" },
                            ]}
                            onChange={(isOrdered: any) => {
                                setAttributes({
                                    isOrdered: isOrdered == "1",
                                });
                            }}
                        />

                        {!attributes.isOrdered && (
                            <>
                                
                            </>
                        )}
                    </BaseControl>
                </PanelBody>
            </InspectorControls>
        </>
    );
}

function save() {
    const blockProps = useBlockProps.save();
    const innerBlocksProps = useInnerBlocksProps.save(blockProps);
    return <ul {...innerBlocksProps} />;
}

registerBlockType(metadata as any, {
    icon: blockIcon,
    attributes: metadata.attributes as any,
    edit,
    save,
});
