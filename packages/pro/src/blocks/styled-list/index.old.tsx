import { __ } from "@wordpress/i18n";

import { BlockEditProps, registerBlockType, createBlock } from "@wordpress/blocks";
//@ts-ignore
import { isEmpty } from "lodash";
import { useSelect, useDispatch } from "@wordpress/data";
import { getStyles } from "./get-styles";
import {
    InnerBlocks,
    InspectorControls,
    AlignmentToolbar,
    BlockControls,
    useBlockProps,
    store as blockEditorStore
} from "@wordpress/block-editor";
import {
    Button,
    Modal,
    PanelBody,
    PanelRow,
    RangeControl,
    ToggleControl,
} from "@wordpress/components";

import icon from "./icon";
import metadata from "./block.json";
//@ts-ignore
import { SpacingControl, ColorSettings } from "../../components/styling-controls";
//@ts-ignore
import IconsLibrary from "../../components/icon-library/library";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { useState, useEffect } from "react";
import { library } from "@fortawesome/fontawesome-svg-core";
import { BlockTypes } from "./types";
import SVGComponent from "./get-icon";
import { edit } from "@wordpress/icons";

library.add(fas, fab);


interface NewAttributes {
    [key: string]: any;
}

function Edit(props: BlockEditProps<BlockTypes>) {
    const [availableIcons, setAvailableIcons] = useState([]);
    const [setFontSize, toggleSetFontSize] = useState(false);
    const [isLibraryOpen, setLibraryOpen] = useState(false);

    const {
        listBlock,
        getBlock,
        getBlockParentsByBlockName,
        getClientIdsOfDescendants,
    } = useSelect((select) => {
        const {
            getBlock,
            // @ts-ignore
            getBlockParentsByBlockName,
            getClientIdsOfDescendants,
        } = select(blockEditorStore) as BlockEditorStoreSelectors;

        return {
            listBlock: getBlock(props.clientId)!,
            getBlock,
            getBlockParentsByBlockName,
            getClientIdsOfDescendants,
        };
    }, []);
    const { updateBlockAttributes } = useDispatch(blockEditorStore);
    const { isSelected, attributes, setAttributes, clientId } = props;
    const blockProps = useBlockProps();
    const {
        iconColor,
        iconSize,
        itemSpacing,
        isRootList,
        textColor,
        fontSize,
        columns,
        maxMobileColumns,
        alignment,
        icon,
    } = attributes;

    useEffect(() => {
        setAttributes({ clientId: listBlock.clientId });
    }, [listBlock.clientId]);

    const listItemBlocks = getClientIdsOfDescendants([listBlock.clientId]).filter(
        (ID: string) => getBlock(ID)!.name === "tableberg/styled-list-item",
    );

    function setAttributesToAllItems(newAttributes: NewAttributes) {
        updateBlockAttributes(listItemBlocks, newAttributes);
    }

    const isRootOfList =
        getBlockParentsByBlockName(listBlock.clientId, [
            "tableberg/styled-list",
            "tableberg/styled-list-item",
        ]).length === 0;

    if (isRootList !== isRootOfList) {
        setAttributes({ isRootList: isRootOfList });
    }
    const styles = getStyles(attributes);
    const hasIcon = !isEmpty(icon);
    // @ts-ignore
    const IconComponent = <SVGComponent icon={icon} />;
    return (
        <div {...blockProps}>
            {isSelected && isRootOfList && (
                <>
                    <InspectorControls group="settings">
                        <PanelBody title={__("Icon")} initialOpen={true}>
                            <PanelRow>
                                <span>Select Icon</span>
                                <PanelRow>
                                    <Button
                                        style={{ border: "1px solid #eeeeee" }}
                                        icon={hasIcon ? IconComponent : edit}
                                        onClick={() => setLibraryOpen(true)}
                                    />
                                    {hasIcon && (
                                        <Button
                                            isSmall
                                            variant="secondary"
                                            style={{
                                                marginLeft: "10px",
                                                height: "30px",
                                            }}
                                            onClick={() =>
                                                setAttributes({
                                                    icon: {
                                                        iconName: "check",
                                                        type: "font-awesome",
                                                        icon: {
                                                            type: "svg",
                                                            key: null,
                                                            ref: null,
                                                            props: {
                                                                xmlns: "http://www.w3.org/2000/svg",
                                                                viewBox:
                                                                    "0 0 512 512",
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
                                                    },
                                                })
                                            }
                                        >
                                            {__("Clear", "ultimate-blocks-pro")}
                                        </Button>
                                    )}
                                </PanelRow>
                                {isLibraryOpen && (
                                    <Modal
                                        isFullScreen
                                        className="tableberg_icons_library_modal"
                                        title={__(
                                            "Icons",
                                            "ultimate-blocks-pro",
                                        )}
                                        onRequestClose={() =>
                                            setLibraryOpen(false)
                                        }
                                    >
                                        <IconsLibrary
                                            value={icon.iconName as any}
                                            onSelect={(newIcon) => {
                                                setAttributes({
                                                    icon: newIcon,
                                                });
                                                setLibraryOpen(false);
                                                return null;
                                            }}
                                        />
                                    </Modal>
                                )}
                            </PanelRow>
                            <RangeControl
                                label={__("Icon size", "tableberg")}
                                value={iconSize}
                                onChange={(iconSize) => {
                                    setAttributes({ iconSize });
                                    setAttributesToAllItems({ iconSize });
                                }}
                                min={1}
                                max={10}
                            />
                        </PanelBody>

                        <PanelBody title={__("Additional")} initialOpen={false}>
                            <RangeControl
                                label={__("Number of columns", "tableberg")}
                                value={columns}
                                onChange={(columns) => {
                                    setAttributes({ columns });
                                    if (
                                        columns &&
                                        columns <= maxMobileColumns
                                    ) {
                                        setAttributes({
                                            maxMobileColumns: columns,
                                        });
                                    }
                                }}
                                min={1}
                                max={4}
                            />
                            {columns > 1 && (
                                <>
                                    <RangeControl
                                        label={__(
                                            "Number of columns in mobile",
                                            "tableberg",
                                        )}
                                        value={maxMobileColumns}
                                        onChange={(maxMobileColumns) =>
                                            setAttributes({ maxMobileColumns })
                                        }
                                        min={1}
                                        max={columns}
                                    />
                                </>
                            )}
                            <RangeControl
                                label={__("Item spacing (pixels)", "tableberg")}
                                value={itemSpacing}
                                onChange={(itemSpacing) =>
                                    setAttributes({ itemSpacing })
                                }
                                min={0}
                                max={50}
                            />
                            <ToggleControl
                                label={__("Customize font size")}
                                checked={setFontSize}
                                onChange={() => {
                                    if (setFontSize) {
                                        setAttributes({ fontSize: 0 });

                                        //change font sizevalue of all list items to zero
                                        updateBlockAttributes(listItemBlocks, {
                                            fontSize: 0,
                                        });
                                    } else {
                                        setAttributes({ fontSize: 10 });
                                        //send signal to first child block to begin measuring
                                        updateBlockAttributes(
                                            listBlock.innerBlocks[0].clientId,
                                            {
                                                fontSize: -1,
                                            },
                                        );
                                    }
                                    toggleSetFontSize(!setFontSize);
                                }}
                            />
                            {setFontSize && (
                                <>
                                    <RangeControl
                                        label={__(
                                            "Font size (pixels)",
                                            "tableberg",
                                        )}
                                        value={fontSize}
                                        onChange={(fontSize) => {
                                            setAttributes({ fontSize });
                                            updateBlockAttributes(
                                                listItemBlocks,
                                                { fontSize },
                                            );
                                        }}
                                        min={10}
                                        max={50}
                                    />
                                </>
                            )}
                        </PanelBody>
                    </InspectorControls>
                    {/*@ts-ignore */}
                    <InspectorControls group="color">
                        <ColorSettings
                            attrKey="iconColor"
                            label={__("Icon Color", "tableberg-pro")}
                        />
                        <ColorSettings
                            attrKey="textColor"
                            label={__("List Text Color", "tableberg-pro")}
                        />
                        <ColorSettings
                            attrKey="backgroundColor"
                            label={__("List Background Color", "tableberg-pro")}
                        />
                    </InspectorControls>
                    {/*@ts-ignore */}
                    <InspectorControls group="dimensions">
                        <SpacingControl
                            showByDefault
                            attrKey="padding"
                            label={__("Padding", "tableberg")}
                        />
                        <SpacingControl
                            minimumCustomValue={-Infinity}
                            showByDefault
                            attrKey="margin"
                            label={__("Margin", "tableberg")}
                        />
                    </InspectorControls>
                </>
            )}
            {isSelected && isRootList && (
                <BlockControls>
                    <AlignmentToolbar
                        value={alignment}
                        onChange={(value) =>
                            setAttributes({ alignment: value })
                        }
                    />
                </BlockControls>
            )}
            <ul
                className={
                    isRootList
                        ? "tableberg_styled_list"
                        : "tableberg_styled_list_sublist"
                }
                id={`tableberg-styled-list-${clientId}`}
                style={isRootList ? styles : {}}
            >
                <InnerBlocks
                    template={
                        isRootOfList
                            ? [["tableberg/styled-list-item", {}, []]]
                            : []
                    }
                    allowedBlocks={["tableberg/styled-list-item"]}
                />
            </ul>
            {isRootOfList && (
                <style
                    dangerouslySetInnerHTML={{
                        __html: `#tableberg-styled-list-${clientId} li::before{
                    top: ${iconSize >= 5 ? 3 : iconSize < 3 ? 2 : 0}px;
                    height:${(4 + iconSize) / 10}em;
                    width:${(4 + iconSize) / 10}em;
                    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='${
                        icon.icon.props.viewBox
                    }' color='${
                        iconColor ? `%23${iconColor.slice(1)}` : "inherit"
                    }'><path fill='currentColor' d='${
                        icon.icon.props.children.props.d
                    }'></path></svg>");
					}
					#tableberg-styled-list-${clientId} li{
						color: ${textColor};
					}
					#tableberg-styled-list-${clientId} [data-type="tableberg/styled-list-item"]:not(:first-child){
						margin-top: ${itemSpacing}px;
					}
					#tableberg-styled-list-${clientId} .block-editor-inner-blocks > .block-editor-block-list__layout .tableberg_styled_list_sublist > .block-editor-inner-blocks > .block-editor-block-list__layout > [data-type="tableberg/styled-list-item"]:first-child{
						margin-top: ${itemSpacing}px;
					}
					#tableberg-styled-list-${clientId}  > .block-editor-inner-blocks > .block-editor-block-list__layout{
						column-count: ${columns};
					}
					#tableberg-styled-list-${clientId} {
						text-align: ${alignment};
					}`,
                    }}
                />
            )}
        </div>
    );
}

// @ts-ignore
registerBlockType(metadata, {
    icon: icon,
    attributes: metadata.attributes,
    transforms: {
        from: [
            {
                type: "block",
                blocks: ["core/list"],
                transform: (attributes: any, innerBlocks: any) => {
                    if (attributes.ordered) {
                        console.log("cannot be used for ordered lists");
                        return null;
                    } else {
                        const convertSubitems = (subitems: any) =>
                            subitems.map((subitem: any) =>
                                createBlock(
                                    "tableberg/styled-list-item",
                                    {
                                        itemText: subitem.attributes.content,
                                    },
                                    subitem.innerBlocks.length > 0
                                        ? [
                                              createBlock(
                                                  "tableberg/styled-list",
                                                  attributes,
                                                  convertSubitems(
                                                      subitem.innerBlocks[0]
                                                          .innerBlocks,
                                                  ),
                                              ),
                                          ]
                                        : [],
                                ),
                            );

                        return createBlock(
                            "tableberg/styled-list",
                            attributes,
                            convertSubitems(innerBlocks),
                        );
                    }
                },
            },
        ],
    },
    example: {},
    edit: Edit,
    save: () => <InnerBlocks.Content />,
});
