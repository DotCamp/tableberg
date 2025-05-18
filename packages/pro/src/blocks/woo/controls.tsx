import { useQuery } from "@tanstack/react-query";
import apiFetch from "@wordpress/api-fetch";
import {
    Button,
    SelectControl,
    __experimentalNumberControl as NumberControl,
    ToggleControl
} from "@wordpress/components";
import { useState } from "react";
import { getFieldPrettyName } from "./";

export const FieldSelector = ({ selectedFields, onChange, onDelete }: {
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

    const defaultFields = [
        "sku",
        "id",
        "name",
        "name_with_link",
        "description",
        "short_description",
        "date_created",
        "categories",
        "tags",
        "images",
        "average_rating",
        "stock_quantity",
        "weight",
        "dimensions",
        "price",
        "add_to_cart",
        "attributes",
    ];

    const fields = new Set<string>(defaultFields);

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
                            label: getFieldPrettyName(field, true),
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
        <div>{getFieldPrettyName(field, true)}</div>
        <div
            style={{ cursor: "pointer" }}
            onClick={() => onDelete(field)}
        >x</div>
    </div>;

export const FilterSelector = ({ filters, onChange }: {
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
}) => {
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
