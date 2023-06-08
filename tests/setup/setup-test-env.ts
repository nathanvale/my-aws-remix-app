import './setup-env-vars'
import { afterAll, afterEach, expect } from 'vitest'
import { installGlobals } from '@remix-run/node'
import { matchers } from './matchers.cjs'
import 'dotenv/config'
import fs from 'fs'
import { BASE_DATABASE_PATH, DATABASE_PATH } from './paths'
import { deleteAllData } from './utils'

expect.extend(matchers)

installGlobals()
fs.copyFileSync(BASE_DATABASE_PATH, DATABASE_PATH)

afterEach(() => deleteAllData())

afterAll(async () => {
	await fs.promises.rm(DATABASE_PATH)
})
