/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
	cacheDirectory: './node_modules/.cache/remix',
	future: {
		v2_errorBoundary: true,
	},
	ignoredRouteFiles: ['**/.*', '**/*.test.{js,jsx,ts,tsx}'],
	publicPath: '/_static/build/',
	postcss: true,
	server: './server.ts',
	serverBuildTarget: 'arc',
	tailwind: true,
	appDirectory: 'app',
	assetsBuildDirectory: 'public/build',
	routes(defineRoutes) {
		return defineRoutes(route => {
			if (process.env.NODE_ENV === 'production') return
		})
	},
}
