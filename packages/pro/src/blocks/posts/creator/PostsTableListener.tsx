import { useEffect } from "react";
import { store as BlockEditorStore } from "@wordpress/block-editor";
import { createBlock } from "@wordpress/blocks";
import { useSelect, useDispatch } from "@wordpress/data";
import { ProBlockProps } from "../../../block-enhancements";
import { TablebergBlockAttrs } from "@tableberg/shared/types";

/**
 * Posts table listener component.
 *
 * This component is used to add various creation options to the posts table.
 * Will only be used before the table is created.
 *
 *
 * __IMPORTANT_NOTE__: This component is temporary and probably will be removed in the future. Zahin's (@permafrost06) approach to feed the pro related table creation options and callbacks into the main block edit component is more elegant.
 * https://github.com/DotCamp/tableberg/blob/woo-table/packages/pro/src/block-enhancements/table/index.tsx
 *
 *
 * @param props           Component props.
 * @param props.props     Block edit props.
 * @param props.BlockEdit Block edit component.
 */
const PostsTableListener = ({
    props,
    BlockEdit,
}: ProBlockProps<TablebergBlockAttrs>) => {
    const { clientId } = props;
    const storeId = `tableberg-private-store-${clientId}`;

    const currentModal = useSelect(
        (
            select: (store: string) =>
                | undefined
                | {
                      getModalScreen: () => string | null;
                  }
        ) => {
            return select(storeId)?.getModalScreen();
        },
        [storeId]
    );

    const storeActions: BlockEditorStoreActions = useDispatch(
        BlockEditorStore
    ) as any;

    /**
     * Handles the creation of a new posts table creator block.
     *
     * The most innovative function name ever.
     */
    const handleCreateCreator = () => {
        const postsTableCreatorBlock = createBlock(
            "tableberg-pro/posts-table-creator"
        );

        storeActions.replaceBlock(clientId, postsTableCreatorBlock);
    };

    useEffect(() => {
        if (currentModal === "posts") {
            handleCreateCreator();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentModal]);

    return <BlockEdit {...props} />;
};

export default PostsTableListener;
