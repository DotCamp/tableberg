import { createReduxStore, register } from "@wordpress/data";
import { BlockInstance } from "@wordpress/blocks";
import { createContext } from "@wordpress/element";
import { TablebergCellBlockAttrs, TablebergCellInstance } from "../cell";

interface ITBStoreState {
    selectedBlocks: Map<string, TablebergCellBlockAttrs>;

    minRow: number;
    maxRow: number;
    minCol: number;
    maxCol: number;
    area: number;
    isMergable: boolean;
}

const DEFAULT_STATE = {
    minRow: Number.MAX_VALUE,
    maxRow: -1,

    minCol: Number.MAX_VALUE,
    maxCol: -1,
    isMergable: false,
    area: 0,
};
/*
const logMergabilityInfo = (state: ITBStoreState, tag: string) => {
    console.log(tag, {
        area: state.area,
        colDiff: state.maxCol - state.minCol,
        maxRow: state.maxRow,
        minRow: state.minRow,
    });
};
*/

export const store = createReduxStore("tableberg-store", {
    reducer(
        state: ITBStoreState = {
            ...DEFAULT_STATE,
            selectedBlocks: new Map(),
        },
        action
    ) {
        switch (action.type) {
            case "TOGGLE_CELL_SELECTION":
                const updatedSelection = state.selectedBlocks;
                const attrs = action.attributes as TablebergCellBlockAttrs;

                const rowEnd = attrs.row + attrs.rowspan;
                const colEnd = attrs.col + attrs.colspan;

                // logMergabilityInfo(state, "Before: ");

                if (!updatedSelection.delete(action.clientId)) {
                    updatedSelection.set(action.clientId, attrs);

                    state.maxRow = Math.max(state.maxRow, rowEnd);
                    state.minRow = Math.min(state.minRow, attrs.row);
                    state.maxCol = Math.max(state.maxCol, colEnd);
                    state.minCol = Math.min(state.minCol, attrs.col);

                    state.area += attrs.rowspan * attrs.colspan;
                } else {
                    state.area -= attrs.rowspan * attrs.colspan;

                    if (
                        attrs.col <= state.minCol ||
                        colEnd >= state.maxCol ||
                        attrs.row <= state.minRow ||
                        rowEnd >= state.maxRow
                    ) {
                        state.minCol = Number.MAX_VALUE;
                        state.maxCol = 0;
                        state.minRow = Number.MAX_VALUE;
                        state.maxRow = 0;

                        state.selectedBlocks.forEach((attrs) => {
                            state.minCol = Math.min(state.minCol, attrs.col);
                            state.maxCol = Math.max(
                                state.maxCol,
                                attrs.col + attrs.colspan
                            );

                            state.minRow = Math.min(state.minRow, attrs.row);
                            state.maxRow = Math.max(
                                state.maxRow,
                                attrs.row + attrs.rowspan
                            );
                        });
                    }
                }

                state.isMergable =
                    state.area > 0 &&
                    state.area ==
                        (state.maxCol - state.minCol) *
                            (state.maxRow - state.minRow);

                // logMergabilityInfo(state, "After: ");

                return {
                    ...state,
                    selectedIds: updatedSelection,
                };

            case "START_FROM_NATIVE":
                const selectedBlocks = new Map();
                const newState = {
                    ...DEFAULT_STATE,
                    selectedBlocks,
                };

                for (let i = 0; i < action.cells.length; i++) {
                    const cell = action.cells[i] as TablebergCellInstance;
                    if (cell.name !== "tableberg/cell") {
                        return state;
                    }
                    selectedBlocks.set(cell.clientId, cell.attributes);
                    const attrs = cell.attributes;
                    newState.maxRow = Math.max(
                        newState.maxRow,
                        attrs.row + attrs.rowspan
                    );
                    newState.minRow = Math.min(newState.minRow, attrs.row);
                    newState.maxCol = Math.max(
                        newState.maxCol,
                        attrs.col + attrs.colspan
                    );
                    newState.minCol = Math.min(newState.minCol, attrs.col);
                    newState.area += attrs.rowspan * attrs.colspan;
                }
                newState.isMergable =
                    newState.area > 0 &&
                    newState.area ==
                        (newState.maxCol - newState.minCol) *
                            (newState.maxRow - newState.minRow);

                return newState;

            case "END_CELL_MULTI_SELECT":
                return {
                    ...DEFAULT_STATE,
                    selectedBlocks: new Map(),
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
        startMultiSelectNative(cells: TablebergCellInstance[]) {
            return {
                type: "START_FROM_NATIVE",
                cells,
            };
        },
        endCellMultiSelect() {
            return {
                type: "END_CELL_MULTI_SELECT",
            };
        },
    },

    selectors: {
        getCurrentSelectedCells(
            state: ITBStoreState
        ): Map<string, TablebergCellBlockAttrs> {
            return state.selectedBlocks;
        },

        getClassName(
            state: ITBStoreState,
            clientId: string
        ): string | undefined {
            if (state.selectedBlocks.has(clientId)) {
                return "tableberg-merge-selected is-multi-selected";
            }
        },
        isMergable(state: ITBStoreState): boolean {
            return state.isMergable;
        },
        getSpans(state: ITBStoreState): { row: number; col: number } {
            return {
                row: state.maxRow - state.minRow,
                col: state.maxCol - state.minCol,
            };
        },
    },
});

register(store);


interface TablebergCtx {
    rootEl?: HTMLElement;
    cellTag?: "div";
}

export const TablebergCtx = createContext<TablebergCtx>({});