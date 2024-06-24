const defaultConfig = require("@wordpress/scripts/config/webpack.config");
const path = require("path");
const IgnoreEmitPlugin = require("ignore-emit-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
    ...defaultConfig,
    entry: {
        "tableberg-pro": path.resolve(process.cwd(), "src", "index.tsx"),
        "tableberg-pro-frontend": path.resolve(process.cwd(), "src", "frontend.ts"),
        "tableberg-pro-style": path.resolve(process.cwd(), "src", "style.scss"),
        "tableberg-pro-editor": path.resolve(
            process.cwd(),
            "src",
            "editor.scss",
        ),
    },
    optimization: {
        ...defaultConfig.optimization,
    },
    plugins: [
        ...defaultConfig.plugins.filter(
            (p) => !(p instanceof CleanWebpackPlugin),
        ),
    ],
    output: {
        filename: (chunkData) => {
            switch (chunkData.chunk.name) {
                default:
                    return "[name].js";
            }
        },
        path: path.resolve(process.cwd(), "dist"),
    },
};
