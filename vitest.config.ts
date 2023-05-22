/// <reference types="vitest" />
/// <reference types="vite/client" />

import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { configDefaults, defineConfig } from 'vitest/config'

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
