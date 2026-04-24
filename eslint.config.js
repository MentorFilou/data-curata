import { defineConfig } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";
import pluginVue from "eslint-plugin-vue";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import vueParser from "vue-eslint-parser";

export default defineConfig([
    {
        ignores: ["dist/**", "node_modules/**"],
    },
    js.configs.recommended,
    ...pluginVue.configs["flat/recommended"],
    {
        files: ["**/*.ts", "**/*.tsx", "**/*.vue"],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
            parser: vueParser,
            parserOptions: {
                parser: tsParser,
                ecmaVersion: 2022,
                sourceType: "module",
            },
        },
        plugins: {
            "@typescript-eslint": typescriptEslint,
        },
        rules: {
            ...typescriptEslint.configs.recommended.rules,
            "vue/multi-word-component-names": "off",
            "vue/no-deprecated-filter": "off",
            "@typescript-eslint/no-explicit-any": "warn",
        },
    },
]);
