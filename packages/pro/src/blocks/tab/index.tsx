import { registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';


function edit() {
    return <></>
}

function save() {
    return <></>
}

registerBlockType(metadata as any, {
    attributes: metadata.attributes as any,
    edit: edit,
    save: save
})
