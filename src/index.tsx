import {
    BlockEditProps,
    BlockSaveProps,
    registerBlockType,
} from "@wordpress/blocks";

import { TextControl } from "@wordpress/components";
import { useBlockProps } from "@wordpress/block-editor";
import { useState } from "react";

import "./style.scss";
import "./editor.scss";

import metadata from "./block.json";

interface TablebergBlockAttrs {
    rows: number;
    cols: number;
    data: Array<Array<any>>;
}

function edit({
    attributes,
    setAttributes,
}: BlockEditProps<TablebergBlockAttrs>) {
    const blockProps = useBlockProps();

    const [data, setData] = useState(
        Array.from({ length: attributes.rows }, () =>
            Array(attributes.cols).fill("")
        )
    );

    const rows = Array.from({ length: attributes.rows }, (_, i) => i);
    const cols = Array.from({ length: attributes.cols }, (_, i) => i);

    const updateData = (value: string, row: number, col: number) => {
        const newData = data.slice();
        newData[row][col] = value;

        setData(newData);
        setAttributes({ data: newData });
    };

    const tableData = rows.map((row) => (
        <tr>
            {cols.map((col) => (
                <td>
                    <TextControl
                        value={data[row][col]}
                        onChange={(value: string) => {
                            updateData(value, row, col);
                        }}
                    />
                </td>
            ))}
        </tr>
    ));

    return (
        <div {...blockProps}>
            <table>{tableData}</table>
            <div>{JSON.stringify(data)}</div>
            <button
                onClick={() => {
                    console.log(attributes);
                }}
            >
                Print Attrs
            </button>
        </div>
    );
}

export default function save({
    attributes,
}: BlockSaveProps<TablebergBlockAttrs>) {
    const rows = Array.from({ length: attributes.rows }, (_, i) => i);
    const cols = Array.from({ length: attributes.cols }, (_, i) => i);

    const tableData = rows.map((row) => (
        <tr>
            {cols.map((col) => (
                <td>
                    <div>{attributes.data[row][col]}</div>
                </td>
            ))}
        </tr>
    ));

    const blockProps = useBlockProps.save();
    return (
        <div {...blockProps}>
            <table>{tableData}</table>
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
