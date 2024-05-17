import { createReduxStore, register } from "@wordpress/data";
import { TablebergCellInstance } from "@tableberg/shared/types";

interface ITBStoreState {
    tableId: string;
    minRow: number;
    maxRow: number;
    minCol: number;
    maxCol: number;

    indexes: number[];
}


const DEFAULT_STATE: ITBStoreState = {
    tableId: '',
    indexes: [],

    minRow: Number.MAX_VALUE,
    maxRow: -1,

    minCol: Number.MAX_VALUE,
    maxCol: -1,
};

export const store = createReduxStore("tableberg-store", {
    reducer(state: ITBStoreState = DEFAULT_STATE, action) {
        switch (action.type) {
            case "TOGGLE_CELL_SELECTION":
                const cells = action.cells as TablebergCellInstance[];

                // @ts-ignore
                const newState: ITBStoreState = {
                    tableId: action.tableId,
                    minRow: action.from.row,
                    maxRow: action.to.row,

                    minCol: action.from.col,
                    maxCol: action.to.col,
                };

                const reCalculateState = (): number[] => {
                    const selectedIndexes: number[] = [];
                    for (let i = 0; i < cells.length; i++) {
                        const { row, col, colspan, rowspan } =
                            cells[i].attributes;

                        if (row >= newState.minRow && row < newState.maxRow) {
                            if (
                                col < newState.minCol &&
                                col + colspan > newState.minCol
                            ) {
                                newState.minCol = col;
                                return reCalculateState();
                            }
                            if (
                                col < newState.maxCol &&
                                col + colspan > newState.maxCol
                            ) {
                                newState.maxCol = col + colspan;
                                return reCalculateState();
                            }
                        }

                        if (col >= newState.minCol && col < newState.maxCol) {
                            if (
                                row < newState.minRow &&
                                row + rowspan > newState.minRow
                            ) {
                                newState.minRow = row;
                                return reCalculateState();
                            }
                            if (
                                row < newState.maxRow &&
                                row + rowspan > newState.maxRow
                            ) {
                                newState.maxRow = row + rowspan;
                                return reCalculateState();
                            }
                        }

                        if (
                            col >= newState.minCol &&
                            col < newState.maxCol &&
                            row >= newState.minRow &&
                            row < newState.maxRow
                        ) {
                            selectedIndexes.push(i);
                        }
                    }
                    return selectedIndexes;
                };

                newState.indexes = reCalculateState();
                return newState;

            case "END_CELL_MULTI_SELECT":
                return {...DEFAULT_STATE};
        }

        return state;
    },

    actions: {
        selectForMerge(
            tableId: string,
            cells: TablebergCellInstance[],
            from: {
                row: number;
                col: number;
            },
            to: {
                row: number;
                col: number;
            }
        ) {
            return {
                type: "TOGGLE_CELL_SELECTION",
                tableId,
                cells,
                from,
                to,
            };
        },
        endCellMultiSelect(tableId: string) {
            return {
                type: "END_CELL_MULTI_SELECT",
                tableId,
            };
        },
    },

    selectors: {
        getClassName(
            state: ITBStoreState,
            tableId: string,
            row: number,
            col: number
        ): string | undefined {
            
            if (
                state.tableId === tableId &&
                state.minCol <= col &&
                state.maxCol > col &&
                state.minRow <= row &&
                state.maxRow > row
            ) {
                return "is-multi-selected";
            }
        },
        getSpans(
            state: ITBStoreState,
        ): { row: number; col: number } {
            return {
                row: state.maxRow - state.minRow,
                col: state.maxCol - state.minCol,
            };
        },

        getIndexes(state: ITBStoreState, tableId: string): number[] | undefined {
            if (state.tableId !== tableId) {
                return;
            }
            return state.indexes;
        },
    },
});

register(store);
