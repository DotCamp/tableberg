import { IconsLibraryIconProps } from "@Components/icon-library/type";

export default function SVGComponent({ icon }: IconsLibraryIconProps) {
    const { viewBox, xmlns, children } = icon.icon.props;
    const pathData = children.props.d;

    return (
        <svg
            className="tabelberg-timeline-item-connector-icon"
            viewBox={viewBox}
            xmlns={xmlns}
        >
            <path d={pathData} />
        </svg>
    );
}
