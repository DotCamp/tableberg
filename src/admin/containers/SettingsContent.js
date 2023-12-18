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
import BooleanSetting from "../components/BooleanSetting";
import NumberSettings from "../components/NumberSettings";

/**
 * Blocks content.
 *
 * @param {Object}   props                component properties
 * @param {Array}    props.pluginBlocks   plugin blocks, will be supplied via HOC
 * @param {Function} props.setBlockStatus set block status, will be supplied via HOC
 * @param {Function} props.dispatch       store action dispatch function, will be supplied via HOC
 * @class
 */
function SettingsContent() {
    const individualData = tablebergAdminMenuData?.individual_control?.data[0];
    const globalControl = tablebergAdminMenuData?.global_control?.data[0];
    const blockProperties = tablebergAdminMenuData?.block_properties?.data;

    return (
        <div className="tableberg-settings-content">
            <BooleanSetting {...individualData} />
            {blockProperties.map((property) => {
                return <NumberSettings {...property} />;
            })}
            <BooleanSetting {...globalControl} />
            <UpgradeBoxContent alignment={BoxContentAlign.CENTER} />
        </div>
    );
}

/**
 * @module SettingsContent
 */
export default SettingsContent;
