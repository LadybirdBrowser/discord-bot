import js from "@eslint/js";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import eslintConfigPrettier from "eslint-config-prettier";
import prettier from "eslint-plugin-prettier";
import unusedImports from "eslint-plugin-unused-imports";

export default [
  {
    ignores: ["node_modules/**", "build/**"],
  },
  js.configs.recommended,
  ...typescriptEslint.configs["flat/recommended"],
  eslintConfigPrettier,
  {
    files: ["**/*.ts"],
    plugins: {
      prettier,
      "unused-imports": unusedImports,
    },
    rules: {
      "prettier/prettier": "error",
      camelcase: "error",
    },
  },
];
