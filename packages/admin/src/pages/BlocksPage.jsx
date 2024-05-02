import blocks from "@tableberg/shared/blocks";
import BlockControlCard from "../components/BlockControlCard";
import UpgradeBoxContent from "../components/UpgradeBoxContent";
import { useState } from "react";
import AssetProvider from "../components/AssetProvider";

function UpsellModal({ info, onClose }) {
    return (
        <div className="tableberg-upsell-modal">
            <div className="tableberg-upsell-modal-backdrop"></div>
            <div className="tableberg-upsell-modal-container">
                <div className="tableberg-upsell-modal-area">
                    <h2>
                        {info.icon} {info.title}
                    </h2>
                    <div className="tableberg-upsell-modal-content">
                        <img src={
                            TABLEBERG_CFG.plugin_url +
                            'includes/Admin/images/upsell/' +
                            info.image
                        } alt={info.title + " Demo"} />
                        <p>{info.upsellText}</p>
                        <p>
                            Limited Time: Use code <b>TB10</b> to get a 10%
                            discount.
                        </p>
                    </div>
                    <div className="tableberg-upsell-modal-footer">
                        <button onClick={onClose}>Cancel</button>
                        <AssetProvider assetIds={["proBuyUrl"]}>
                            {({ proBuyUrl }) => <a href={proBuyUrl}>Buy PRO</a>}
                        </AssetProvider>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function BlocksPage() {
    const [upsellView, setUpsellView] = useState(null);

    return (
        <div
            style={{
                display: "flex",
                flexFlow: "column",
                gap: "30px",
            }}
        >
            <div
                className={"tableberg-controls-container controls-container"}
                data-show-info="false"
            >
                {blocks.map((info) => {
                    const { title, name, icon, isPro } = info;
                    return (
                        <BlockControlCard
                            name={name}
                            key={name}
                            title={title}
                            iconElement={icon}
                            isPro={isPro}
                            showUpsell={() => setUpsellView(info)}
                            isProPlugin={tablebergAdminMenuData.misc.pro_status}
                            demoUrl={"https://tableberg.com/"}
                        />
                    );
                })}
            </div>
            {!tablebergAdminMenuData.misc.pro_status && <UpgradeBoxContent />}
            {upsellView && (
                <UpsellModal
                    info={upsellView}
                    onClose={() => setUpsellView(null)}
                />
            )}
        </div>
    );
}
