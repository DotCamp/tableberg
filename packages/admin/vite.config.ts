import { defineConfig } from 'vite'
import path from "path"
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        outDir: "../tableberg/build",
        assetsDir: ".",
        lib: {
            entry: path.resolve(__dirname, "src/index.jsx"),
            name: "Tableberg admin app",
            fileName: () => "tableberg-admin.build.js"
        },
        rollupOptions: {
            external: ["lodash"],
            output: {
                globals: {
                    lodash: "lodash"
                },
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name === "style.css") {
                        return "tableberg-admin-style.css";
                    }
                    return assetInfo.name as string;
                },
            },
        },
    },
    define: {
        "process.env": JSON.stringify("")
    }
})
