/// <reference types="vitest" />
/// <reference types="vite/client" />

import { react } from './other/test-setup/vitejs-plugin-react.cjs'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { configDefaults  } from 'vitest/config'

export default defineConfig({
	plugins: [react(), tsconfigPaths()],
	test: {
		exclude: [...configDefaults.exclude, 'playwright/**/*'],
		globals: true,
		environment: 'happy-dom',
		globalSetup: ['test/global-setup.ts'],
		setupFiles: ['./test/setup-test-env.ts'],
		coverage: {
			exclude: ['app/models/note/**'],
			provider: 'c8',
			reporter: ['text', 'json', 'html'],
			lines: 0,
			functions: 0,
			branches: 0,
			statements: 0,
		},
	},
})
