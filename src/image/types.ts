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
  sizes: {
    thumbnail: {
      height: number;
      width: number;
      url: string;
      orientation: string;
    };
    medium: {
      height: number;
      width: number;
      url: string;
      orientation: string;
    };
    large: {
      height: number;
      width: number;
      url: string;
      orientation: string;
    };
    full: {
      url: string;
      height: number;
      width: number;
      orientation: string;
    };
  };
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
  aspectRatio: string;
  scale: string;
  sizeSlug: string;
  caption: string;
  href: string;
  linkClass: string;
  linkDestination: string;
  rel: string;
  linkTarget: string;
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
