import { BlockEditProps, registerBlockType } from "@wordpress/blocks";
import {
    // @ts-ignore
    AlignmentControl,
    BlockControls,
    store as blockEditorStore,
} from "@wordpress/block-editor";
import {
    useBlockProps,
    useInnerBlocksProps,
    InnerBlocks,
} from "@wordpress/block-editor";
import { useSelect } from "@wordpress/data";
import { alignLeft, alignRight, alignCenter } from "@wordpress/icons";

import "./style.scss";
import "./editor.scss";

import metadata from "./block.json";
import classNames from "classnames";

interface TablebergCellBlockAttrs {
    align: string;
}

const ALLOWED_BLOCKS = [
    "core/image",
    "core/list",
    "core/buttons",
    "core/heading",
    "core/code",
    "core/social-links",
    "core/paragraph",
];

function edit({
    clientId,
    attributes,
    setAttributes,
}: BlockEditProps<TablebergCellBlockAttrs>) {
    const hasInnerBlocks = useSelect(
        (select) =>
            (select(blockEditorStore) as any).getBlocks(clientId).length > 0,
        [clientId]
    );

    const { align } = attributes;

    const className = classNames({
        [`has-text-align-${align}`]: align,
    });

    const blockProps = useBlockProps({ className });

    // @ts-ignore
    const innerBlocksProps = useInnerBlocksProps(blockProps, {
        allowedBlocks: ALLOWED_BLOCKS,
        template: [["core/paragraph"]],
    });

    return (
        <>
            <td {...innerBlocksProps} />
            {/* @ts-ignore */}
            <BlockControls group="block">
                <AlignmentControl
                    value={align}
                    onChange={(nextAlign: string) => {
                        setAttributes({ align: nextAlign });
                    }}
                    label="Align Content"
                    alignmentControls={[
                        {
                            icon: alignLeft,
                            title: "Align content left",
                            align: "left",
                        },
                        {
                            icon: alignCenter,
                            title: "Align content center",
                            align: "center",
                        },
                        {
                            icon: alignRight,
                            title: "Align content right",
                            align: "right",
                        },
                    ]}
                />
            </BlockControls>
        </>
    );
}

function save() {
    const blockProps = useBlockProps.save();
    const innerBlocksProps = useInnerBlocksProps.save(blockProps);
    return <td {...innerBlocksProps} />;
}

registerBlockType(metadata.name, {
    title: metadata.title,
    category: metadata.category,
    attributes: {
        align: {
            type: "string",
        },
    },
    example: {},
    edit,
    save,
});
