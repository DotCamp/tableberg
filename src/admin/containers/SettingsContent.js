import React, { useRef } from "react";
import { __ } from "@wordpress/i18n";
import { BoxContentAlign } from "../components/BoxContent/BoxContent";
import UpgradeBoxContent from "../components/UpgradeBoxContent";
import BooleanSetting from "../components/BooleanSetting";
import NumberSettings from "../components/NumberSettings";
import { toggleGlobalControl, toggleIndividualControl } from "../functions";
/**
 * Settings content.
 *
 * @class
 */
function SettingsContent() {
    const individualData = tablebergAdminMenuData?.individual_control;
    const globalControl = tablebergAdminMenuData?.global_control;
    const blockProperties = tablebergAdminMenuData?.block_properties?.data;

    const individualDataProps = {
        onStatusChange: toggleIndividualControl,
        ...individualData.data[0],
    };
    const globalControlDataProps = {
        onStatusChange: toggleGlobalControl,
        ...globalControl.data[0],
    };
    return (
        <div className="tableberg-settings-content">
            <BooleanSetting {...individualDataProps} />
            {blockProperties.map((property) => {
                return <NumberSettings {...property} />;
            })}
            <BooleanSetting {...globalControlDataProps} />
            <UpgradeBoxContent alignment={BoxContentAlign.CENTER} />
        </div>
    );
}

/**
 * @module SettingsContent
 */
export default SettingsContent;
