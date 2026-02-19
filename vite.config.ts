import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
    build: {
        target: "es2018",   // 🔥 IMPORTANT

        lib: {
            entry: resolve(__dirname, "src/code.ts"),
            formats: ["iife"],
            name: "code",
            fileName: () => "code.js"
        },
        rollupOptions: {
            external: []
        },
        outDir: "dist",
        emptyOutDir: true,
        minify: false
    }
});
