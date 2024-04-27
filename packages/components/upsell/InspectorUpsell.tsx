import { InspectorControls } from "@wordpress/block-editor";
import { __ } from "@wordpress/i18n";

export default function InspectorUpsell() {
    const logoUrl = tablebergAdminMenuData?.assets.logo;
    return (
        <InspectorControls>
            <div className="tableberg-upsell-inspector-notice-wrapper">
                <div
                    className={"tableberg-upsell-inspector-notice"}
                    title={__("click for more info", "tableberg")}
                >
                    <div className={"tableberg-upsell-notice-icon-container"}>
                        <img alt={"Tableberg logo"} src={logoUrl} />
                    </div>
                    <div className={"tableberg-upsell-notice"}>
                        <span>
                            <b>Tableberg</b> has <b>PRO</b>
                            <br /> enhancements.
                        </span>
                    </div>
                </div>
            </div>
        </InspectorControls>
    );
}
