import { CSSProperties, useState } from "react";
import { UpsellEnhancedModal } from "./UpsellModal";
import { createPortal } from "react-dom";

interface LockedTableTypeProps {
    icon: JSX.Element;
    selected?: string;
    style?: CSSProperties;
    name: string;
    link?: string;
}

export default function LockedTableType({
    icon,
    selected,
    style,
    name,
    link = "https://tableberg.com/pricing/",
}: LockedTableTypeProps) {
    const [showUpsell, setVisibility] = useState(false);

    return (
        <>
            <button
                className="tableberg-table-creator-btn tableberg-upsell"
                style={style}
                onClick={() => setVisibility(true)}
            >
                <div className="tableberg-table-creator-btn-icon">{icon}</div>
                <span>{name}</span>
            </button>
            {showUpsell &&
                createPortal(
                    <UpsellEnhancedModal
                        onClose={() => setVisibility(false)}
                        selected={selected}
                        link={link}
                    />,
                    document.body,
                )}
        </>
    );
}
