import React, { useEffect, useRef, useState } from "react";

/**
 * Toggle control component.
 *
 * @class
 * @param {Object}   props                component properties
 * @param {boolean}  props.status         control status
 * @param {boolean}  props.name           control name
 * @param {boolean}  props.disabled       control disabled status
 * @param {Function} props.onStatusChange status changed callback
 */
function ToggleControl({
    status,
    name,
    onStatusChange = () => {},
    disabled = false,
}) {
    /**
     * Click handler for toggle component.
     */
    const clickHandler = () => {
        if (!disabled) {
            onStatusChange(!status, name);
        }
    };

    return (
        <div
            onClick={clickHandler}
            className={"tableberg-toggle-control"}
            data-enabled={JSON.stringify(disabled || status)}
            role={"button"}
        >
            <div className={"knob"}></div>
        </div>
    );
}

/**
 * @module ToggleControl
 */
export default ToggleControl;
