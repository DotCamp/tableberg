import { Borders } from "@wordpress/components/build-types/border-box-control/types";
import { Border } from "@wordpress/components/build-types/border-control/types";
import { RefObject } from "react";

interface MediaSize {
    height: number;
    width: number;
    url: string;
    orientation: string;
}
export interface MediaSizes {
    thumbnail?: MediaSize;
    medium?: MediaSize;
    large?: MediaSize;
    full?: MediaSize;
}

interface media {
    id: number;
    title: string;
    filename: string;
    url: string;
    link: string;
    alt: string;
    author: string;
    description: string;
    caption: string;
    name: string;
    status: string;
    uploadedTo: number;
    date: string;
    modified: string;
    menuOrder: number;
    mime: string;
    type: string;
    subtype: string;
    icon: string;
    dateFormatted: string;
    nonces: {
        update: string;
        delete: string;
        edit: string;
    };
    editLink: string;
    meta: boolean;
    authorName: string;
    authorLink: string;
    filesizeInBytes: number;
    filesizeHumanReadable: string;
    context: string;
    height: number;
    width: number;
    orientation: string;
    sizes: MediaSizes;
    compat: {
        item: string;
        meta: string;
    };
}

export interface AttributesTypes {
    media: media;
    height: string;
    width: string;
    alt: string;
    align: "left" | "center" | "right";
    aspectRatio: string;
    scale: string;
    sizeSlug: string;
    caption: string;
    href: string;
    linkClass: string;
    linkDestination: string;
    rel: string;
    linkTarget: string;
    border: Border | Borders;
    borderRadius: {
        topLeft: string;
        topRight: string;
        bottomLeft: string;
        bottomRight: string;
    };
    isExample: boolean;
}
export interface MainPropTypes {
    attributes: AttributesTypes;
    setAttributes: (attrs: object) => void;
}
export interface ExtendMainPropTypes extends MainPropTypes {
    showCaption: boolean;
    setShowCaption: (showCaption: boolean) => void;
    setIsEditingImage: (isImageEditing: boolean) => void;
}
export interface ImageTypes extends MainPropTypes {
    imageRef: RefObject<HTMLImageElement> | null;
}
