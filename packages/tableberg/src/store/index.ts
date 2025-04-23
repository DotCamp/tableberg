import { createReduxStore, register } from "@wordpress/data";
import { TablebergCellInstance } from "@tableberg/shared/types";
import { TablebergRenderMode } from "..";

interface ITBStoreState {
    tableId: string;
    minRow: number;
    maxRow: number;
    minCol: number;
    maxCol: number;

    indexes: number[];
    patterns: object[];
    categories: object[];
    renderMode: TablebergRenderMode;

    testmessage: string;
}

const DEFAULT_STATE: ITBStoreState = {
    tableId: '',
    indexes: [],

    minRow: Number.MAX_VALUE,
    maxRow: -1,

    minCol: Number.MAX_VALUE,
    maxCol: -1,
    patterns: [],
    categories: [],

    renderMode: "primary",

    testmessage: "none",
};

const context = (self || global) as typeof window & typeof global;
const tablebergPatterns = context.tablebergPatterns || [];
const tablebergCategories = context.tablebergPatternCategories || [];
DEFAULT_STATE.patterns = tablebergPatterns;
DEFAULT_STATE.categories = tablebergCategories;

export const store = createReduxStore('tableberg-store', {
    reducer(state: ITBStoreState = DEFAULT_STATE, action) {
        switch (action.type) {
            case "SET_MESSAGE":
                return {
                    ...state,
                    testmessage: action.message
                }
            case "SET_RENDER_MODE":
                return {
                    ...state,
                    renderMode: action.renderMode
                }
            case 'TOGGLE_CELL_SELECTION':
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
            case 'END_CELL_MULTI_SELECT':
                return { ...DEFAULT_STATE };
        }

        return state;
    },

    actions: {
        setTestMessage(message: string) {
            return {
                type: "SET_MESSAGE",
                message
            }
        },
        setRenderMode(renderMode: TablebergRenderMode) {
            return {
                type: "SET_RENDER_MODE",
                renderMode
            }
        },
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
                type: 'TOGGLE_CELL_SELECTION',
                tableId,
                cells,
                from,
                to,
            };
        },
        endCellMultiSelect(tableId: string) {
            return {
                type: 'END_CELL_MULTI_SELECT',
                tableId,
            };
        },
    },

    selectors: {
        getTestMessage(state: ITBStoreState) {
            return state.testmessage
        },
        getRenderMode(state: ITBStoreState) {
            return state.renderMode
        },
        isCellSelected(
            state: ITBStoreState,
            tableId: string,
            row: number,
            col: number
        ): boolean {
            return (
                state.tableId === tableId &&
                state.minCol <= col &&
                state.maxCol > col &&
                state.minRow <= row &&
                state.maxRow > row
            );
        },
        getSpans(state: ITBStoreState): { row: number; col: number } {
            return {
                row: state.maxRow - state.minRow,
                col: state.maxCol - state.minCol,
            };
        },

        getIndexes(
            state: ITBStoreState,
            tableId: string
        ): number[] | undefined {
            if (state.tableId !== tableId) {
                return;
            }
            return state.indexes;
        },
        getPatterns(state: ITBStoreState): object[] {
            return state.patterns;
        },
        getPatternCategories(state: ITBStoreState): object[] {
            return state.categories;
        },
    },
});

register(store);

type DynamicData = {
    fields: string[],
    rows: Record<string, any>[],
}

interface ITBPrivateStoreState {
    renderMode: TablebergRenderMode;
    testmessage: string;
    dynamicProps: {
        fields: string[];
    };

    dynamicData?: DynamicData;
}
const PRIVATE_STORE_DEFAULT_STATE: ITBPrivateStoreState = {
    renderMode: "primary",
    testmessage: "none",
    dynamicProps: {
        fields: []
    }
};

export const createPrivateStore = (clientId: string) => {
    const store = createReduxStore('tableberg-private-store-' + clientId, {
        reducer(state: ITBPrivateStoreState = PRIVATE_STORE_DEFAULT_STATE, action) {
            switch (action.type) {
                case "SET_MESSAGE":
                    return {
                        ...state,
                        testmessage: action.message
                    }
                case "SET_RENDER_MODE":
                    return {
                        ...state,
                        renderMode: action.renderMode
                    }
                case "SET_DYNAMIC_FIELD":
                    const newFields = JSON.parse(JSON.stringify(state.dynamicProps.fields));
                    newFields[action.col] = action.field;
                    return {
                        ...state,
                        dynamicProps: {
                            fields: newFields,
                        }
                    };
                case "SET_DYNAMIC_DATA":
                    return {
                        ...state,
                        dynamicData: action.data,
                    };
            }

            return state;
        },

        actions: {
            setTestMessage(message: string) {
                return {
                    type: "SET_MESSAGE",
                    message
                }
            },
            setRenderMode(renderMode: TablebergRenderMode) {
                return {
                    type: "SET_RENDER_MODE",
                    renderMode
                }
            },
            setDynamicData(data: DynamicData) {
                return {
                    type: "SET_DYNAMIC_DATA",
                    data
                };
            },
        },

        selectors: {
            getTestMessage(state: ITBPrivateStoreState) {
                return state.testmessage;
            },
            getRenderMode(state: ITBPrivateStoreState) {
                return state.renderMode;
            },
            getDynamicData(state: ITBPrivateStoreState): DynamicData | undefined {
                return state.dynamicData;
            },
        },
    })

    register(store);

    return store;
};
