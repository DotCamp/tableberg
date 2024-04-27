import HtmlBlockIcon from "../../../pro/src/blocks/html/icon";
import IconBlockIcon from "../../../pro/src/blocks/icon/icon";
import ListBlockIcon from "../../../pro/src/blocks/styled-list/icon";
import RibbonBlockIcon from "../../../pro/src/blocks/ribbon/icon";
import { BlockIcon as StarBlockIcon } from "../../../pro/src/blocks/star-rating/icons";
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
    },
    {
        name: "tableberg/ribbon",
        title: "Ribbon",
        icon: RibbonBlockIcon,
        isPro: true,
    },
    {
        name: "tableberg/html",
        title: "Custom Html",
        icon: HtmlBlockIcon,
        isPro: true,
    },
    {
        name: "tableberg/icon",
        title: "Icon",
        icon: IconBlockIcon,
        isPro: true,
    },
    {
        name: "tableberg/star-rating",
        title: "Star Rating",
        icon: StarBlockIcon,
        isPro: true,
    },
];
