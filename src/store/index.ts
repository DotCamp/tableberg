import { createReduxStore, register } from "@wordpress/data";
import { BlockInstance } from "@wordpress/blocks";
import { TablebergCellBlockAttrs } from "../cell";

interface ITBStoreState {
    selectedCells: Map<number, Map<string, TablebergCellBlockAttrs>>;
    selectedIds: Set<string>;
    minRow: number;
    maxRow: number;
    minCol: number;
    maxCol: number;
    isMergable: boolean;
}

const DEFAULT_STATE = {
    minRow: Number.MAX_VALUE,
    maxRow: -1,
    minCol: Number.MAX_VALUE,
    maxCol: -1,
    isMergable: false,
};

const isMergable = (state: ITBStoreState): boolean => {
    const rows = state.selectedCells;
    const filledBoxes = new Set<string>();
    rows.forEach((row) => {
        row.forEach((cell) => {
            for (let i = 0; i < cell.colspan; i++) {
                for (let j = 0; j < cell.rowspan; j++) {
                    filledBoxes.add(`${cell.row + j}x${cell.col + i}`);
                }
            }
        });
    });

    console.log(filledBoxes);

    if (filledBoxes.size < 2) {
        return false;
    }

    for (let row = state.minRow; row <= state.maxRow; row++) {
        for (let col = state.minCol; col <= state.maxCol; col++) {
            if (!filledBoxes.has(`${row}x${col}`)) {
                console.log(`Fail at: ${row}x${col}`);
                
                return false;
            }
        }
    }

    return true;
};

export const store = createReduxStore("tableberg-store", {
    reducer(
        state: ITBStoreState = {
            ...DEFAULT_STATE,
            selectedCells: new Map(),
            selectedIds: new Set(),
        },
        action,
    ) {
        switch (action.type) {
            case "TOGGLE_CELL_SELECTION":
                const updatedSelection = state.selectedCells;
                const rowIdx = action.attributes.row;
                const row = updatedSelection.get(rowIdx);
                const attrs = action.attributes as TablebergCellBlockAttrs;

                if (!row) {
                    const row = new Map();
                    row.set(action.clientId, attrs);
                    updatedSelection.set(rowIdx, row);
                } else {
                    if (!row.delete(action.clientId)) {
                        row.set(action.clientId, attrs);
                    }
                    if (row.size === 0) {
                        updatedSelection.delete(rowIdx);
                    }
                }

                if (!state.selectedIds.delete(action.clientId)) {
                    state.selectedIds.add(action.clientId);

                    state.maxRow = Math.max(
                        state.maxRow,
                        attrs.row + attrs.rowspan - 1,
                    );
                    state.minRow = Math.min(state.minRow, attrs.row);
                    state.maxCol = Math.max(
                        state.maxCol,
                        attrs.col + attrs.colspan - 1,
                    );
                    state.minCol = Math.min(state.minCol, attrs.col);
                } else if (
                    attrs.col == state.minCol ||
                    attrs.col == state.maxCol ||
                    attrs.row == state.minRow ||
                    attrs.row == state.maxRow
                ) {
                    let minCol = Number.MAX_VALUE,
                        maxCol = -1,
                        minRow = Number.MAX_VALUE,
                        maxRow = -1;
                    state.selectedCells.forEach((row) => {
                        row.forEach((cell) => {
                            maxRow = Math.max(
                                maxRow,
                                cell.row + cell.rowspan - 1,
                            );
                            minRow = Math.min(minRow, cell.row);
                            maxCol = Math.max(
                                maxCol,
                                cell.col + cell.colspan - 1,
                            );
                            minCol = Math.min(minCol, cell.col);
                        });
                    });
                    state.minCol = minCol;
                    state.maxCol = maxCol;
                    state.minRow = minRow;
                    state.maxRow = maxRow;
                }

                state.isMergable = isMergable(state);

                return {
                    ...state,
                    selectedCells: updatedSelection,
                };
            case "END_CELL_MULTI_SELECT":
                return {
                    ...state,
                    ...DEFAULT_STATE,
                    selectedCells: new Map(),
                    selectedIds: new Set(),
                };
        }

        return state;
    },

    actions: {
        toggleCellSelection(cell: BlockInstance<TablebergCellBlockAttrs>) {
            return {
                type: "TOGGLE_CELL_SELECTION",
                clientId: cell.clientId,
                attributes: cell.attributes,
            };
        },
        endCellMultiSelect() {
            return {
                type: "END_CELL_MULTI_SELECT",
            };
        },
    },

    selectors: {
        getCurrentSelectedCells(state: ITBStoreState): Set<string> {
            return state.selectedIds;
        },

        getClassName(
            state: ITBStoreState,
            clientId: string,
        ): string | undefined {
            if (state.selectedIds.has(clientId)) {
                return "is-multi-selected";
            }
        },
        isMergable(state: ITBStoreState): boolean {
            return state.isMergable;
        },
        getSpans(state: ITBStoreState): { row: number; col: number } {
            return {
                row: state.maxRow - state.minRow + 1,
                col: state.maxCol - state.minCol + 1,
            };
        },
    },
});

register(store);
