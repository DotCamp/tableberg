/**
 * Wordpress Dependencies
 */
import { InspectorControls } from "@wordpress/block-editor";
//@ts-ignore
import { useMemo } from "@wordpress/element";
import {
  PanelBody,
  SelectControl,
  TextareaControl,
  __experimentalToolsPanel as ToolsPanel,
  __experimentalUnitControl as UnitControl,
  __experimentalToolsPanelItem as ToolsPanelItem,
  __experimentalToggleGroupControl as ToggleGroupControl,
  __experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from "@wordpress/components";
import { __ } from "@wordpress/i18n";
/***
 * Internal imports
 */
import type { MainPropTypes } from "./types";
import {
  DEFAULT_ASPECT_RATIO_OPTIONS,
  DEFAULT_SCALE_OPTIONS,
  DEFAULT_SIZE_SLUG_OPTIONS,
} from "./constants";
import { BorderControl } from "../components";

function Inspector(props: MainPropTypes) {
  const { attributes, setAttributes } = props;
  const { alt, aspectRatio, height, scale, width, sizeSlug } = attributes;
  const resetAll = () => {
    setAttributes({
      alt: "",
      aspectRatio: "",
      height: "",
      scale: "cover",
      width: "",
    });
  };
  const scaleOptions = DEFAULT_SCALE_OPTIONS;
  // Match the CSS default so if the value is used directly in CSS it will look correct in the control.
  const aspectRatioDisplayValue = aspectRatio ?? "auto";
  const scaleDisplayValue = scale ?? "cover";
  const scaleHelp = useMemo(() => {
    return scaleOptions.reduce((acc, option) => {
      //@ts-ignore
      acc[option.value] = option.help;
      return acc;
    }, {});
  }, [scaleOptions]);
  const aspectRatioOptions = DEFAULT_ASPECT_RATIO_OPTIONS;

  return (
    <>
      <InspectorControls>
        <ToolsPanel label={__("Settings", "tableberg")} resetAll={resetAll}>
          <ToolsPanelItem
            isShownByDefault
            hasValue={() => !!alt}
            label={__("Alternative Text", "tableberg")}
            onDeselect={() => setAttributes({ alt: "" })}
          >
            <TextareaControl
              __nextHasNoMarginBottom
              value={alt}
              label={__("Alternative Text", "tableberg")}
              onChange={(newValue: string) => setAttributes({ alt: newValue })}
            />
          </ToolsPanelItem>
          <ToolsPanelItem
            isShownByDefault
            label={__("Aspect ratio", "tableberg")}
            onDeselect={() => setAttributes({ aspectRatio: "" })}
            hasValue={() =>
              aspectRatioDisplayValue !== aspectRatioOptions[0].value
            }
          >
            <SelectControl
              value={aspectRatioDisplayValue}
              __nextHasNoMarginBottom
              size={"__unstable-large"}
              options={aspectRatioOptions}
              label={__("Aspect ratio", "tableberg")}
              onChange={(newValue) => setAttributes({ aspectRatio: newValue })}
            />
          </ToolsPanelItem>
          {aspectRatio !== DEFAULT_ASPECT_RATIO_OPTIONS[0].value && (
            <ToolsPanelItem
              label={__("Scale", "tableberg")}
              isShownByDefault
              hasValue={() => scaleDisplayValue !== scaleOptions[0].value}
              onDeselect={() => setAttributes({ scale: scaleOptions[0].value })}
            >
              <ToggleGroupControl
                label={__("Scale", "tableberg")}
                isBlock
                help={scaleHelp[scaleDisplayValue]}
                value={scaleDisplayValue}
                onChange={(newScale) => setAttributes({ scale: newScale })}
                __nextHasNoMarginBottom
              >
                {scaleOptions.map((option) => (
                  <ToggleGroupControlOption key={option.value} {...option} />
                ))}
              </ToggleGroupControl>
            </ToolsPanelItem>
          )}
          <div className="tableberg-width-height-control">
            <ToolsPanelItem
              isShownByDefault
              label={__("Width", "tableberg")}
              hasValue={() => width !== ""}
              onDeselect={() => setAttributes({ width: "" })}
            >
              <UnitControl
                label={__("Width", "tableberg")}
                placeholder={__("Auto", "tableberg")}
                labelPosition="top"
                units={[{ value: "px", label: "px", default: 0 }]}
                min={0}
                value={width}
                onChange={(newWidth: string | number | undefined) =>
                  setAttributes({ width: newWidth })
                }
                size={"__unstable-large"}
              />
            </ToolsPanelItem>
            <ToolsPanelItem
              isShownByDefault
              label={__("height", "tableberg")}
              hasValue={() => height !== ""}
              onDeselect={() => setAttributes({ height: "" })}
            >
              <UnitControl
                label={__("Height", "tableberg")}
                placeholder={__("Auto", "tableberg")}
                labelPosition="top"
                units={[{ value: "px", label: "px", default: 0 }]}
                min={0}
                value={height}
                onChange={(newHeight: string | number | undefined) =>
                  setAttributes({ height: newHeight })
                }
                size={"__unstable-large"}
              />
            </ToolsPanelItem>
          </div>
          <ToolsPanelItem
            isShownByDefault
            label={__("Resolution", "tableberg")}
            hasValue={() => sizeSlug !== DEFAULT_SIZE_SLUG_OPTIONS[0].value}
            onDeselect={() =>
              setAttributes({ sizeSlug: DEFAULT_SIZE_SLUG_OPTIONS[0].value })
            }
          >
            <SelectControl
              label={__("Resolution", "tableberg")}
              value={sizeSlug}
              options={DEFAULT_SIZE_SLUG_OPTIONS}
              onChange={(newSlug: string) =>
                setAttributes({ sizeSlug: newSlug })
              }
              help={__("Select the size of the source image.", "tableberg")}
              size={"__unstable-large"}
            />
          </ToolsPanelItem>
        </ToolsPanel>
      </InspectorControls>
      {/* @ts-ignore */}
      <InspectorControls group="border">
        <BorderControl
          attrBorderKey="border"
          attrBorderRadiusKey="borderRadius"
          borderLabel={__("Border", "tableberg")}
          borderRadiusLabel={__("Border Radius")}
        />
      </InspectorControls>
    </>
  );
}

export default Inspector;
