export function SidebarUpsell() {
    return <div
        onClick={() => {
            window.open("https://tableberg.com/pricing", "_blank")
        }}
        className="tableberg-upsell-inspector-notice-wrapper"
    >
        <div
            className={"tableberg-upsell-inspector-notice"}
            title={"click for more info"}
        >
            <div className={"tableberg-upsell-notice-icon-container"}>
                <img alt={"Tableberg logo"}
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
}

