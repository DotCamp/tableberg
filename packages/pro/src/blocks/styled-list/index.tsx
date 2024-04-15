import { BlockEditProps, registerBlockType } from "@wordpress/blocks";

import metadata from "./block.json";
import blockIcon from "./icon";
import {
    AlignmentToolbar,
    BlockControls,
    FontSizePicker,
    InspectorControls,
    useBlockProps,
    useInnerBlocksProps,
} from "@wordpress/block-editor";
import { getStyles } from "./get-styles";
import { ColorControl, SpacingControl } from "@tableberg/components";
import IconsLibrary from "@tableberg/components/icon-library";
import { __ } from "@wordpress/i18n";
import {
    BaseControl,
    Button,
    Modal,
    PanelBody,
    PanelRow,
    RangeControl,
    SelectControl,
} from "@wordpress/components";
import { useState } from "react";
import { edit as editIcon, trash } from "@wordpress/icons";
import SVGComponent from "./get-icon";
import classNames from "classnames";

export interface StyledListProps {
    isOrdered: boolean;
    icon: any;
    listStyle: string;
    alignment: string;
    iconColor: string;
    iconSize: number;
    iconSpacing: number;
    fontSize: string;
    itemSpacing: number;
    listSpacing: number;
    textColor: string;
    backgroundColor: string;
    padding: object;
    margin: object;
    parentCount: number;
}

const ALLOWED_BLOCKS = ["tableberg/styled-list-item"];

const numberTypes: {
    label: string;
    value: string;
}[] = [
    { label: "Arabic Indic", value: "arabic-indic" },
    { label: "Armenian", value: "armenian" },
    { label: "Auto", value: "auto" },
    { label: "Bengali", value: "bengali" },
    { label: "Cambodian", value: "cambodian" },
    { label: "Cjk Earthly Branch", value: "cjk-earthly-branch" },
    { label: "Cjk Heavenly Stem", value: "cjk-heavenly-stem" },
    { label: "Cjk Ideographic", value: "cjk-ideographic" },
    { label: "Decimal", value: "decimal" },
    { label: "Decimal Leading Zero", value: "decimal-leading-zero" },
    { label: "Devanagari", value: "devanagari" },
    { label: "Ethiopic Halehame", value: "ethiopic-halehame" },
    { label: "Ethiopic Halehame Am", value: "ethiopic-halehame-am" },
    { label: "Ethiopic Halehame TI ER", value: "ethiopic-halehame-ti-er" },
    { label: "Ethiopic Halehame TI ET", value: "ethiopic-halehame-ti-et" },
    { label: "Georgian", value: "georgian" },
    { label: "Gujarati", value: "gujarati" },
    { label: "Gurmukhi", value: "gurmukhi" },
    { label: "Hangul", value: "hangul" },
    { label: "Hangul Consonant", value: "hangul-consonant" },
    { label: "Hebrew", value: "hebrew" },
    { label: "Hiragana", value: "hiragana" },
    { label: "Hiragana Iroha", value: "hiragana-iroha" },
    { label: "Kannada", value: "kannada" },
    { label: "Katakana", value: "katakana" },
    { label: "Katakana Iroha", value: "katakana-iroha" },
    { label: "Khmer", value: "khmer" },
    { label: "Korean Hangul Formal", value: "korean-hangul-formal" },
    { label: "Korean Hanja Formal", value: "korean-hanja-formal" },
    { label: "Korean Hanja Informal", value: "korean-hanja-informal" },
    { label: "Lao", value: "lao" },
    { label: "Lower Alpha", value: "lower-alpha" },
    { label: "Lower Armeninan", value: "lower-armeninan" },
    { label: "Lower Greek", value: "lower-greek" },
    { label: "Lower Latin", value: "lower-latin" },
    { label: "Lower Roman", value: "lower-roman" },
    { label: "Malayalam", value: "malayalam" },
    { label: "Mongolian", value: "mongolian" },
    { label: "Myanmar", value: "myanmar" },
    { label: "Oriy", value: "oriy" },
    { label: "Persian", value: "persian" },
    { label: "Simp Chinese Formal", value: "simp-chinese-formal" },
    { label: "Simp Chinese Informal", value: "simp-chinese-informal" },
    { label: "Persian", value: "persian" },
    { label: "Telugu", value: "telugu" },
    { label: "Thai", value: "thai" },
    { label: "Tibetan", value: "tibetan" },
    { label: "Katakana", value: "katakana" },
    { label: "Trad Chinese Formal", value: "trad-chinese-formal" },
    { label: "Trad Chinese Informal", value: "trad-chinese-informal" },
    { label: "Upper Alpha", value: "upper-alpha" },
    { label: "Upper Armeninan", value: "upper-armeninan" },
    { label: "Upper Greek", value: "upper-greek" },
    { label: "Upper Latin", value: "upper-latin" },
    { label: "Upper Roman", value: "upper-roman" },
    { label: "Urdu", value: "urdu" },
];
const listTypes: {
    label: string;
    value: string;
}[] = [
    { label: "Custom", value: "" },
    { label: "Circle", value: "circle" },
    { label: "Disc", value: "disc" },
    { label: "Disclosure Closed", value: "disclosure-closed" },
    { label: "Disclosure Open", value: "disclosure-open" },
];

