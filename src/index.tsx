import {
    BlockEditProps,
    BlockSaveProps,
    createBlock,
    // @ts-ignore createBlocksFromInnerBlocksTemplate obviously exists as it is used by wordpress in their own blocks. Need to make a pr to @types/wordpress__blocks.
    createBlocksFromInnerBlocksTemplate,
    registerBlockType,
} from "@wordpress/blocks";

import { Placeholder, TextControl, Button } from "@wordpress/components";
import {
    useBlockProps,
    useInnerBlocksProps,
    store as blockEditorStore,
    BlockIcon,
} from "@wordpress/block-editor";
import { blockTable } from "@wordpress/icons";
import { useDispatch } from "@wordpress/data";

import "./style.scss";
import "./editor.scss";

import metadata from "./block.json";
import { FormEvent, useState } from "react";

interface TablebergBlockAttrs {
    rows: number;
    cols: number;
    data: Array<Array<any>>;
}

function edit({ clientId }: BlockEditProps<TablebergBlockAttrs>) {
    const blockProps = useBlockProps();

    const innerBlocksProps = useInnerBlocksProps(blockProps, {
        // @ts-ignore false can obviously be assigned to renderAppender as does wordpress in their own blocks. Need to make a pr to @types/wordpress__block-editor.
        renderAppender: false,
    });

    const { replaceInnerBlocks } = useDispatch(blockEditorStore);

    const [initialRowCount, setInitialRowCount] = useState(2);
    const [initialColumnCount, setInitialColumnCount] = useState(2);
    const [hasTableCreated, setHasTableCreated] = useState(false);

    function onCreateTable(event: FormEvent) {
        event.preventDefault();

        const initialInnerBlocks = [];
        for (let i = 0; i < initialRowCount; i++) {
            initialInnerBlocks.push([
                "tableberg/row",
                { cols: initialColumnCount },
            ]);
        }

        replaceInnerBlocks(
            clientId,
            createBlocksFromInnerBlocksTemplate(initialInnerBlocks)
        );
        setHasTableCreated(true);
    }

    function onChangeInitialColumnCount(count: string) {
        setInitialColumnCount(parseInt(count, 10) || 2);
    }

    function onChangeInitialRowCount(count: string) {
        setInitialRowCount(parseInt(count, 10) || 2);
    }

    const placeholder = (
        <Placeholder
            label={"Create Tableberg Table"}
            icon={<BlockIcon icon={blockTable} showColors />}
            instructions={"Create a complex table with all types of element"}
        >
            <form
                className="blocks-table__placeholder-form"
                onSubmit={onCreateTable}
            >
                <TextControl
                    __nextHasNoMarginBottom
                    type="number"
                    label={"Column count"}
                    value={initialColumnCount}
                    onChange={onChangeInitialColumnCount}
                    min="1"
                    className="blocks-table__placeholder-input"
                />
                <TextControl
                    __nextHasNoMarginBottom
                    type="number"
                    label={"Row count"}
                    value={initialRowCount}
                    onChange={onChangeInitialRowCount}
                    min="1"
                    className="blocks-table__placeholder-input"
                />
                <Button
                    className="blocks-table__placeholder-button"
                    variant="primary"
                    type="submit"
                >
                    {"Create Table"}
                </Button>
            </form>
        </Placeholder>
    );

    return hasTableCreated ? <table {...innerBlocksProps} /> : placeholder;
}

export default function save() {
    return <table></table>;
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
