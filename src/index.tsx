import {
    BlockEditProps,
    InnerBlockTemplate,
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

import metadata from "./block.json";
import { FormEvent, useState } from "react";

interface TablebergBlockAttrs {
    rows: number;
    hasTableCreated: boolean;
}

const ALLOWED_BLOCKS = ["tableberg/row"];

function edit({
    attributes: { hasTableCreated },
    setAttributes,
    clientId,
}: BlockEditProps<TablebergBlockAttrs>) {
    const blockProps = useBlockProps();

    const innerBlocksProps = useInnerBlocksProps(blockProps, {
        // @ts-ignore false can obviously be assigned to renderAppender as does wordpress in their own blocks. Need to make a pr to @types/wordpress__block-editor.
        renderAppender: false,
        allowedBlocks: ALLOWED_BLOCKS,
    });

    const { replaceInnerBlocks } = useDispatch(blockEditorStore);

    const [initialRowCount, setInitialRowCount] = useState<number | "">(2);
    const [initialColCount, setInitialColCount] = useState<number | "">(2);

    function onCreateTable(event: FormEvent) {
        event.preventDefault();

        if (initialRowCount === "" || initialColCount === "") return;

        const initialInnerBlocks: InnerBlockTemplate[] = Array.from(
            { length: initialRowCount },
            () => ["tableberg/row", { cols: initialColCount }]
        );

        replaceInnerBlocks(
            clientId,
            createBlocksFromInnerBlocksTemplate(initialInnerBlocks)
        );
        setAttributes({ hasTableCreated: true });
    }

    function onChangeInitialColCount(count: string) {
        const value = count === "" ? "" : parseInt(count, 10) || 2;
        setInitialColCount(value);
    }

    function onChangeInitialRowCount(count: string) {
        const value = count === "" ? "" : parseInt(count, 10) || 2;
        setInitialRowCount(value);
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
                    value={initialColCount}
                    onChange={onChangeInitialColCount}
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

function save() {
    const blockProps = useBlockProps.save();
    const innerBlocksProps = useInnerBlocksProps.save(blockProps);
    return <table {...innerBlocksProps} />;
}

registerBlockType(metadata.name, {
    title: metadata.title,
    category: metadata.category,
    attributes: {
        rows: {
            type: "number",
            default: 2,
        },
        hasTableCreated: {
            type: "boolean",
            default: false,
        },
    },
    edit,
    save,
});
