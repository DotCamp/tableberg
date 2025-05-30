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
import { useDispatch, select, useSelect } from '@wordpress/data';

interface PostsTableAttributes {
	postType: string;
	columns: string[];
}

function edit(props: BlockEditProps<PostsTableAttributes>) {
	// eslint-disable-next-line react-hooks/rules-of-hooks
	const blockProps = useBlockProps();

	const { attributes, clientId } = props;
	const { postType, columns } = attributes;

	// eslint-disable-next-line react-hooks/rules-of-hooks
	const storeActions: BlockEditorStoreActions = useDispatch(
		BlockEditorStore
	) as any;

	const textCell = (
		content: string,
		row: number,
		col: number
	): InnerBlockTemplate => {
		return [
			'tableberg/cell',
			{ row, col },
			[
				[
					'core/paragraph',
					{
						content: String(content) || 'empty',
						fontSize: 'medium',
					},
				],
			],
		];
	};

	const generateImageCell = (
		imageId: number,
		row: number,
		col: number
	): InnerBlockTemplate => {
		return [
			'tableberg/cell',
			{ row, col },
			[
				[
					'core/image',
					{
						url: '',
						alt: 'Image',
						caption: '',
						sizeSlug: 'large',
					},
				],
			],
		];
	};

	const generateTitle = (columnIds: string[]) => {
		return columnIds.map((column, index) => {
			const capitalizedColumn = column
				.replace(/_/g, ' ')
				.replace(/\b\w/g, (char) => char.toUpperCase());
			return textCell(capitalizedColumn, 0, index);
		});
	};

	// eslint-disable-next-line react-hooks/rules-of-hooks
	useEffect(() => {
		apiFetch<Array<object>>({
			path: `wp/v2/${postType}`,
			method: 'GET',
		}).then((resp) => {
			const initialInnerBlocks: InnerBlockTemplate[] = [];

			initialInnerBlocks.push(...generateTitle(columns));

			for (let i = 0; i < resp.length; i++) {
				for (let j = 0; j < columns.length; j++) {
					const currentColumn = columns[j];
					// @ts-ignore
					const currentCellContent = resp[i][currentColumn] || '';

					const isImage =
						currentColumn === 'featured_media' &&
						currentCellContent;

					initialInnerBlocks.push(
						isImage
							? generateImageCell(currentCellContent, i + 1, j)
							: textCell(currentCellContent, i + 1, j)
					);
				}
			}

			const freshTable = createBlock(
				'tableberg/table',
				{
					rows: resp.length + 1,
					cols: columns.length,
					cells: initialInnerBlocks.length,
					enableTableHeader: true,
					headerBackgroundColor: '#f1f1f1',
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
	save: () => null,
});
