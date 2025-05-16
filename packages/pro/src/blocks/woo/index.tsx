import { BlockEditProps, createBlocksFromInnerBlocksTemplate, InnerBlockTemplate, registerBlockType } from "@wordpress/blocks";
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
import { useEffect, useState } from "react";
import {
    QueryClient,
    QueryClientProvider,
    useQuery
} from "@tanstack/react-query";
import apiFetch from "@wordpress/api-fetch";
import { useDispatch, useSelect } from "@wordpress/data";
import { TablebergBlockAttrs } from "@tableberg/shared/types";

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
                path: `/tableberg/v1/woo/products?${queryParams}`,
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

function FilterSelector({ filters, onChange }: {
    filters: {
        limit: number;
        featured: boolean;
        on_sale: boolean;
    };
    onChange: (filters: {
        limit: number;
        featured: boolean;
        on_sale: boolean;
    }) => void;
}) {
    const { limit, featured, on_sale } = filters;

    return <div style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "10px"
    }}>
        <NumberControl
            __next40pxDefaultSize
            label="Number of items"
            value={limit}
            onChange={(newLimit) => {
                onChange({
                    ...filters,
                    limit: Number(newLimit)
                })
            }}
        />
        <ToggleControl
            __nextHasNoMarginBottom
            checked={featured}
            label="Show only featured products"
            onChange={(val) => {
                onChange({
                    ...filters,
                    featured: val
                })
            }}
        />
        <ToggleControl
            __nextHasNoMarginBottom
            checked={on_sale}
            label="Show only products on sale"
            onChange={(val) => {
                onChange({
                    ...filters,
                    on_sale: val
                })
            }}
        />
    </div>;
}

