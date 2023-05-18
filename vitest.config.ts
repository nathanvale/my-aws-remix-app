/// <reference types="vitest" />
/// <reference types="vite/client" />

import react from '@vitejs/plugin-react'
import { configDefaults, defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

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
			lines: 99,
			functions: 99,
			branches: 99,
			statements: 99,
		},
	},
})
