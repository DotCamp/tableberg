/**
 * WordPress Dependencies
 */
import { useDispatch, useSelect } from "@wordpress/data";
//@ts-ignore
import {
    useBlockEditContext,
    store as blockEditorStore,
} from "@wordpress/block-editor";
import {
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOptionIcon as ToggleGroupControlOptionIcon,
    __experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from "@wordpress/components";
import { ToggleGroupControlPropTypes } from "../types";
import {
    BlockEditorStoreActions,
    BlockEditorStoreSelectors,
} from "../../wordpress__data";

function CustomToggleGroupControl({
    label,
    options,
    attributeKey,
    isBlock = false,
    isAdaptiveWidth = false,
    isDeselectable = false,
}: ToggleGroupControlPropTypes) {
    const { clientId } = useBlockEditContext();
    const { updateBlockAttributes } = useDispatch(
        blockEditorStore
    ) as BlockEditorStoreActions;

    const attributes = useSelect((select) => {
        return (
            select(blockEditorStore) as BlockEditorStoreSelectors
        ).getBlockAttributes(clientId);
    }, []);
    const setAttributes = (newAttributes: object) =>
        updateBlockAttributes(clientId, newAttributes);

    return (
        <ToggleGroupControl
            label={label}
            isBlock={isBlock}
            isDeselectable={isDeselectable}
            isAdaptiveWidth={isAdaptiveWidth}
            __nextHasNoMarginBottom
            value={attributes[attributeKey]}
            onChange={(newValue) => {
                setAttributes({
                    [attributeKey]: newValue,
                });
            }}
        >
            {options.map(({ value, icon = null, label }) => {
                return icon ? (
                    <ToggleGroupControlOptionIcon
                        key={value}
                        value={value}
                        icon={icon}
                        label={label}
                    />
                ) : (
                    <ToggleGroupControlOption
                        key={value}
                        value={value}
                        label={label}
                    />
                );
            })}
        </ToggleGroupControl>
    );
}

export default CustomToggleGroupControl;
