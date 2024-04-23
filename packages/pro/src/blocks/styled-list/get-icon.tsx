export default function SVGComponent({ icon }: any) {
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
