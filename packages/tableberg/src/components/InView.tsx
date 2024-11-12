import React, {useEffect, useRef, useState} from "react";

/**
 * Props for InView component.
 */
interface InViewProps {
    children: React.ReactNode;
    viewRatio?: number;
}

/**
 * Component to render children when they are in view.
 *
 * @param children Component to render when in view.
 * @param [viewRatio=0.1] Ratio of the element that needs to be in view to trigger the render. (1.0 being fully in view)
 *
 * @constructor
 */
const InView: React.FC<InViewProps> = ({children, viewRatio = 0.1}) => {
    const [isInView, setIsInView] = useState(false);

    const wrapperRef = useRef(null);

    // component observer initialization
    const observer = new IntersectionObserver(([entry]) => {
        const {isIntersecting} = entry;

        // only update state if element is in view
        if (isIntersecting) {
            setIsInView(isIntersecting);
        }
    }, {threshold: viewRatio})

    useEffect(() => {
        if (wrapperRef.current) {
            observer.observe(wrapperRef.current);
        }
    }, [wrapperRef]);

    // disconnect observer when component is in view to prevent multiple calls
    useEffect(() => {
        if (isInView) {
            observer.disconnect();
        }
    }, [isInView])

    return (<div className={'tableberg-in-view-wrapper'} ref={wrapperRef}>
        {
            isInView && children
        }
    </div>);
}

export default InView;
