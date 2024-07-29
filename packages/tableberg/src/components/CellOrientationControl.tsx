/**
 * WordPress dependencies
 */
import { __ } from "@wordpress/i18n";
import {
    justifyLeft,
    justifyCenter,
    justifyRight,
    justifySpaceBetween,
    arrowRight,
    arrowDown,
} from "@wordpress/icons";
import {
    ToggleControl,
    Flex,
    FlexItem,
    __experimentalToolsPanelItem as ToolsPanelItem,
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOptionIcon as ToggleGroupControlOptionIcon,
} from "@wordpress/components";
import { TablebergCellBlockAttrs } from "@tableberg/shared/types";

export default function CellOrientationControl({
    attrs,
    setAttrs,
}: {
    attrs: TablebergCellBlockAttrs;
    setAttrs: (attrs: Partial<TablebergCellBlockAttrs>) => void;
}) {
    const justificationOptions = [
        {
            value: "left",
            icon: justifyLeft,
            label: __("Justify items left"),
        },
        {
            value: "center",
            icon: justifyCenter,
            label: __("Justify items center"),
        },
        {
            value: "right",
            icon: justifyRight,
            label: __("Justify items right"),
        },
        {
            value: "space-between",
            icon: justifySpaceBetween,
            label: __("Space between items"),
        },
    ];

    return (
        <ToolsPanelItem label={__("Orientation")} hasValue={() => true}>
            <Flex>
                <FlexItem>
                    <ToggleGroupControl
                        __nextHasNoMarginBottom
                        className="block-editor-hooks__flex-layout-orientation-controls"
                        label={__("Orientation")}
                        value={attrs.isHorizontal ? "1" : "0"}
                        onChange={(isHorizontal: any) =>
                            setAttrs({ isHorizontal: isHorizontal === "1" })
                        }
                    >
                        <ToggleGroupControlOptionIcon
                            icon={arrowRight}
                            value={"1"}
                            label={__("Horizontal")}
                        />
                        <ToggleGroupControlOptionIcon
                            icon={arrowDown}
                            value={"0"}
                            label={__("Vertical")}
                        />
                    </ToggleGroupControl>
                </FlexItem>
                {attrs.isHorizontal && (
                    <FlexItem>
                        <ToggleGroupControl
                            __nextHasNoMarginBottom
                            label={__("Justification")}
                            value={attrs.justifyContent}
                            onChange={(justifyContent: any) =>
                                setAttrs({ justifyContent })
                            }
                            className="block-editor-hooks__flex-layout-justification-controls"
                        >
                            {justificationOptions.map(
                                ({ value, icon, label }) => {
                                    return (
                                        <ToggleGroupControlOptionIcon
                                            key={value}
                                            value={value}
                                            icon={icon}
                                            label={label}
                                        />
                                    );
                                },
                            )}
                        </ToggleGroupControl>
                    </FlexItem>
                )}
            </Flex>
            {attrs.isHorizontal && (
                <ToggleControl
                    __nextHasNoMarginBottom
                    label={__("Allow to wrap to multiple lines")}
                    onChange={() => setAttrs({ wrapItems: !attrs.wrapItems })}
                    checked={attrs.wrapItems}
                />
            )}
        </ToolsPanelItem>
    );
}
