import './setup-env-vars.ts'
import { afterAll, expect } from 'vitest'
import { installGlobals } from '@remix-run/node'
import { matchers } from './matchers.cjs'
import 'dotenv/config'
import fs from 'fs'
import { BASE_DATABASE_PATH, DATABASE_PATH } from './paths.ts'

expect.extend(matchers)

installGlobals()
fs.copyFileSync(BASE_DATABASE_PATH, DATABASE_PATH)

afterAll(async () => {
	await fs.promises.rm(DATABASE_PATH)
})
