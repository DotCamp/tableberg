import React, { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { __ } from "@wordpress/i18n";
import MenuButton, { BUTTON_TYPES } from "./MenuButton";
import { faRightLong } from "@fortawesome/free-solid-svg-icons";

/**
 * Version control popup component.
 *
 * @param {Object}   props                  component properties
 * @param {string}   props.from             current version
 * @param {string}   props.to               version to rollback
 * @param {Function} props.onCloseHandler   close popup callback
 * @param {Function} props.onOperationStart operation start callback
 * @param {number}   props.reloadDelay      automatic page reload delay in milliseconds
 * @class
 */
function VersionControlPopup({
    from,
    to,
    onCloseHandler,
    onOperationStart,
    reloadDelay = 5000,
}) {
    const OPERATION_STATUS_TYPES = {
        NOT_STARTED: "notStarted",
        STARTED: "started",
        FINISHED: "finished",
    };

    const RESPONSE_TYPES = {
        OK: "ok",
        ERROR: "error",
    };

    /**
     * Generate response object.
     *
     * @param {string} message     message
     * @param {string} [type='ok'] response type.
     * @return {Object} response object
     */
    const generateResponseObject = (message, type = RESPONSE_TYPES.OK) => {
        return {
            type,
            message,
        };
    };

    const [operationStatus, setOperationStatus] = useState(
        OPERATION_STATUS_TYPES.NOT_STARTED,
    );
    const [reloadCountdown, setReloadCountdown] = useState(reloadDelay / 1000);

    const [responseObject, setResponseObject] = useState(
        generateResponseObject(""),
    );

    const isDowngrade = from > to;

    const countdownToReload = useRef(reloadDelay);

    /**
     * Start rollback operation.
     */
    const startOperation = () => {
        setOperationStatus(OPERATION_STATUS_TYPES.STARTED);
        onOperationStart()
            .then(({ message }) => {
                setResponseObject(
                    generateResponseObject(message, RESPONSE_TYPES.OK),
                );
            })
            .catch(({ message }) => {
                setResponseObject(
                    generateResponseObject(message, RESPONSE_TYPES.ERROR),
                );
            })
            .finally(() => {
                setOperationStatus(OPERATION_STATUS_TYPES.FINISHED);
                reloadPage();
            });
    };

    /**
     * Reload page after a designated amount of time.
     */
    const reloadPage = () => {
        const reloadIntervalId = setInterval(() => {
            if (countdownToReload.current <= 0) {
                window.location.reload();
                clearInterval(reloadIntervalId);
            } else {
                countdownToReload.current = countdownToReload.current - 1000;
                setReloadCountdown(countdownToReload.current / 1000);
            }
        }, 1000);
    };

    return (
        <div className={"version-control-popup"}>
            <div className={"modal-container"}>
                <div className={"rollback-versions"}>
                    <div
                        className={`version-id ${
                            isDowngrade
                                ? "tableberg-positive-color"
                                : "tableberg-negative-color"
                        }`}
                    >
                        {from}
                    </div>
                    <div
                        className={"version-icon"}
                        data-in-progress={JSON.stringify(
                            operationStatus === OPERATION_STATUS_TYPES.STARTED,
                        )}
                    >
                        <div className={"version-icon-inner-wrapper"}>
                            <FontAwesomeIcon icon={faRightLong} />
                        </div>
                    </div>
                    <div
                        className={`version-id ${
                            isDowngrade
                                ? "tableberg-negative-color"
                                : "tableberg-positive-color"
                        }`}
                    >
                        {to}
                    </div>
                </div>
                {operationStatus !== OPERATION_STATUS_TYPES.STARTED && (
                    <div className={"version-content"}>
                        {operationStatus ===
                            OPERATION_STATUS_TYPES.NOT_STARTED && (
                            <div className={"version-warning"}>
                                <div>
                                    {__(
                                        "Older versions might be unstable. Do it on your own risk and create a backup.",
                                        "tableberg",
                                    )}
                                </div>
                                <div
                                    className={
                                        "version-rollback-button-container"
                                    }
                                >
                                    <MenuButton
                                        type={BUTTON_TYPES.POSITIVE}
                                        onClickHandler={startOperation}
                                        status={true}
                                        title={"Start"}
                                    />
                                    <MenuButton
                                        onClickHandler={onCloseHandler}
                                        status={true}
                                        title={"Close"}
                                    />
                                </div>
                            </div>
                        )}
                        {operationStatus ===
                            OPERATION_STATUS_TYPES.FINISHED && (
                            <div className={"operation-finished-wrapper"}>
                                <div
                                    className={"version-control-response"}
                                    data-resp-type={responseObject.type}
                                >
                                    {responseObject.message}
                                </div>
                                <div>
                                    {reloadCountdown <= 0
                                        ? `${__(
                                              "Reloading page now…",
                                              "tableberg",
                                          )}`
                                        : `${__(
                                              "Reloading page in ",
                                              "tableberg",
                                          )} ${reloadCountdown}...`}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * @module VersionControlPopup
 */
export default VersionControlPopup;
