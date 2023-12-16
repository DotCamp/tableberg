// eslint-disable-next-line no-unused-vars
import { createRoot } from "react-dom/client";
import AdminMenuContainer from "./containers/AdminMenuContainer";
import "./css/src/tableberg-admin-settings.scss";
import AdminMenuWrapper from "./components/AdminMenuWrapper";

const mountPoint = document.querySelector("#tableberg-admin-menu");

if (mountPoint) {
    const root = createRoot(mountPoint);

    root.render(
        <AdminMenuWrapper>
            <AdminMenuContainer />
        </AdminMenuWrapper>
    );
} else {
    throw new Error("no mount point found for settings menu");
}
