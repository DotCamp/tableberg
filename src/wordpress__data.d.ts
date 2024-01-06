import blockEditorStoreSelectorTypes from "../node_modules/@types/wordpress__block-editor/store/selectors";
import blockEditorStoreActionsTypes from "../node_modules/@types/wordpress__block-editor/store/actions";

import editorStoreSelectorTypes from "../node_modules/@types/wordpress__editor/store/selectors";

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

type BlockEditorStoreSelectors = typeof blockEditorStoreSelectorTypes &
    blockEditorStoreSelectorCustomTypes;
type BlockEditorStoreActions = typeof blockEditorStoreActionsTypes &
    blockEditorStoreActionsCustomTypes;

type EditorStoreSelectors = typeof editorStoreSelectorTypes;
