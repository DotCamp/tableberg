import { createReduxStore, register } from "@wordpress/data";

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
    },
});

register(store);
