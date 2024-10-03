import {
    TablebergBlockAttrs,
    TablebergCellBlockAttrs,
} from "@tableberg/shared/types";
import { InspectorControls } from "@wordpress/block-editor";
import StickyRowColControl from "../shared/StickyRowColControl";
import {
    PanelBody,
    TextControl,
    ToggleControl,
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOptionIcon as ToggleGroupControlOptionIcon,
} from "@wordpress/components";
import {
    justifyCenter,
    justifyLeft,
    justifyRight,
    stretchFullWidth,
} from "@wordpress/icons";
import { __ } from "@wordpress/i18n";

interface Props {
    cellAttrs?: TablebergCellBlockAttrs;
    tableAttrs: TablebergBlockAttrs;
    setCellAttrs?: (attrs: Partial<TablebergCellBlockAttrs>) => void;
    setTableAttrs: (attrs: Partial<TablebergBlockAttrs>) => void;
}

const searchPositionOptions = [
    {
        value: "left",
        icon: justifyLeft,
        label: __("Left"),
    },
    {
        value: "center",
        icon: justifyCenter,
        label: __("Center"),
    },
    {
        value: "right",
        icon: justifyRight,
        label: __("Right"),
    },
    {
        value: "wide",
        icon: stretchFullWidth,
        label: __("Wide"),
    },
];

export default function TableAndCellControl({
    //cellAttrs,
    tableAttrs,
    //setCellAttrs,
    setTableAttrs,
}: Props) {
    return (
        <InspectorControls>
            <StickyRowColControl attrs={tableAttrs} setAttrs={setTableAttrs} />
            <PanelBody title="[PRO] Search">
                <ToggleControl
                    checked={tableAttrs.search}
                    label="Enable Search"
                    onChange={(search) => {
                        setTableAttrs({
                            search,
                        });
                    }}
                />

                <TextControl 
                    label={__('Search Placeholder', 'your-text-domain')}
                    onChange={(newPlaceholder) => {
                        setTableAttrs({
                            searchPlaceholder: newPlaceholder
                        });
                    } } 
                    value={tableAttrs.searchPlaceholder}              
                />

                {tableAttrs.search && (
                    <ToggleGroupControl
                        __nextHasNoMarginBottom
                        label={__("Search Position")}
                        value={tableAttrs.searchPosition}
                        onChange={(searchPosition: any) =>
                            setTableAttrs({ searchPosition })
                        }
                        className="block-editor-hooks__flex-layout-justification-controls"
                    >
                        {searchPositionOptions.map(({ value, icon, label }) => {
                            return (
                                <ToggleGroupControlOptionIcon
                                    key={value}
                                    value={value}
                                    icon={icon}
                                    label={label}
                                />
                            );
                        })}
                    </ToggleGroupControl>
                )}
            </PanelBody>
            <PanelBody title="[PRO] Sorting">
                <ToggleControl
                    checked={!!tableAttrs.sort?.vertical?.enabled}
                    label="Enable Vertical Sorting"
                    onChange={(val) => {
                        setTableAttrs({
                            sort: {
                                ...tableAttrs.sort,
                                vertical: {
                                    col: 0,
                                    order: "asc",
                                    ...tableAttrs.sort?.vertical,
                                    enabled: val,
                                },
                            },
                        });
                    }}
                />
                <ToggleControl
                    checked={!!tableAttrs.sort?.horizontal?.enabled}
                    label="Enable Horizontal Sorting"
                    onChange={(val) => {
                        setTableAttrs({
                            sort: {
                                ...tableAttrs.sort,
                                horizontal: {
                                    row: 0,
                                    order: "asc",
                                    ...tableAttrs.sort?.horizontal,
                                    enabled: val,
                                },
                            },
                        });
                    }}
                />
            </PanelBody>
        </InspectorControls>
    );
}
