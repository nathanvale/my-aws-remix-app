import { createRequestHandler } from '@remix-run/architect'
import * as build from '@remix-run/dev/server-build'
import { configure } from '@vendia/serverless-express'

export const handler = createRequestHandler({
	build,
	mode: process.env.NODE_ENV,
})
