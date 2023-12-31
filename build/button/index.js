/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/.pnpm/@wordpress+icons@9.28.0/node_modules/@wordpress/icons/build-module/library/link-off.js":
/*!*******************************************************************************************************************!*\
  !*** ./node_modules/.pnpm/@wordpress+icons@9.28.0/node_modules/@wordpress/icons/build-module/library/link-off.js ***!
  \*******************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_1__);


/**
 * WordPress dependencies
 */

const linkOff = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_1__.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24"
}, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_1__.Path, {
  d: "M17.031 4.703 15.576 4l-1.56 3H14v.03l-2.324 4.47H9.5V13h1.396l-1.502 2.889h-.95a3.694 3.694 0 0 1 0-7.389H10V7H8.444a5.194 5.194 0 1 0 0 10.389h.17L7.5 19.53l1.416.719L15.049 8.5h.507a3.694 3.694 0 0 1 0 7.39H14v1.5h1.556a5.194 5.194 0 0 0 .273-10.383l1.202-2.304Z"
}));
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (linkOff);
//# sourceMappingURL=link-off.js.map

/***/ }),

/***/ "./node_modules/.pnpm/@wordpress+icons@9.28.0/node_modules/@wordpress/icons/build-module/library/link.js":
/*!***************************************************************************************************************!*\
  !*** ./node_modules/.pnpm/@wordpress+icons@9.28.0/node_modules/@wordpress/icons/build-module/library/link.js ***!
  \***************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_1__);


/**
 * WordPress dependencies
 */

const link = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_1__.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24"
}, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_1__.Path, {
  d: "M10 17.389H8.444A5.194 5.194 0 1 1 8.444 7H10v1.5H8.444a3.694 3.694 0 0 0 0 7.389H10v1.5ZM14 7h1.556a5.194 5.194 0 0 1 0 10.39H14v-1.5h1.556a3.694 3.694 0 0 0 0-7.39H14V7Zm-4.5 6h5v-1.5h-5V13Z"
}));
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (link);
//# sourceMappingURL=link.js.map

/***/ }),

/***/ "./src/button/get-classes.ts":
/*!***********************************!*\
  !*** ./src/button/get-classes.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getStyleClass: () => (/* binding */ getStyleClass)
/* harmony export */ });
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lodash */ "lodash");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_0__);
//@ts-ignore

function getStyleClass(attributes) {
  const {
    backgroundHoverColor,
    textHoverColor,
    backgroundHoverGradient,
    backgroundColor,
    textColor,
    backgroundGradient
  } = attributes;
  const isValueEmpty = value => {
    return (0,lodash__WEBPACK_IMPORTED_MODULE_0__.isUndefined)(value) || value === false || (0,lodash__WEBPACK_IMPORTED_MODULE_0__.trim)(value) === "" || (0,lodash__WEBPACK_IMPORTED_MODULE_0__.trim)(value) === "undefined undefined undefined" || (0,lodash__WEBPACK_IMPORTED_MODULE_0__.isEmpty)(value);
  };
  return {
    "has-background-color": !isValueEmpty(backgroundColor) || !isValueEmpty(backgroundGradient),
    "has-hover-background-color": !isValueEmpty(backgroundHoverColor) || !isValueEmpty(backgroundHoverGradient),
    "has-hover-text-color": !isValueEmpty(textHoverColor),
    "has-text-color": !isValueEmpty(textColor)
  };
}

/***/ }),

/***/ "./src/button/get-styles.ts":
/*!**********************************!*\
  !*** ./src/button/get-styles.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getStyles: () => (/* binding */ getStyles)
/* harmony export */ });
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lodash */ "lodash");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_0__);
//@ts-ignore

