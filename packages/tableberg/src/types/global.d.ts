declare global {
    const TABLEBERG_CFG: {
        plugin_url: string;
        IS_PRO: boolean;
        [key: string]: any;
    };
    
    interface BlockEditorStoreActions {
        replaceBlock: (clientId: string, block: any) => void;
        replaceInnerBlocks: (clientId: string, blocks: any[]) => void;
        updateBlockAttributes: (clientId: string, attributes: any) => void;
    }
}

export {};