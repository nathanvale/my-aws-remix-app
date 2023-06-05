import { createRequestHandler } from '@remix-run/architect'
import * as build from '@remix-run/dev/server-build'

if (process.env.NODE_ENV !== 'production') {
	require('./playwright/mocks')
}

export const handler = createRequestHandler({
	build,
	mode: process.env.NODE_ENV,
})
