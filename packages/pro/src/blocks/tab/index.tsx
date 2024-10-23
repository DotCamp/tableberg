import { useBlockProps, useInnerBlocksProps, store, InnerBlocks, BlockControls } from '@wordpress/block-editor';
import { BlockEditProps, registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect } from 'react';
import { createBlock } from '@wordpress/blocks';
import { Button, ToolbarButton, ToolbarGroup } from '@wordpress/components';
import { reset, plus } from '@wordpress/icons';
import { min, remove } from 'lodash';


function edit({ clientId, attributes, setAttributes }: BlockEditProps<{
    activeTab: number;
    tabs: Array<{
        title: string,
        content: string
    }>;
}>) {
    const { children, ...innerBlocksProps } = useInnerBlocksProps(useBlockProps(), {
        allowedBlocks: ['tableberg/table'],
        template: [["tableberg/table"], ["tableberg/table"], ["tableberg/table"]],
        // @ts-ignore
        renderAppender: false
    })

    const { activeTab, tabs } = attributes;

    const { innerBlocks, innerBlocksLength } = useSelect((select) => {
        const innerBlocks = (select(store) as BlockEditorStoreSelectors).getBlock(clientId)?.innerBlocks;
        return {
            innerBlocks,
            innerBlocksLength: innerBlocks?.length
        };
    }, [clientId])

    useEffect(() => {
        if (innerBlocksLength! <= 0) {
            return;
        }
        for (let i = 0; i < innerBlocks!.length; i++) {
            (document.querySelector(`#block-${innerBlocks![i].clientId}`) as HTMLElement).style.display = "none";
        }
        (document.querySelector(`#block-${innerBlocks![activeTab].clientId}`) as HTMLElement).style.display = "block";
    }, [innerBlocksLength, activeTab]);

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
        console.log(innerBlocksLength);
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


    return <div {...innerBlocksProps} className="tab-block" >
        <BlockControls>
            <ToolbarGroup>
                <ToolbarButton icon={reset} onClick={removeTabHandler} label='remove tab' />
                <ToolbarButton icon={plus} onClick={addTabHandler} label='add tab' />
            </ToolbarGroup>
        </BlockControls>
        <nav className="tab-headings">
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
            {children}
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
