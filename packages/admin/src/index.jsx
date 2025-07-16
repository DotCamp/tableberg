import { createRoot } from "react-dom";
import AdminMenuContainer from "./containers/AdminMenuContainer";
import AdminMenuWrapper from "./components/AdminMenuWrapper";

import "./css/src/tableberg-admin-settings.scss";

const mountPoint = document.querySelector("#tableberg-admin-menu");

if (mountPoint) {
    const root = createRoot(mountPoint);

    root.render(
        <AdminMenuWrapper>
            <AdminMenuContainer />
        </AdminMenuWrapper>,
    );
}
