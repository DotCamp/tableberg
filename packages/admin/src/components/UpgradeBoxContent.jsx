import React from "react";
import BoxContentProvider from "./BoxContent/BoxContentProvider";
import { BoxContentSize } from "./BoxContent/BoxContent";
import ButtonLink, { ButtonLinkType } from "./ButtonLink";
import ProFilter from "./ProFilter";
import AssetProvider from "./AssetProvider";

/**
 * Box content for upgrade.
 *
 * @param {Object} props component properties, will be reflected to BoxContentProvider
 * @class
 */
function UpgradeBoxContent(props) {
    return (
        <AssetProvider assetIds={["proBuyUrl"]}>
            {({ proBuyUrl }) => (
                <ProFilter invert={true}>
                    <BoxContentProvider
                        size={BoxContentSize.JUMBO}
                        contentId={"upgrade"}
                        {...props}
                    >
                        <ButtonLink
                            url={proBuyUrl}
                            title={"GET TABLEBERG PRO"}
                            type={ButtonLinkType.PRIMARY}
                        />
                    </BoxContentProvider>
                </ProFilter>
            )}
        </AssetProvider>
    );
}

/**
 * @module UpgradeBoxContent
 */
export default UpgradeBoxContent;
