import blocks from "../data/blocks";
import BlockControlCard from "../components/BlockControlCard";
import UpgradeBoxContent from "../components/UpgradeBoxContent";

export default function BlocksPage() {
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
                {blocks.map(({ title, name, icon, isPro }) => {
                    return (
                        <BlockControlCard
                            key={name}
                            title={title}
                            blockId={name}
                            status={true}
                            iconElement={icon}
                            info={"IDK What it is"}
                            isPro={isPro}
                            showUpsell={() => {}}
                            isProPlugin={window.__is_tableberg_pro_active}
                            demoUrl={"https://tableberg.com/"}
                        />
                    );
                })}
            </div>

            <UpgradeBoxContent />
        </div>
    );
}
