import {
    BlockEditProps,
    registerBlockType,
    createBlocksFromInnerBlocksTemplate,
    createBlock,
    InnerBlockTemplate,
} from "@wordpress/blocks";
import {
    BlockAlignmentToolbar,
    BlockVerticalAlignmentToolbar,
    BlockControls,
    store as blockEditorStore,
} from "@wordpress/block-editor";
import { useBlockProps, useInnerBlocksProps } from "@wordpress/block-editor";
import { useDispatch, useSelect } from "@wordpress/data";
import { Button } from "@wordpress/components";
import { tableRowBefore, tableRowAfter } from "@wordpress/icons";

import "./style.scss";
import "./editor.scss";

import metadata from "./block.json";
import classNames from "classnames";

interface TablebergCellBlockAttrs {
    align: "left" | "right" | "center";
    vAlign: "bottom" | "center" | "top";
}

const ALLOWED_BLOCKS = ["core/paragraph", "tableberg/button"];

function edit({
    clientId,
    attributes,
    setAttributes,
}: BlockEditProps<TablebergCellBlockAttrs>) {
    const { align, vAlign } = attributes;

    const hAlignChange = (newValue: "left" | "right" | "center") => {
        setAttributes({ align: newValue });
    };

    const vAlignChange = (newValue: "bottom" | "center" | "top") => {
        setAttributes({ vAlign: newValue });
    };

    const className = classNames({
        [`align-${align}`]: align,
        [`align-v-${vAlign}`]: vAlign,
    });

    const blockProps = useBlockProps({ className });

    // @ts-ignore
    const innerBlocksProps = useInnerBlocksProps(blockProps, {
        allowedBlocks: ALLOWED_BLOCKS,
        template: [["core/paragraph"]],
    });

    const { insertBlock, updateBlockAttributes } =
        useDispatch(blockEditorStore);

    const [insertRow] = useSelect(
        (select) => {
            const storeSelect = select(blockEditorStore) as any;

            const insertRow = async (after = false) => {
                const parentBlocks = storeSelect.getBlockParents(clientId);

                const tableBlockId = parentBlocks.find(
                    (parentId: string) =>
                        storeSelect.getBlockName(parentId) === "tableberg/table"
                );

                const currentRowBlockId = parentBlocks.find(
                    (parentId: string) =>
                        storeSelect.getBlockName(parentId) === "tableberg/row"
                );

                const { rows, cols } =
                    storeSelect.getBlockAttributes(tableBlockId);

                const rowIndex = storeSelect.getBlockIndex(currentRowBlockId);

                const newRowIndex = after ? rowIndex + 1 : rowIndex;
                const newRowBlock = createBlocksFromInnerBlocksTemplate([
                    [
                        "tableberg/row",
                        {},
                        Array.from({ length: cols }, () => ["tableberg/cell"]),
                    ],
                ])[0];

                await insertBlock(newRowBlock, newRowIndex, tableBlockId, true);
                await updateBlockAttributes(tableBlockId, { rows: rows + 1 });
            };
            return [insertRow];
        },
        [clientId]
    );

    const addRowBefore = async () => {
        await insertRow();
    };
    const addRowAfter = async () => {
        await insertRow(true);
    };

    return (
        <>
            <td {...innerBlocksProps} />
            <BlockControls group="block">
                <BlockAlignmentToolbar
                    value={align}
                    onChange={hAlignChange}
                    controls={["left", "center", "right"]}
                />
                <BlockVerticalAlignmentToolbar
                    value={vAlign}
                    onChange={vAlignChange}
                />
                <Button
                    label="Add Row Before"
                    icon={tableRowBefore}
                    onClick={addRowBefore}
                />
                <Button
                    label="Add Row After"
                    icon={tableRowAfter}
                    onClick={addRowAfter}
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
            default: "left",
        },
        vAlign: {
            type: "string",
            default: "top",
        },
    },
    example: {},
    edit,
    save,
});
