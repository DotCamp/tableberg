import React from "react";
import Router from "../components/Router";
import RouterProvider from "../components/RouterProvider";

/**
 * Contents of menu page.
 */
function Content({ currentRoutePath, setCurrentRoutePath }) {
    return (
        <RouterProvider
            currentRoutePath={currentRoutePath}
            setCurrentRoutePath={setCurrentRoutePath}
        >
            <Router />
        </RouterProvider>
    );
}

/**
 * @module Content
 */
export default Content;
