import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Props for InView component.
 */
interface InViewProps {
    children: React.ReactNode;
    viewRatio?: number;
    classNames?: string[];
}

/**
 * Component to render children when they are in view.
 *
 * @param props                 Component props.
 * @param props.children        Component to render when in view.
 * @param [props.viewRatio=0.1] Ratio of the element that needs to be in view to trigger the render. (1.0 being fully in view)
 *
 * @param [props.classNames=[]] Additional class names to apply to the wrapper.
 * @class
 */
const InView: React.FC<InViewProps> = ({
    children,
    viewRatio = 0.1,
    classNames = [],
}) => {
    const [isInView, setIsInView] = useState(false);

    const wrapperRef = useRef(null);

    // Component observer initialization.
    const observer = useMemo(
        () =>
            new IntersectionObserver(
                ([entry]) => {
                    const { isIntersecting } = entry;

                    // only update state if element is in view
                    if (isIntersecting) {
                        setIsInView(isIntersecting);
                    }
                },
                { threshold: viewRatio },
            ),
        [viewRatio],
    );

    // Class list for the wrapper.
    const classList = useMemo(
        () => ["tableberg-in-view-wrapper", ...classNames].join(" "),
        [classNames],
    );

    useEffect(() => {
        if (wrapperRef.current) {
            observer.observe(wrapperRef.current);
        }
    }, [observer, wrapperRef]);

    // disconnect observer when component is in view to prevent multiple calls
    useEffect(() => {
        if (isInView) {
            observer.disconnect();
        }
    }, [observer, isInView]);

    return (
        <div className={classList} ref={wrapperRef}>
            {isInView && children}
        </div>
    );
};

export default InView;
