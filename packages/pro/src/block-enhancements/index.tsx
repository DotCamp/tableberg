import { createHigherOrderComponent } from '@wordpress/compose';
import { addFilter } from '@wordpress/hooks';
import { BlockEditProps } from '@wordpress/blocks';

import { CellBlockPro } from './cell';
import TableBlockPro from './table';

export interface ProBlockProps<T extends Record<string, any>> {
	props: BlockEditProps<T>;
	BlockEdit: any;
}

const BLOCKS_MAP = new Map<string, any>();
BLOCKS_MAP.set('tableberg/table', TableBlockPro);
BLOCKS_MAP.set('tableberg/cell', CellBlockPro);

const ProEnhancements = createHigherOrderComponent((BlockEdit) => {
	return (props) => {
		const ProBlock = BLOCKS_MAP.get(props.name);
		if (!ProBlock) {
			return <BlockEdit {...props} />;
		}
		return <ProBlock props={props} BlockEdit={BlockEdit} />;
	};
}, 'tableberg/pro-enhancements');

const PostsTableListener = createHigherOrderComponent((BlockEdit) => {
	return (props) => {
		//Only intercept tableberg table on creation screen
		if (props.name === 'tableberg/table' && props.attributes.cells === 0) {
			return <BlockEdit {...props} />;
		}

		return <BlockEdit {...props} />;
	};
}, 'tableberg/posts-table-listener');

addFilter('editor.BlockEdit', 'tableberg/cell', ProEnhancements);
addFilter('editor.BlockEdit', 'tableberg/posts-table', PostsTableListener);
