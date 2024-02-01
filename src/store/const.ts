let OWNER_DOCUMENT: Document = document;

export const setOwnerDocument = (doc: Document) => {
    OWNER_DOCUMENT = doc;
}

export const getOwnerDocument = () => OWNER_DOCUMENT;