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
        manifest: true,
        outDir: "build",
        rollupOptions: {
            input: [
                "src/index.tsx",
                "src/cell/index.tsx",
                "src/image/index.tsx",
                "src/button/index.tsx",
                "src/frontend/index.ts"
            ],
        },
    },
});
