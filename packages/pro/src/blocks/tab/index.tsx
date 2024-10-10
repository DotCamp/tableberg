import { InnerBlocks, useBlockProps, useInnerBlocksProps, store } from "@wordpress/block-editor";
import { registerBlockType } from "@wordpress/blocks";
import metadata from "./block.json";
import { select, useSelect, dispatch } from "@wordpress/data";
import { useEffect } from "react";
import { createBlock } from "@wordpress/blocks";
import { Button } from "@wordpress/components";
function edit({ clientId, attributes, setAttributes }) {
  const innerBlocksProps = useInnerBlocksProps(useBlockProps(), {
    allowedBlocks: ['tableberg/table'],
    template: [["tableberg/table"], ["tableberg/table"], ["tableberg/table"]],
  })

  const { activeTab } = attributes;

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
      if (activeTab === i) {
        document.querySelector(`#block-${innerBlocks[i].clientId}`).style.display = "block";
      }
      else {
        document.querySelector(`#block-${innerBlocks[i].clientId}`).style.display = "none";
      }
    }
  }, [innerBlocksLength]);

  function insertBlock() {
    const innerCount = select("core/editor").getBlocksByClientId(clientId)[0]
      .innerBlocks.length;
    let block = createBlock("tableberg/table");
    dispatch("core/block-editor").insertBlock(block, innerCount, clientId);
  }

  function clickHandler(index: number) {
    setVisibleTable(index);
    setAttributes({
      activeTab: index
    })
  }

  function addTabHandler() {
    insertBlock();
    setVisibleTable(innerBlocksLength)
    setAttributes({
      activeTab: innerBlocksLength
    })
  }

  return <div className="tab-block" >
    <nav className="tab-headings">
      {Array.from({ length: innerBlocks.length }, (_, i) => i).map(i => {
        const isActive = activeTab === i;
        return <div className={`tab-heading ${isActive ? "active" : ""}`} onClick={() => clickHandler(i)}>{i + 1}</div>
      })}

      <Button onClick={addTabHandler}>
        +
      </Button>

    </nav >
    <div {...innerBlocksProps} />
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

