import React, { useState, useEffect, useMemo } from "react";
import { Button, Placeholder } from "@wordpress/components";
import { useSelect } from "@wordpress/data";
import apiFetch from "@wordpress/api-fetch";
import { PostsTableIcon } from "@tableberg/shared/icons/table-creation";
import { BlockIcon } from "@wordpress/block-editor";
import SelectionControlRow, {
    SelectControlOption,
    SelectedOptionRow,
} from "./controls";

/**
 * Props for the posts table creator component.
 *
 * @interface
 */
interface PostsTableCreatorProps {
    onCancel: () => void;
    onCreate: (postType: string, columns: string[]) => void;
}

/**
 * Represents the structure of a post-type object.
 *
 * This interface defines the essential properties associated with a post type for REST API endpoints.
 *
 * @interface
 */
interface PostType {
    name: string;
    slug: string;
    rest_base: string;
}

/**
 * Represents the possible types of properties in a schema definition.
 *
 * The `SchemaPropertyType` defines the allowed data types that can be used
 * for a property within a schema. It restricts the values to a predefined set
 * of types, ensuring consistency and validation within the schema framework.
 *
 * @interface
 */
type SchemaPropertyType = "string" | "null" | "object" | "integer" | "array";

/**
 * Represents a property schema retrieved from an API.
 *
 * This interface is used to define the structure of a property within a
 * schema, including its description, type, and optional format.
 *
 * @interface
 */
interface SchemaPropertyFromApi {
    description: string;
    type: SchemaPropertyType | Array<SchemaPropertyType>;
    format?: string;
}

/**
 * The SchemaProperty interface extends SchemaPropertyFromApi and represents
 * a structure for defining schema properties with an additional key field.
 *
 * It is used to represent individual schema properties with a unique key,
 * inheriting any additional fields from SchemaPropertyFromApi.
 *
 * @interface
 */
interface SchemaProperty extends SchemaPropertyFromApi {
    key: string;
}

/**
 * Posts table creator component.
 *
 * @param props          Component props.
 * @param props.onCancel Function to cancel operation.
 * @param props.onCreate Callback function when create operation is triggered.
 */
