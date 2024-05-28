import { BlockEditProps, registerBlockType } from "@wordpress/blocks";
import { useDispatch, useSelect } from "@wordpress/data";
import { store } from "@wordpress/block-editor";
import UpsellModal from "../components/UpsellModal";

import StyledListMeta from "./styled-list-dummy/block.json";
import HtmlMeta from "./html-dummy/block.json";
import IconMeta from "./icon-dummy/block.json";
import RibbonMeta from "./ribbon-dummy/block.json";
import StarRatingMeta from "./star-rating-dummy/block.json";

import HtmlIcon from "@tableberg/shared/icons/html";
import StyledListIcon from "@tableberg/shared/icons/styled-list";
import IconIcon from "@tableberg/shared/icons/icon";
import RibbonIcon from "@tableberg/shared/icons/ribbon";
import StarRatingIcon from "@tableberg/shared/icons/star-rating";
import { createPortal } from "react-dom";

function edit({ clientId }: BlockEditProps<{}>) {
    // @ts-ignore
    const { removeBlock } = useDispatch(store) as BlockEditorStoreActions;
    const { blockName } = useSelect((select) => {
        const block = (select(store) as BlockEditorStoreSelectors).getBlock(
            clientId,
        )!;
        return {
            blockName: block.name,
        };
    }, []);
    return createPortal(
        <UpsellModal
            onClose={() => removeBlock(clientId)}
            selected={blockName}
        />,
        document.body,
    );
}

const register = (metadata: any, icon: any) => {
    registerBlockType(metadata.name, {
        title: metadata.title,
        category: metadata.category,
        icon,
        edit,
    });
};

if (!TABLEBERG_CFG.IS_PRO) {
    register(StyledListMeta, StyledListIcon);
    register(HtmlMeta, HtmlIcon);
    register(IconMeta, IconIcon);
    register(RibbonMeta, RibbonIcon);
    register(StarRatingMeta, StarRatingIcon);
}

