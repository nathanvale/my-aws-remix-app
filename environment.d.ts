declare global {
	namespace NodeJS {
		interface ProcessEnv {
			SESSION_SECRET: string
			NODE_ENV: 'development' | 'production'
			PORT?: string
			QUIET: string
			ARC_TABLES_PORT: string
		}
	}
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
