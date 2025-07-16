import React from "react";
import { __ } from "@wordpress/i18n";
import BoxContentProvider from "../components/BoxContent/BoxContentProvider";
import { BoxContentSize } from "../components/BoxContent/BoxContent";
import YouTubeEmbed from "../components/YouTubeEmbed";
import ButtonLink, { ButtonLinkType } from "../components/ButtonLink";
import ButtonLinkGroup from "../components/ButtonLinkGroup";
import UpgradeBoxContent from "../components/UpgradeBoxContent";
import AssetProvider from "../components/AssetProvider";

/**
 * Welcome content component.
 *
 * @class
 */
function WelcomePage() {
    return (
        <AssetProvider
            assetIds={[
                "youtubeVideoId",
                "documentsUrl",
                "supportUrl",
                "twitterUrl",
                "facebookUrl",
                "youtubeUrl",
            ]}
        >
            {({
                youtubeVideoId,
                documentsUrl,
                supportUrl,
                twitterUrl,
                facebookUrl,
                youtubeUrl,
            }) => (
                <div className={"tableberg-welcome-content"}>
                    <div className={"tableberg-welcome-content__main"}>
                        <BoxContentProvider
                            size={BoxContentSize.JUMBO}
                            contentId={"welcome"}
                        >
                            <YouTubeEmbed
                                height={315}
                                videoId={youtubeVideoId}
                            />
                        </BoxContentProvider>
                        {!tablebergAdminMenuData.misc.pro_status && (
                            <UpgradeBoxContent />
                        )}
                    </div>
                    <div className={"tableberg-welcome-content__right-sidebar"}>
                        <BoxContentProvider contentId={"documentation"}>
                            <ButtonLink
                                url={documentsUrl}
                                title={__("Visit Documents", "tableberg")}
                                type={ButtonLinkType.DEFAULT}
                            />
                        </BoxContentProvider>
                        <BoxContentProvider contentId={"support"}>
                            <ButtonLink
                                url={supportUrl}
                                title={__("Support Forum", "tableberg")}
                                type={ButtonLinkType.DEFAULT}
                            />
                        </BoxContentProvider>
                    </div>
                </div>
            )}
        </AssetProvider>
    );
}

/**
 * @module WelcomePage
 */
export default WelcomePage;