function getStyles(attributes) {
  const {
    backgroundColor,
    backgroundGradient,
    backgroundHoverColor,
    backgroundHoverGradient,
    textColor,
    textHoverColor
  } = attributes;
  let styles = {
    "--tableberg-button-background-color": !(0,lodash__WEBPACK_IMPORTED_MODULE_0__.isEmpty)(backgroundColor) ? backgroundColor : backgroundGradient,
    "--tableberg-button-text-hover-color": textHoverColor,
    "--tableberg-button-text-color": textColor,
    "--tableberg-button-hover-background-color": !(0,lodash__WEBPACK_IMPORTED_MODULE_0__.isEmpty)(backgroundHoverColor) ? backgroundHoverColor : backgroundHoverGradient
  };
  return (0,lodash__WEBPACK_IMPORTED_MODULE_0__.omitBy)(styles, value => value === false || (0,lodash__WEBPACK_IMPORTED_MODULE_0__.isEmpty)(value) || (0,lodash__WEBPACK_IMPORTED_MODULE_0__.isUndefined)(value) || (0,lodash__WEBPACK_IMPORTED_MODULE_0__.trim)(value) === "" || (0,lodash__WEBPACK_IMPORTED_MODULE_0__.trim)(value) === "undefined undefined undefined");
}

/***/ }),

/***/ "./src/button/index.tsx":
/*!******************************!*\
  !*** ./src/button/index.tsx ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! classnames */ "./node_modules/.pnpm/classnames@2.3.2/node_modules/classnames/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/blocks */ "@wordpress/blocks");
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_blocks__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_url__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/url */ "@wordpress/url");
/* harmony import */ var _wordpress_url__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_url__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_compose__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/compose */ "@wordpress/compose");
/* harmony import */ var _wordpress_compose__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_compose__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _block_json__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./block.json */ "./src/button/block.json");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var _style_scss__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./style.scss */ "./src/button/style.scss");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/.pnpm/@wordpress+icons@9.28.0/node_modules/@wordpress/icons/build-module/library/link-off.js");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/.pnpm/@wordpress+icons@9.28.0/node_modules/@wordpress/icons/build-module/library/link.js");
/* harmony import */ var _components__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../components */ "./src/components/index.tsx");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_11__);
/* harmony import */ var _get_classes__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./get-classes */ "./src/button/get-classes.ts");
/* harmony import */ var _get_styles__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./get-styles */ "./src/button/get-styles.ts");



// @ts-ignore

// @ts-ignore











