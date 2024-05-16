import { TablebergBlockAttrs } from "@tableberg/shared/types";
import { ProBlockProps } from "..";
import { InspectorControls } from "@wordpress/block-editor";
import { SelectControl } from "@wordpress/components";

const TablePro = ({ props, BlockEdit }: ProBlockProps<TablebergBlockAttrs>) => {
    return (
        <>
            {props.isSelected && (
                <InspectorControls group="border">
                    <div style={{ marginBottom: "0px", gridColumn: "1/-1" }}>
                        <SelectControl
                            label="[PRO] Inner border style"
                            value={props.attributes.innerBorderType}
                            options={[
                                {
                                    label: "All",
                                    value: "",
                                },
                                {
                                    label: "Column Only",
                                    value: "col",
                                },
                                {
                                    label: "Row only",
                                    value: "row",
                                },
                            ]}
                            onChange={(innerBorderType: any) =>
                                props.setAttributes({ innerBorderType })
                            }
                        />
                    </div>
                </InspectorControls>
            )}
            <BlockEdit {...props} />
        </>
    );
};


export default TablePro;