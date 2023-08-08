const { createProxyMiddleware } = require("http-proxy-middleware");

const PROXY = process.env.REACT_APP_API_URL;

module.exports = function (app) {
  app.use(
    "/graphql",
    createProxyMiddleware({
      target: PROXY,
      changeOrigin: true,
      logLevel: "debug",
      onProxyReq: function(proxyReq, req, res) {
        proxyReq.setHeader('Origin', PROXY); //replace Origin with FA env domain
      },
    })
  );
  app.use(
    "/flowable/graphql",
    createProxyMiddleware({
      target: PROXY,
      changeOrigin: true,
      onProxyReq: function(proxyReq, req, res) {
        proxyReq.setHeader('Origin', PROXY);
      },
    }),
    
  );
};
