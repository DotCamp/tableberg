import { useBlockProps, useInnerBlocksProps, store, InnerBlocks, BlockControls, InspectorControls } from '@wordpress/block-editor';
import { BlockEditProps, registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';
import { useSelect, useDispatch } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';
import { PanelBody, TabPanel, Button } from '@wordpress/components';
import { positionLeft, positionRight, positionCenter, stretchFullWidth, settings, styles, reset, plus } from '@wordpress/icons';
import { useState } from 'react';
import { SpacingControlSingle } from '@tableberg/components';
import {
    __experimentalToggleGroupControl as ToggleGroupControl, __experimentalToggleGroupControlOptionIcon as ToggleGroupControlOptionIcon
} from '@wordpress/components';
import { Icon, } from '@wordpress/icons'

interface AlignmentControls {
    icon: JSX.Element;
    title: string;
    value: string;
}


const alignmentOptions: Array<AlignmentControls> = [
    {
        icon: positionLeft,
        title: "Align left",
        value: "left"
    },
    {
        icon: positionRight,
        title: "Align right",
        value: "right"
    },
    {
        icon: positionCenter,
        title: "Align center",
        value: "center"
    },
    {
        icon: stretchFullWidth,
        title: "Stretch full width",
        value: "full"
    }
]

function edit({ clientId, attributes, setAttributes }: BlockEditProps<{
    activeTab: number;
    tabs: Array<{
        title: string,
        content: string
    }>;
    alignment: string;
    gap: string;
    tabType: string;
}>) {
    const blockProps = useBlockProps();
    const { children, ...innerBlocksProps } = useInnerBlocksProps(blockProps, {
        className: 'tab-block',
        allowedBlocks: ['tableberg/table'],
        template: [["tableberg/table"], ["tableberg/table"], ["tableberg/table"]],
        // @ts-ignore
        renderAppender: false
    })

    const { activeTab, tabs, alignment, gap } = attributes;

    const { innerBlocks, innerBlocksLength } = useSelect((select) => {
        const innerBlocks = (select(store) as BlockEditorStoreSelectors).getBlock(clientId)?.innerBlocks;
        return {
            innerBlocks,
            innerBlocksLength: innerBlocks?.length
        };
    }, [clientId])

    const [selectedAlignment, setSelectedAlignment] = useState<JSX.Element>(positionLeft);
    const [contentGap, setContentGap] = useState("0px");


    const insertBlock = (useDispatch(store) as unknown as BlockEditorStoreActions).insertBlock;

    const removeBlock = (useDispatch(store) as unknown as BlockEditorStoreActions).removeBlock;

    function addTabHandler() {
        insertBlock(
            createBlock("tableberg/table"),
            innerBlocksLength,
            clientId,
            false,
        );

        setAttributes({
            activeTab: innerBlocksLength,
            tabs: [...tabs, {
                title: `Untitled Tab`,
                content: "",
            }]
        })
    }

    function removeTabHandler(i: number) {
        if (innerBlocks && innerBlocksLength) {
            removeBlock(innerBlocks[i].clientId, false);

            const newTabs = [...tabs.slice(0, i), ...tabs.slice(i + 1)];

            setAttributes({
                tabs: newTabs,
                activeTab: 0
            })
        }
        console.log(innerBlocks);
    }


    return <div {...blockProps} className="tab-block" >
        <InspectorControls>
            <TabPanel
                className="tab-block-panel"
                activeClass="active-tab"
                tabs={[
                    {
                        name: 'settings',
                        title: (
                            <>
                                <Icon icon={settings} />
                            </>
                        ),
                        className: 'tab-settings',
                    },
                    {
                        name: 'style',
                        title: (
                            <>
                                <Icon icon={styles} />
                            </>
                        ),
                        className: 'tab-style',
                    },
                ]}
            >
                {(tab) => {
                    if (tab.name === 'settings') {
                        return (
                            <PanelBody title='Tab Content Settings'>

                            </PanelBody>
                        );
                    } else if (tab.name === 'style') {
                        return (
                            <PanelBody title='Style Settings'>
                                <SpacingControlSingle
                                    label="Tab content gap"
                                    value={gap}
                                    onChange={(newGap) => {
                                        setAttributes({
                                            gap: newGap
                                        })
                                        const spacing = newGap.toString().split('|');
                                        if (spacing.length > 1) {
                                            setContentGap(spacing[spacing.length - 1] + 'px');
                                        } else {
                                            setContentGap(newGap);
                                        }
                                    }}
                                />
                                <ToggleGroupControl __nextHasNoMarginBottom label="Table alignment" value={alignment} onChange={(newAlignment: any) => setAttributes({
                                    alignment: newAlignment
                                })} >
                                    {
                                        alignmentOptions.map(({ icon, title, value }) => (<ToggleGroupControlOptionIcon key={value} icon={icon} value={value} label={title} />))
                                    }
                                </ToggleGroupControl>
                            </PanelBody>
                        );
                    }
                }}
            </TabPanel>
        </InspectorControls>
        <div {...innerBlocksProps}>
            <nav data-toolbar-trigger="true" className={`tab-headings ${alignment}`} style={{ marginBottom: `${contentGap}` }}>
                {tabs.map((v, i) => {
                    const isActive = activeTab === i;
                    return (
                        <div
                            className={`tab-heading ${isActive ? "active" : ""}`}
                            onClick={() => setAttributes({ activeTab: i })}
                            data-toolbar-trigger='true'
                        >
                            <p contentEditable tabIndex={0} onBlur={(e) => {
                                e.preventDefault();
                                const newTabs = [...tabs];
                                newTabs[i].title = e.target.innerText;
                                setAttributes({
                                    tabs: newTabs
                                })
                            }}>
                                {tabs[i].title}
                            </p>
                            <Button
                                className='tab-heading-remove'
                                icon={reset}
                                onClick={() => removeTabHandler(i)}
                            />
                        </div>
                    )
                })}
                <div
                    className="tab-heading tab-heading-add"

                >
                    <Button icon={plus} onClick={addTabHandler} />
                </div>
            </nav >
            <div>
                <div>
                    <style>
                        {innerBlocks?.map((block, index) => `
                #block-${block.clientId} {
                    display: ${activeTab === index ? 'block' : 'none'};
                }`).join('\n')}
                    </style>
                    {children}
                </div>
            </div>
        </div>
    </div >
}

function save() {
    const blockProps = useBlockProps.save();

    return <div {...blockProps}>
        <InnerBlocks.Content />
    </div>
}

registerBlockType(metadata as any, {
    attributes: metadata.attributes as any,
    edit: edit,
    save: save
})
