import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest"
  ],
  "framework": {
    "name": "@storybook/react-vite",
    "options": {}
  },
  // Serve static files from public directory
  // This allows Storybook to access translation files, logos, etc.
  "staticDirs": ["../public"],
  "previewHead": (head) => `
    <link rel="shortcut icon" href="/favicon.ico"/>
    <link rel="icon" type="image/png" href="/logo192.png" sizes="192x192">
    ${head}
  `
};
export default config;