const ALL_REL = ["sponsored", "nofollow", "noreferrer", "noopener"];
const NEW_TAB_REL = "noreferrer noopener";
function edit({
  attributes,
  setAttributes,
  isSelected
}) {
  function WidthPanel({
    selectedWidth,
    setAttributes
  }) {
    function handleChange(newWidth) {
      // Check if we are toggling the width off
      const width = selectedWidth === newWidth ? undefined : newWidth;

      // Update attributes.
      setAttributes({
        width
      });
    }
    return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.PanelBody, {
      title: "Width settings"
    }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.ButtonGroup, {
      "aria-label": "Button width"
    }, [25, 50, 75, 100].map(widthValue => {
      return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.Button, {
        key: widthValue,
        isSmall: true,
        variant: widthValue === selectedWidth ? "primary" : undefined,
        onClick: () => handleChange(widthValue)
      }, widthValue, "%");
    })));
  }
  const {
    text,
    align,
    width,
    textAlign,
    id,
    url,
    rel,
    linkTarget
  } = attributes;
  const ref = (0,react__WEBPACK_IMPORTED_MODULE_8__.useRef)();
  const richTextRef = (0,react__WEBPACK_IMPORTED_MODULE_8__.useRef)();
  const isURLSet = !!url;
  const opensInNewTab = linkTarget === "_blank";
  const borderProps = (0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_7__.__experimentalUseBorderProps)(attributes);
  const [isEditingURL, setIsEditingURL] = (0,react__WEBPACK_IMPORTED_MODULE_8__.useState)(false);
  const [popoverAnchor, setPopoverAnchor] = (0,react__WEBPACK_IMPORTED_MODULE_8__.useState)(null);
  const blockProps = (0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_7__.useBlockProps)({
    ref: (0,_wordpress_compose__WEBPACK_IMPORTED_MODULE_4__.useMergeRefs)([setPopoverAnchor, ref]),
    className: (0,_get_classes__WEBPACK_IMPORTED_MODULE_12__.getStyleClass)(attributes),
    style: (0,_get_styles__WEBPACK_IMPORTED_MODULE_13__.getStyles)(attributes)
  });
  const blockAlignChange = newValue => {
    setAttributes({
      align: newValue
    });
  };
  const onToggleOpenInNewTab = value => {
    const newLinkTarget = value ? "_blank" : undefined;
    if (newLinkTarget && !rel) {
      handleRelChange(NEW_TAB_REL);
    }
    setAttributes({
      linkTarget: newLinkTarget
    });
  };
  const startEditing = event => {
    event.preventDefault();
    setIsEditingURL(true);
  };
  const unlink = () => {
    setAttributes({
      url: undefined,
      linkTarget: undefined,
      rel: undefined
    });
    setIsEditingURL(false);
  };
  (0,react__WEBPACK_IMPORTED_MODULE_8__.useEffect)(() => {
    if (!isSelected) {
      setIsEditingURL(false);
    }
  }, [isSelected]);

  // Memoize link value to avoid overriding the LinkControl's internal state.
  // This is a temporary fix. See https://github.com/WordPress/gutenberg/issues/51256.
  const linkValue = (0,react__WEBPACK_IMPORTED_MODULE_8__.useMemo)(() => ({
    url,
    opensInNewTab
  }), [url, opensInNewTab]);
  const handleRelChange = (relOpt, state = true) => {
    if (state && rel === undefined) {
      setAttributes({
        rel: relOpt
      });
      return;
    }
    if (state && rel?.includes(relOpt)) {
      return;
    }
    if (state) {
      setAttributes({
        rel: rel + ` ${relOpt}`
      });
      return;
    }
    if (rel?.includes(relOpt)) {
      setAttributes({
        rel: rel.replace(relOpt, "").trim()
      });
      return;
    }
  };
  return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    ...blockProps,
    className: classnames__WEBPACK_IMPORTED_MODULE_1___default()(blockProps.className, {
      [`has-custom-width wp-block-button__width-${width}`]: width,
      [`has-custom-font-size`]: blockProps.style.fontSize,
      [`block-align-${align}`]: align
    }),
    id: id
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_7__.RichText
  // @ts-ignore
  , {
    ref: richTextRef,
    className: classnames__WEBPACK_IMPORTED_MODULE_1___default()("wp-block-button__link", "wp-element-button", borderProps.className, {
      [`has-text-align-${textAlign}`]: textAlign
    }),
    "aria-label": "Button text",
    placeholder: "Add text\u2026",
    value: text,
    allowedFormats: ["core/bold", "core/italic"],
    onChange: value => setAttributes({
      text: value.replace(/<\/?a[^>]*>/g, "")
    })
    // @ts-ignore
    ,
    withoutInteractiveFormatting: true,
    identifier: "text",
    style: {
      ...borderProps.style
    }
  })), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_7__.BlockControls, {
    group: "block"
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_7__.BlockAlignmentToolbar, {
    value: align,
    onChange: blockAlignChange,
    controls: ["left", "center", "right"]
  }), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_7__.AlignmentControl, {
    value: textAlign,
    onChange: nextAlign => {
      setAttributes({
        textAlign: nextAlign
      });
    }
  }), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.ToolbarButton, {
    icon: isURLSet ? _wordpress_icons__WEBPACK_IMPORTED_MODULE_14__["default"] : _wordpress_icons__WEBPACK_IMPORTED_MODULE_15__["default"],
    title: isURLSet ? "Unlink" : "Link",
    onClick: isURLSet ? unlink : startEditing,
    isActive: isURLSet
  }), isSelected && (isEditingURL || isURLSet) && (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.Popover, {
    placement: "bottom",
    onClose: () => {
      setIsEditingURL(false);
      richTextRef.current?.focus();
    },
    anchor: popoverAnchor,
    focusOnMount: isEditingURL ? "firstElement" : false,
    __unstableSlotName: "__unstable-block-tools-after",
    shift: true
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_7__.__experimentalLinkControl, {
    value: linkValue,
    onChange: ({
      url: newURL = "",
      opensInNewTab: newOpensInNewTab
    }) => {
      setAttributes({
        url: (0,_wordpress_url__WEBPACK_IMPORTED_MODULE_3__.prependHTTP)(newURL)
      });
      if (opensInNewTab !== newOpensInNewTab) {
        onToggleOpenInNewTab(newOpensInNewTab);
      }
    },
    onRemove: () => {
      unlink();
      richTextRef.current?.focus();
    },
    forceIsEditingLink: isEditingURL
  }))), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_7__.InspectorControls, {
    group: "color"
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components__WEBPACK_IMPORTED_MODULE_10__.ColorSettings, {
    attrKey: "textColor",
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_11__.__)("Text", "tableberg")
  }), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components__WEBPACK_IMPORTED_MODULE_10__.ColorSettings, {
    attrKey: "textHoverColor",
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_11__.__)("Hover Text", "tableberg")
  }), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components__WEBPACK_IMPORTED_MODULE_10__.ColorSettingsWithGradient, {
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_11__.__)("Background Color", "tableberg"),
    attrBackgroundKey: "backgroundColor",
    attrGradientKey: "backgroundGradient"
  }), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components__WEBPACK_IMPORTED_MODULE_10__.ColorSettingsWithGradient, {
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_11__.__)("Hover Background Color", "tableberg"),
    attrBackgroundKey: "backgroundHoverColor",
    attrGradientKey: "backgroundHoverGradient"
  })), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_7__.InspectorControls, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(WidthPanel, {
    selectedWidth: width,
    setAttributes: setAttributes
  })), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_7__.InspectorControls, {
    group: "advanced"
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.TextControl, {
    label: "HTML ID",
    onChange: value => {
      setAttributes({
        id: value
      });
    },
    value: id
  })), isURLSet && (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_7__.InspectorControls, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.PanelBody, {
    title: "Link rel"
  }, ALL_REL.map(relOpt => (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.CheckboxControl, {
    onChange: val => handleRelChange(relOpt, val),
    label: relOpt,
    checked: rel?.includes(relOpt)
  }))))));
}
(0,_wordpress_blocks__WEBPACK_IMPORTED_MODULE_2__.registerBlockType)(_block_json__WEBPACK_IMPORTED_MODULE_6__.name, {
  title: _block_json__WEBPACK_IMPORTED_MODULE_6__.title,
  category: _block_json__WEBPACK_IMPORTED_MODULE_6__.category,
  attributes: {
    text: {
      type: "string"
    },
    align: {
      type: "string"
    },
    width: {
      type: "number"
    },
    backgroundGradient: {
      type: "string"
    },
    backgroundHoverGradient: {
      type: "string"
    },
    backgroundColor: {
      type: "string"
    },
    textColor: {
      type: "string"
    },
    backgroundHoverColor: {
      type: "string"
    },
    textHoverColor: {
      type: "string"
    },
    textAlign: {
      type: "string"
    },
    id: {
      type: "string"
    },
    url: {
      type: "string"
    },
    linkTarget: {
      type: "string"
    },
    rel: {
      type: "string"
    }
  },
  example: {},
  edit
});

