import {
    useBlockProps,
    useInnerBlocksProps,
    store,
    InnerBlocks,
    InspectorControls,
} from "@wordpress/block-editor";
import { BlockEditProps, registerBlockType } from "@wordpress/blocks";
import metadata from "./block.json";
import { useSelect, useDispatch } from "@wordpress/data";
import { createBlock } from "@wordpress/blocks";
import {
    TabPanel,
    Button,
    __experimentalConfirmDialog as ConfirmDialog,
    PanelBody,
    BaseControl,
} from "@wordpress/components";
import {
    positionLeft,
    positionRight,
    positionCenter,
    stretchFullWidth,
    settings,
    styles,
    reset,
    plus,
} from "@wordpress/icons";
import { useState } from "react";
import { SpacingControlSingle } from "@tableberg/components";
import {
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOptionIcon as ToggleGroupControlOptionIcon,
    __experimentalToolsPanel as ToolsPanel,
    __experimentalToolsPanelItem as ToolsPanelItem,
    __experimentalNumberControl as NumberControl,
} from "@wordpress/components";
import { Icon } from "@wordpress/icons";
import { __ } from "@wordpress/i18n";
import { ColorControl } from "@tableberg/components";
import {
    getStyles,
    getSpacingUnderTabs,
    getInactiveTabHeadingStyles,
    getActiveTabHeadingStyles,
} from "./getStyles";
import blockIcon from "@tableberg/shared/icons/tableberg";

export interface ToggleBlockTypes {
    tabs: Array<{
        title: string;
        content: string;
    }>;
    defaultActiveTabIndex: number;
    alignment: string;
    gap: string;
    tabType: string;
    activeTabTextColor: string;
    activeTabBackgroundColor: string;
    inactiveTabTextColor: string;
    inactiveTabBackgroundColor: string;
    tabBorderRadius: string;
}

interface AlignmentControls {
    icon: JSX.Element;
    title: string;
    value: string;
}

const alignmentOptions: Array<AlignmentControls> = [
    {
        icon: positionLeft,
        title: "Align left",
        value: "left",
    },
    {
        icon: positionCenter,
        title: "Align center",
        value: "center",
    },
    {
        icon: positionRight,
        title: "Align right",
        value: "right",
    },
    {
        icon: stretchFullWidth,
        title: "Stretch full width",
        value: "full",
    },
];

