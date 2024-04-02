// eslint-disable-next-line no-unused-vars
import React, { useMemo, useState } from "react";
import VersionControlPopup from "./VersionControlPopup";
import Portal from "./Portal";
import HeaderVersionInfo from "./HeaderVersionInfo";

/**
 * Version control component.
 *
 * @param {Object}   props                      component properties
 * @param {string}   props.pluginVersion        plugin version
 * @param {Object}   props.allVersions          available versions
 * @param {Function} props.onVersionRollBack    version roll back function
 * @function Object() { [native code] }
 */
function VersionControl({ pluginVersion, allVersions, onVersionRollBack }) {
    const [selectedVersion, setSelectedVersion] = useState(pluginVersion);
    const [popupVisibility, setPopupVisibility] = useState(false);

    const sortedVersions = useMemo(
        () => allVersions.sort().reverse(),
        [allVersions]
    );

    /**
     * Callback for version selection.
     *
     * @param {string} targetVersion target version
     */
    const onVersionSelect = (targetVersion) => {
        setSelectedVersion(targetVersion);
        setPopupVisibility(true);
    };

    /**
     * Start version operation.
     *
     * @return {Promise} operation promise object
     */
    const startVersionOperation = () => {
        return onVersionRollBack(selectedVersion);
    };

    return (
        <div className={"version-control-container"}>
            <HeaderVersionInfo
                availableVersions={sortedVersions}
                currentVersion={selectedVersion}
                onSelect={onVersionSelect}
            />
            {popupVisibility && (
                <Portal target={document.body}>
                    <VersionControlPopup
                        onCloseHandler={() => {
                            setSelectedVersion(pluginVersion);
                            setPopupVisibility(false);
                        }}
                        from={pluginVersion}
                        to={selectedVersion}
                        onOperationStart={startVersionOperation}
                    />
                </Portal>
            )}
        </div>
    );
}

/**
 * @module VersionControl
 */
export default VersionControl;
