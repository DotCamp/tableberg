/**
 * WordPress Dependencies
 */
import { isEmpty } from "lodash";
import { __ } from "@wordpress/i18n";
import {
    useBlockEditContext,
    __experimentalBorderRadiusControl as RadiusControl,
} from "@wordpress/block-editor";
import {
    __experimentalToolsPanelItem as ToolsPanelItem,
} from "@wordpress/components";

interface BorderRadiusControlPropTypes {
    label: string;
    value: any;
    onChange: (newBorder: any) => any;
    resetAllFilter?: () => any;
    onDeselect: () => any;
    isShownByDefault?: boolean;
}

function BorderRadiusControl({
    label,
    isShownByDefault = true,
    value,
    onChange = () => {},
    resetAllFilter,
    onDeselect = () => {},
}: BorderRadiusControlPropTypes) {
    const { clientId } = useBlockEditContext();

    if (!resetAllFilter) {
        resetAllFilter = onDeselect;
    }

    const handleChange = (value: any) => {
        if (typeof value === "string") {
            // attributes does not support both string & object types
            onChange({
                topLeft: value,
                topRight: value,
                bottomLeft: value,
                bottomRight: value,
            });
            return;
        }
        onChange(value);
    }

    return (
        <ToolsPanelItem
            panelId={clientId}
            isShownByDefault={isShownByDefault}
            resetAllFilter={resetAllFilter}
            hasValue={() => !isEmpty(value)}
            label={label}
            onDeselect={onDeselect}
        >
            <RadiusControl
                onChange={handleChange}
                values={value}
            />
        </ToolsPanelItem>
    );
}

export default BorderRadiusControl;
