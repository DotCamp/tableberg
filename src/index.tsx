import {
    BlockEditProps,
    BlockSaveProps,
    createBlock,
    registerBlockType,
} from "@wordpress/blocks";

import { ToolbarButton, ToolbarGroup } from "@wordpress/components";
import {
    BlockControls,
    useBlockProps,
    useInnerBlocksProps,
    store as blockEditorStore,
} from "@wordpress/block-editor";
import { quote, list, image } from "@wordpress/icons";
import { useDispatch, useSelect } from "@wordpress/data";

import "./style.scss";
import "./editor.scss";

import metadata from "./block.json";

interface TablebergBlockAttrs {
    rows: number;
    cols: number;
    data: Array<Array<any>>;
}

function edit({ attributes, clientId }: BlockEditProps<TablebergBlockAttrs>) {
    const blockProps = useBlockProps();

    const innerBlocksProps = useInnerBlocksProps(blockProps);

    const { replaceInnerBlocks } = useDispatch(blockEditorStore);

    const { innerBlocks } = useSelect((select) => {
        const { getBlocks } = select(blockEditorStore) as any;
        return { innerBlocks: getBlocks(clientId) };
    }, []);

    function addRow(block: string) {
        console.log(innerBlocks);

        innerBlocks.push(createBlock(block));

        replaceInnerBlocks(clientId, innerBlocks);
    }

    return (
        <>
            <BlockControls>
                <ToolbarGroup>
                    <ToolbarButton
                        onClick={() => addRow("core/list")}
                        label="Add list block"
                        icon={list}
                    />
                    <ToolbarButton
                        onClick={() => addRow("core/quote")}
                        label="Add quote block"
                        icon={quote}
                    />
                    <ToolbarButton
                        onClick={() => addRow("core/image")}
                        label="Add image block"
                        icon={image}
                    />
                </ToolbarGroup>
            </BlockControls>
            <table {...innerBlocksProps} />
        </>
    );
}

export default function save({
    attributes,
}: BlockSaveProps<TablebergBlockAttrs>) {
    const blockProps = useBlockProps.save();
    return (
        <div {...blockProps}>
            <table></table>
        </div>
    );
}

registerBlockType(metadata.name, {
    title: metadata.title,
    category: metadata.category,
    attributes: {
        cols: {
            type: "number",
            default: 5,
        },
        rows: {
            type: "number",
            default: 3,
        },
        data: {
            type: "array",
            default: [],
        },
    },
    example: {
        attributes: {
            cols: 2,
            rows: 2,
            data: [
                ["1x1", "1x2"],
                ["2x1", "2x2"],
            ],
        },
    },
    edit,
    save,
});
