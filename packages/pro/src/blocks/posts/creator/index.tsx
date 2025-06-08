import { ComponentType } from "react";
import {
    BlockEditProps,
    BlockInstance,
    createBlock,
    registerBlockType,
} from "@wordpress/blocks";
import metadata from "./block.json";
import postsTableMetadata from "../block.json";
import { PostsTableIcon } from "@tableberg/shared/icons/table-creation";
import PostsTableCreator from "./PostsTableCreator";
import { withDispatch } from "@wordpress/data";
import {
    store as BlockEditorStore,
    BlockEditorStoreDescriptor,
} from "@wordpress/block-editor";
import { compose } from "@wordpress/compose";

type PostsTableCreatorEditComponentProps = BlockEditProps<{}> & {
    replaceCurrentBlock: (block: BlockInstance) => void;
};

function EditComponent(props: PostsTableCreatorEditComponentProps) {
    const { replaceCurrentBlock } = props;

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

        replaceCurrentBlock(postsTableBlock);
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

const edit = compose(
    withDispatch(
        (
            dispatch: (arg0: BlockEditorStoreDescriptor) => {
                replaceBlock: (clientId: string, block: BlockInstance) => void;
            },
            ownProps: BlockEditProps<{}>
        ) => {
            const { clientId } = ownProps;
            const { replaceBlock } = dispatch(BlockEditorStore);

            const replaceCurrentBlock = (block: BlockInstance) => {
                replaceBlock(clientId, block);
            };
            return {
                replaceCurrentBlock,
            };
        }
    )
)(EditComponent) as ComponentType<BlockEditProps<{}>>;

registerBlockType(metadata as any, {
    icon: PostsTableIcon,
    attributes: metadata.attributes as any,
    edit,
    save: () => null,
});
