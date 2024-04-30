import HtmlBlockIcon from "./icons/html";
import IconBlockIcon from "./icons/icon";
import ListBlockIcon from "./icons/styled-list";
import RibbonBlockIcon from "./icons/ribbon";
import { BlockIcon as StarBlockIcon } from "./icons/star-rating";
import { image, button, paragraph, list } from "@wordpress/icons";

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
        image: "styled_list_block_1.png",
        upsellText: "Elevate your lists with customizable icons as bullets for a polished look."
    },
    {
        name: "tableberg/ribbon",
        title: "Ribbon",
        icon: RibbonBlockIcon,
        isPro: true,
        image: "ribbon_block_1.png",
        upsellText: "Overlay a decorative ribbon on your table, ideal for highlighting special offers or important notices."
    },
    {
        name: "tableberg/html",
        title: "Custom Html",
        icon: HtmlBlockIcon,
        isPro: true,
        image: "html_block_1.png",
        upsellText: "Add your own HTML code to create specialized content and integrate custom elements."
    },
    {
        name: "tableberg/icon",
        title: "Icon",
        icon: IconBlockIcon,
        isPro: true,
        image: "icon_block_1.png",
        upsellText: "Add scalable icons to your tables to support text and enhance user engagement."
    },
    {
        name: "tableberg/star-rating",
        title: "Star Rating",
        icon: StarBlockIcon,
        isPro: true,
        image: "star_rating_block_1.png",
        upsellText: "Add customizable star ratings, perfect for reviews and comparison tables."
    },
];
