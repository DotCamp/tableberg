import {
    BlockEditProps,
    createBlock,
    registerBlockType,
} from "@wordpress/blocks";
import metadata from "./block.json";
import postsTableMetadata from "../block.json";
import { PostsTableIcon } from "@tableberg/shared/icons/table-creation";
import PostsTableCreator from "./PostsTableCreator";
import { useDispatch } from "@wordpress/data";
import { store as BlockEditorStore } from "@wordpress/block-editor";

function edit(props: BlockEditProps<never>) {
    const { clientId } = props;

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const storeActions: BlockEditorStoreActions = useDispatch(
        BlockEditorStore
    ) as any;

    /**
     * Handles the creation of a new posts table block.
     *
     * @param postType Post type id.
     * @param columns  Column ids to be used in the posts table.
     */
    const handleCreateNew = (postType: string, columns: string[]) => {
        const postsTableBlock = createBlock(postsTableMetadata.name, {
            postType,
            columns,
        });

        storeActions.replaceBlock(clientId, postsTableBlock);
    };

    /**
     * Handles the cancellation of the posts table creation.
     */
    const handleCancel = () => {
        // TODO [ErdemBircan] cancel the creation of the posts table block and return to default creation screen
    };

    return (
        <PostsTableCreator onCreate={handleCreateNew} onCancel={handleCancel} />
    );
}

registerBlockType(metadata as any, {
    icon: PostsTableIcon,
    attributes: metadata.attributes as any,
    edit,
    save: () => null,
});
