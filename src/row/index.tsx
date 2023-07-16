import {
    BlockEditProps,
    registerBlockType,
    // @ts-ignore
    createBlocksFromInnerBlocksTemplate,
} from "@wordpress/blocks";

import {
    useBlockProps,
    useInnerBlocksProps,
    InnerBlocks,
    store as blockEditorStore,
} from "@wordpress/block-editor";
import { useDispatch, useSelect } from "@wordpress/data";

import metadata from "./block.json";
import { useEffect } from "react";

interface TBRowAttrs {
    cols: number;
}

const ALLOWED_BLOCKS = ["tableberg/cell"];

function edit({ attributes: { cols }, clientId }: BlockEditProps<TBRowAttrs>) {
    const blockProps = useBlockProps();

    const hasInnerBlocks = useSelect(
        (select) =>
            (select(blockEditorStore) as any).getBlocks(clientId).length > 0,
        [clientId]
    );

    const innerBlocksProps = useInnerBlocksProps(blockProps, {
        renderAppender: hasInnerBlocks
            ? undefined
            : InnerBlocks.ButtonBlockAppender,
        allowedBlocks: ALLOWED_BLOCKS,
    });

    const { replaceInnerBlocks } = useDispatch(blockEditorStore);

    useEffect(() => {
        if (hasInnerBlocks) {
            return;
        }

        const newInnerBlocksTmpl = Array.from({ length: cols }, () => [
            "tableberg/cell",
        ]);
        replaceInnerBlocks(
            clientId,
            createBlocksFromInnerBlocksTemplate(newInnerBlocksTmpl)
        );
    }, []);

    return <tr {...innerBlocksProps} />;
}

export default function save() {
    return <tr></tr>;
}

registerBlockType(metadata.name, {
    title: metadata.title,
    category: metadata.category,
    attributes: {
        cols: {
            type: "number",
            default: 2,
        },
    },
    example: {},
    edit,
    save,
});
