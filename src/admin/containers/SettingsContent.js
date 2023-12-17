import React, { useRef } from "react";
import { __ } from "@wordpress/i18n";
import BoxContentProvider from "../components/BoxContent/BoxContentProvider";
import {
    BoxContentAlign,
    BoxContentLayout,
    BoxContentSize,
} from "../components/BoxContent/BoxContent";
import ButtonLink, { ButtonLinkType } from "../components/ButtonLink";
import UpgradeBoxContent from "../components/UpgradeBoxContent";
// import BlockControlsContainer from "../components/BlockControlsContainer";

/**
 * Blocks content.
 *
 * @param {Object}   props                component properties
 * @param {Array}    props.pluginBlocks   plugin blocks, will be supplied via HOC
 * @param {Function} props.setBlockStatus set block status, will be supplied via HOC
 * @param {Function} props.dispatch       store action dispatch function, will be supplied via HOC
 * @class
 */
function SettingsContent({ pluginBlocks, setBlockStatus, dispatch }) {
    const pluginBlockNames = useRef(pluginBlocks.map(({ name }) => name));

    /**
     * Toggle status of all available blocks.
     *
     * @param {boolean} status status to set
     */
    const toggleAllBlockStatus = (status) => {
        dispatch(toggleBlockStatus)(pluginBlockNames.current, status);
        pluginBlockNames.current.map((bName) =>
            setBlockStatus({ id: bName, status })
        );
    };

    return (
        <div className="tableberg-blocks-content">
            <BoxContentProvider
                layout={BoxContentLayout.HORIZONTAL}
                contentId={"globalControl"}
                size={BoxContentSize.JUMBO}
            >
                <ButtonLink
                    onClickHandler={() => {
                        toggleAllBlockStatus(true);
                    }}
                    type={ButtonLinkType.DEFAULT}
                    title={__("Activate All")}
                />
                <ButtonLink
                    onClickHandler={() => {
                        toggleAllBlockStatus(false);
                    }}
                    type={ButtonLinkType.DEFAULT}
                    title={__("Deactivate All")}
                />
            </BoxContentProvider>
            {/* <BlockControlsContainer /> */}
            {/* <UpgradeBoxContent alignment={BoxContentAlign.CENTER} /> */}
        </div>
    );
}

/**
 * @module SettingsContent
 */
export default SettingsContent;
