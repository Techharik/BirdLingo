import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
    root: "src",
    build: {
        outDir: "../dist",
        emptyOutDir: true,
        rollupOptions: {
            input: {
                ui: resolve(__dirname, "src/ui.html"),
                code: resolve(__dirname, "src/code.ts"),
            },
            output: {
                entryFileNames: "[name].js",
            },
        },
    },
});
