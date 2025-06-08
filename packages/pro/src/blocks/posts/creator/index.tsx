import { BlockEditProps, registerBlockType } from "@wordpress/blocks";
import metadata from "./block.json";
import { PostsTableIcon } from "@tableberg/shared/icons/table-creation";

function edit(props: BlockEditProps<any>) {
    const { clientId } = props;

    return <i>creator block</i>;
}

registerBlockType(metadata as any, {
    icon: PostsTableIcon,
    attributes: metadata.attributes as any,
    edit,
    save: () => null,
});
