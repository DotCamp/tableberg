import metadata from "./block.json";
import { registerBlockType } from "@wordpress/blocks";
import { useDispatch } from "@wordpress/data";
import { store } from "@wordpress/block-editor";
import UpsellModal from "../components/UpsellModal";

function edit({ clientId, attributes }) {
    // @ts-ignore
    const { removeBlock } = useDispatch(store) as BlockEditorStoreActions;

    if (attributes.isPreview === true) {
        return <UpsellModal onClose={() => removeBlock(clientId)} />;
    }

    return <UpsellModal onClose={() => removeBlock(clientId)} />;
};

// @ts-ignore
registerBlockType(metadata.name, {
    title: metadata.title,
    category: metadata.category,
    attributes: metadata.attributes,
    edit,
});

