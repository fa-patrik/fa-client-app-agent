const cracoServiceWorkerConfig = require("./cracoServiceWorkerConfig");

module.exports = {
  plugins: process.env.WITH_SW ? [{ plugin: cracoServiceWorkerConfig }] : [],
  style: {
    postcss: {
      // CRA 5 do not read postcss.config.js, this is workaround inspired by
      // https://github.com/gsoft-inc/craco/issues/378#issuecomment-1025069357
      // keep eye on https://github.com/gsoft-inc/craco/issues/385
      loaderOptions: (postcssLoaderOptions) => {
        postcssLoaderOptions.postcssOptions.plugins = [
          ...postcssLoaderOptions.postcssOptions.plugins,
          "postcss-nested-import",
          "postcss-nested",
        ];
        return postcssLoaderOptions;
      },
    },
  },
  babel: {
    plugins: ["preval"],
  },
  webpack: {
    configure: (webpackConfig) => {
      // webpack has problems with dynamic imports for loaders that have issuers
      // https://github.com/webpack/webpack/discussions/15117
      // https://github.com/webpack/webpack/issues/9309
      // CRA 5 uses issuers in rule for svg files, so we remove that property
      // https://github.com/facebook/create-react-app/blob/main/packages/react-scripts/config/webpack.config.js#L408
      const filesRule = webpackConfig.module.rules.find((rule) => rule.oneOf);
      const svgRule = filesRule.oneOf.find(
        (rule) => String(rule.test) === String(/\.svg$/)
      );
      delete svgRule.issuer;

      return webpackConfig;
    },
  },
  jest: {
    configure: {
      reporters: [
        "default",
        [
          "jest-junit",
          {
            outputDirectory: "test-reports",
            outputName: "jest-test-report.xml",
          },
        ],
      ],
    },
  },
};
