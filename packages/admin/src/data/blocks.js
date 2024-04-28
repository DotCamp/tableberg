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
        image: "https://picsum.photos/400/250",
        upsellText: "Effortlessly create and customize interactive timelines to showcase your story or project milestones."
    },
    {
        name: "tableberg/list",
        title: "List",
        icon: list,
        isPro: false,
        image: "https://picsum.photos/400/250",
        upsellText: "Effortlessly create and customize interactive timelines to showcase your story or project milestones."
    },
    {
        name: "tableberg/button",
        title: "Button",
        icon: button,
        isPro: false,
        image: "https://picsum.photos/400/250",
        upsellText: "Effortlessly create and customize interactive timelines to showcase your story or project milestones."
    },
    {
        name: "tableberg/image",
        title: "Image",
        icon: image,
        isPro: false,
        image: "https://picsum.photos/400/250",
        upsellText: "Effortlessly create and customize interactive timelines to showcase your story or project milestones."
    },
    {
        name: "tableberg/styled-list",
        title: "Styled List",
        icon: ListBlockIcon,
        isPro: true,
        image: "https://picsum.photos/400/250",
        upsellText: "Effortlessly create and customize interactive timelines to showcase your story or project milestones."
    },
    {
        name: "tableberg/ribbon",
        title: "Ribbon",
        icon: RibbonBlockIcon,
        isPro: true,
        image: "https://picsum.photos/400/250",
        upsellText: "Effortlessly create and customize interactive timelines to showcase your story or project milestones."
    },
    {
        name: "tableberg/html",
        title: "Custom Html",
        icon: HtmlBlockIcon,
        isPro: true,
        image: "https://picsum.photos/400/250",
        upsellText: "Effortlessly create and customize interactive timelines to showcase your story or project milestones."
    },
    {
        name: "tableberg/icon",
        title: "Icon",
        icon: IconBlockIcon,
        isPro: true,
        image: "https://picsum.photos/400/250",
        upsellText: "Effortlessly create and customize interactive timelines to showcase your story or project milestones."
    },
    {
        name: "tableberg/star-rating",
        title: "Star Rating",
        icon: StarBlockIcon,
        isPro: true,
        image: "https://picsum.photos/400/250",
        upsellText: "Effortlessly create and customize interactive timelines to showcase your story or project milestones."
    },
];