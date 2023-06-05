const flatRoutes = require('remix-flat-routes').flatRoutes
/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
	cacheDirectory: './node_modules/.cache/remix',
	future: {
		v2_meta: true,
		v2_errorBoundary: true,
		v2_normalizeFormMethod: true,
		v2_routeConvention: true,
	},
	ignoredRouteFiles: ['**/.*', '**/*.test.{js,jsx,ts,tsx}'],
	publicPath: '/_static/build/',
	postcss: true,
	server: './server.ts',
	serverBuildPath: 'server/index.js',
	serverModuleFormat: 'cjs',
	tailwind: true,
	routes: async defineRoutes => {
		return flatRoutes('routes', defineRoutes, {
			ignoredRouteFiles: [
				'.*',
				'**/*.css',
				'**/*.test.{js,jsx,ts,tsx}',
				'**/__*.*',
			],
		})
	},
}
