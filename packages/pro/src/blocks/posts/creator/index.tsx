import { ComponentType } from "react";
import {
    store as BlockEditorStore,
    BlockEditorStoreDescriptor,
    useBlockProps,
} from "@wordpress/block-editor";
import {
    BlockEditProps,
    BlockInstance,
    createBlock,
    registerBlockType,
} from "@wordpress/blocks";
import { compose } from "@wordpress/compose";
import { withDispatch } from "@wordpress/data";
import { PostsTableIcon } from "@tableberg/shared/icons/table-creation";
import postsTableMetadata from "../block.json";
import metadata from "./block.json";
import PostsTableCreator from "./PostsTableCreator";

/**
 * Attributes for the posts table creator block.
 *
 * @interface
 */
interface PostsTableCreatorAttributes {
    postType: string;
    selectedColumns: Array<string>;
}

/**
 * Props for the posts table creator edit component.
 */
type PostsTableCreatorEditComponentProps =
    BlockEditProps<PostsTableCreatorAttributes> & {
        replaceCurrentBlock: (block: BlockInstance) => void;
    };

/**
 * Edit component for the posts table creator block.
 *
 * @param props Component props.
 * @return JSX Element for the posts table creator edit component.
 */
function EditComponent(props: PostsTableCreatorEditComponentProps) {
    const { replaceCurrentBlock, attributes, setAttributes } = props;
    const { postType, selectedColumns } = attributes;

    /**
     * Handles the creation of a new posts table block.
     *
     * @param pType   Post type id.
     * @param columns Column ids to be used in the posts table.
     */
    const handleCreateNew = (pType: string, columns: string[]) => {
        const postsTableBlock = createBlock(postsTableMetadata.name, {
            pType,
            columns,
        });

        replaceCurrentBlock(postsTableBlock);
    };

    /**
     * Handles the cancellation of the posts table creation.
     */
    const handleCancel = () => {
        // If the user cancels the creation process, we replace the current block with a new empty table block to start from scratch.
        const postsTableBlock = createBlock("tableberg/table");

        replaceCurrentBlock(postsTableBlock);
    };

    return (
        <div {...useBlockProps()}>
            <PostsTableCreator
                onCreate={handleCreateNew}
                onCancel={handleCancel}
                postType={postType}
                onPostTypeChange={(newPostType: string) => {
                    setAttributes({ postType: newPostType });
                }}
                selectedColumns={selectedColumns}
                onSelectColumnsChange={(newSelectedColumns: string[]) => {
                    setAttributes({ selectedColumns: newSelectedColumns });
                }}
            />
        </div>
    );
}

// Let's inject some additional props to the edit component.
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

            /**
             * Replaces the current block with a new block instance.
             * @param block
             */
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
    save: () => {
        return null;
    },
});
