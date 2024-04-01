import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// @ts-ignore
import { viteExternalsPlugin } from "vite-plugin-externals";

const wp = ["blocks", "editor", "block-editor", "data", "blocks"];

const external: Record<string, any> = {
    jquery: "jQuery",
    "lodash-es": "lodash",
    lodash: "lodash",
    moment: "moment",
    "react-dom": "ReactDOM",
    react: "React",
};

wp.forEach((wpEntry) => {
    external[`@wordpress/${wpEntry}`] = ["wp", wpEntry.replace(
        /-([a-z])/g,
        (_, letter) => letter.toUpperCase(),
    )];
});

export default defineConfig({
    plugins: [
        viteExternalsPlugin(external),
        react()
    ],
    build: {
        outDir: "build",
        rollupOptions: {
            input: {
                "tableberg-admin": "src/admin/index.jsx",
                "tableberg-admin-style": "src/admin/tableberg-admin-style.scss",
                tableberg: "src/tableberg.tsx",
                style: "src/style.scss",
                "tableberg-editor-style": "src/tableberg-editor-style.scss",
                "tableberg-frontend-style": "src/tableberg-frontend-style.scss",
            },
            output: {
                entryFileNames: "[name].build.js",
                assetFileNames: "[name].[ext]",
            },
        },
    },
});
