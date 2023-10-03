import { createReduxStore, register, useSelect } from "@wordpress/data";
import { store as blockEditorStore } from "@wordpress/block-editor";

interface ITBStoreState {
    currentCellClientId: string;
    cellMultiSelect: boolean;
    selectedCells: string[];
}

const DEFAULT_STATE: ITBStoreState = {
    currentCellClientId: "",
    cellMultiSelect: false,
    selectedCells: [],
};

export const store = createReduxStore("tableberg-store", {
    reducer(state: ITBStoreState = DEFAULT_STATE, action) {
        switch (action.type) {
            case "SET_CURRENT_CELL":
                return {
                    ...state,
                    currentCellClientId: action.clientId,
                };
            case "SET_CELL_MULTI_SELECT":
                return {
                    ...state,
                    cellMultiSelect: true,
                    selectedCells: [state.currentCellClientId],
                };
            case "UNSET_CELL_MULTI_SELECT":
                return {
                    ...state,
                    cellMultiSelect: false,
                    selectedCells: [],
                };
            case "ADD_CELL_TO_MULTI_SELECT":
                return {
                    ...state,
                    selectedCells: [...state.selectedCells, action.clientId],
                };
            case "REMOVE_CELL_TO_MULTI_SELECT":
                return {
                    ...state,
                    selectedCells: state.selectedCells.filter(
                        (id) => id !== action.clientId
                    ),
                };
        }

        return state;
    },

    actions: {
        setCurrentCellClientId(clientId: string) {
            return {
                type: "SET_CURRENT_CELL",
                clientId,
            };
        },
        startCellMultiSelect() {
            return {
                type: "SET_CELL_MULTI_SELECT",
            };
        },
        endCellMultiSelect() {
            document
                .querySelectorAll(".multi-select")
                .forEach((el) => el.classList.remove("multi-select"));
            return {
                type: "UNSET_CELL_MULTI_SELECT",
            };
        },
        addCellToMultiSelect(clientId: string) {
            document
                .querySelector(`[data-block="${clientId}"]`)
                ?.classList.add("multi-select");
            return {
                type: "ADD_CELL_TO_MULTI_SELECT",
                clientId,
            };
        },
        removeCellFromMultiSelect(clientId: string) {
            document
                .querySelector(`[data-block="${clientId}"]`)
                ?.classList.remove("multi-select");
            return {
                type: "REMOVE_CELL_TO_MULTI_SELECT",
                clientId,
            };
        },
    },

    selectors: {
        getCurrentCellClientId(state: ITBStoreState) {
            return state.currentCellClientId;
        },
        isInMultiSelectMode(state: ITBStoreState) {
            return state.cellMultiSelect;
        },
        getCurrentSelectedCells(state: ITBStoreState) {
            return state.selectedCells;
        },
    },
});

register(store);
