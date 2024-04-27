import { __ } from "@wordpress/i18n";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons'

/**
 * Menu block control component.
 *
 * This control will be used for both enabling/disabling blocks and showing info about them.
 *
 * @class
 *
 * @param {Object}        props                component properties
 * @param {string}        props.title          block title
 * @param {string}        props.name           registry id of block
 * @param {boolean}       props.isActive       if the block is activated
 * @param {HTMLElement}   props.iconElement    block icon element
 * @param {boolean}       props.isPro          block belongs to pro version
 * @param {boolean}       props.isProPlugin    plugin pro status
 * @param {Function}      props.showUpsell     set target block type for modal interface
 * @param {string | null} [props.demoUrl=null] demo url for block
 */
function BlockControlCard({
    title,
    name,
    status,
    iconElement,
    isPro,
    isProPlugin,
    showUpsell,
    demoUrl = null,
}) {
    return (
        <div
            className={"tableberg-block-control"}
            data-enabled={isPro && isProPlugin ? "true" : "false"}
        >
            <div className={"tableberg-block-title"}>
                <div
                    className={"tableberg-block-title-left-container"}
                    data-demo={demoUrl !== null}
                >
                    <div className={"tableberg-title-icon"}>{iconElement}</div>
                    <div className={"tableberg-title-text"}>
                        {title}
                        {isPro && (
                            <span className={"tableberg-pro-block-card-title-suffix"}>
                                PRO
                            </span>
                        )}
                    </div>
                    {demoUrl && (
                        <div className={"tableberg-title-demo"}>
                            <a
                                href={demoUrl}
                                target={"_blank"}
                                rel="noreferrer"
                                className={"tableberg-strip-anchor-styles"}
                            >
                                {__("See Documentation", "tableberg")}
                            </a>
                        </div>
                    )}
                </div>
                <div className={"tableberg-block-title-right-container"}>
                    <div
                        role={"button"}
                        className={"tableberg-pro-block-card-info-button"}
                        onClick={(e) => {
                            e.preventDefault();
                            showUpsell(name);
                        }}
                    >
                        <FontAwesomeIcon icon={faCircleInfo} />
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * @module BlockControl
 */
export default BlockControlCard;
