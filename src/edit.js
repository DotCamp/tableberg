import { TextControl } from "@wordpress/components";
import { useBlockProps } from "@wordpress/block-editor";
import { useState } from "react";

export default function Edit({ attributes, setAttributes }) {
    const blockProps = useBlockProps();

    const [data, setData] = useState(
        Array.from({ length: attributes.rows }, () =>
            Array(attributes.cols).fill("")
        )
    );

    const rows = Array.from({ length: attributes.rows }, (_, i) => i);
    const cols = Array.from({ length: attributes.cols }, (_, i) => i);

    const updateData = (value, row, col) => {
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
                        onChange={(value) => {
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
