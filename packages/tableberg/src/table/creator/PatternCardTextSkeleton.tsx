import { type FC } from "react";

const SKELETON_WIDTH = {
    SMALL: 25,
    MEDIUM: 50,
    LARGE: 100,
};

type SKELETON_WIDTH = keyof typeof SKELETON_WIDTH;

/**
 * Pattern card text skeleton component.
 *
 * This component can be used to display a skeleton layout for pattern card text section on busy/load processes.
 *
 * @param props                 Component properties.
 * @param [props.classNames=[]] Additional class names to apply to the wrapper.
 * @param [props.width=LARGE]   Width of the skeleton text.
 * @class
 */
const PatternCardTextSkeleton: FC<{
    classNames?: string[];
    width?: SKELETON_WIDTH;
}> = ({ classNames = [], width = "LARGE" }) => {
    return (
        <div
            className={[
                "tableberg-pattern-library-card-skeleton-text",
                ...classNames,
            ].join(" ")}
        >
            <div
                className={
                    "tableberg-pattern-library-card-skeleton-text-overlay"
                }
                style={{ width: `${SKELETON_WIDTH[width]}%` }}
            />
            &#128128;
        </div>
    );
};

export default PatternCardTextSkeleton;
