import { useBlockProps, useInnerBlocksProps, store } from "@wordpress/block-editor";
import { BlockEditProps, registerBlockType } from "@wordpress/blocks";
import metadata from "./block.json";
import { select, useSelect, dispatch, useDispatch } from "@wordpress/data";
import { useEffect } from "react";
import { createBlock } from "@wordpress/blocks";
import { Button } from "@wordpress/components";

function edit({ clientId, attributes, setAttributes }: BlockEditProps<{
    activeTab: number;
}>) {
    const { children, ...innerBlocksProps } = useInnerBlocksProps(useBlockProps(), {
        allowedBlocks: ['tableberg/table'],
        template: [["tableberg/table"], ["tableberg/table"], ["tableberg/table"]],
        // @ts-ignore
        renderAppender: false
    })

    const { activeTab } = attributes;

    const { innerBlocks, innerBlocksLength } = useSelect((select) => {
        const innerBlocks = (select(store) as BlockEditorStoreSelectors).getBlock(clientId)?.innerBlocks;
        return {
            innerBlocks,
            innerBlocksLength: innerBlocks?.length
        };
    }, [clientId])

    useEffect(() => {
        for (let i = 0; i < innerBlocks!.length; i++) {
            (document.querySelector(`#block-${innerBlocks![i].clientId}`) as HTMLElement).style.display = "none";
        }
        (document.querySelector(`#block-${innerBlocks![activeTab].clientId}`) as HTMLElement).style.display = "block";
    }, [innerBlocksLength, activeTab]);

    function addTabHandler() {
        (useDispatch(store) as unknown as BlockEditorStoreActions).insertBlock(
            createBlock("tableberg/table"),
            innerBlocksLength,
            clientId
        );

        setAttributes({
            activeTab: innerBlocksLength
        })
    }

    return <div {...innerBlocksProps} className="tab-block" >
        <nav className="tab-headings">
            {Array.from({ length: innerBlocks!.length }, (_, i) => i).map(i => {
                const isActive = activeTab === i;
                return <div className={`tab-heading ${isActive ? "active" : ""}`} onClick={() => setAttributes({ activeTab: i })}>{i + 1}</div>
            })}
            <Button onClick={addTabHandler}> + </Button>
        </nav >
        <div>
            {children}
        </div>
    </div >
}

function save() {
    return <div>Hello world</div>
}

registerBlockType(metadata as any, {
    attributes: metadata.attributes as any,
    edit: edit,
    save: save
})

