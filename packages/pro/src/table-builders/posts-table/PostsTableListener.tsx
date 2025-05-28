import { store as BlockEditorStore } from '@wordpress/block-editor';
import { createBlock } from '@wordpress/blocks';
import { useSelect, useDispatch } from '@wordpress/data';
import { ProBlockProps } from '../../block-enhancements';
import { TablebergBlockAttrs } from '@tableberg/shared/types';
import PostsTableModal from './PostsTableModal';

/**
 * Posts table listener component.
 *
 * This component is used to add various creation options to the posts table.
 * Will only be used before the table is created.
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

	if (props.isSelected) {
		// Need to call hook inside a conditional statement since the target store will not be
		// available till the main block is selected
		// @ts-ignore
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const currentModal = useSelect(
			(
				select: (store: string) =>
					| undefined
					| {
							getModalScreen: () => string | null;
					  }
			) => {
				return select(storeId)?.getModalScreen();
			}
		);

		// Need to call hook inside a conditional statement since the target store will not be
		// available till the main block is selected
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const closeModalScreen = useDispatch(storeId)?.closeModalScreen;

		// Need to call hook inside a conditional statement since the target store will not be
		// available till the main block is selected
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const storeActions: BlockEditorStoreActions = useDispatch(
			BlockEditorStore
		) as any;

		// Need to call hook inside a conditional statement since the target store will not be
		// available till the main block is selected
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const handleCreateNew = (postType: string, columns: string[]) => {
			const postsTableBlock = createBlock('tableberg/posts-tables', {
				postType,
				columns,
			});

			storeActions.replaceBlock(clientId, postsTableBlock);
		};

		return (
			<>
				{currentModal === 'posts' && (
					<PostsTableModal
						onClose={closeModalScreen}
						onCreate={handleCreateNew}
					/>
				)}
				<BlockEdit {...props} />
			</>
		);
	}

	return <BlockEdit {...props} />;
};

export default PostsTableListener;
