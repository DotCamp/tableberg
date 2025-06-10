import React from "react";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, SelectControl } from "@wordpress/components";

/**
 * Represents the structure of a select control option.
 */
export interface SelectControlOption {
    label: string;
    value: string;
    disabled?: boolean;
}

/**
 * Types of selection control row.
 */
type SelectionControlRowType = "selection" | "withButton";

/**
 * Props for the SelectionControlRow component.
 */
interface SelectionControlRowProps {
    value: string;
    onChange: (value: string) => void;
    options: Array<SelectControlOption>;
    disabled?: boolean;
    label?: string;
    type?: SelectionControlRowType;
    onButtonClick?: () => void;
    buttonDisabled?: boolean;
}

/**
 * Props for the SelectedOptionRow component.
 */
interface SelectedOptionRowProps {
    label: string;
    value: string;
    onDelete: (value: string) => void;
}

export const SelectedOptionRow: React.FC<SelectedOptionRowProps> = ({
    label,
    value,
    onDelete,
}) => {
    return (
        <div className={"tableberg-selected-option-row"}>
            <div>{label}</div>
            <button
                className={"tableberg-selected-option-row__delete-button"}
                title={"Delete"}
                onClick={() => onDelete(value)}
            >
                <FontAwesomeIcon
                    className={
                        "tableberg-selected-option-row__delete-button__icon"
                    }
                    icon={faClose}
                />
            </button>
        </div>
    );
};

/**
 * Component for rendering a row with a selection control and an optional button.
 * @param props                Component properties.
 * @param props.value          Value of current selection.
 * @param props.onChange       Function to handle value change.
 * @param props.options        Options for the select control.
 * @param props.disabled       Whether the control is disabled.
 * @param props.label          Label for the select control.
 * @param props.type           Type of selection control row.
 * @param props.onButtonClick  Function to handle button click if it is enabled.
 * @param props.buttonDisabled Whether the button is disabled.
 */
export const SelectionControlRow: React.FC<SelectionControlRowProps> = ({
    value,
    onChange,
    options,
    disabled = false,
    label = "",
    type = "selection",
    onButtonClick = () => {},
    buttonDisabled = false,
}) => {
    return (
        <div style={{ width: "100%", display: "flex", gap: "5px" }}>
            <div style={{ width: "100%" }}>
                <SelectControl
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                    label={label}
                    labelPosition={"side"}
                    value={value}
                    onChange={onChange}
                    options={options}
                    disabled={disabled}
                />
            </div>
            {type === "withButton" && (
                <Button
                    className="blocks-table__placeholder-button"
                    variant="secondary"
                    onClick={() => onButtonClick()}
                    type="button"
                    style={{ minHeight: "100%" }}
                    disabled={buttonDisabled}
                >
                    Add
                </Button>
            )}
        </div>
    );
};

export default SelectionControlRow;