/***/ }),

/***/ "./src/components/border-control/index.tsx":
/*!*************************************************!*\
  !*** ./src/components/border-control/index.tsx ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   splitBorderRadius: () => (/* binding */ splitBorderRadius)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! lodash */ "lodash");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__);

/**
 * WordPress Dependencies
 */
//@ts-ignore




function splitBorderRadius(value) {
  const isValueMixed = typeof value === "string";
  const splittedBorderRadius = {
    topLeft: value,
    topRight: value,
    bottomLeft: value,
    bottomRight: value
  };
  return isValueMixed ? splittedBorderRadius : value;
}
function BorderControl({
  borderLabel,
  attrBorderKey,
  borderRadiusLabel,
  attrBorderRadiusKey,
  showBorder = true,
  showBorderRadius = true,
  showDefaultBorder = false,
  showDefaultBorderRadius = false
}) {
  const {
    clientId
  } = (0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.useBlockEditContext)();
  // @ts-ignore
  const attributes = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_3__.useSelect)(
  // @ts-ignore
  select => select("core/block-editor").getSelectedBlock().attributes);
  const {
    updateBlockAttributes
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_3__.useDispatch)("core/block-editor");
  const setAttributes = newAttributes => {
    updateBlockAttributes(clientId, newAttributes);
  };
  // @ts-ignore
  const {
    defaultColors
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_3__.useSelect)(select => {
    return {
      defaultColors:
      // @ts-ignore
      select("core/block-editor")?.getSettings()?.__experimentalFeatures?.color?.palette?.default
    };
  });
  return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, showBorder && (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.__experimentalToolsPanelItem, {
    panelId: clientId,
    isShownByDefault: showDefaultBorder,
    resetAllFilter: () => setAttributes({
      [attrBorderKey]: {}
    }),
    hasValue: () => !(0,lodash__WEBPACK_IMPORTED_MODULE_1__.isEmpty)(attributes[attrBorderKey]),
    label: borderLabel,
    onDeselect: () => {
      setAttributes({
        [attrBorderKey]: {}
      });
    }
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.__experimentalBorderBoxControl, {
    enableAlpha: true,
    size: "__unstable-large",
    colors: defaultColors,
    label: borderLabel,
    onChange: newBorder => {
      setAttributes({
        [attrBorderKey]: newBorder
      });
    },
    value: attributes[attrBorderKey]
  })), showBorderRadius && (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.__experimentalToolsPanelItem, {
    panelId: clientId,
    isShownByDefault: showDefaultBorderRadius,
    resetAllFilter: () => setAttributes({
      [attrBorderRadiusKey]: {}
    }),
    label: borderRadiusLabel,
    hasValue: () => !(0,lodash__WEBPACK_IMPORTED_MODULE_1__.isEmpty)(attributes[attrBorderRadiusKey]),
    onDeselect: () => {
      setAttributes({
        [attrBorderRadiusKey]: {}
      });
    }
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.BaseControl.VisualLabel, {
    as: "legend"
  }, borderRadiusLabel), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "tableberg-custom-border-radius-control"
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.__experimentalBorderRadiusControl, {
    values: attributes[attrBorderRadiusKey],
    onChange: newBorderRadius => {
      const splitted = splitBorderRadius(newBorderRadius);
      setAttributes({
        [attrBorderRadiusKey]: splitted
      });
    }
  }))));
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (BorderControl);

