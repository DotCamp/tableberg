import { registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';

function edit() {
	return <div>posts table</div>;
}

registerBlockType(metadata, {
	attributes: metadata.attributes,
	edit,
	save: () => {
		return <i>here</i>;
	},
});
