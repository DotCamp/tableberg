import { BlockEditProps, registerBlockType } from "@wordpress/blocks";
import metadata from "./block.json";
import blockIcon from "@tableberg/shared/icons/tableberg";
import {
    BlockIcon,
    useBlockProps,
    useInnerBlocksProps,
    store,
    InnerBlocks,
    InspectorControls
} from "@wordpress/block-editor";
import {
    Button,
    PanelBody,
    Placeholder,
    SelectControl,
    __experimentalNumberControl as NumberControl,
    ToggleControl
} from "@wordpress/components";
import TablebergIcon from "@tableberg/shared/icons/tableberg";
import { useState } from "react";
import {
    QueryClient,
    QueryClientProvider,
    useQuery
} from "@tanstack/react-query";
import apiFetch from "@wordpress/api-fetch";
import { useDispatch, useSelect } from "@wordpress/data";

const queryClient = new QueryClient();

const FieldSelector = ({ selectedFields, onChange, onDelete }: {
    selectedFields: string[];
    onChange: (fields: string) => void;
    onDelete: (fieldToDelete: string) => void;
}) => {
    const [selectedField, setSelectedField] = useState<string>("");

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

    return <div style={{ width: "100%" }}>
        {selectedFields.map(field => <SelectedField
            field={field}
            key={field}
            onDelete={onDelete}
        />)}
        <div style={{ display: "flex" }}>
            <div style={{ width: "100%", marginRight: "5px" }}>
                <SelectControl
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                    onChange={(value) => setSelectedField(value)}
                    options={[
                        {
                            label: "Choose a field",
                            value: ""
                        },
                        ...validFields.filter(el => !selectedFields.includes(el)).map(field => ({
                            label: field,
                            value: field,
                        }))
                    ]}
                />
            </div>
            <Button
                variant="secondary"
                onClick={() => {
                    if (selectedField !== "") {
                        onChange(selectedField)
                    }
                    setSelectedField("");
                }}
                style={{ minHeight: "40px" }}
            >
                Add
            </Button>
        </div>
    </div>
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
    const [fields, setFields] = useState<string[]>([]);

    return (
        <div className="tableberg-table-creator">
            <Placeholder
                label={"Tableberg"}
                icon={<BlockIcon icon={TablebergIcon} />}
            >
                <div className="tableberg-table-creator-heading">
                    Select WooCommerce table columns
                </div>
                <FieldSelector
                    selectedFields={fields}
                    onChange={(field) => setFields(
                        fields => [...fields, field]
                    )}
                    onDelete={(fieldToDelete) => {
                        setFields(fields.filter(field =>
                            field !== fieldToDelete
                        ))
                    }}
                />
                <Button
                    className="blocks-table__placeholder-button"
                    variant="primary"
                    onClick={() => onCreate(fields)}
                    type="button"
                >
                    Create WooCommerce Table
                </Button>
            </Placeholder>
        </div>
    );
}

interface WooBlockAttrs {
    fields: string[];
    filters: {
        limit: number;
        featured: boolean;
        on_sale: boolean;
    };
}

function WooTableEdit(props: BlockEditProps<WooBlockAttrs>) {
    const { attributes, setAttributes } = props;
    const blockProps = useBlockProps();

    const { fields, filters } = attributes;
    const { featured, on_sale, limit } = filters;

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
        queryKey: ['wooKeys', fields, filters],
        queryFn: async () => {
            const page = 1;

            const queryParams = new URLSearchParams({
                per_page: limit.toString(),
                page: page.toString(),
                _fields: fields.join(','),
            });
            if (featured) { queryParams.set("featured", "true"); }
            if (on_sale) { queryParams.set("on_sale", "true"); }

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
            <PanelBody title="WooCommerce fields">
                <FieldSelector
                    selectedFields={fields}
                    onChange={(field) => setAttributes(
                        { fields: [...fields, field] }
                    )}
                    onDelete={(fieldToDelete) => {
                        setAttributes({
                            fields: fields.filter(field =>
                                field !== fieldToDelete
                            )
                        })
                    }}
                />
            </PanelBody>
            <PanelBody title="Items filtering">
                <NumberControl
                    __next40pxDefaultSize
                    label="Number of items"
                    value={limit}
                    onChange={(newLimit) => {
                        setAttributes({
                            filters: { ...filters, limit: Number(newLimit) }
                        })
                    }}
                />
                <ToggleControl
                    __nextHasNoMarginBottom
                    checked={featured}
                    label="Show only featured products"
                    onChange={(val) => {
                        setAttributes({
                            filters: { ...filters, featured: val }
                        })
                    }}
                />
                <ToggleControl
                    __nextHasNoMarginBottom
                    checked={on_sale}
                    label="Show only products on sale"
                    onChange={(val) => {
                        setAttributes({
                            filters: { ...filters, on_sale: val }
                        })
                    }}
                />
            </PanelBody>
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
