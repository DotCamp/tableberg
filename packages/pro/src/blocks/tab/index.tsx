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
} from "@wordpress/components";
import { Icon } from "@wordpress/icons";

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
    activeColor: string;
    inactiveColor: string;
    activeText: string;
    activeBackground: string;
    activeBorder: string;
    inactiveText: string;
    inactiveBackground: string;
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
        activeColor,
        inactiveColor,
        activeBackground,
        inactiveBackground,
        activeText,
        inactiveText,
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

    const [contentGap, setContentGap] = useState("0px");

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
        <div {...blockProps} className="tab-block">
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
                            return (
                                <PanelBody title="Tab Content Settings"></PanelBody>
                            );
                        } else if (tab.name === "style") {
                            return (
                                <PanelBody title="Style Settings">
                                    <SpacingControlSingle
                                        label="Tab content gap"
                                        value={gap}
                                        onChange={(newGap) => {
                                            setAttributes({
                                                gap: newGap,
                                            });
                                            const spacing = newGap
                                                .toString()
                                                .split("|");
                                            if (spacing.length > 1) {
                                                setContentGap(
                                                    spacing[
                                                        spacing.length - 1
                                                    ] + "px",
                                                );
                                            } else {
                                                setContentGap(newGap);
                                            }
                                        }}
                                    />
                                    <ToggleGroupControl
                                        __nextHasNoMarginBottom
                                        label="Table alignment"
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
                                    <PanelColorSettings
                                        title="color"
                                        initialOpen={true}
                                        colorSettings={[
                                            {
                                                value: activeColor,
                                                onChange: (color) =>
                                                    setAttributes({
                                                        activeColor: color,
                                                    }),
                                                label: "Active Color",
                                            },
                                            {
                                                value: inactiveColor,
                                                onChange: (color) =>
                                                    setAttributes({
                                                        inactiveColor: color,
                                                    }),
                                                label: "Inactive Color",
                                            },
                                            {
                                                value: activeText,
                                                onChange: (color) =>
                                                    setAttributes({
                                                        activeText: color,
                                                    }),
                                                label: "Active Text",
                                            },
                                            {
                                                value: inactiveText,
                                                onChange: (color) =>
                                                    setAttributes({
                                                        inactiveText: color,
                                                    }),
                                                label: "Inactive Text",
                                            },
                                            {
                                                value: activeBackground,
                                                onChange: (color) =>
                                                    setAttributes({
                                                        activeBackground: color,
                                                    }),
                                                label: "Active Background",
                                            },
                                            {
                                                value: inactiveBackground,
                                                onChange: (color) =>
                                                    setAttributes({
                                                        inactiveBackground:
                                                            color,
                                                    }),
                                                label: "Inactive Background",
                                            },
                                        ]}
                                        disableCustomColors={false}
                                    />
                                </PanelBody>
                            );
                        }
                    }}
                </TabPanel>
            </InspectorControls>

            <style>
                {`
        .wp-block-tableberg-pro-tab {
            --tab-active-color: ${activeColor};
            --tab-inactive-color: ${inactiveColor};
            --tab-active-text-color: ${activeText};
            --tab-inactive-text-color: ${inactiveText};
            --tab-active-background-color: ${activeBackground};
            --tab-inactive-background-color: ${inactiveBackground};
        }
            `}
            </style>

            <div {...innerBlocksProps}>
                <nav
                    data-toolbar-trigger="true"
                    className={`tab-headings ${alignment}`}
                    style={{ marginBottom: `${contentGap}` }}
                >
                    {tabs.map((v, i) => {
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
                                style={{
                                    borderBottomColor: isActive
                                        ? activeColor
                                        : "",
                                    color: isActive
                                        ? activeColor
                                        : inactiveColor,
                                }}
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
                <div>
                    <div>
                        <style>
                            {innerBlocks
                                ?.map((block, index) => {
                                    console.log(block.clientId);
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