function edit({
    clientId,
    attributes,
    setAttributes,
}: BlockEditProps<ToggleBlockTypes>) {
    const blockProps = useBlockProps();
    const { children, ...innerBlocksProps } = useInnerBlocksProps(blockProps, {
        className: "toggle-block",
        allowedBlocks: ["tableberg/table"],
        template: [
            ["tableberg/table"],
            ["tableberg/table"],
            ["tableberg/table"],
        ],
        // @ts-ignore
        renderAppender: false,
    });

    const {
        tabs,
        alignment,
        defaultActiveTabIndex,
        gap,
        activeTabTextColor,
        inactiveTabTextColor,
        activeTabBackgroundColor,
        inactiveTabBackgroundColor,
        tabBorderRadius,
    } = attributes;

    const [activeTab, setActiveTab] = useState(defaultActiveTabIndex);

    const { innerBlocks, innerBlocksLength } = useSelect(
        (select) => {
            const innerBlocks = (
                select(store) as BlockEditorStoreSelectors
            ).getBlock(clientId)?.innerBlocks;
            return {
                innerBlocks,
                innerBlocksLength: innerBlocks?.length,
            };
        },
        [clientId],
    );

    const [deleteConfirmDialogIsOpen, setDeleteConfirmDialogIsOpen] =
        useState(false);
    const [deleteIndex, setDeleteIndex] = useState(0);

    const insertBlock = (
        useDispatch(store) as unknown as BlockEditorStoreActions
    ).insertBlock;

    const removeBlock = (
        useDispatch(store) as unknown as BlockEditorStoreActions
    ).removeBlock;

    function addTabHandler() {
        insertBlock(
            createBlock("tableberg/table"),
            innerBlocksLength,
            clientId,
            false,
        );

        setActiveTab(innerBlocksLength!);
        setAttributes({
            tabs: [
                ...tabs,
                {
                    title: `Untitled Tab`,
                    content: "",
                },
            ],
        });
    }

    function removeTabHandler(i: number) {
        if (innerBlocks && innerBlocksLength) {
            removeBlock(innerBlocks[i].clientId, false);

            const newTabs = [...tabs.slice(0, i), ...tabs.slice(i + 1)];

            setActiveTab(0);
            setAttributes({
                tabs: newTabs,
            });
        }
    }

    return (
        <div
            {...blockProps}
            style={getStyles(attributes)}
            className="tab-block"
        >
            <InspectorControls>
                <ToolsPanel
                    label={__(
                        "Toggle Settings",
                        "tableberg",
                    )}
                    resetAll={() => { }}
                >
                    <ToolsPanelItem
                        label={__("Default Active Tab")}
                        hasValue={() => true}
                    >
                        <NumberControl
                            label="Default Active Tab"
                            value={
                                defaultActiveTabIndex + 1
                            }
                            onChange={(newVal) =>
                                setAttributes({
                                    defaultActiveTabIndex:
                                        Math.max(0, Number(newVal || 1,) - 1)
                                })
                            }
                            min={1}
                            max={tabs.length}
                        />
                    </ToolsPanelItem>
                    <ToolsPanelItem
                        label={__("Tabs alignment", "tableberg")}
                        hasValue={() => true}
                    >
                        <ToggleGroupControl
                            __nextHasNoMarginBottom
                            label={__(
                                "Tabs alignment",
                                "tableberg",
                            )}
                            value={alignment}
                            onChange={(newAlignment: any) =>
                                setAttributes({
                                    alignment: newAlignment,
                                })
                            }
                        >
                            {alignmentOptions.map(
                                ({ icon, title, value }) => (
                                    <ToggleGroupControlOptionIcon
                                        key={value}
                                        icon={icon}
                                        value={value}
                                        label={title}
                                    />
                                ),
                            )}
                        </ToggleGroupControl>
                    </ToolsPanelItem>
                </ToolsPanel>
            </InspectorControls>
            <InspectorControls group="color">
                <ColorControl
                    label={__(
                        "Active Tab Text Color",
                        "",
                    )}
                    colorValue={activeTabTextColor}
                    onColorChange={(newColor) =>
                        setAttributes({
                            activeTabTextColor:
                                newColor,
                        })
                    }
                    onDeselect={() =>
                        setAttributes({
                            activeTabTextColor: "",
                        })
                    }
                />
                <ColorControl
                    label={__(
                        "Inactive Tab Text Color",
                        "tableberg",
                    )}
                    colorValue={inactiveTabTextColor}
                    onColorChange={(newColor) =>
                        setAttributes({
                            inactiveTabTextColor:
                                newColor,
                        })
                    }
                    onDeselect={() =>
                        setAttributes({
                            inactiveTabTextColor: "",
                        })
                    }
                />
                <ColorControl
                    label={__(
                        "Active Tab Background Color",
                        "tableberg",
                    )}
                    colorValue={
                        activeTabBackgroundColor
                    }
                    onColorChange={(newColor) =>
                        setAttributes({
                            activeTabBackgroundColor:
                                newColor,
                        })
                    }
                    onDeselect={() =>
                        setAttributes({
                            activeTabBackgroundColor:
                                "",
                        })
                    }
                />
                <ColorControl
                    label={__(
                        "Inactive Tab Background Color",
                        "tableberg",
                    )}
                    colorValue={
                        inactiveTabBackgroundColor
                    }
                    onColorChange={(newColor) =>
                        setAttributes({
                            inactiveTabBackgroundColor:
                                newColor,
                        })
                    }
                    onDeselect={() =>
                        setAttributes({
                            inactiveTabBackgroundColor:
                                "",
                        })
                    }
                />
            </InspectorControls>
            <InspectorControls group="dimensions">
                <ToolsPanelItem
                    label={__("Spacing Under Tabs", "tableberg")}
                    hasValue={() => true}
                >
                    <SpacingControlSingle
                        label={__(
                            "Spacing Under Tabs",
                            "tableberg",
                        )}
                        value={gap}
                        onChange={(newGap) =>
                            setAttributes({
                                gap: newGap,
                            })
                        }
                    />
                </ToolsPanelItem>
            </InspectorControls>
            <InspectorControls group="border">
                <ToolsPanelItem
                    label={__("Tab Heading Border Radius", "tableberg")}
                    hasValue={() => true}
                >
                    <SpacingControlSingle
                        label={__(
                            "Tab Heading Border Radius",
                            "tableberg",
                        )}
                        value={tabBorderRadius}
                        onChange={(newValue) =>
                            setAttributes({
                                tabBorderRadius: newValue,
                            })
                        }
                    />
                </ToolsPanelItem>
            </InspectorControls>

            <div {...innerBlocksProps}>
                <nav
                    data-toolbar-trigger="true"
                    className={`tab-headings ${alignment}`}
                    style={getSpacingUnderTabs(attributes)}
                >
                    {tabs.map((_, i) => {
                        const isActive = activeTab === i;
                        return (
                            <div
                                className={`tab-heading ${isActive ? "active" : ""
                                    }`}
                                onClick={() => {
                                    setActiveTab(i);
                                }}
                                data-toolbar-trigger="true"
                                style={
                                    isActive
                                        ? getActiveTabHeadingStyles(attributes)
                                        : getInactiveTabHeadingStyles(
                                            attributes,
                                        )
                                }
                            >
                                <p
                                    contentEditable
                                    tabIndex={0}
                                    onBlur={(e) => {
                                        e.preventDefault();
                                        const newTabs = [...tabs];
                                        newTabs[i].title = e.target.innerText;
                                        setAttributes({
                                            tabs: newTabs,
                                        });
                                    }}
                                >
                                    {tabs[i].title}
                                </p>
                                <button
                                    className="tab-heading-remove"
                                    onClick={() => {
                                        setDeleteIndex(i);
                                        setDeleteConfirmDialogIsOpen(true);
                                    }}
                                >
                                    <Icon icon={reset} />
                                </button>
                            </div>
                        );
                    })}
                    {deleteConfirmDialogIsOpen && (
                        <ConfirmDialog
                            isOpen={deleteConfirmDialogIsOpen}
                            onCancel={() => setDeleteConfirmDialogIsOpen(false)}
                            onConfirm={() => {
                                removeTabHandler(deleteIndex);
                                setDeleteConfirmDialogIsOpen(false);
                            }}
                        >
                            Are you sure you want to delete this tab?
                        </ConfirmDialog>
                    )}

                    <div className=" tab-heading-add">
                        <Button icon={plus} onClick={addTabHandler} />
                    </div>
                </nav>
                <div className="tab-content">
                    <div>
                        <style>
                            {innerBlocks
                                ?.map((block, index) => {
                                    return `#block-${block.clientId
                                        } {display: ${activeTab === index ? "block" : "none"
                                        };}`;
                                })
                                .join("\n")}
                        </style>
                        <div>{children}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function save() {
    const blockProps = useBlockProps.save();

    return (
        <div {...blockProps}>
            <InnerBlocks.Content />
        </div>
    );
}

registerBlockType(metadata as any, {
    attributes: metadata.attributes as any,
    icon: blockIcon,
    edit: edit,
    save: save,
});
