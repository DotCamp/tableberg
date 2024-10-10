
import { InnerBlocks, useBlockProps, useInnerBlocksProps } from "@wordpress/block-editor";
import { BlockEditProps, registerBlockType } from "@wordpress/blocks";
import { Button } from "@wordpress/components";
import { useDispatch, useSelect } from "@wordpress/data";
import metadata from "./block.json";
import { useEffect } from "react";

interface Tab {
  title: string,
  content: string
}

interface TabBlockProps {
  activeTab: number,
  tabs: Tab[]
}

function edit(props: BlockEditProps<TabBlockProps>) {
  const blockProps = useBlockProps();

  const { tabs, activeTab } = props.attributes;

  const { clientId, setAttributes } = props;

  const getBlocks = useSelect((select) => select("core/block-editor").getBlocks(clientId), [clientId])
  const { replaceInnerBlocks } = useDispatch("core/block-editor");

  function saveActiveContent() {
    const innerBlocksContent = getBlocks;
    const serializeInnerBlocksContent = wp.blocks.serialize(innerBlocksContent);
    const updatedTabs = [...tabs];
    updatedTabs[activeTab].content = serializeInnerBlocksContent;
    setAttributes({
      tabs: updatedTabs
    })
  }

  function restoreTabContent(index: number) {
    const innerBlocks = wp.blocks.parse(tabs[index].content);

    replaceInnerBlocks(clientId, innerBlocks);
  }

  function tabClickHandler(index: number) {
    saveActiveContent();
    setAttributes(
      {
        activeTab: index
      }
    )
    restoreTabContent(index)
  }

  function addTabHandler() {

    const newTabs = [...tabs, { title: `Tab ${tabs.length + 1}`, content: "" }]

    setAttributes({
      tabs: newTabs,
      activeTab: tabs.length
    });
  }

  const { ...innerBlocksProps } = useInnerBlocksProps({
    allowedBlocks: ['tableberg/table'],
    renderAppender: InnerBlocks.ButtonBlockAppender,
  })

  useEffect(() => {
    saveActiveContent()
  }, [activeTab])

  console.log({ ...innerBlocksProps });
  return <div {...blockProps} className="tab-block" >

    <nav className="tab-headings">
      {
        tabs.map((tab, index) => {
          const isActive = index === activeTab;
          return <div key={index} onClick={() => tabClickHandler(index)} className={`tab-heading ${isActive ? "active" : ""}`}>
            {tab.title}
          </div>
        })
      }
      <Button className="add-tab-button" onClick={addTabHandler}>+</Button>
    </nav>

    <div className="tab-contents">
      <div   {...innerBlocksProps} >
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

