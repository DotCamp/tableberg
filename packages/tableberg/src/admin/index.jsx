// eslint-disable-next-line no-unused-vars
import { createRoot } from "react-dom/client";
import AdminMenuContainer from "./containers/AdminMenuContainer";
import AdminMenuWrapper from "./components/AdminMenuWrapper";

const mountPoint = document.querySelector("#tableberg-admin-menu");

if (mountPoint) {
    const root = createRoot(mountPoint);

    root.render(
        <AdminMenuWrapper>
            <AdminMenuContainer />
        </AdminMenuWrapper>
    );
}
