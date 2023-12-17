// eslint-disable-next-line no-unused-vars
import React from "react";
// import MenuHeader from "../components/MenuHeader";
import Content from "../components/Content";
// import UpsellModalSettingsMenu from '$Components/UpsellModalSettingsMenu';

/**
 * Container for admin menu.
 *
 * @return {JSX.Element} container component
 * @function Object() { [native code] }
 */
function AdminMenuContainer() {
    return (
        <div className={"tableberg-admin-menu-container"}>
            {/* <UpsellModalSettingsMenu /> */}
            {/* <MenuHeader />*/}
            <Content />
        </div>
    );
}

/**
 * @module AdminMenuContainer
 */
export default AdminMenuContainer;
