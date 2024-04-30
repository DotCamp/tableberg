import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";

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
    external[`@wordpress/${wpEntry}`] =
        "wp." +
        wpEntry.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
});

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        minify: "esbuild",
        outDir: "../tableberg/includes/Admin/assets",
        lib: {
            entry: path.resolve(__dirname, "src/index.jsx"),
            name: "tableberg-admin-app",
            fileName: () => "tableberg-admin.build.js",
            formats: ["umd"],
        },
        rollupOptions: {
            external: Object.keys(external),
            output: {
                globals: external,
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name === "style.css") {
                        return "tableberg-admin-style.css";
                    }
                    return assetInfo.name as string;
                },
            },
        },
        cssCodeSplit: false,
    },
    define: {
        "process.env.NODE_ENV": '"production"',
    },
});
