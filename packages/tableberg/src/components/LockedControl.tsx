import classNames from "classnames";
import { CSSProperties, useState, type SVGProps } from "react";
import UpsellModal, {
    BlockUpsellInfo,
    UpsellEnhancedModal,
    UpsellModalComponent,
} from "./UpsellModal";
import { createPortal } from "react-dom";

function LockFillIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
            {...props}
        >
            <g fill="none" fillRule="evenodd">
                <path d="M24 0v24H0V0zM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022m-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"></path>
                <path
                    fill="currentColor"
                    d="M6 8a6 6 0 1 1 12 0h1a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2zm6-4a4 4 0 0 1 4 4H8a4 4 0 0 1 4-4m2 10a2 2 0 0 1-1 1.732V17a1 1 0 1 1-2 0v-1.268A2 2 0 0 1 12 12a2 2 0 0 1 2 2"
                ></path>
            </g>
        </svg>
    );
}

interface LockedControlProps {
    children: any;
    inToolsPanel?: boolean;
    info?: BlockUpsellInfo;
    selected?: string;
    isEnhanced?: boolean;
    style?: CSSProperties;
}

export default function LockedControl({
    children,
    inToolsPanel,
    info,
    selected,
    isEnhanced,
    style,
}: LockedControlProps) {
    const [showUpsell, setVisibility] = useState(false);

    return (
        <>
            <div
                className={classNames({
                    "tableberg-locked-root": true,
                    "tableberg-locked-root-toolbar": inToolsPanel,
                })}
                style={style}
            >
                {children}
                <button
                    className="tableberg-lock-container"
                    onClick={() => setVisibility(true)}
                >
                    <LockFillIcon height="25px" width="25px" />
                </button>
            </div>
            {showUpsell &&
                createPortal(
                    info ? (
                        <UpsellModalComponent
                            onClose={() => setVisibility(false)}
                            info={info}
                        />
                    ) : isEnhanced ? (
                        <UpsellEnhancedModal
                            onClose={() => setVisibility(false)}
                            selected={selected}
                        />
                    ) : (
                        <UpsellModal
                            onClose={() => setVisibility(false)}
                            selected={selected}
                        />
                    ),
                    document.body,
                )}
        </>
    );
}
