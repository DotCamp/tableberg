const path = require("path");
const wpConfig = require("@wordpress/scripts/config/webpack.config");

module.exports = {
    ...wpConfig,
    entry: "./src/index.tsx",
    module: {
        ...wpConfig.module,
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "ts-loader",
                        options: {
                            configFile: "tsconfig.json",
                            transpileOnly: true,
                        },
                    },
                ],
            },
            ...wpConfig.module.rules,
        ],
    },

    resolve: {
        ...wpConfig.resolve,
        extensions: [".tsx", ".ts", "js", "jsx"],

        // old config. wp-scripts start kept failing
        // extensions: [
        //     ".ts",
        //     ".tsx",
        //     ...(wpConfig.resolve
        //         ? wpConfig.resolve.extensions || [".js", ".jsx"]
        //         : []),
        // ],
    },

    output: {
        ...wpConfig.output,
        filename: "index.js",
        path: path.resolve(__dirname, "build"),
    },
};
