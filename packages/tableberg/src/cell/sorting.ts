export const sortTableV = (
    tableBlockID: string,
    byCol: number,
    storeSelect: BlockEditorStoreSelectors,
    storeAction: BlockEditorStoreActions,
) => {
    const tableBlock = storeSelect.getBlock(tableBlockID)!;
    storeAction.updateBlockAttributes(tableBlockID, {
        sort: {
            vertical: {
                enabled: true,
                order:
                    tableBlock.attributes.sort?.vertical?.order === "asc"
                        ? "desc"
                        : "asc",
                col: byCol,
            },
            horizontal: tableBlock.attributes.sort?.horizontal,
        },
    });
};

export const sortTableH = (
    tableBlockID: string,
    byRow: number,
    storeSelect: BlockEditorStoreSelectors,
    storeAction: BlockEditorStoreActions,
) => {
    const tableBlock = storeSelect.getBlock(tableBlockID)!;
    storeAction.updateBlockAttributes(tableBlockID, {
        sort: {
            horizontal: {
                enabled: true,
                order:
                    tableBlock.attributes.sort?.horizontal?.order === "asc"
                        ? "desc"
                        : "asc",
                row: byRow,
            },
            vertical: tableBlock.attributes.sort?.vertical,
        },
    });
};
