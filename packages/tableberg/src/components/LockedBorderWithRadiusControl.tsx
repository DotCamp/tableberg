import { __experimentalBorderRadiusControl as RadiusControl } from "@wordpress/block-editor";
import {
    __experimentalToolsPanelItem as ToolsPanelItem,
    __experimentalBorderBoxControl as BorderBoxControl,
    PanelBody,
} from "@wordpress/components";
import LockedControl from "./LockedControl";

interface LockedBorderWithRadiusControlPropTypes {
    clientId: string;
    label: string;
    isShownByDefault?: boolean;
    children?: any;
    selected?: string;
    selectedRadius?: string;
}

export default function LockedBorderWithRadiusControl({
    clientId,
    label,
    isShownByDefault = false,
    children,
    selected,
    selectedRadius,
}: LockedBorderWithRadiusControlPropTypes) {
    return (
        <ToolsPanelItem
            panelId={clientId}
            isShownByDefault={isShownByDefault}
            resetAllFilter={() => null}
            hasValue={() => true}
            label={label}
            onDeselect={() => null}
        >
            <PanelBody
                title={label}
                initialOpen={isShownByDefault}
                className="tableberg-border-with-radius-control-handle"
            >
                {children}
                <LockedControl isEnhanced selected={selected}>
                    <BorderBoxControl
                        enableAlpha
                        size={"__unstable-large"}
                        label={label}
                        value={{}}
                        onChange={() => null}
                    />
                </LockedControl>
                <LockedControl isEnhanced selected={selectedRadius}>
                    <RadiusControl onChange={() => null} values="" />
                </LockedControl>
            </PanelBody>
        </ToolsPanelItem>
    );
}
