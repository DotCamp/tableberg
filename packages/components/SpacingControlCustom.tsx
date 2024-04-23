import {
    RangeControl,
    Button,
    BaseControl,
    __experimentalHStack as HStack,
    __experimentalVStack as VStack,
    __experimentalUnitControl as UnitControl,
    __experimentalUseCustomUnits as useCustomUnits,
    __experimentalParseQuantityAndUnitFromRawValue as parseQuantityAndUnitFromRawValue,
} from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { settings } from "@wordpress/icons";
import { HTMLAttributes, useMemo, useState } from "react";
import {
    // @ts-ignore
    useSettings,
    // @ts-ignore
    isValueSpacingPreset,
    // @ts-ignore
    getCustomValueFromPreset,
} from "@wordpress/block-editor";

export interface Props {
    label: string;
    value: string;
    onChange: (value: string) => void;
    style?: HTMLAttributes<HTMLFieldSetElement>["style"];
}

const getSpacingPresetSlug = (value: string) => {
    if (!value) {
        return;
    }
    value = value.toString();
    if (value === "0" || value === "default") {
        return value;
    }
    const slug = value.match(/var:preset\|spacing\|(.+)/);
    return slug ? slug[1] : undefined;
};

const getSliderValueFromPreset = (presetValue: any, spacingSizes: any) => {
    if (presetValue === undefined) {
        return 0;
    }
    const slug =
        parseFloat(presetValue) === 0 ? "0" : getSpacingPresetSlug(presetValue);
    const sliderValue = spacingSizes.findIndex((spacingSize: any) => {
        return String(spacingSize.slug) === slug;
    });

    // Returning NaN rather than undefined as undefined makes range control thumb sit in center
    return sliderValue !== -1 ? sliderValue : NaN;
};

function useSpacingSizes() {
    const spacingSizes = [
        { name: 0, slug: "0", size: 0 },
        { name: "5px", slug: "5", size: "5px" },
    ];

    const [settingsSizes] = useSettings("spacing.spacingSizes");
    if (settingsSizes) {
        spacingSizes.push(...settingsSizes);
    }

    if (spacingSizes.length > 8) {
        spacingSizes.unshift({
            // @ts-ignore
            name: __("Default"),
            slug: "default",
            // @ts-ignore
            size: undefined,
        });
    }

    return spacingSizes;
}

export default function SpacingControlSingle({
    label,
    value,
    onChange,
    style,
}: Props) {
    const [showCustomValueControl, setShowCustomValueControl] = useState(
        !!value && !isValueSpacingPreset(value),
    );

    style ||= {};
    style.position = "relative";

    const [availableUnits] = useSettings("spacing.units");
    const units = useCustomUnits({
        availableUnits: availableUnits || ["px", "em", "rem"],
    });
    const spacingSizes = useSpacingSizes();

    let currentValue: any = !showCustomValueControl
        ? getSliderValueFromPreset(value, spacingSizes)
        : getCustomValueFromPreset(value, spacingSizes);

    const customRangeValue = parseFloat(currentValue);

    const selectedUnit =
        useMemo(
            () => parseQuantityAndUnitFromRawValue(currentValue),
            [currentValue],
        )[1] || units[0]?.value;

    const marks = spacingSizes.map((_, index) => ({
        value: index,
        label: undefined,
    }));

    const getNewCustomValue = (newSize: string) => {
        const isNumeric = !isNaN(parseFloat(newSize));
        const nextValue = isNumeric ? newSize : undefined;
        return nextValue;
    };

    const getNewPresetValue = (newSize: any) => {
        const size = parseInt(newSize, 10);
        if (size === 0) {
            return "0";
        }
        return `var:preset|spacing|${spacingSizes[newSize]?.slug}`;
    };

    const handleCustomValueSliderChange = (next: number) => {
        onChange([next, selectedUnit].join(""));
    };
    return (
        <fieldset className="spacing-sizes-control" style={style}>
            {showCustomValueControl && (
                <BaseControl.VisualLabel
                    as="legend"
                    className="spacing-sizes-control__label"
                    style={{
                        marginBottom: "3px",
                        position: "absolute",
                        bottom: "100%",
                        left: "0px",
                    }}
                >
                    {label}
                </BaseControl.VisualLabel>
            )}
            <HStack className="spacing-sizes-control__wrapper">
                {showCustomValueControl ? (
                    <>
                        <UnitControl
                            hideLabelFromVision
                            className="spacing-sizes-control__custom-value-input"
                            size={"__unstable-large"}
                            value={currentValue}
                            onChange={(newSize: any) =>
                                onChange(getNewCustomValue(newSize) as any)
                            }
                        />
                        <RangeControl
                            min={0}
                            max={100}
                            step={1}
                            withInputField={false}
                            className="spacing-sizes-control__custom-value-range"
                            value={customRangeValue}
                            onChange={handleCustomValueSliderChange as any}
                            __nextHasNoMarginBottom
                        />
                    </>
                ) : (
                    <RangeControl
                        className="spacing-sizes-control__range-control"
                        label={label}
                        value={currentValue}
                        min={0}
                        max={marks.length - 1}
                        marks={marks}
                        withInputField={false}
                        onChange={(newSize) =>
                            onChange(getNewPresetValue(newSize))
                        }
                    />
                )}

                <Button
                    label={
                        showCustomValueControl
                            ? __("Use size preset")
                            : __("Set custom size")
                    }
                    icon={settings}
                    onClick={() => {
                        setShowCustomValueControl(!showCustomValueControl);
                    }}
                    isPressed={showCustomValueControl}
                    size="small"
                    className="spacing-sizes-control__custom-toggle"
                    iconSize={24}
                />
            </HStack>
        </fieldset>
    );
}
