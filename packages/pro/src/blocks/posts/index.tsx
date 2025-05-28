import { useEffect } from 'react';
import apiFetch from '@wordpress/api-fetch';
import {
	BlockEditProps,
	createBlock,
	createBlocksFromInnerBlocksTemplate,
	InnerBlockTemplate,
	registerBlockType,
} from '@wordpress/blocks';
import metadata from './block.json';
import {
	InnerBlocks,
	useBlockProps,
	store as BlockEditorStore,
} from '@wordpress/block-editor';
import { useDispatch } from '@wordpress/data';

interface PostsTableAttributes {
	postType: string;
	columns: string[];
}

function edit(props: BlockEditProps<PostsTableAttributes>) {
	// eslint-disable-next-line react-hooks/rules-of-hooks
	const blockProps = useBlockProps();

	const { attributes, clientId } = props;
	const { postType, columns } = attributes;

	const storeActions: BlockEditorStoreActions = useDispatch(
		BlockEditorStore
	) as any;

	const textCell = (content: string, row: number, col: number) => {
		return [
			'tableberg/cell',
			{ row, col },
			[['core/paragraph', { content }]],
		];
	};

	useEffect(() => {
		apiFetch({
			path: `wp/v2/${postType}`,
			method: 'GET',
		}).then((resp) => {
			const initialInnerBlocks: InnerBlockTemplate[] = [];

			for (let i = 0; i < resp.length; i++) {
				for (let j = 0; j < columns.length; j++) {
					initialInnerBlocks.push([
						'tableberg/cell',
						{ row: i, col: j },
						[
							[
								'core/paragraph',
								{ content: `Cell ${i + 1}-${j + 1}` },
							],
						],
					]);
				}
			}

			const freshTable = createBlock(
				'tableberg/table',
				{
					rows: resp.length,
					cols: columns.length,
					cells: initialInnerBlocks.length,
				},
				createBlocksFromInnerBlocksTemplate(initialInnerBlocks)
			);

			storeActions.replaceInnerBlocks(clientId, [freshTable], true);
		});
	}, [postType, columns]);

	return (
		<div {...blockProps} className="tableberg-posts-table-block">
			<div>
				<InnerBlocks />
			</div>
		</div>
	);
}

registerBlockType(metadata as any, {
	attributes: metadata.attributes as any,
	edit,
	save: () => {
		return <i>here</i>;
	},
});
