import React, { useEffect, useMemo } from "react";
import Router from "./Router";
import routes from "../inc/routes";
import { generateRouteArray } from "../inc/Route";
import NoRouterComponentFoundError from "../inc/err/NoRouterComponentFoundError";

/**
 * RouterProvider component.
 *
 * @param {Object}   props                  component properties
 * @param {Router}   props.children         router component
 * @class
 */
function RouterProvider({ children, currentRoutePath, setCurrentRoutePath }) {
    const RouterChild = useMemo(() => {
        const Component = children?.type === Router ? children.type : null;

        if (Component === null) {
            throw new NoRouterComponentFoundError();
        }

        return Component;
    }, [currentRoutePath]);

    const generatedRoutes = useMemo(() => {
        return generateRouteArray(routes);
    }, []);

    /**
     * Parse url and set route path.
     */
    const parseRouteFromUrl = () => {
        const url = new URL(window.location.href);
        const urlRoute = url.searchParams.get("route");

        if (urlRoute) {
            setCurrentRoutePath(urlRoute);
        }
    };

    /**
     * Hook to add event listener for popstate.
     */
    useEffect(() => {
        window.addEventListener("popstate", parseRouteFromUrl);
    }, []);

    /**
     * Parse url and set route path at startup.
     */
    useEffect(() => {
        parseRouteFromUrl();
    }, []);

    /**
     * Add route path to url.
     */
    useEffect(() => {
        const url = new URL(window.location.href);
        url.searchParams.set("route", currentRoutePath);
        window.history.pushState(null, null, url.href);
    }, [currentRoutePath]);

    return (
        <RouterChild
            routes={generatedRoutes}
            currentRoutePath={currentRoutePath}
        />
    );
}

/**
 * @module RouterProvider
 */
export default RouterProvider;
