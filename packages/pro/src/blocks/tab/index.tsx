import { InnerBlocks, useBlockProps, useInnerBlocksProps, store } from "@wordpress/block-editor";
import { registerBlockType } from "@wordpress/blocks";
import metadata from "./block.json";
import { useSelect } from "@wordpress/data";

function edit({ clientId }) {
    const blockProps = useBlockProps();

    const innerBlocksProps = useInnerBlocksProps({
        allowedBlocks: ['tableberg/table'],
        renderAppender: InnerBlocks.ButtonBlockAppender,
        template: [["tableberg/table"]]
    })

    const innerBlocks = useSelect((select) => {
        return (select(store) as BlockEditorStoreSelectors).getBlock(clientId)?.innerBlocks
    }, [clientId])

    const setVisibleTable = (v) => {
        for (let i = 0; i < innerBlocks?.length; i++) {
            if (i === v) {
                document.querySelector(`#block-${innerBlocks[i].clientId}`).style.display = "block";
                continue;
            }
            document.querySelector(`#block-${innerBlocks[i].clientId}`).style.display = "none";
        }
    }

    return <div {...blockProps} className="tab-block" >
        <div className="tab-contents">
            {Array.from({ length: innerBlocks.length }, (_, i) => i ).map(i => {
                return <div onClick={() => setVisibleTable(i)}>{i+1}</div>
            })}
            <div {...innerBlocksProps} >
            </div>
        </div>
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

