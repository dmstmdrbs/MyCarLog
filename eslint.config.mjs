import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import json from '@eslint/json';
import css from '@eslint/css';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-plugin-prettier';

export default defineConfig([
  {
    files: ['src/**/*.{js,mjs,cjs,ts,mts,cts}'],
    plugins: { js },
    extends: ['js/recommended'],
  },
  {
    files: ['src/**/*.{js,mjs,cjs,ts,mts,cts}'],
    languageOptions: { globals: globals.browser },
  },
  tseslint.configs.recommended,
  {
    files: ['src/**/*.{js,mjs,cjs,ts,mts,cts}'],
    plugins: { prettier },
    rules: { 'prettier/prettier': 'error' },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { prettier },
    rules: {
      'prettier/prettier': 'error',
    },
  },
  {
    files: ['**/*.json'],
    plugins: { json },
    language: 'json/json',
    extends: ['json/recommended'],
  },
  {
    files: ['**/*.jsonc'],
    plugins: { json },
    language: 'json/jsonc',
    extends: ['json/recommended'],
  },
  {
    files: ['**/*.css'],
    plugins: { css },
    language: 'css/css',
    extends: ['css/recommended'],
  },
  globalIgnores([
    'node_modules',
    'dist',
    'build',
    'public',
    'ios',
    'android',
    'package-lock.json',
    'metro.config.js',
    'tailwind.config.js',
  ]),
]);
