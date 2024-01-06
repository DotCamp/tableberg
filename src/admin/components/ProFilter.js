import { useEffect, useState } from "react";

/**
 * Component to filter its children based on pro version status of current plugin.
 *
 * @param {Object}                    props               component properties
 * @param {boolean}                   props.proStatus     pro version status, will be supplied via HOC
 * @param {Array | Function | string} props.children      component children
 * @param {boolean}                   [props.invert=true] invert filter, if true, children will be rendered only if proStatus is false
 * @class
 */
function ProFilter({ proStatus = false, children, invert = true }) {
    const [finalStatus, setFinalStatus] = useState(false);

    /**
     * useEffect hook.
     */
    useEffect(() => {
        setFinalStatus(invert ? !proStatus : proStatus);
    }, []);

    return finalStatus && children;
}

/**
 * @module ProFilter
 */
export default ProFilter;