const DEFAULT_ICON = {
    iconName: "check",
    type: "font-awesome",
    icon: {
        type: "svg",
        key: null,
        ref: null,
        props: {
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 512 512",
            children: {
                type: "path",
                key: null,
                ref: null,
                props: {
                    d: "M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z",
                },
                _owner: null,
            },
        },
        _owner: null,
    },
};

function edit(props: BlockEditProps<StyledListProps>) {
    const { attributes, setAttributes } = props;

    const blockProps = useBlockProps({
        style: getStyles(attributes),
        className: classNames({
            "tableberg-styled-list": true,
            "tableberg-list-has-icon": !attributes.isOrdered && attributes.icon,
        }),
    });

    const innerBlocksProps = useInnerBlocksProps(blockProps as any, {
        allowedBlocks: ALLOWED_BLOCKS,
        template: [["tableberg/styled-list-item"]],
    });

    const [isLibraryOpen, setLibraryOpen] = useState(false);

    const TagName = attributes.isOrdered ? "ol" : "ul";

    return (
        <>
            <TagName {...innerBlocksProps} />

            <BlockControls>
                <AlignmentToolbar
                    value={attributes.alignment}
                    onChange={(value) => setAttributes({ alignment: value })}
                />
            </BlockControls>

            <InspectorControls group="color">
                <ColorControl
                    label={__("Icon Color", "tableberg-pro")}
                    colorValue={attributes.iconColor}
                    onColorChange={(iconColor: any) =>
                        setAttributes({ iconColor })
                    }
                    onDeselect={() => setAttributes({ iconColor: undefined })}
                />
                <ColorControl
                    label={__("List Text Color", "tableberg-pro")}
                    colorValue={attributes.textColor}
                    onColorChange={(textColor: any) =>
                        setAttributes({ textColor })
                    }
                    onDeselect={() => setAttributes({ textColor: undefined })}
                />
                <ColorControl
                    label={__("List Background Color", "tableberg-pro")}
                    colorValue={attributes.backgroundColor}
                    onColorChange={(backgroundColor: any) =>
                        setAttributes({ backgroundColor })
                    }
                    onDeselect={() =>
                        setAttributes({ backgroundColor: undefined })
                    }
                />
            </InspectorControls>
            <InspectorControls group="dimensions">
                <SpacingControl
                    label={__("Padding", "tableberg-pro")}
                    value={attributes.padding}
                    onChange={(padding) => setAttributes({ padding })}
                    onDeselect={() => setAttributes({ padding: undefined })}
                />
                <SpacingControl
                    label={__("Margin", "tableberg-pro")}
                    value={attributes.margin}
                    onChange={(margin) => setAttributes({ margin })}
                    onDeselect={() => setAttributes({ margin: undefined })}
                />
            </InspectorControls>

            <InspectorControls group="settings">
                <PanelBody title="List Settings" initialOpen={true}>
                    <BaseControl __nextHasNoMarginBottom>
                        <SelectControl
                            label="List Type"
                            value={attributes.isOrdered ? "1" : "0"}
                            options={[
                                { label: "Orderded", value: "1" },
                                { label: "Unordered", value: "0" },
                            ]}
                            onChange={(isOrdered: any) => {
                                setAttributes({
                                    isOrdered: isOrdered == "1",
                                });
                            }}
                        />
                    </BaseControl>
                    {attributes.isOrdered && (
                        <BaseControl __nextHasNoMarginBottom>
                            <SelectControl
                                label="Number Type"
                                value={attributes.listStyle}
                                options={numberTypes}
                                onChange={(listStyle: any) => {
                                    setAttributes({
                                        listStyle,
                                    });
                                }}
                            />
                        </BaseControl>
                    )}
                    <BaseControl __nextHasNoMarginBottom>
                        <RangeControl
                            label={__("Item Spacing", "tableberg-pro")}
                            value={attributes.itemSpacing}
                            onChange={(itemSpacing) => {
                                setAttributes({ itemSpacing });
                            }}
                            min={0}
                            max={50}
                        />
                    </BaseControl>
                    <BaseControl __nextHasNoMarginBottom>
                        <RangeControl
                            label={__("Inner List Spacing", "tableberg-pro")}
                            value={attributes.listSpacing}
                            onChange={(listSpacing) => {
                                setAttributes({ listSpacing });
                            }}
                            min={0}
                            max={50}
                        />
                    </BaseControl>
                </PanelBody>
                {!attributes.isOrdered && (
                    <PanelBody title="Icon Settings" initialOpen={true}>
                        {!attributes.icon && (
                            <BaseControl __nextHasNoMarginBottom>
                                <SelectControl
                                    label="List Style"
                                    value={attributes.listStyle}
                                    options={listTypes}
                                    onChange={(listStyle: any) => {
                                        if (listStyle === "") {
                                            setAttributes({
                                                icon: DEFAULT_ICON,
                                            });
                                            return;
                                        }
                                        setAttributes({
                                            listStyle,
                                            icon: undefined,
                                        });
                                    }}
                                />
                            </BaseControl>
                        )}
                        {attributes.icon && (
                            <>
                                <PanelRow className="tableberg-styled-list-icon-selector">
                                    <label>Select Icon</label>
                                    <div>
                                        <Button
                                            style={{
                                                border: "1px solid #eeeeee",
                                            }}
                                            icon={
                                                <SVGComponent
                                                    icon={attributes.icon}
                                                    iconName="wordpress"
                                                    type="wordpress"
                                                />
                                            }
                                            onClick={() => setLibraryOpen(true)}
                                        />
                                        <Button
                                            style={{
                                                border: "1px solid red",
                                                marginLeft: "5px",
                                                color: "red",
                                            }}
                                            icon={trash}
                                            onClick={() =>
                                                setAttributes({
                                                    icon: undefined,
                                                })
                                            }
                                        />
                                    </div>
                                </PanelRow>
                                <RangeControl
                                    label={__("Icon size", "tableberg-pro")}
                                    value={attributes.iconSize}
                                    onChange={(iconSize) => {
                                        setAttributes({ iconSize });
                                    }}
                                    min={10}
                                    max={100}
                                />
                                <RangeControl
                                    label={__("Icon Spacing", "tableberg-pro")}
                                    value={attributes.iconSpacing}
                                    onChange={(iconSpacing) => {
                                        setAttributes({ iconSpacing });
                                    }}
                                    min={0}
                                    max={20}
                                />
                            </>
                        )}
                    </PanelBody>
                )}
                <PanelBody title="Font Size" initialOpen={true}>
                    <BaseControl __nextHasNoMarginBottom>
                        <FontSizePicker
                            value={attributes.fontSize as any}
                            onChange={(val: any) =>
                                setAttributes({ fontSize: val })
                            }
                        />
                    </BaseControl>
                </PanelBody>
                {isLibraryOpen && (
                    <Modal
                        isFullScreen
                        className="tableberg_icons_library_modal"
                        title={__("Icons", "tableberg-pro")}
                        onRequestClose={() => setLibraryOpen(false)}
                    >
                        <IconsLibrary
                            value={attributes.icon?.iconName as any}
                            onSelect={(newIcon) => {
                                setAttributes({
                                    icon: newIcon,
                                    listStyle: "custom",
                                });
                                setLibraryOpen(false);
                                return null;
                            }}
                        />
                    </Modal>
                )}
            </InspectorControls>
        </>
    );
}

function save() {
    const blockProps = useBlockProps.save();
    const innerBlocksProps = useInnerBlocksProps.save(blockProps);
    return <ul {...innerBlocksProps} />;
}

registerBlockType(metadata as any, {
    icon: blockIcon,
    attributes: metadata.attributes as any,
    edit,
    save,
});
