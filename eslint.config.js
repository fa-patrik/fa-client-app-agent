// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import react from 'eslint-plugin-react'
import importPlugin from 'eslint-plugin-import'
import tailwindcss from 'eslint-plugin-tailwindcss'
import tseslint from 'typescript-eslint'
import unusedImports from 'eslint-plugin-unused-imports'

export default [
{
  ignores: ['dist/**', 'build/**', 'node_modules/**']
}, // Main configuration for TypeScript/React files
{
  files: ['**/*.{ts,tsx}'],
  languageOptions: {
    ecmaVersion: 2022,
    globals: {
      ...globals.browser,
      React: 'readonly',
      JSX: 'readonly',
    },
    parser: tseslint.parser,
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
      sourceType: 'module',
    },
  },
  plugins: {
    '@typescript-eslint': tseslint.plugin,
    'react': react,
    'react-hooks': reactHooks,
    'react-refresh': reactRefresh,
    'import': importPlugin,
    'tailwindcss': tailwindcss,
    'unused-imports': unusedImports,
  },
  rules: {
    // Base recommended rules
    ...js.configs.recommended.rules,
    ...tseslint.configs.recommended.rules,
    ...reactHooks.configs.recommended.rules,
    ...react.configs.recommended.rules,
    
    // React 19 JSX Transform - no need to import React
    'react/react-in-jsx-scope': 'off',
    'react/jsx-uses-react': 'off',
    
    // React Refresh rules for Vite
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-use-before-define': 'off',
    'no-use-before-define': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/consistent-type-imports': 'error',
    'no-constant-binary-expression': 'warn',
    'no-unused-vars': 'off',
    
    // Unused imports plugin rules
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': ['warn', { 
      'argsIgnorePattern': '^_',
      'varsIgnorePattern': '^_',
      'caughtErrorsIgnorePattern': '^_'
    }],
    
    // React Hooks rules (critical for React)
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',
    
    // Import ordering rules (preserve your custom organization)
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', ['parent', 'sibling']],
        pathGroups: [
          {
            pattern: 'react',
            group: 'external',
            position: 'before',
          },
        ],
        pathGroupsExcludedImportTypes: ['react'],
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    
    // Tailwind CSS rules
    'tailwindcss/no-custom-classname': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
}, // Special rules for TypeScript files (disable React prop-types)
{
  files: ['**/*.{ts,tsx}'],
  rules: {
    'react/prop-types': 'off', // TypeScript handles prop validation
  },
}, // Special rules for Storybook files
{
  files: ['**/*.stories.*'],
  rules: {
    'import/no-anonymous-default-export': 'off',
    'react-refresh/only-export-components': 'off',
  },
}, // Test files configuration
{
  files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', '**/__tests__/**/*.{ts,tsx}'],
  languageOptions: {
    globals: {
      ...globals.vitest,
    },
  },
  rules: {
    // Allow any in test files for mocking
    '@typescript-eslint/no-explicit-any': 'off',
    // Test files can have unused vars for mocking
    '@typescript-eslint/no-unused-vars': 'off',
    // Allow use before define in tests for better organization
    '@typescript-eslint/no-use-before-define': 'off',
  },
}, // Service Worker files
{
  files: ['**/service-worker.ts', '**/workbox/**/*.ts'],
  languageOptions: {
    globals: {
      ...globals.serviceworker,
      ServiceWorkerGlobalScope: 'readonly',
      RequestInfo: 'readonly',
    },
  },
  rules: {
    // Allow use before define in service workers
    '@typescript-eslint/no-use-before-define': 'off',
  },
}, // Utility and type files - more lenient rules
{
  files: ['**/utils/**/*.ts', '**/types/**/*.ts', '**/*.d.ts'],
  rules: {
    // Allow use before define in utility files for better organization
    '@typescript-eslint/no-use-before-define': 'off',
    // Allow unused vars in type files (often used for type exports)
    '@typescript-eslint/no-unused-vars': 'off',
  },
}, ...storybook.configs["flat/recommended"]];
