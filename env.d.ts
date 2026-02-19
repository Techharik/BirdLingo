/// <reference types="@figma/plugin-typings" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_LINGODOTDEV_API_KEY: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}