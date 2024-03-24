/**
 * WordPress Dependencies
 */
import { isEmpty } from "lodash";
import { __ } from "@wordpress/i18n";
import {
    useBlockEditContext,
    __experimentalSpacingSizesControl as SpacingSizesControl,
    store as blockEditorStore,
} from "@wordpress/block-editor";
import { useSelect, useDispatch } from "@wordpress/data";
import { __experimentalToolsPanelItem as ToolsPanelItem } from "@wordpress/components";
import { SpacingPropTypes } from "../types";

function SpacingControl({
    label,
    attrKey,
    showByDefault = false,
    sides
}: SpacingPropTypes) {

    sides ||= ["top", "right", "bottom", "left"];

    const { clientId } = useBlockEditContext();
    const attributes = useSelect(
        (select) =>
            (
                select(blockEditorStore) as BlockEditorStoreSelectors
            ).getSelectedBlock()?.attributes,
        []
    )!;
    const { updateBlockAttributes } = useDispatch(
        blockEditorStore
    ) as BlockEditorStoreActions;

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
                    sides={sides}
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
