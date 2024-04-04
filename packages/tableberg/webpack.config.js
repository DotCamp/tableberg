const defaultConfig = require("@wordpress/scripts/config/webpack.config");
const path = require("path");

const config = {
    ...defaultConfig,
    entry: {
        tableberg: "./src/tableberg.tsx",
        "tableberg-editor-style": "./src/tableberg-editor-style.scss",
        "tableberg-frontend-style": "./src/tableberg-frontend-style.scss",
    },
    output: {
        path: path.resolve(__dirname, "build"),
        filename: "[name].build.js",
    },
};

module.exports = config;
