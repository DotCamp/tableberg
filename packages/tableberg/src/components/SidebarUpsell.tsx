import { useState } from "react";
import UpsellModal from "./UpsellModal";

export function SidebarUpsell() {
    const [isShown, setIsShown] = useState(false);
    return (
        <>
            <div
                onClick={() => setIsShown(true)}
                className="tableberg-upsell-inspector-notice-wrapper"
            >
                <div
                    className={"tableberg-upsell-inspector-notice"}
                    title={"click for more info"}
                >
                    <div className={"tableberg-upsell-notice-icon-container"}>
                        <img
                            alt={"Tableberg logo"}
                            src={tablebergAdminMenuData?.assets.logoTransparent}
                        />
                    </div>
                    <div className={"tableberg-upsell-notice"}>
                        <span>
                            <b>Tableberg</b> has <b>PRO</b>
                            <br /> enhancements.
                        </span>
                    </div>
                </div>
            </div>
            {isShown && <UpsellModal onClose={() => setIsShown(false)} />}
        </>
    );
}
