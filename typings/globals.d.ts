declare const tablebergAdminMenuData: {
    assets: {
        logo: string;
        logoTransparent: string;
    };
    individual_control: {
        data: any;
        ajax: {
            toggleControl: {
                url: string;
                action: "toggle_control";
                nonce: string;
            };
        };
    };
    global_control: {
        data: any;
        ajax: {
            toggleControl: {
                url: string;
                action: "toggle_control";
                nonce: string;
            };
        };
    };
    block_properties: {
        data: any;
        ajax: {
            blockProperties: {
                url: string;
                action: "toggle_control";
                nonce: string;
            };
        };
    };
    misc: {
        pro_status: boolean;
    };
    welcome: {
        title: "Welcome to Tableberg!";
        content: "Elevate Your Content with Seamless Tables - The Ultimate WordPress Block Editor Plugin for Effortless Table Creation!";
    };
    documentation: {
        title: "Documentation";
        content: "Elevate your space with Tableberg: a sleek, modern table block for style and functionality. Crafted for timeless elegance and versatility.";
    };
    support: {
        title: "Support";
        content: "Visit our Tableberg Support Page for quick solutions and assistance. We're here to ensure your Tableberg experience is seamless and satisfying.";
    };
    community: {
        title: "Join Community";
        content: "Join the vibrant Tableberg community. Connect, share, and discover endless possibilities together. Elevate your experience with like-minded enthusiasts now!";
    };
    upgrade: {
        title: "Upgrade to Tableberg PRO!";
        content: "Elevate Your Content with Seamless Tables - The Ultimate WordPress Block Editor Plugin for Effortless Table Creation!";
    };
    versionControl: {
        currentVersion: string;
        versions: string[];
        ajax: {
            versionRollback: {
                url: string;
                action: "tableberg_version_control";
                nonce: string;
            };
        };
    };
};

declare const TABLEBERG_CFG: {
    plugin_url: string;
    IS_PRO: boolean;
}

interface Window {
    tablebergPatterns: object[];
    tablebergPatternCategories: object[];
}