/***/ }),

/***/ "./src/components/color-settings/color-settings-with-gradient.tsx":
/*!************************************************************************!*\
  !*** ./src/components/color-settings/color-settings-with-gradient.tsx ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__);

/**
 * WordPress Dependencies
 */




/**
 *
 * @param {object} props - Color settings with gradients props
 * @param {string} props.label - Component Label
 * @param {string} props.attrBackgroundKey - Attribute key for background color
 * @param {string} props.attrGradientKey - Attribute key for gradient background color
 *
 */
function ColorSettingWithGradient({
  attrBackgroundKey,
  attrGradientKey,
  label
}) {
  const {
    clientId
  } = (0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__.useBlockEditContext)();
  const {
    updateBlockAttributes
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useDispatch)("core/block-editor");

  // @ts-ignore
  const attributes = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useSelect)(select => {
    // @ts-ignore
    return select("core/block-editor").getBlockAttributes(clientId);
  });
  // @ts-ignore
  const setAttributes = newAttributes => updateBlockAttributes(clientId, newAttributes);
  const colorGradientSettings = (0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__.__experimentalUseMultipleOriginColorsAndGradients)();
  // @ts-ignore
  const {
    defaultColors,
    defaultGradients
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useSelect)(select => {
    return {
      defaultColors:
      // @ts-ignore
      select("core/block-editor")?.getSettings()?.__experimentalFeatures?.color?.palette?.default,
      defaultGradients:
      // @ts-ignore
      select("core/block-editor")?.getSettings()?.__experimentalFeatures?.color?.gradients?.default
    };
  });
  return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__.__experimentalColorGradientSettingsDropdown, {
    ...colorGradientSettings,
    enableAlpha: true,
    panelId: clientId,
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)("Color Settings", "gutenberghub-tabs"),
    popoverProps: {
      placement: "left start"
    },
    settings: [{
      clearable: true,
      resetAllFilter: () => setAttributes({
        [attrBackgroundKey]: null,
        [attrGradientKey]: null
      }),
      colorValue: attributes[attrBackgroundKey],
      gradientValue: attributes[attrGradientKey],
      colors: defaultColors,
      gradients: defaultGradients,
      label: label,
      onColorChange: newValue => setAttributes({
        [attrBackgroundKey]: newValue
      }),
      onGradientChange: newValue => setAttributes({
        [attrGradientKey]: newValue
      })
    }]
  });
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ColorSettingWithGradient);

