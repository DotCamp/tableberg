import { useBlockEditContext, __experimentalSpacingSizesControl as SpacingSizesControl } from "@wordpress/block-editor";
import { __experimentalToolsPanelItem as ToolsPanelItem } from "@wordpress/components";

interface Props {
    label: string;
    value: {
        top?: string;
        right?: string;
        bottom?: string;
        left?: string;
    };
    onChange: (newBorder: Record<string, string>) => any;
    resetAllFilter?: () => any;
    onDeselect?: () => any;
    isShownByDefault?: boolean;
}

const SpacingControl = ({
    label,
    value,
    onChange = () => { },
    resetAllFilter,
    onDeselect = () => { },
}: Props) => {
    const { clientId } = useBlockEditContext()

    if (!resetAllFilter) {
        resetAllFilter = onDeselect;
    }

    return <ToolsPanelItem
        panelId={clientId}
        isShownByDefault={true}
        resetAllFilter={resetAllFilter}
        className={"tools-panel-item-spacing"}
        label={label}
        onDeselect={onDeselect}
        hasValue={() => {
            if (!value) {
                return false;
            }
            const { top, right, bottom, left } = value;
            if (!top && !right && !bottom && !left) {
                return false;
            }
            return true;
        }}
    >
        <SpacingSizesControl
            allowReset={true}
            label={label}
            values={value}
            sides={["top", "right", "bottom", "left"]}
            onChange={onChange}
        />
    </ToolsPanelItem>
};

export default SpacingControl;
