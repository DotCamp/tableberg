import {useEffect, useRef, useState} from "react";

export default function InView({children}: { children: React.ReactNode }) {
    const [isInView, setIsInView] = useState(false);

    const wrapperRef = useRef(null);

    const observer = new IntersectionObserver(([entry]) => {
        const {isIntersecting} = entry;

        // only update state if element is in view
        if (isIntersecting) {
            setIsInView(isIntersecting);
        }
    }, {threshold: 1})

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

    return <div className={'patterns-library-in-view'} ref={wrapperRef}>
        {
            isInView && children
        }
    </div>
}