/***/ }),

/***/ "./src/components/color-settings/color-settings.tsx":
/*!**********************************************************!*\
  !*** ./src/components/color-settings/color-settings.tsx ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__);

/**
 * WordPress Dependencies
 */




/**
 *
 * @param {object} props - Color settings props
 * @param {string} props.label - Component Label
 * @param {string} props.attrKey - Attribute key for color
 *
 */
function ColorSetting({
  attrKey,
  label
}) {
  const {
    clientId
  } = (0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__.useBlockEditContext)();
  const {
    updateBlockAttributes
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useDispatch)("core/block-editor");

  // @ts-ignore
  const attributes = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useSelect)(select => {
    // @ts-ignore
    return select("core/block-editor").getBlockAttributes(clientId);
  });
  const setAttributes = newAttributes => updateBlockAttributes(clientId, newAttributes);
  const colorGradientSettings = (0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__.__experimentalUseMultipleOriginColorsAndGradients)();
  // @ts-ignore
  const {
    defaultColors
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useSelect)(select => {
    return {
      defaultColors:
      // @ts-ignore
      select("core/block-editor")?.getSettings()?.__experimentalFeatures?.color?.palette?.default
    };
  });
  return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__.__experimentalColorGradientSettingsDropdown, {
    ...colorGradientSettings,
    enableAlpha: true,
    panelId: clientId,
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)("Color Settings", "gutenberghub-tabs"),
    popoverProps: {
      placement: "left start"
    },
    settings: [{
      clearable: true,
      resetAllFilter: () => setAttributes({
        [attrKey]: null
      }),
      colorValue: attributes[attrKey],
      colors: defaultColors,
      label: label,
      onColorChange: newValue => setAttributes({
        [attrKey]: newValue
      })
    }]
  });
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ColorSetting);

/***/ }),

/***/ "./src/components/index.tsx":
/*!**********************************!*\
  !*** ./src/components/index.tsx ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BorderControl: () => (/* reexport safe */ _border_control__WEBPACK_IMPORTED_MODULE_0__["default"]),
/* harmony export */   ColorSettings: () => (/* reexport safe */ _color_settings_color_settings__WEBPACK_IMPORTED_MODULE_3__["default"]),
/* harmony export */   ColorSettingsWithGradient: () => (/* reexport safe */ _color_settings_color_settings_with_gradient__WEBPACK_IMPORTED_MODULE_4__["default"]),
/* harmony export */   CustomToggleGroupControl: () => (/* reexport safe */ _toggle_group_control__WEBPACK_IMPORTED_MODULE_1__["default"]),
/* harmony export */   SpacingControl: () => (/* reexport safe */ _spacing_control__WEBPACK_IMPORTED_MODULE_2__["default"])
/* harmony export */ });
/* harmony import */ var _border_control__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./border-control */ "./src/components/border-control/index.tsx");
/* harmony import */ var _toggle_group_control__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./toggle-group-control */ "./src/components/toggle-group-control/index.tsx");
/* harmony import */ var _spacing_control__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./spacing-control */ "./src/components/spacing-control/index.tsx");
/* harmony import */ var _color_settings_color_settings__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./color-settings/color-settings */ "./src/components/color-settings/color-settings.tsx");
/* harmony import */ var _color_settings_color_settings_with_gradient__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./color-settings/color-settings-with-gradient */ "./src/components/color-settings/color-settings-with-gradient.tsx");






/***/ }),

/***/ "./src/components/spacing-control/index.tsx":
/*!**************************************************!*\
  !*** ./src/components/spacing-control/index.tsx ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! lodash */ "lodash");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__);

