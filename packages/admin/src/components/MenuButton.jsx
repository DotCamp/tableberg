import React from "react";

/**
 * Button types.
 *
 * @type {Object}
 */
export const BUTTON_TYPES = {
    NEGATIVE: "negative",
    POSITIVE: "positive",
};

/**
 * Menu button component.
 *
 * @param {Object}   props                         component properties
 * @param {string}   props.title                   button title
 * @param {Function} [props.onClickHandler=()=>{}] click callback
 * @param {boolean}  [props.status=false]          enabled status
 * @param {string}   [props.type='negative']       button type
 * @class
 */
function MenuButton({
    title,
    onClickHandler = () => {},
    status = false,
    type = BUTTON_TYPES.NEGATIVE,
}) {
    const typeClass = () => {
        let buttonClass = "";

        switch (type) {
            case BUTTON_TYPES.NEGATIVE: {
                buttonClass = "tableberg-negative-bg";
                break;
            }
            case BUTTON_TYPES.POSITIVE: {
                buttonClass = "tableberg-positive-bg";
                break;
            }
        }

        return buttonClass;
    };

    return (
        <div
            onClick={() => {
                if (status) {
                    onClickHandler();
                }
            }}
            className={`tableberg-menu-button ${typeClass()}`}
            data-enabled={JSON.stringify(status)}
        >
            {title}
        </div>
    );
}

/**
 * @module MenuButton
 */
export default MenuButton;
