const defaultConfig = require("@wordpress/scripts/config/webpack.config");
const path = require("path");
const IgnoreEmitPlugin = require("ignore-emit-webpack-plugin");

const config = {
    ...defaultConfig,
    entry: {
        "tableberg-admin": "./src/admin/index.js",
        "tableberg-admin-style": "./src/admin/tableberg-admin-style.scss",
        tableberg: "./src/tableberg.tsx",
        "tableberg-editor-style": "./src/tableberg-editor-style.scss",
        "tableberg-frontend-style": "./src/tableberg-frontend-style.scss",
    },
    output: {
        path: path.resolve(__dirname, "build"),
        filename: "[name].build.js",
    },
    plugins: [...defaultConfig.plugins, new IgnoreEmitPlugin([/\.map$/])],
};

module.exports = config;
