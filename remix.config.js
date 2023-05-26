/**
 * @type {import('@remix-run/dev').AppConfig}
 */
export default {
	cacheDirectory: './node_modules/.cache/remix',
	future: {
		v2_errorBoundary: true,
	},
	ignoredRouteFiles: ['**/.*', '**/*.test.{js,jsx,ts,tsx}'],
	publicPath: '/_static/build/',
	postcss: true,
	server: './server.ts',
	serverBuildPath: 'server/index.js',
	serverModuleFormat: 'esm',
	serverPlatform: 'node',
	tailwind: true,
	watchPaths: ['./tailwind.config.ts'],
	routes(defineRoutes) {
		return defineRoutes(route => {
			if (process.env.NODE_ENV === 'production') return
		})
	},
}