function WooTableCreator({ onCreate }: {
    onCreate: (selectedFields: string[], filters: {
        limit: number;
        featured: boolean;
        on_sale: boolean;
    }) => void
}) {
    const [fields, setFields] = useState<string[]>([]);
    const [filters, setFilters] = useState<{
        limit: number;
        featured: boolean;
        on_sale: boolean;
    }>({
        limit: 10,
        featured: false,
        on_sale: false
    });

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
                <FilterSelector
                    filters={filters}
                    onChange={setFilters}
                />
                <Button
                    className="blocks-table__placeholder-button"
                    variant="primary"
                    onClick={() => onCreate(fields, filters)}
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

const getDynamicFieldAttrs = (field: string, value: any) => {
    switch (field) {
        case "images":
            return {
                target: "tableberg/image",
                targetAttribute: "media",
                value
            };
        case "add_to_cart":
            return {
                target: "tableberg/button",
                targetAttribute: "wooCartButtonId",
                value
            };
        default:
            return { value };
    }
}

function WooTableEdit(props: BlockEditProps<WooBlockAttrs>) {
    const { attributes, setAttributes } = props;
    const blockProps = useBlockProps();

    const { fields, filters } = attributes;
    const { featured, on_sale, limit } = filters;

    const [oldFields, setOldFields] = useState<string[]>([]);

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
                        ["tableberg/dynamic-field", { value: field }],
                    ]
                ]
            })
        ]],
        // @ts-ignore
        renderAppender: false,
    });

    const tableBlock = useSelect((select) => {
        const { getBlock } = select(store) as BlockEditorStoreSelectors;

        const innerBlocks = getBlock(props.clientId)?.innerBlocks;

        if (innerBlocks?.length !== 1) {
            return;
        }

        return innerBlocks[0];
    }, []);

    const {
        updateBlockAttributes,
        removeBlocks,
        insertBlocks,
    } = useDispatch(store) as any as BlockEditorStoreActions;

    let {
        isLoading: isLoadingProducts,
        data: products
    } = useQuery<Record<string, any>[]>({
        queryKey: ['wooProducts', fields, filters],
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
                path: `/tableberg/v1/woo/products?${queryParams}`,
                method: 'GET',
            });
        }
    })

    useEffect(() => {
        if (!tableBlock || !products || isLoadingProducts) {
            return;
        }

        const currentCols = tableBlock?.attributes.cols;
        const currentRows = tableBlock?.attributes.rows;

        if (currentCols > fields.length) {
            const removedIndices = oldFields
                .filter(field => !fields.includes(field))
                .map(field => oldFields.indexOf(field));

            const toRemoves = tableBlock.innerBlocks.filter(
                cell => removedIndices.includes(cell.attributes.col)
            );

            try {
                removeBlocks(toRemoves.map(cell => cell.clientId), false);
            } catch (e) { }

            removedIndices.forEach(index => {
                tableBlock.innerBlocks.forEach(cell => {
                    if (cell.attributes.col > index) {
                        updateBlockAttributes(cell.clientId, {
                            col: cell.attributes.col - 1
                        });
                    }
                });
            });

            updateBlockAttributes(tableBlock.clientId, {
                cols: fields.length,
                cells: tableBlock.attributes.cells - toRemoves.length
            });
        }

        if (currentRows > products.length + 1) {
            const toRemoves = tableBlock.innerBlocks.filter(
                cell => cell.attributes.row >= products.length + 1
            );

            try {
                removeBlocks(toRemoves.map(cell => cell.clientId), false);
            } catch (e) { }

            updateBlockAttributes(tableBlock.clientId, {
                rows: products.length + 1,
                cells: tableBlock.attributes.cells - toRemoves.length
            });
        }

        if (currentCols < fields.length) {
            const toAdds: InnerBlockTemplate[] = [];
            for (let col = currentCols; col < fields.length; col++) {
                toAdds.push([
                    "tableberg/cell",
                    { col, row: 0, tagName: "th" },
                    [
                        ["tableberg/dynamic-field", { value: fields[col] }]
                    ]
                ]);

                for (let row = 1; row < currentRows; row++) {
                    const dfAttrs = getDynamicFieldAttrs(
                        fields[col], products[row - 1][fields[col]]
                    );

                    toAdds.push([
                        "tableberg/cell",
                        { col, row, tagName: "td" },
                        [
                            ["tableberg/dynamic-field", dfAttrs]
                        ]
                    ]);
                }
            }

            insertBlocks(
                createBlocksFromInnerBlocksTemplate(toAdds),
                undefined,
                tableBlock.clientId,
                false
            );
            updateBlockAttributes(tableBlock.clientId, {
                cols: fields.length,
                cells: tableBlock.attributes.cells + toAdds.length
            });
        }

        if (currentRows < products.length + 1) {
            const toAdds: InnerBlockTemplate[] = [];
            for (let row = currentRows; row < products.length + 1; row++) {
                for (let col = 0; col < fields.length; col++) {
                    const dfAttrs = getDynamicFieldAttrs(
                        fields[col], products[row - 1][fields[col]]
                    );

                    toAdds.push([
                        "tableberg/cell",
                        { row, col, tagName: "td" },
                        [
                            ["tableberg/dynamic-field", dfAttrs]
                        ]
                    ]);
                }
            }

            insertBlocks(
                createBlocksFromInnerBlocksTemplate(toAdds),
                undefined,
                tableBlock.clientId,
                false
            );
            updateBlockAttributes(tableBlock.clientId, {
                rows: products.length + 1,
                cells: tableBlock.attributes.cells + toAdds.length
            });
        }

        queryClient.invalidateQueries(
            { queryKey: ['wooProducts', fields, filters] }
        );

        setOldFields(fields);
    }, [fields, products, isLoadingProducts, tableBlock]);

    useEffect(() => {
        if (!products) {
            return;
        }

        products.forEach((product, r) => {
            fields.forEach((field, c) => {
                const dfAttrs = getDynamicFieldAttrs(
                    field, product[field]
                );

                const dynamicField = tableBlock?.innerBlocks.find(
                    cell => {
                        const { col, row } = cell.attributes;
                        return col === c && row === r + 1;
                    }
                )?.innerBlocks.find(
                    block => block.name === "tableberg/dynamic-field"
                );

                if (dynamicField) {
                    updateBlockAttributes(dynamicField.clientId, dfAttrs);
                }
            });
        });
    }, [products]);

    const setFilters = (filters: {
        limit: number;
        featured: boolean;
        on_sale: boolean;
    }) => {
        setAttributes({ filters });
    }

    if (fields.length === 0) {
        return <WooTableCreator
            onCreate={(fields, filters) => {
                setAttributes({ fields, filters });
            }}
            {...blockProps}
        />
    }

    return <>
        <div {...blockProps}>
            <div {...innerBlocksProps} />
        </div>
        <InspectorControls>
            <PanelBody title="WooCommerce fields">
                <FieldSelector
                    selectedFields={fields}
                    onChange={(field) => {
                        setAttributes(
                            { fields: [...fields, field] }
                        );
                    }}
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
                <FilterSelector
                    filters={filters}
                    onChange={setFilters}
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
