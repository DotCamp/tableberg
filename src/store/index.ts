import {
    createReduxStore,
    register,
    createRegistrySelector,
} from "@wordpress/data";
import { store as blockEditorStore } from "@wordpress/block-editor";
import { BlockInstance } from "@wordpress/blocks";

interface ITBStoreState {
    selectedCells: string[];
}

const DEFAULT_STATE: ITBStoreState = {
    selectedCells: [],
};

export const store = createReduxStore("tableberg-store", {
    reducer(state: ITBStoreState = DEFAULT_STATE, action) {
        switch (action.type) {
            case "TOGGLE_CELL_SELECTION":
                const updatedSelection = state.selectedCells;
                const index = updatedSelection.indexOf(action.clientId);
                if (index > -1) {
                    updatedSelection.splice(index, 1);
                } else {
                    updatedSelection.push(action.clientId);
                }

                return {
                    ...state,
                    selectedCells: updatedSelection,
                };
            case "END_CELL_MULTI_SELECT":
                return {
                    ...state,
                    selectedCells: [],
                };
        }

        return state;
    },

    actions: {
        toggleCellSelection(clientId: string) {
            const cell = document.querySelector(`[data-block="${clientId}"]`);

            if (cell?.classList.contains("is-multi-selected")) {
                cell.classList.remove("is-multi-selected");
            } else {
                cell?.classList.add("is-multi-selected");
            }

            return {
                type: "TOGGLE_CELL_SELECTION",
                clientId,
            };
        },
        endCellMultiSelect() {
            document.querySelectorAll(".is-multi-selected").forEach((cell) => {
                cell.classList.remove("is-multi-selected");
            });

            return {
                type: "END_CELL_MULTI_SELECT",
            };
        },
    },

    selectors: {
        getCurrentSelectedCells(state: ITBStoreState) {
            return state.selectedCells;
        },
        getCellsStructure: createRegistrySelector(
            (select: any) => (_: ITBStoreState, clientId: string) => {
                const { getBlockParents, getBlockName, getBlock } =
                    select(blockEditorStore);
                const parentBlocks = getBlockParents(clientId);

                const tableBlockId = parentBlocks.find(
                    (parentId: string) =>
                        getBlockName(parentId) === "tableberg/table"
                );
                const tableBlock: BlockInstance = getBlock(tableBlockId);
                return tableBlock.innerBlocks
                    .map((row, rowIndex) => {
                        let colMod = 0;
                        let rowMod = 0;

                        const rowStructure = row.innerBlocks.map(
                            ({ clientId, attributes }, cellIndex) => {
                                const colspan = Number(attributes.colspan);
                                const rowspan = Number(attributes.rowspan);

                                colMod += colspan - 1;
                                rowMod += rowspan - 1;

                                return {
                                    clientId: clientId,
                                    colIndex: cellIndex + colMod,
                                    colspan: colspan,
                                    rowIndex: rowIndex + rowMod,
                                    rowspan: rowspan,
                                };
                            }
                        );
                        return rowStructure;
                    })
                    .flat();
            }
        ),
    },
});

register(store);


export const RAW_TR_STORE: Record<number, HTMLElement | null> = {};