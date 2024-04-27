import { useEffect, useState } from "react";
import blocks from "../data/blocks";
import BlockControlCard from "../components/BlockControlCard";
import UpgradeBoxContent from "../components/UpgradeBoxContent";

export default function BlocksPage() {
    const [innerBlocks, setInnerBlocks] = useState(blocks);

    // useEffect hook
    useEffect(() => {
        const sortedBlocks = [...blocks].sort((a, b) => {
            const aName = a.title.toLowerCase();
            const bName = b.title.toLowerCase();

            if (aName < bName) {
                return -1;
            }
            if (aName > bName) {
                return 1;
            }

            return 0;
        });

        setInnerBlocks(sortedBlocks);
    }, []);

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
                {innerBlocks.map(({ title, name, icon, isPro }) => {
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