/**
 * WordPress Dependencies
 */
//@ts-ignore




function SpacingControl({
  label,
  attrKey,
  showByDefault = false
}) {
  const {
    clientId
  } = (0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.useBlockEditContext)();

  //@ts-ignore
  const attributes = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_3__.useSelect)(select =>
  //@ts-ignore
  select("core/block-editor").getSelectedBlock().attributes);
  const {
    updateBlockAttributes
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_3__.useDispatch)("core/block-editor");
  const setAttributes = newAttributes => {
    updateBlockAttributes(clientId, newAttributes);
  };
  return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.__experimentalToolsPanelItem, {
    panelId: clientId,
    isShownByDefault: showByDefault,
    resetAllFilter: () => {
      setAttributes({
        [attrKey]: {}
      });
    },
    className: "tools-panel-item-spacing",
    label: label,
    onDeselect: () => setAttributes({
      [attrKey]: {}
    }),
    hasValue: () => !(0,lodash__WEBPACK_IMPORTED_MODULE_1__.isEmpty)(attributes[attrKey])
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.__experimentalSpacingSizesControl, {
    allowReset: true,
    label: label,
    values: attributes[attrKey],
    sides: ["top", "right", "bottom", "left"],
    onChange: newValue => {
      setAttributes({
        [attrKey]: newValue
      });
    }
  })));
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (SpacingControl);

/***/ }),

/***/ "./src/components/toggle-group-control/index.tsx":
/*!*******************************************************!*\
  !*** ./src/components/toggle-group-control/index.tsx ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__);

/**
 * WordPress Dependencies
 */

//@ts-ignore


function CustomToggleGroupControl({
  label,
  options,
  attributeKey,
  isBlock = false,
  isAdaptiveWidth = false,
  isDeselectable = false
}) {
  const {
    clientId
  } = (0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.useBlockEditContext)();
  const {
    updateBlockAttributes
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useDispatch)("core/block-editor");

  //@ts-ignore
  const attributes = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useSelect)(select => {
    //@ts-ignore
    return select("core/block-editor").getBlockAttributes(clientId);
  });
  const setAttributes = newAttributes => updateBlockAttributes(clientId, newAttributes);
  return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.__experimentalToggleGroupControl, {
    label: label,
    isBlock: isBlock,
    isDeselectable: isDeselectable,
    isAdaptiveWidth: isAdaptiveWidth,
    __nextHasNoMarginBottom: true,
    value: attributes[attributeKey],
    onChange: newValue => {
      setAttributes({
        [attributeKey]: newValue
      });
    }
  }, options.map(({
    value,
    icon = null,
    label
  }) => {
    return icon ? (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.__experimentalToggleGroupControlOptionIcon, {
      key: value,
      value: value,
      icon: icon,
      label: label
    }) : (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.__experimentalToggleGroupControlOption, {
      key: value,
      value: value,
      label: label
    });
  }));
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (CustomToggleGroupControl);

/***/ }),

/***/ "./node_modules/.pnpm/classnames@2.3.2/node_modules/classnames/index.js":
/*!******************************************************************************!*\
  !*** ./node_modules/.pnpm/classnames@2.3.2/node_modules/classnames/index.js ***!
  \******************************************************************************/
/***/ ((module, exports) => {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	Copyright (c) 2018 Jed Watson.
	Licensed under the MIT License (MIT), see
	http://jedwatson.github.io/classnames
*/
/* global define */

(function () {
	'use strict';

	var hasOwn = {}.hasOwnProperty;
	var nativeCodeString = '[native code]';

	function classNames() {
		var classes = [];

		for (var i = 0; i < arguments.length; i++) {
			var arg = arguments[i];
			if (!arg) continue;

			var argType = typeof arg;

			if (argType === 'string' || argType === 'number') {
				classes.push(arg);
			} else if (Array.isArray(arg)) {
				if (arg.length) {
					var inner = classNames.apply(null, arg);
					if (inner) {
						classes.push(inner);
					}
				}
			} else if (argType === 'object') {
				if (arg.toString !== Object.prototype.toString && !arg.toString.toString().includes('[native code]')) {
					classes.push(arg.toString());
					continue;
				}

				for (var key in arg) {
					if (hasOwn.call(arg, key) && arg[key]) {
						classes.push(key);
					}
				}
			}
		}

		return classes.join(' ');
	}

	if ( true && module.exports) {
		classNames.default = classNames;
		module.exports = classNames;
	} else if (true) {
		// register as 'classnames', consistent with npm package name
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function () {
			return classNames;
		}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else {}
}());


/***/ }),

/***/ "./src/button/style.scss":
/*!*******************************!*\
  !*** ./src/button/style.scss ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "React" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = window["React"];

/***/ }),

