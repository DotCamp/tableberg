import { useBlockProps } from "@wordpress/block-editor";

export default function save({ attributes }) {
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
