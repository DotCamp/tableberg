import React, { useMemo, useEffect } from "react";
import { __ } from "@wordpress/i18n";
import RightContainerItem from "./RightContainerItem";
import VersionControl from "./VersionControl";
import Navigation from "./Navigation";
import { routeObjects } from "../inc/routes";
import AssetProvider from "./AssetProvider";
import ButtonLink from "./ButtonLink";

/**
 * Settings menu header element.
 *
 * @return {JSX.Element} component
 */
function MenuHeader({ currentRoutePath, setCurrentRoutePath }) {
    useEffect(() => {
        const url = new URL(window.location.href);
        url.searchParams.set("route", currentRoutePath);
        window.history.pushState(null, null, url.href);
    }, [currentRoutePath]);

    const routeObjectsMinus404 = useMemo(
        () => routeObjects.slice(0, routeObjects.length - 1),
        [],
    );
    const logoUrl = tablebergAdminMenuData?.assets.logo;
    const versionData = tablebergAdminMenuData?.versionControl;

    /**
     * Rollback plugin version.
     *
     * @param {Function} dispatch store action dispatch function
     * @param {Function} getState store state selection function
     * @return {Function} action function
     */
    const rollbackToVersion = (version) => {
        const { url, action, nonce } = versionData.ajax.versionRollback;

        const formData = new FormData();
        formData.append("action", action);
        formData.append("nonce", nonce);
        formData.append("version", version);

        return fetch(url, {
            method: "POST",
            body: formData,
        })
            .then((resp) => {
                return resp.json();
            })
            .then((data) => {
                if (data.error) {
                    throw new Error(data.error);
                }

                return data;
            });
    };
    return (
        <div className={"header-wrapper"}>
            <div className={"menu-header"}>
                <div className={"left-container"}>
                    <div className={"logo-container"}>
                        <img alt={"plugin logo"} src={logoUrl} />
                        <div className={"tableberg-plugin-logo-text"}>
                            Tableberg
                        </div>
                    </div>
                </div>
                <div className={"tableberg-menu-navigation-wrapper"}>
                    <Navigation
                        routes={routeObjectsMinus404}
                        currentRoutePath={currentRoutePath}
                        setRoute={setCurrentRoutePath}
                    />
                </div>
                <div className={"right-container"}>
                    <RightContainerItem>
                        <div className={"version-control-header-wrapper"}>
                            <VersionControl
                                pluginVersion={versionData.currentVersion}
                                allVersions={versionData.versions}
                                onVersionRollBack={rollbackToVersion}
                            />
                        </div>
                    </RightContainerItem>
                    {!tablebergAdminMenuData.misc.pro_status && (
                        <RightContainerItem>
                            <AssetProvider assetIds={["proBuyUrl"]}>
                                {({ proBuyUrl }) => (
                                    <ButtonLink
                                        url={proBuyUrl}
                                        title="Upgrade to PRO"
                                    />
                                )}
                            </AssetProvider>
                        </RightContainerItem>
                    )}
                </div>
            </div>
            <div className={"dropdown-navigation"}>
                <div className={"dropdown-drawer"}>
                    <Navigation
                        routes={routeObjectsMinus404}
                        currentRoutePath={currentRoutePath}
                        setRoute={setCurrentRoutePath}
                    />
                    <div className={"hamburger-version-control"}>
                        <VersionControl
                            pluginVersion={versionData.currentVersion}
                            allVersions={versionData.versions}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * @module MenuHeader
 */
export default MenuHeader;
