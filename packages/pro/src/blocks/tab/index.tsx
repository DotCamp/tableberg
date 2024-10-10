import { InnerBlocks, useBlockProps, useInnerBlocksProps, store } from "@wordpress/block-editor";
import { registerBlockType } from "@wordpress/blocks";
import metadata from "./block.json";
import { useSelect } from "@wordpress/data";
import { useEffect } from "react";

function edit({ clientId }) {
    const innerBlocksProps = useInnerBlocksProps(useBlockProps(), {
        allowedBlocks: ['tableberg/table'],
        renderAppender: InnerBlocks.ButtonBlockAppender,
        template: [["tableberg/table"], ["tableberg/table"], ["tableberg/table"]]
    })

    const innerBlocks = useSelect((select) => {
        return (select(store) as BlockEditorStoreSelectors).getBlock(clientId)?.innerBlocks
    }, [clientId])

    const innerBlocksLength = useSelect((select) => {
        return (select(store) as BlockEditorStoreSelectors).getBlock(clientId)?.innerBlocks.length
    }, [clientId])

    const setVisibleTable = (v) => {
        for (let i = 0; i < innerBlocks!.length; i++) {
            if (i === v) {
                document.querySelector(`#block-${innerBlocks[i].clientId}`).style.display = "block";
                continue;
            }
            document.querySelector(`#block-${innerBlocks[i].clientId}`).style.display = "none";
        }
    }

    useEffect(() => {
        for (let i = 1; i < innerBlocks!.length; i++) {
            console.log(i);
            document.querySelector(`#block-${innerBlocks[i].clientId}`).style.display = "none";
        }
    }, [innerBlocksLength]);

    return <div className="tab-block" >
        {Array.from({ length: innerBlocks.length }, (_, i) => i ).map(i => {
            return <div onClick={() => setVisibleTable(i)}>{i+1}</div>
        })}
        <div {...innerBlocksProps} />
    </div>
}

function save() {
    return <div>Hello world</div>
}

registerBlockType(metadata as any, {
    attributes: metadata.attributes as any,
    edit: edit,
    save: save
})

