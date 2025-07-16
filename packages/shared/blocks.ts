import HtmlBlockIcon from "./icons/html";
import IconBlockIcon from "./icons/icon";
import ListBlockIcon from "./icons/styled-list";
import RibbonBlockIcon from "./icons/ribbon";
import blockIcon from "./icons/tableberg";
import { BlockIcon as StarBlockIcon } from "./icons/star-rating";
import { image, button, paragraph, list } from "@wordpress/icons";

export default [
    {
        name: "core/paragraph",
        title: "Paragraph",
        icon: paragraph,
        isPro: false,
    },
    {
        name: "core/list",
        title: "List",
        icon: list,
        isPro: false,
        demoUrl:
            "https://tableberg.com/docs/how-to-add-a-list-to-a-table-in-wordpress/",
    },
    {
        name: "tableberg/button",
        title: "Button",
        icon: button,
        isPro: false,
        demoUrl:
            "https://tableberg.com/docs/how-to-add-buttons-to-wordpress-tables/",
    },
    {
        name: "tableberg/image",
        title: "Image",
        icon: image,
        isPro: false,
        demoUrl:
            "https://tableberg.com/docs/how-to-add-images-to-a-table-in-wordpress/",
    },
    {
        name: "tableberg/styled-list",
        title: "Styled List",
        icon: ListBlockIcon,
        isPro: true,
        image: "styled_list_block_1.png",
        upsellText:
            "Elevate your lists with customizable icons as bullets for a polished look.",
        demoUrl:
            "https://tableberg.com/docs/how-to-add-styled-lists-in-wordpress-tables/",
    },
    {
        name: "tableberg/ribbon",
        title: "Ribbon",
        icon: RibbonBlockIcon,
        isPro: true,
        image: "ribbon_block_1.png",
        upsellText:
            "Overlay a decorative ribbon on your table, ideal for highlighting special offers or important notices.",
        demoUrl:
            "https://tableberg.com/docs/how-to-add-ribbons-to-wordpress-tables/",
    },
    {
        name: "tableberg/html",
        title: "Custom Html",
        icon: HtmlBlockIcon,
        isPro: true,
        image: "html_block_1.png",
        upsellText:
            "Add your own HTML code to create specialized content and integrate custom elements.",
        demoUrl:
            "https://tableberg.com/docs/how-to-add-custom-html-to-wordpress-tables/",
    },
    {
        name: "tableberg/icon",
        title: "Icon",
        icon: IconBlockIcon,
        isPro: true,
        image: "icon_block_1.png",
        upsellText:
            "Add scalable icons to your tables to support text and enhance user engagement.",
        demoUrl:
            "https://tableberg.com/docs/how-to-add-icons-to-wordpress-tables/",
    },
    {
        name: "tableberg/star-rating",
        title: "Star Rating",
        icon: StarBlockIcon,
        isPro: true,
        image: "star_rating_block_1.png",
        upsellText:
            "Add customizable star ratings, perfect for reviews and comparison tables.",
        demoUrl:
            "https://tableberg.com/docs/how-to-add-star-rating-in-wordpress/",
    },
];

export const ENHANCED_FEATURES = [
    {
        name: "empty-cell",
        title: "Empty Cell",
        icon: blockIcon,
        upsellText:
            "<strong>Empty Cell</strong> is not available in the free version. Please get the PRO add-on to unlock all exclusive features.",
    },
    {
        name: "cell-orientation",
        title: "Cell Orientation",
        icon: blockIcon,
        upsellText:
            "<strong>Cell Orientation</strong> is not available in the free version. Please get the PRO add-on to unlock all exclusive features.",
    },
    {
        name: "sticky-top-row",
        title: "Sticky Top Row",
        icon: blockIcon,
        upsellText:
            "<strong>Sticky Top Row</strong> is not available in the free version. Please get the PRO add-on to unlock all exclusive features.",
    },
    {
        name: "sticky-first-col",
        title: "Sticky First Column",
        icon: blockIcon,
        upsellText:
            "<strong>Sticky First Column</strong> is not available in the free version. Please get the PRO add-on to unlock all exclusive features.",
    },
    {
        name: "cell-bg",
        title: "Individual Cell Background",
        icon: blockIcon,
        upsellText:
            "<strong>Individual Cell Background</strong> is not available in the free version. Please get the PRO add-on to unlock all exclusive features.",
    },
    {
        name: "row-bg",
        title: "Individual Row Background",
        icon: blockIcon,
        upsellText:
            "<strong>Individual Row Background</strong> is not available in the free version. Please get the PRO add-on to unlock all exclusive features.",
    },
    {
        name: "col-bg",
        title: "Individual Column Background",
        icon: blockIcon,
        upsellText:
            "<strong>Individual Column Background</strong> is not available in the free version. Please get the PRO add-on to unlock all exclusive features.",
    },
    {
        name: "col-border",
        title: "Individual Column Border",
        icon: blockIcon,
        upsellText:
            "<strong>Individual Column Border</strong> is not available in the free version. Please get the PRO add-on to unlock all exclusive features.",
    },
    {
        name: "col-border-radius",
        title: "Individual Column Border Radius",
        icon: blockIcon,
        upsellText:
            "<strong>Individual Column Border Radius</strong> is not available in the free version. Please get the PRO add-on to unlock all exclusive features.",
    },
    {
        name: "row-border",
        title: "Individual Row Border",
        icon: blockIcon,
        upsellText:
            "<strong>Individual Row Border</strong> is not available in the free version. Please get the PRO add-on to unlock all exclusive features.",
    },
    {
        name: "row-border-radius",
        title: "Individual Row Border Radius",
        icon: blockIcon,
        upsellText:
            "<strong>Individual Row Border Radius</strong> is not available in the free version. Please get the PRO add-on to unlock all exclusive features.",
    },
    {
        name: "duplicate-row-col",
        title: "Duplicate Rows and Columns",
        icon: blockIcon,
        upsellText:
            "<strong>Duplicate Rows and Columns</strong> is not available in the free version. Please get the PRO add-on to unlock all exclusive features.",
    },
    {
        name: "move-row-col",
        title: "Move Rows and Columns",
        icon: blockIcon,
        upsellText:
            "<strong>Move Rows and Columns</strong> is not available in the free version. Please get the PRO add-on to unlock all exclusive features.",
    },
    {
        name: "row-only-border",
        title: "Row Only Border",
        icon: blockIcon,
        upsellText:
            "<strong>Row Only Border</strong> is not available in the free version. Please get the PRO add-on to unlock all exclusive features.",
    },
    {
        name: "col-only-border",
        title: "Column Only Border",
        icon: blockIcon,
        upsellText:
            "<strong>Column Only Border</strong> is not available in the free version. Please get the PRO add-on to unlock all exclusive features.",
    },
    {
        name: "search",
        title: "Search",
        icon: blockIcon,
        upsellText:
            "<strong>Search</strong> is not available in the free version. Please get the PRO add-on to unlock all exclusive features.",
    },
    {
        name: "sorting",
        title: "Sorting",
        icon: blockIcon,
        upsellText:
            "<strong>Sorting</strong> is not available in the free version. Please get the PRO add-on to unlock all exclusive features.",
    },
    {
        name: "product-table",
        title: "Product Table",
        icon: blockIcon,
        upsellText:
            "<strong>Product Table</strong> is not available in the free version. Please get the PRO add-on to unlock all exclusive features.",
    },
] as const;
