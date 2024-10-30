import { useBlockProps, useInnerBlocksProps, store, InnerBlocks, BlockControls, InspectorControls } from '@wordpress/block-editor';
import { BlockEditProps, registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';
import { useSelect, useDispatch } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';
import { PanelBody, ToolbarButton, ToolbarDropdownMenu, ToolbarGroup } from '@wordpress/components';
import { reset, plus, positionLeft, positionRight, positionCenter, stretchFullWidth } from '@wordpress/icons';
import { useState } from 'react';
import { SpacingControlSingle } from '@tableberg/components';


interface AlignmentControls {
    icon: JSX.Element;
    title: string;
    value?: string;
    onClick?: (option: AlignmentControls) => void;
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
    const { children, ...innerBlocksProps } = useInnerBlocksProps(useBlockProps(), {
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
                title: `Tab ${innerBlocksLength! + 1}`,
                content: "",
            }]
        })
    }

    function removeTabHandler() {
        if (innerBlocks && innerBlocksLength) {
            removeBlock(innerBlocks[innerBlocksLength - 1].clientId, false);

            const newTabs = tabs.slice(0, -1);

            const newActiveTab = Math.min(activeTab, innerBlocksLength - 2);

            setAttributes({
                tabs: newTabs,
                activeTab: newActiveTab
            })
        }
    }

    function handleAlignmentClick(option: AlignmentControls) {
        setSelectedAlignment(option.icon);
        setAttributes({
            alignment: option.value
        })

    }


    return <div {...innerBlocksProps} className="tab-block" >
        <InspectorControls>
            <PanelBody title='Tab Content Settings'>
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
            </PanelBody>
        </InspectorControls>
        <BlockControls>
            <ToolbarGroup>
                <ToolbarButton icon={reset} onClick={removeTabHandler} label='remove tab' />
                <ToolbarButton icon={plus} onClick={addTabHandler} label='add tab' />
                <ToolbarDropdownMenu icon={selectedAlignment} label='Headings Alignment' controls={alignmentOptions.map((option) => {
                    return {
                        ...option,
                        onClick: () => handleAlignmentClick(option)
                    }
                })} />

            </ToolbarGroup>
        </BlockControls>
        <nav className={`tab-headings ${alignment}`} style={{ marginBottom: `${contentGap}` }}>
            {Array.from({ length: innerBlocks!.length }, (_, i) => i).map(i => {
                const isActive = activeTab === i;
                return (
                    <div
                        className={`tab-heading ${isActive ? "active" : ""}`}
                        onClick={() => setAttributes({ activeTab: i })}
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
                    </div>
                )
            })}

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
