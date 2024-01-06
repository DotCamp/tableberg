/**
 * WordPress Dependencies
 */
import { isEmpty } from "lodash";
import { __ } from "@wordpress/i18n";
import {
    //@ts-ignore
    useBlockEditContext,
    //@ts-ignore
    __experimentalSpacingSizesControl as SpacingSizesControl,
} from "@wordpress/block-editor";
import { useSelect, useDispatch } from "@wordpress/data";
import { __experimentalToolsPanelItem as ToolsPanelItem } from "@wordpress/components";
import { SpacingPropTypes } from "../types";

function SpacingControl({
    label,
    attrKey,
    showByDefault = false,
}: SpacingPropTypes) {
    const { clientId } = useBlockEditContext();

    //@ts-ignore
    const attributes = useSelect(
        (select) =>
            //@ts-ignore
            select("core/block-editor").getSelectedBlock().attributes
    );
    const { updateBlockAttributes } = useDispatch("core/block-editor");

    const setAttributes = (newAttributes: object) => {
        updateBlockAttributes(clientId, newAttributes);
    };
    return (
        <>
            <ToolsPanelItem
                panelId={clientId}
                isShownByDefault={showByDefault}
                resetAllFilter={() => {
                    setAttributes({
                        [attrKey]: {},
                    });
                }}
                className={"tools-panel-item-spacing"}
                label={label}
                onDeselect={() => setAttributes({ [attrKey]: {} })}
                hasValue={() => !isEmpty(attributes[attrKey])}
            >
                <SpacingSizesControl
                    allowReset={true}
                    label={label}
                    values={attributes[attrKey]}
                    sides={["top", "right", "bottom", "left"]}
                    onChange={(newValue: any) => {
                        setAttributes({
                            [attrKey]: newValue,
                        });
                    }}
                />
            </ToolsPanelItem>
        </>
    );
}

export default SpacingControl;
