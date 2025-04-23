import { BlockEditProps, registerBlockType } from "@wordpress/blocks";
import metadata from "./block.json";
import blockIcon from "@tableberg/shared/icons/tableberg";
import { BlockIcon, useBlockProps, useInnerBlocksProps, store, InnerBlocks, InspectorControls } from "@wordpress/block-editor";
import { Button, Placeholder, SelectControl } from "@wordpress/components";
import TablebergIcon from "@tableberg/shared/icons/tableberg";
import { useEffect, useRef, useState } from "react";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import apiFetch from "@wordpress/api-fetch";
import { useDispatch, useSelect } from "@wordpress/data";

const queryClient = new QueryClient();

const FieldSelector = ({ fields, onChange }: {
    fields: string[];
    onChange: (value: string) => void
}) => {
    return <SelectControl
        __next40pxDefaultSize
        __nextHasNoMarginBottom
        onChange={onChange}
        options={[
            {
                label: "Choose a field",
                value: ""
            },
            ...fields.map(field => ({
                label: field,
                value: field,
            }))
        ]}
    />
}

const SelectedField = ({ field, onDelete }: {
    field: string;
    onDelete: (field: string) => void
}) => <div style={{
    backgroundColor: "#f3f3f3",
    fontWeight: 600,
    padding: "1rem",
    display: "flex",
    justifyContent: "space-between",
    marginBottom: ".25rem"
}}>
        <div>{field}</div>
        <div
            style={{ cursor: "pointer" }}
            onClick={() => onDelete(field)}
        >x</div>
    </div>;

function WooTableCreator({ onCreate }: { onCreate: (selectedFields: string[]) => void }) {
    const [selectedField, setSelectedField] = useState<string>("");
    const [selectedFields, setSelectedFields] = useState<string[]>([]);

    const { data: products } = useQuery<Record<string, any>[]>({
        queryKey: ['wooKeys'],
        queryFn: async () => {
            const queryParams = new URLSearchParams({
                per_page: "-1",
            }).toString();

            return await apiFetch({
                path: `/wc/v3/products?${queryParams}`,
                method: 'GET',
            });
        }
    })

    if (!products) {
        return;
    }

    const fields = new Set<string>();

    products.forEach(product => {
        Object.keys(product).forEach(key => fields.add(key));
    });

    const validFields = Array.from(fields);
    return (
        <div className="tableberg-table-creator">
            <Placeholder
                label={"Tableberg"}
                icon={<BlockIcon icon={TablebergIcon} />}
            >
                <div className="tableberg-table-creator-heading">
                    Select WooCommerce table columns
                </div>
                <div style={{ width: "100%" }}>
                    {selectedFields.map(field => <SelectedField
                        field={field}
                        key={field}
                        onDelete={(fieldToDelete) => {
                            setSelectedFields(selectedFields.filter(field =>
                                field !== fieldToDelete
                            ))
                        }}
                    />)}
                    <div style={{ display: "flex" }}>
                        <div style={{ width: "100%", marginRight: "5px" }}>
                            <FieldSelector
                                fields={validFields.filter(el => !selectedFields.includes(el))}
                                onChange={(value) => setSelectedField(value)}
                            />
                        </div>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                if (selectedField !== "") {
                                    setSelectedFields(
                                        fields => [...fields, selectedField]
                                    );
                                }
                                setSelectedField("");
                            }}
                            style={{ minHeight: "40px" }}
                        >
                            Add
                        </Button>
                    </div>
                </div>
                <Button
                    className="blocks-table__placeholder-button"
                    variant="primary"
                    onClick={() => onCreate(selectedFields)}
                    type="button"
                >
                    Create WooCommerce Table
                </Button>
            </Placeholder>
        </div>
    );
}

interface WooBlockAttrs {
    fields: string[]
}

function WooTableEdit(props: BlockEditProps<WooBlockAttrs>) {
    const { attributes, setAttributes } = props;
    const blockProps = useBlockProps();

    const { fields } = attributes;

    const innerBlocksProps = useInnerBlocksProps(blockProps, {
        allowedBlocks: ["tableberg/table"],
        template: [[
            "tableberg/table",
            {
                cells: fields.length,
                rows: 1,
                cols: fields.length,
                enableTableHeader: "converted",
                dynamic: true,
            },
            fields.map((field, col) => {
                return [
                    "tableberg/cell",
                    { col, tagName: "th" },
                    [
                        ["core/paragraph", { content: field }],
                    ]
                ]
            })
        ]],
        // @ts-ignore
        renderAppender: false,
    });

    let { data: products } = useQuery<Record<string, any>[]>({
        queryKey: ['wooKeys', fields],
        queryFn: async () => {
            const per_page = 10, page = 1;

            const queryParams = new URLSearchParams({
                per_page: per_page.toString(),
                page: page.toString(),
                _fields: fields.join(','),
            }).toString();

            return await apiFetch({
                path: `/wc/v3/products?${queryParams}`,
                method: 'GET',
            });
        }
    })

    const tableBlockId = useSelect((select) => {
        const { getBlock } = select(store) as BlockEditorStoreSelectors;

        const innerBlocks = getBlock(props.clientId)?.innerBlocks;

        if (innerBlocks?.length !== 1) {
            return;
        }

        return innerBlocks[0].clientId;
    }, []);

    const privateStore = tableBlockId ?
        window.tablebergPrivateStores[tableBlockId] :
        null;
    const privateStoreActions = (privateStore !== null) ?
        useDispatch(privateStore) :
        { setDynamicData: undefined };

    const inputRef = useRef<HTMLInputElement>(null);

    if (fields.length === 0) {
        return <WooTableCreator
            onCreate={(fields) => {
                setAttributes({ fields });
            }}
            {...blockProps}
        />
    }

    if (!products) {
        products = [];
    }

    if (privateStoreActions.setDynamicData) {
        privateStoreActions.setDynamicData({
            fields,
            rows: products,
        });
    }

    return <>
        <div {...blockProps} className="tableberg-pro-woo-block">
            <div {...innerBlocksProps} />
        </div>
        <InspectorControls>
            <input ref={inputRef} />
            <Button
                onClick={() => {
                    setAttributes({ fields: JSON.parse(inputRef.current?.value!) });
                }}
            >
                Update fields
            </Button>
        </InspectorControls>
    </>
}

function edit(props: BlockEditProps<WooBlockAttrs>) {
    return <QueryClientProvider client={queryClient}>
        <WooTableEdit {...props} />
    </QueryClientProvider>
}

registerBlockType(metadata as any, {
    attributes: metadata.attributes as any,
    icon: blockIcon,
    edit: edit,
    save: () => {
        const blockProps = useBlockProps.save();

        return (
            <div {...blockProps}>
                <InnerBlocks.Content />
            </div>
        );
    }
});
