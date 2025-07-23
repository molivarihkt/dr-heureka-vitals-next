import {dirname} from "path";
import {fileURLToPath} from "url";
import {FlatCompat} from "@eslint/eslintrc";
import react from 'eslint-plugin-react'
import globals from 'globals';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [...compat.extends("next/core-web-vitals"), {
  files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
  plugins: {
    react,
  },
  languageOptions: {
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    }, globals: {
      ...globals.browser,
    },
  }, rules: {
    'react/jsx-uses-react': 'error', 
    'react/jsx-uses-vars': 'error',
    "react/jsx-one-expression-per-line": [2, { "allow": "non-jsx"}],
    "indent": [2, 2],
    "@next/next/no-img-element": "off"
  },
}];

export default eslintConfig;
