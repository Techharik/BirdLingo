import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
    build: {
        target: "es2018",   // 🔥 IMPORTANT

        lib: {
            entry: resolve(__dirname, "src/Bridge.ts"),
            formats: ["iife"],
            name: "code",
            fileName: () => "Bridge.js"
        },
        rollupOptions: {
            external: []
        },
        outDir: "dist",
        emptyOutDir: true,
        minify: false
    }
});
