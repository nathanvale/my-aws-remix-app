import {
	createUser,
	deleteUser,
	getUserByEmail,
	getUserByUsername,
	readUser,
	updateUser,
} from './user.server'
import { setTimeout } from 'timers/promises'
import os from 'os'
import { create } from 'domain'
import {
	createSession,
	deleteAllSessions,
	deleteAllUserSessions,
	deleteSessions,
	readSession,
} from '../session/session.server'
import { createUserSeed } from 'dynamodb/seed-utils'
const sandbox = require('@architect/sandbox')
const util = require('util')
const exec = util.promisify(require('child_process').exec)

function isMacOs() {
	return os.platform() === 'darwin'
}

const PORT = '8888'

export async function setup() {
	if (isMacOs() && !process.env.CI) {
		// Kill port 8888 if it's already in use
		await exec(`lsof -i tcp:${PORT} | awk 'NR!=1 {print $2}' | xargs kill -9 ;`)
		// Needs a fraction of a second to actually kill the process
		await setTimeout(100)
	}
	process.env.PORT = process.env.PORT ?? PORT
	process.env.QUIET = process.env.QUIET ?? 1
	process.env.ARC_TABLES_PORT = process.env.ARC_TABLES_PORT ?? 5555
	//await sandbox.start()
}

export async function teardown() {
	await sandbox.end()
}

;(async () => {
	await setup()
	const user = await readUser('12345') //?
	const createdUser = await createUser(createUserSeed()) //?
	const deletedUser = await deleteUser(createdUser.userId) //?
	let userByName = await getUserByUsername('test_user') //?
	let userBrEmail = await getUserByEmail('test@test.com') //?
	let createdSession = await createSession({
		expirationDate: new Date(Date.now() + 100000).toISOString(),
		userId: user.userId,
	}) //?
	const sesion = await readSession(createdSession.sessionId) //?
	const userUpdated = await updateUser({ ...user, name: 'Fuck you!' }) //?

	// const unprocessed = await deleteAllUserSessions('12345') //?
	// console.log(unprocessed)
	// await teardown()
	// console.log(session)
})()
