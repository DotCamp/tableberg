import HtmlBlockIcon from "../../../pro/src/blocks/html/icon";
import IconBlockIcon from "../../../pro/src/blocks/icon/icon";
import ListBlockIcon from "../../../pro/src/blocks/styled-list/icon";
import RibbonBlockIcon from "../../../pro/src/blocks/ribbon/icon";
import { BlockIcon as StarBlockIcon } from "../../../pro/src/blocks/star-rating/icons";
import { image, button, paragraph, list } from "@wordpress/icons";

const IMAGE_BASE = TABLEBERG_CFG.plugin_url + 'includes/Admin/images/upsell/';

export default [
    {
        name: "tableberg/paragraph",
        title: "Paragraph",
        icon: paragraph,
        isPro: false,
    },
    {
        name: "tableberg/list",
        title: "List",
        icon: list,
        isPro: false,
    },
    {
        name: "tableberg/button",
        title: "Button",
        icon: button,
        isPro: false,
    },
    {
        name: "tableberg/image",
        title: "Image",
        icon: image,
        isPro: false,
    },
    {
        name: "tableberg/styled-list",
        title: "Styled List",
        icon: ListBlockIcon,
        isPro: true,
        image:  IMAGE_BASE + "styled_list_block_1.png",
        upsellText: "Elevate your lists with customizable icons as bullets for a polished look."
    },
    {
        name: "tableberg/ribbon",
        title: "Ribbon",
        icon: RibbonBlockIcon,
        isPro: true,
        image:  IMAGE_BASE + "ribbon_block_1.png",
        upsellText: "Overlay a decorative ribbon on your table, ideal for highlighting special offers or important notices."
    },
    {
        name: "tableberg/html",
        title: "Custom Html",
        icon: HtmlBlockIcon,
        isPro: true,
        image:  IMAGE_BASE + "html_block_1.png",
        upsellText: "Add your own HTML code to create specialized content and integrate custom elements."
    },
    {
        name: "tableberg/icon",
        title: "Icon",
        icon: IconBlockIcon,
        isPro: true,
        image:  IMAGE_BASE + "icon_block_1.png",
        upsellText: "Add scalable icons to your tables to support text and enhance user engagement."
    },
    {
        name: "tableberg/star-rating",
        title: "Star Rating",
        icon: StarBlockIcon,
        isPro: true,
        image:  IMAGE_BASE + "star_rating_block_1.png",
        upsellText: "Add customizable star ratings, perfect for reviews and comparison tables."
    },
];