const PostsTableCreator: React.FC<PostsTableCreatorProps> = ({
    onCancel,
    onCreate,
}) => {
    // Header for the post selection list.
    const postTypeSelectionHeader: SelectControlOption = {
        label: "--Select Post Type--",
        value: "",
        disabled: true,
    };

    // Header for the column selection list.
    const columnSelectionHeader: SelectControlOption = {
        ...postTypeSelectionHeader,
        label: "--Select Column--",
    };

    // List of post-types to be excluded from the selection.
    const postTypeBlackList = [
        "menu-items",
        "blocks",
        "templates",
        "template-parts",
        "global-styles",
        "navigation",
        "font-families",
    ];

    // List of column types to be excluded from the schema properties.
    const columnTypeBlackList = ["array"];

    // List of column IDs to be excluded from the schema properties.
    const columnIdBlackList = [
        "password",
        "sticky",
        "template",
        "ping_status",
        "comment_status",
        "modified_gmt",
        "date_gmt",
        "format",
    ];

    // State variables for managing the modal's internal state.
    const [selectedPostSlug, setSelectedPostSlug] = useState("");
    const [postTypeSelectionList, setPostTypeSelectionList] = useState<
        Array<SelectControlOption>
    >([postTypeSelectionHeader]);
    const [schemaProperties, setSchemaProperties] = useState<SchemaProperty[]>(
        []
    );
    const [columnSelectionList, setColumnSelectionList] = useState<
        Array<SelectControlOption>
    >([columnSelectionHeader]);
    const [currentColumnSelection, setCurrentColumnSelection] = useState("");
    const [selectedColumns, setSelectedColumns] = useState<Array<string>>([]);
    const [modalBusy, setModalBusy] = useState(false);

    const postTypes: Array<PostType> = useSelect((select) => {
        const rawPostTypes = (
            select("core") as {
                getPostTypes: () => Array<{ name: string; rest_base: string }>;
            }
        ).getPostTypes();

        // Resolve status for post type store selector.
        const status = (
            select("core/data") as {
                isResolving: (
                    targetStore: string,
                    selectorId: string
                ) => boolean;
            }
        ).isResolving("core", "getPostTypes");
        setModalBusy(status);

        /* eslint-disable camelcase */
        return rawPostTypes
            ? rawPostTypes.map(({ name, rest_base }) => ({
                  name,
                  slug: rest_base,
                  rest_base,
              }))
            : [];
        /* eslint-enable camelcase */
    }, []);

    useEffect(() => {
        if (postTypes.length) {
            const parsedPostTypes = postTypes
                .map((pT) => ({
                    label: pT.name,
                    value: pT.slug,
                    disabled: false,
                }))
                .filter(({ value }) => !postTypeBlackList.includes(value));
            setPostTypeSelectionList([
                postTypeSelectionHeader,
                ...parsedPostTypes,
            ]);
        }
    }, [postTypes]);

    useEffect(() => {
        const parsedColumns: Array<SelectControlOption> = schemaProperties.map(
            ({ key, description }) => ({
                label: `${key} --- ${description}`,
                value: key,
                disabled: false,
            })
        );

        setColumnSelectionList([columnSelectionHeader, ...parsedColumns]);
    }, [schemaProperties]);

    // Memoized list of column selection options. This memo function will filter out the already selected columns from the column selection list.
    const columnSelectionListMemo: Array<SelectControlOption> = useMemo(() => {
        return columnSelectionList.filter(
            (option) => !selectedColumns.includes(option.value)
        );
    }, [columnSelectionList, selectedColumns]);

    useEffect(() => {
        if (selectedPostSlug) {
            // Clear out any previously selected columns.
            setSelectedColumns([]);

            setModalBusy(true);
            apiFetch({
                path: `wp/v2/${selectedPostSlug}`,
                method: "OPTIONS",
            })
                .then((resp) => {
                    const response = resp as {
                        schema?: { properties: Record<string, object> };
                    };

                    if (response.schema && response.schema.properties) {
                        const rawSchemaProperties = response.schema.properties;

                        const parsedSchemaProperties = Object.entries(
                            rawSchemaProperties
                        )
                            .map(([key, value]) => {
                                const parsedValue =
                                    value as SchemaPropertyFromApi;

                                return {
                                    key,
                                    description: parsedValue.description,
                                    type: parsedValue.type,
                                    format: parsedValue.format,
                                };
                            })
                            .filter(({ type, key }) => {
                                // Filter out unwanted columns.
                                const keyFilter =
                                    !columnIdBlackList.includes(key);

                                // Filter out unwanted types.
                                let typeToUse = type;
                                if (!Array.isArray(typeToUse)) {
                                    typeToUse = [typeToUse];
                                }
                                const typeFilter = typeToUse.some(
                                    (t) => !columnTypeBlackList.includes(t)
                                );

                                return keyFilter && typeFilter;
                            })
                            .sort((a, b) => a.key.localeCompare(b.key));

                        if (rawSchemaProperties.acf) {
                            const acfProperties = Object.keys(
                                rawSchemaProperties.acf.properties
                            );

                            const acfSchemaProperties = acfProperties.map(
                                (acfKey) => ({
                                    key: `${acfKey}_acf`,
                                    description: acfKey,
                                    type: "text",
                                    format: "acf_standard",
                                })
                            );

                            parsedSchemaProperties.push(...acfSchemaProperties);
                        }

                        setSchemaProperties(parsedSchemaProperties);
                    }
                })
                .finally(() => {
                    setModalBusy(false);
                });
        }
    }, [selectedPostSlug]);

    /**
     * Handles the change event of a checkbox and updates the list of selected columns accordingly.
     *
     * @param columnId The unique identifier of the column associated with the checkbox.
     * @param status   The new state of the checkbox (true if checked, false if unchecked).
     */
    const handleColumnSelectionChange = (columnId: string, status: boolean) => {
        const currentSelectedColumns = [...selectedColumns];
        if (status) {
            currentSelectedColumns.push(columnId);
        } else {
            const index = currentSelectedColumns.indexOf(columnId);
            if (index > -1) {
                currentSelectedColumns.splice(index, 1);
            }
        }
        setSelectedColumns(currentSelectedColumns);
    };

    /**
     * Handles the creation trigger of the posts table.
     */
    const handleCreate = () => {
        onCreate(selectedPostSlug, selectedColumns);
    };

    return (
        <div className="tableberg-table-creator tableberg-posts-table-creator">
            <Placeholder
                label={"Tableberg Posts Table"}
                icon={<BlockIcon icon={PostsTableIcon} />}
            >
                <SelectionControlRow
                    value={selectedPostSlug}
                    label="Post Type"
                    onChange={(value) => {
                        setSelectedPostSlug(value);
                    }}
                    options={postTypeSelectionList}
                    disabled={modalBusy}
                />
                {schemaProperties.length > 0 && (
                    <>
                        <div
                            style={{
                                width: "100%",
                                marginTop: "20px",
                            }}
                        >
                            {selectedColumns.map((columnId) => (
                                <SelectedOptionRow
                                    key={columnId}
                                    label={columnId}
                                    value={columnId}
                                    onDelete={(val) =>
                                        handleColumnSelectionChange(val, false)
                                    }
                                />
                            ))}
                        </div>
                        <SelectionControlRow
                            type={"withButton"}
                            value={currentColumnSelection}
                            onChange={setCurrentColumnSelection}
                            options={columnSelectionListMemo}
                            disabled={modalBusy}
                            onButtonClick={() => {
                                handleColumnSelectionChange(
                                    currentColumnSelection,
                                    true
                                );
                                setCurrentColumnSelection("");
                            }}
                            buttonDisabled={
                                currentColumnSelection === "" || modalBusy
                            }
                        />
                    </>
                )}
                <Button
                    className="blocks-table__placeholder-button"
                    variant="primary"
                    onClick={handleCreate}
                    type="button"
                    disabled={modalBusy || selectedColumns.length === 0}
                >
                    Create
                </Button>
                <Button
                    className="blocks-table__placeholder-button"
                    variant="primary"
                    onClick={onCancel}
                    isDestructive={true}
                    type="button"
                >
                    Cancel
                </Button>
            </Placeholder>
        </div>
    );
};

export default PostsTableCreator;
