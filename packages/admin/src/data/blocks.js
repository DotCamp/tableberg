import HtmlBlockIcon from "../../../pro/src/blocks/html/Icon";
import IconBlockIcon from "../../../pro/src/blocks/icon/Icon";
import ListBlockIcon from "../../../pro/src/blocks/styled-list/icon";
import RibbonBlockIcon from "../../../pro/src/blocks/ribbon/Icon";
import { BlockIcon as StarBlockIcon } from "../../../pro/src/blocks/star-rating/icons";
import { image, button } from "@wordpress/icons";

export default [
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
        title: "Html",
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
    }
];
