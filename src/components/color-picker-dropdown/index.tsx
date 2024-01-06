import { Button, ColorIndicator, Dropdown } from "@wordpress/components";

import "./style.scss";
import { ColorPalette } from "@wordpress/block-editor";
import { Color } from "@wordpress/components/build-types/palette-edit/types";

export interface ColorPickerDropdownProps {
    label: string;
    value: string;
    onChange: (value?: string) => void;
    colors?: Color[];
}

const ColorPickerDropdown = (props: ColorPickerDropdownProps) => {
    return (
        <Dropdown
            className="tableberg-dropdown-color-picker"
            contentClassName="tbdcp-picker"
            popoverProps={{ placement: "bottom-start" }}
            renderToggle={({ isOpen, onToggle }) => (
                <Button
                    className="tbdcp-dropdown-handle"
                    onClick={onToggle}
                    aria-expanded={isOpen}
                >
                    <ColorIndicator colorValue={props.value} />
                    <label className="tbdcp-label">{props.label}</label>
                </Button>
            )}
            renderContent={() => (
                <ColorPalette
                    value={props.value}
                    onChange={props.onChange}
                    colors={props.colors || []}
                />
            )}
        />
    );
};

export default ColorPickerDropdown;
