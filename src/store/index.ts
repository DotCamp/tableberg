import { createReduxStore, register } from "@wordpress/data";
import { BlockInstance } from "@wordpress/blocks";
import { TablebergCellBlockAttrs } from "../cell";

interface ITBStoreState {
    selectedIds: Set<string>;
    blockSizes: Map<
        number,
        {
            start: number;
            end: number;
        }
    >;

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


export const store = createReduxStore("tableberg-store", {
    reducer(
        state: ITBStoreState = {
            ...DEFAULT_STATE,
            selectedIds: new Set(),
            blockSizes: new Map(),
        },
        action
    ) {
        switch (action.type) {
            case "TOGGLE_CELL_SELECTION":
                const updatedSelection = state.selectedIds;
                const attrs = action.attributes as TablebergCellBlockAttrs;

                const rowEnd = attrs.row + attrs.rowspan;
                const colEnd = attrs.col + attrs.colspan;

                const sizeInfo = state.blockSizes.get(attrs.row);

                if (!updatedSelection.delete(action.clientId)) {
                    updatedSelection.add(action.clientId);
                    if (sizeInfo) {
                        sizeInfo.start = Math.min(attrs.col, sizeInfo.start);
                        sizeInfo.end = Math.max(colEnd, sizeInfo.end);
                    } else {
                        state.blockSizes.set(attrs.row, {
                            start: attrs.col,
                            end: colEnd,
                        });
                    }

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
                        state.blockSizes.forEach((sizeInfo, row) => {
                            state.minCol = Math.min(
                                state.minCol,
                                sizeInfo.start
                            );
                            state.maxCol = Math.max(state.maxCol, sizeInfo.end);

                            state.minRow = Math.min(state.minRow, row);
                            state.maxRow = Math.max(state.maxRow, row);
                        });
                    }
                }
                

                state.isMergable =
                    state.area > 0 &&
                    state.area ==
                        (state.maxCol - state.minCol) *
                            (state.maxRow - state.minRow);

                return {
                    ...state,
                    selectedIds: updatedSelection,
                };
            case "END_CELL_MULTI_SELECT":
                return {
                    ...DEFAULT_STATE,
                    blockSizes: new Map(),
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
            clientId: string
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
