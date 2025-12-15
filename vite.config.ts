/// <reference types="vitest/config" />
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import tailwindcss from "@tailwindcss/vite";
import react from '@vitejs/plugin-react-swc'
import { defineConfig, loadEnv } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd()));
  const apiTarget = process.env.VITE_API_URL;
  const base = process.env.VITE_BASE_URL || "/";

  return {
    base,
    define: {
      global: "globalThis",
    },
    css: {
      postcss: {
        plugins: [
          {
            postcssPlugin: 'internal:charset-removal',
            AtRule: {
              charset: (atRule) => {
                if (atRule.name === 'charset') {
                  atRule.remove();
                }
              }
            }
          }
        ]
      }
    },
    plugins: [
      tailwindcss(),
      tsconfigPaths(),
      react(),
      svgr({
        svgrOptions: {
          exportType: "named",
          ref: true,
          svgo: false,
          titleProp: true,
        },
        include: "**/*.svg",
      }),
      VitePWA({
        registerType: "prompt",
        strategies: "injectManifest",
        srcDir: "src",
        filename: "service-worker.ts",
        injectRegister: 'auto',
        manifest: {
          name: "FA Client App",
          short_name: "FA",
          theme_color: "#ffffff",
          background_color: "#ffffff",
          display: "standalone",
          start_url: "/",
          icons: [
            {
              src: "favicon.ico",
              sizes: "64x64 32x32 24x24 16x16",
              type: "image/x-icon"
            },
            {
              src: "logo192.png",
              type: "image/png",
              sizes: "192x192"
            },
            {
              src: "logo_maskable.png",
              type: "image/png",
              sizes: "192x192",
              purpose: "maskable"
            }
          ]
        },
        injectManifest: {
          dontCacheBustURLsMatching: /\.[0-9a-f]{8}\./,
          globIgnores: ["**/*.map", "**/asset-manifest.json", "**/LICENSE", "**/manifest.json"],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        },
      }),
    ],
    build: {
      outDir: "build",
      emptyOutDir: true,
    },
    server: {
      port: 3000,
      host: true,
      open: true,
      proxy: apiTarget
        ? {
          "/graphql": {
            target: apiTarget,
            changeOrigin: true,
            secure: false,
          },
        }
        : undefined,
    },
    test: {
      projects: [
        {
          extends: true,
          test: {
            name: 'unit',
            globals: true,
            environment: "jsdom",
            setupFiles: ["./src/setupTests.ts"],
            include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
            exclude: [
              "**/node_modules/**",
              "**/dist/**",
              "**/cypress/**",
              "**/.{idea,git,cache,output,temp}/**",
              "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*",
              "**/*.stories.*", // Exclude Storybook files from unit tests
              "**/*.e2e.*", // Exclude e2e tests if any
            ],
          },
        },
        {
          extends: true,
          plugins: [
            storybookTest({
              configDir: path.join(dirname, '.storybook')
            })
          ],
          test: {
            name: 'storybook',
            include: ["**/*.stories.@(js|jsx|ts|tsx|mdx)"],
            browser: {
              enabled: true,
              headless: true,
              provider: 'playwright',
              instances: [{
                browser: 'chromium'
              }]
            },
            setupFiles: ['.storybook/vitest.setup.ts']
          }
        }
      ],

      coverage: {
        reporter: ["text", "json", "html"],
        exclude: [
          "node_modules/",
          "src/setupTests.ts",
          "**/*.d.ts",
          "**/*.config.*",
          "**/dist/**",
          "**/*.stories.*",
          "**/build/**",
        ],
      },
    }
  };
});
