import {
    BlockEditProps,
    createBlocksFromInnerBlocksTemplate,
    InnerBlockTemplate,
    registerBlockType,
} from "@wordpress/blocks";
import metadata from "./block.json";
import { WooTableIcon } from "@tableberg/shared/icons/table-creation";
import {
    BlockIcon,
    useBlockProps,
    useInnerBlocksProps,
    store,
    InnerBlocks,
    InspectorControls,
} from "@wordpress/block-editor";
import { Button, PanelBody, Placeholder } from "@wordpress/components";
import TablebergIcon from "@tableberg/shared/icons/tableberg";
import { useEffect, useState } from "react";
import {
    QueryClient,
    QueryClientProvider,
    useQuery,
} from "@tanstack/react-query";
import apiFetch from "@wordpress/api-fetch";
import { useDispatch, useSelect } from "@wordpress/data";
import { FilterSelector, FieldSelector } from "./controls";

const queryClient = new QueryClient();

export const getFieldPrettyName = (field: string, showKey: boolean = false) => {
    const fieldNames = new Map<string, string>([
        ["sku", "SKU"],
        ["id", "ID"],
        ["name", "Name"],
        ["name_with_link", "Name with link"],
        ["description", "Description"],
        ["short_description", "Short Description"],
        ["date_created", "Date"],
        ["categories", "Categories"],
        ["tags", "Tags"],
        ["images", "Image"],
        ["average_rating", "Reviews"],
        ["stock_quantity", "Stock"],
        ["weight", "Weight"],
        ["dimensions", "Dimensions"],
        ["price", "Price"],
        ["variation_picker", "Select Options"],
        ["add_to_cart", "Add to Cart"],
        ["attributes", "Attributes"],
    ]);

    const prettyName = fieldNames.get(field);

    if (!prettyName) {
        return field;
    }

    if (showKey) {
        return `${prettyName} (${field})`;
    }

    return prettyName;
};

