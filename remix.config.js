/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  cacheDirectory: "./node_modules/.cache/remix",
  ignoredRouteFiles: ["**/.*", "**/*.css", "**/*.test.{js,jsx,ts,tsx}"],
  serverBuildTarget: "arc",
  appDirectory: "app",
  assetsBuildDirectory: "public/build",
  postcss: true,
  publicPath: "/_static/build/",
  server: "./server.ts",
  future: {
    v2_errorBoundary: true,
  },
  routes(defineRoutes) {
    return defineRoutes((route) => {
      if (process.env.NODE_ENV === "production") return;
    });
  },
};
