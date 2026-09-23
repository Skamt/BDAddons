import { defineConfig } from "eslint/config";
import globals from "globals";
import eslintReact from "@eslint-react/eslint-plugin";
import eslintJs from "@eslint/js";

export default defineConfig({
	files: ["**/*.js", "**/*.jsx"],
	extends: [
		eslintJs.configs.recommended, 
		eslintReact.configs.recommended
	],

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
			DiscordNative: "readonly"
		},

		ecmaVersion: "latest",
		sourceType: "module",

		parserOptions: {
			allowImportExportEverywhere: true,
			ecmaFeatures: {
				jsx: true 
			}
		}
	},

	settings: {
		react: {
			version: "19.0"
		}
	},

	// off:0, 
	// warn:1, 
	// error:2
	rules: {
		"no-unused-vars": ["error", { "varsIgnorePattern": "React" }],
		"@eslint-react/no-missing-key": "off",
		"no-unused-labels": "off",
		"no-empty": "off",
		"no-multiple-empty-lines": "off"
	}
});
