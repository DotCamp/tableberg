import {
    useBlockProps,
    useInnerBlocksProps,
    store,
    InnerBlocks,
    BlockControls,
    InspectorControls,
    PanelColorSettings,
} from "@wordpress/block-editor";
import { BlockEditProps, registerBlockType } from "@wordpress/blocks";
import metadata from "./block.json";
import { useSelect, useDispatch } from "@wordpress/data";
import { createBlock } from "@wordpress/blocks";
import {
    PanelBody,
    TabPanel,
    Button,
    __experimentalConfirmDialog as ConfirmDialog,
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
} from "@wordpress/components";
import { Icon } from "@wordpress/icons";
import { __ } from "@wordpress/i18n";
import { ColorControl } from "@tableberg/components";
import { getStyles } from "./getStyles";

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
        icon: positionRight,
        title: "Align right",
        value: "right",
    },
    {
        icon: positionCenter,
        title: "Align center",
        value: "center",
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
}: BlockEditProps<{
    activeTab: number;
    tabs: Array<{
        title: string;
        content: string;
    }>;
    alignment: string;
    gap: string;
    tabType: string;
    activeTabIndicatorColor: string;
    activeTabTextColor: string;
    activeTabBackgroundColor: string;
    inactiveTabTextColor: string;
    inactiveTabBackgroundColor: string;
    tabBorderRadius: string;
}>) {
    const blockProps = useBlockProps();
    const { children, ...innerBlocksProps } = useInnerBlocksProps(blockProps, {
        className: "tab-block",
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
        activeTab,
        tabs,
        alignment,
        gap,
        activeTabIndicatorColor,
        activeTabTextColor,
        inactiveTabTextColor,
        activeTabBackgroundColor,
        inactiveTabBackgroundColor,
        tabBorderRadius,
    } = attributes;

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

        setAttributes({
            activeTab: innerBlocksLength,
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

            setAttributes({
                tabs: newTabs,
                activeTab: 0,
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
                <TabPanel
                    className="tab-block-panel"
                    activeClass="active-tab"
                    tabs={[
                        {
                            name: "settings",
                            title: (
                                <>
                                    <Icon icon={settings} />
                                </>
                            ),
                            className: "tab-settings",
                        },
                        {
                            name: "style",
                            title: (
                                <>
                                    <Icon icon={styles} />
                                </>
                            ),
                            className: "tab-style",
                        },
                    ]}
                >
                    {(tab) => {
                        if (tab.name === "settings") {
                            return <></>;
                        } else if (tab.name === "style") {
                            return (
                                <ToolsPanel
                                    label={__("Style Settings", "tableberg")}
                                    resetAll={() => {}}
                                >
                                    <ToolsPanelItem
                                        label={__("")}
                                        hasValue={() => true}
                                    >
                                        <SpacingControlSingle
                                            label={__(
                                                "Tab content gap",
                                                "tableberg",
                                            )}
                                            value={gap}
                                            onChange={(newGap) =>
                                                setAttributes({
                                                    gap: newGap,
                                                })
                                            }
                                        />
                                        <ToggleGroupControl
                                            __nextHasNoMarginBottom
                                            label={__(
                                                "Table alignment",
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
                                        <SpacingControlSingle
                                            label={__(
                                                "Tab Heading Corner Radius",
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
                                    <ToolsPanelItem
                                        label="Color"
                                        hasValue={() => true}
                                    >
                                        <h3>{__("Colors", "tableberg")}</h3>
                                        <ColorControl
                                            label={__(
                                                "Active Tab Indicator Color",
                                                "tableberg",
                                            )}
                                            colorValue={activeTabIndicatorColor}
                                            onColorChange={(newColor) =>
                                                setAttributes({
                                                    activeTabIndicatorColor:
                                                        newColor,
                                                })
                                            }
                                            onDeselect={() =>
                                                setAttributes({
                                                    activeTabIndicatorColor: "",
                                                })
                                            }
                                        />
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
                                    </ToolsPanelItem>
                                </ToolsPanel>
                            );
                        }
                    }}
                </TabPanel>
            </InspectorControls>

            <div {...innerBlocksProps}>
                <nav
                    data-toolbar-trigger="true"
                    className={`tab-headings ${alignment}`}
                >
                    {tabs.map((_, i) => {
                        const isActive = activeTab === i;
                        return (
                            <div
                                className={`tab-heading ${
                                    isActive ? "active" : ""
                                }`}
                                onClick={() => {
                                    setAttributes({ activeTab: i });
                                }}
                                data-toolbar-trigger="true"
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
                                <div className="tab-heading-remove">
                                    <Button
                                        icon={reset}
                                        onClick={() => {
                                            setDeleteIndex(i);
                                            setDeleteConfirmDialogIsOpen(true);
                                        }}
                                    />
                                </div>
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

                    <div className="tab-heading tab-heading-add">
                        <Button icon={plus} onClick={addTabHandler} />
                    </div>
                </nav>
                <div className="tab-content">
                    <div>
                        <style>
                            {innerBlocks
                                ?.map((block, index) => {
                                    return `#block-${
                                        block.clientId
                                    } {display: ${
                                        activeTab === index ? "block" : "none"
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
    edit: edit,
    save: save,
});