/***/ "lodash":
/*!*************************!*\
  !*** external "lodash" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = window["lodash"];

/***/ }),

/***/ "@wordpress/block-editor":
/*!*************************************!*\
  !*** external ["wp","blockEditor"] ***!
  \*************************************/
/***/ ((module) => {

"use strict";
module.exports = window["wp"]["blockEditor"];

/***/ }),

/***/ "@wordpress/blocks":
/*!********************************!*\
  !*** external ["wp","blocks"] ***!
  \********************************/
/***/ ((module) => {

"use strict";
module.exports = window["wp"]["blocks"];

/***/ }),

/***/ "@wordpress/components":
/*!************************************!*\
  !*** external ["wp","components"] ***!
  \************************************/
/***/ ((module) => {

"use strict";
module.exports = window["wp"]["components"];

/***/ }),

/***/ "@wordpress/compose":
/*!*********************************!*\
  !*** external ["wp","compose"] ***!
  \*********************************/
/***/ ((module) => {

"use strict";
module.exports = window["wp"]["compose"];

/***/ }),

/***/ "@wordpress/data":
/*!******************************!*\
  !*** external ["wp","data"] ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = window["wp"]["data"];

/***/ }),

/***/ "@wordpress/element":
/*!*********************************!*\
  !*** external ["wp","element"] ***!
  \*********************************/
/***/ ((module) => {

"use strict";
module.exports = window["wp"]["element"];

/***/ }),

/***/ "@wordpress/i18n":
/*!******************************!*\
  !*** external ["wp","i18n"] ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = window["wp"]["i18n"];

/***/ }),

/***/ "@wordpress/primitives":
/*!************************************!*\
  !*** external ["wp","primitives"] ***!
  \************************************/
/***/ ((module) => {

"use strict";
module.exports = window["wp"]["primitives"];

/***/ }),

/***/ "@wordpress/url":
/*!*****************************!*\
  !*** external ["wp","url"] ***!
  \*****************************/
/***/ ((module) => {

"use strict";
module.exports = window["wp"]["url"];

/***/ }),

/***/ "./src/button/block.json":
/*!*******************************!*\
  !*** ./src/button/block.json ***!
  \*******************************/
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"$schema":"https://schemas.wp.org/trunk/block.json","apiVersion":3,"version":"0.0.2","title":"Button","name":"tableberg/button","parent":["tableberg/cell"],"category":"design","icon":"button","description":"Tableberg Button: Add a button to your tableberg table","attributes":{"text":{"type":"string"},"width":{"type":"number"},"backgroundColor":{"type":"string"},"backgroundGradient":{"type":"string"},"textColor":{"type":"string"},"backgroundHoverGradient":{"type":"string"},"backgroundHoverColor":{"type":"string"},"textHoverColor":{"type":"string"},"textAlign":{"type":"string"},"id":{"type":"string"},"url":{"type":"string"},"linkTarget":{"type":"string"},"rel":{"type":"string"}},"supports":{"html":false,"typography":{"fontSize":true},"__experimentalBorder":{"radius":true}},"textdomain":"tableberg","editorScript":"file:./index.tsx","editorStyle":"file:./index.css","style":"file:./style-index.css"}');

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"button/index": 0,
/******/ 			"button/style-index": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = globalThis["webpackChunktableberg"] = globalThis["webpackChunktableberg"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["button/style-index"], () => (__webpack_require__("./src/button/index.tsx")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=index.js.map