function WooTableCreator({
    onCreate,
}: {
    onCreate: (
        selectedFields: string[],
        filters: {
            limit: number;
            featured: boolean;
            on_sale: boolean;
        },
    ) => void;
}) {
    const [fields, setFields] = useState<string[]>([]);
    const [filters, setFilters] = useState<{
        limit: number;
        featured: boolean;
        on_sale: boolean;
    }>({
        limit: 10,
        featured: false,
        on_sale: false,
    });

    const blockProps = useBlockProps({
        className: "tableberg-table-creator",
    });

    return (
        <div {...blockProps}>
            <Placeholder
                label={"Tableberg"}
                icon={<BlockIcon icon={TablebergIcon} />}
            >
                <div className="tableberg-table-creator-heading">
                    Select WooCommerce table columns
                </div>
                <FieldSelector
                    selectedFields={fields}
                    onChange={(field) =>
                        setFields((fields) => [...fields, field])
                    }
                    onDelete={(fieldToDelete) => {
                        setFields(
                            fields.filter((field) => field !== fieldToDelete),
                        );
                    }}
                />
                <FilterSelector filters={filters} onChange={setFilters} />
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

const getDynamicFieldAttrs = (
    field: string,
    value: any,
): {
    target?: string;
    targetAttribute?: string;
    value: any;
    fetchParams?: string;
} => {
    switch (field) {
        case "images":
            return {
                target: "tableberg/image",
                targetAttribute: "media",
                value,
            };
        case "add_to_cart":
            return {
                target: "tableberg/button",
                targetAttribute: "wooCartButtonId",
                value,
            };
        case "variation_picker":
            return {
                target: "tableberg-pro/woo-variation-picker",
                targetAttribute: "variationProps",
                value,
            };
        default:
            return { value };
    }
};

function WooTableEdit(props: BlockEditProps<WooBlockAttrs>) {
    const { attributes, setAttributes } = props;
    const blockProps = useBlockProps();

    const { fields, filters } = attributes;
    const { featured, on_sale, limit } = filters;

    const [oldFields, setOldFields] = useState<string[]>([]);

    const innerBlocksProps = useInnerBlocksProps(blockProps, {
        allowedBlocks: ["tableberg/table"],
        template: [
            [
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
                            [
                                "tableberg/dynamic-field",
                                {
                                    value: getFieldPrettyName(field),
                                },
                            ],
                        ],
                    ];
                }),
            ],
        ],
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

    const { updateBlockAttributes, removeBlocks, insertBlocks } = useDispatch(
        store,
    ) as any as BlockEditorStoreActions;

    let { isLoading: isLoadingProducts, data: products } = useQuery<
        Record<string, any>[]
    >({
        queryKey: ["wooProducts", fields, filters],
        queryFn: async () => {
            const page = 1;

            const queryParams = new URLSearchParams({
                per_page: limit.toString(),
                page: page.toString(),
                _fields: fields.join(","),
            });
            if (featured) {
                queryParams.set("featured", "true");
            }
            if (on_sale) {
                queryParams.set("on_sale", "true");
            }

            return await apiFetch({
                path: `/tableberg/v1/woo/products?${queryParams}`,
                method: "GET",
            });
        },
    });

    useEffect(() => {
        if (!tableBlock || !products || isLoadingProducts) {
            return;
        }

        const currentCols = tableBlock?.attributes.cols;
        const currentRows = tableBlock?.attributes.rows;

        if (currentCols > fields.length) {
            const removedIndices = oldFields
                .filter((field) => !fields.includes(field))
                .map((field) => oldFields.indexOf(field));

            const toRemoves = tableBlock.innerBlocks.filter((cell) =>
                removedIndices.includes(cell.attributes.col),
            );

            try {
                removeBlocks(
                    toRemoves.map((cell) => cell.clientId),
                    false,
                );
            } catch (e) {}

            removedIndices.forEach((index) => {
                tableBlock.innerBlocks.forEach((cell) => {
                    if (cell.attributes.col > index) {
                        updateBlockAttributes(cell.clientId, {
                            col: cell.attributes.col - 1,
                        });
                    }
                });
            });

            updateBlockAttributes(tableBlock.clientId, {
                cols: fields.length,
                cells: tableBlock.attributes.cells - toRemoves.length,
            });
        }

        if (currentRows > products.length + 1) {
            const toRemoves = tableBlock.innerBlocks.filter(
                (cell) => cell.attributes.row >= products.length + 1,
            );

            try {
                removeBlocks(
                    toRemoves.map((cell) => cell.clientId),
                    false,
                );
            } catch (e) {}

            updateBlockAttributes(tableBlock.clientId, {
                rows: products.length + 1,
                cells: tableBlock.attributes.cells - toRemoves.length,
            });
        }

        if (currentCols < fields.length) {
            const toAdds: InnerBlockTemplate[] = [];
            for (let col = currentCols; col < fields.length; col++) {
                toAdds.push([
                    "tableberg/cell",
                    { col, row: 0, tagName: "th" },
                    [
                        [
                            "tableberg/dynamic-field",
                            {
                                value: getFieldPrettyName(fields[col]),
                            },
                        ],
                    ],
                ]);

                for (let row = 1; row < currentRows; row++) {
                    const dfAttrs = getDynamicFieldAttrs(
                        fields[col],
                        products[row - 1][fields[col]],
                    );

                    dfAttrs.fetchParams = `${fields[col]}:${row - 1}:${featured}:${on_sale}`;

                    toAdds.push([
                        "tableberg/cell",
                        { col, row, tagName: "td" },
                        [["tableberg/dynamic-field", dfAttrs]],
                    ]);
                }
            }

            insertBlocks(
                createBlocksFromInnerBlocksTemplate(toAdds),
                undefined,
                tableBlock.clientId,
                false,
            );
            updateBlockAttributes(tableBlock.clientId, {
                cols: fields.length,
                cells: tableBlock.attributes.cells + toAdds.length,
            });
        }

        if (currentRows < products.length + 1) {
            const toAdds: InnerBlockTemplate[] = [];
            for (let row = currentRows; row < products.length + 1; row++) {
                for (let col = 0; col < fields.length; col++) {
                    const dfAttrs = getDynamicFieldAttrs(
                        fields[col],
                        products[row - 1][fields[col]],
                    );

                    dfAttrs.fetchParams = `${fields[col]}:${row - 1}:${featured}:${on_sale}`;

                    toAdds.push([
                        "tableberg/cell",
                        { row, col, tagName: "td" },
                        [["tableberg/dynamic-field", dfAttrs]],
                    ]);
                }
            }

            insertBlocks(
                createBlocksFromInnerBlocksTemplate(toAdds),
                undefined,
                tableBlock.clientId,
                false,
            );
            updateBlockAttributes(tableBlock.clientId, {
                rows: products.length + 1,
                cells: tableBlock.attributes.cells + toAdds.length,
            });
        }

        queryClient.invalidateQueries({
            queryKey: ["wooProducts", fields, filters],
        });

        setOldFields(fields);
    }, [fields, products, isLoadingProducts, tableBlock]);

    useEffect(() => {
        products?.forEach((product, r) => {
            fields.forEach((field, c) => {
                const dfAttrs = getDynamicFieldAttrs(field, product[field]);

                dfAttrs.fetchParams = `${field}:${r}:${featured}:${on_sale}`;

                const dynamicField = tableBlock?.innerBlocks
                    .find((cell) => {
                        const { col, row } = cell.attributes;
                        return col === c && row === r + 1;
                    })
                    ?.innerBlocks.find(
                        (block) => block.name === "tableberg/dynamic-field",
                    );

                if (dynamicField) {
                    updateBlockAttributes(dynamicField.clientId, dfAttrs);
                }
            });
        });
    }, [products]);

    if (fields.length === 0) {
        return (
            <WooTableCreator
                onCreate={(fields, filters) => {
                    setAttributes({ fields, filters });
                }}
            />
        );
    }

    return (
        <>
            <div {...blockProps}>
                <div {...innerBlocksProps} />
            </div>
            <InspectorControls>
                <PanelBody title="WooCommerce fields">
                    <FieldSelector
                        selectedFields={fields}
                        onChange={(field) => {
                            setAttributes({ fields: [...fields, field] });
                        }}
                        onDelete={(fieldToDelete) => {
                            setAttributes({
                                fields: fields.filter(
                                    (field) => field !== fieldToDelete,
                                ),
                            });
                        }}
                    />
                </PanelBody>
                <PanelBody title="Items filtering">
                    <FilterSelector
                        filters={filters}
                        onChange={(filters: {
                            limit: number;
                            featured: boolean;
                            on_sale: boolean;
                        }) => {
                            setAttributes({ filters });
                        }}
                    />
                </PanelBody>
            </InspectorControls>
        </>
    );
}

registerBlockType(metadata as any, {
    attributes: metadata.attributes as any,
    icon: WooTableIcon,
    edit: (props: BlockEditProps<WooBlockAttrs>) => {
        return (
            <QueryClientProvider client={queryClient}>
                <WooTableEdit {...props} />
            </QueryClientProvider>
        );
    },
    save: () => {
        const blockProps = useBlockProps.save();

        return (
            <div {...blockProps}>
                <InnerBlocks.Content />
            </div>
        );
    },
});
