import React from "react";
import Route, { generateRouteArray } from "./Route";
import WelcomePage from "../pages/WelcomePage";
import BlocksPage from "../pages/BlocksPage";
import SettingsContent from "../containers/SettingsContent";
import AIDebugPage from "../pages/AIDebugPage";

/**
 * Routes for admin menu.
 *
 * Last route is reserved for 404 page.
 *
 * @type {Array} routes array
 */
const routes = [
    {
        path: "welcome",
        title: "Welcome",
        element: <WelcomePage />,
    },
    {
        path: "blocks",
        title: "Blocks",
        element: <BlocksPage />,
    },
    {
        path: "settings",
        title: "Settings",
        element: <SettingsContent />,
    },
    {
        path: "ai-debug",
        title: "AI Debug",
        element: <AIDebugPage />,
        requiresPro: true,
    },
    {
        path: "404",
        title: "404",
        element: <div>404</div>,
    },
];

/**
 * Generated route objects array.
 *
 * @type {Array<Route>}
 */
export const routeObjects = generateRouteArray(routes);

/**
 * @module routes
 */
export default routes;
