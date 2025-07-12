import { defineConfig, globalIgnores } from "eslint/config";
import react from "eslint-plugin-react";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([globalIgnores([
    "**/**.css",
    "**/**.json",
    "**/**.png",
    "**/**.md",
    "**/**.gif",
    "**/**.svg",
    "**/**.TODO",
]), {
    extends: compat.extends(
    	"react-app",
        "eslint:recommended",
        "plugin:react/jsx-runtime",
        "plugin:react/recommended",
    ),

    plugins: {
        react,
    },

    languageOptions: {
        globals: {
            ...globals.browser,
            config: "readonly",
            electron: "readonly",
            process: "readonly",
            module: "readonly",
            require: "readonly",
            BdApi: "readonly",
            global: "readonly",
            DiscordNative: "readonly",
        },

        ecmaVersion: "latest",
        sourceType: "module",

        parserOptions: {
            allowImportExportEverywhere: true,
        },
    },

    settings: {
        react: {
            version: "19.0",
        },
    },

    rules: {
        "react/prop-types": [0],
        "react/display-name": [0],
        "react/style-prop-object": [1],
        "no-empty": [0],
        "no-multiple-empty-lines": [0],
    },
}]);