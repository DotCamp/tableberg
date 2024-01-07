interface blockEditorStoreSelectorCustomTypes {
    getBlockParents: (clientId: string, ascending?: boolean) => string[];
}

interface blockEditorStoreActionsCustomTypes {
    moveBlocksToPosition: (
        clientIds: string | string[],
        fromRootClientId?: string,
        toRootClientId?: string,
        index?: number
    ) => void;
}

declare type BlockEditorStoreSelectors =
    typeof import("@wordpress/block-editor/store/selectors") &
        blockEditorStoreSelectorCustomTypes;
declare type BlockEditorStoreActions =
    typeof import("@wordpress/block-editor/store/actions") &
        blockEditorStoreActionsCustomTypes;

declare type EditorStoreSelectors =
    typeof import("@wordpress/editor/store/selectors");
