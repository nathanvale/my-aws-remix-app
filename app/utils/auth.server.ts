import bcrypt from 'bcryptjs'
import { Authenticator } from 'remix-auth'
import { FormStrategy } from 'remix-auth-form'
import invariant from 'tiny-invariant'
import { redirect } from '@remix-run/node'
import {
	createUser,
	getUserByUsername,
	updateUser,
	type User,
} from '~/models/user/user.server.ts'
import { sessionStorage } from './session.server.ts'
import {
	createSession,
	deleteAllUserSessions,
	readSession,
} from '~/models/session/session.server.ts'

export type { User }

export const authenticator = new Authenticator<string>(sessionStorage, {
	sessionKey: 'sessionId',
})

const SESSION_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30

authenticator.use(
	new FormStrategy(async ({ form }) => {
		const username = form.get('username')
		const password = form.get('password')

		invariant(typeof username === 'string', 'username must be a string')
		invariant(username.length > 0, 'username must not be empty')

		invariant(typeof password === 'string', 'password must be a string')
		invariant(password.length > 0, 'password must not be empty')

		const user = await verifyLogin(username, password)
		if (!user) {
			throw new Error('Invalid username or password')
		}
		deleteAllUserSessions(user.id)
		const session = await createSession({
			userId: user.id,
			expirationDate: new Date(
				Date.now() + SESSION_EXPIRATION_TIME,
			).toISOString(),
		})

		return session.sessionId
	}),
	FormStrategy.name,
)

export async function requireUserId(
	request: Request,
	{ redirectTo }: { redirectTo?: string | null } = {},
) {
	const requestUrl = new URL(request.url)
	redirectTo =
		redirectTo === null
			? null
			: redirectTo ?? `${requestUrl.pathname}${requestUrl.search}`
	const loginParams = redirectTo
		? new URLSearchParams([['redirectTo', redirectTo]])
		: null
	const failureRedirect = ['/login', loginParams?.toString()]
		.filter(Boolean)
		.join('?')
	const sessionId = await authenticator.isAuthenticated(request, {
		failureRedirect,
	})
	const session = await readSession(sessionId)
	if (!session) {
		throw redirect(failureRedirect)
	}
	return session.userId
}

export async function getUserId(request: Request) {
	const sessionId = await authenticator.isAuthenticated(request)
	if (!sessionId) return null
	const session = await readSession(sessionId)
	// There is still a cookie but the session in the database has been deleted
	if (sessionId && !session)
		await authenticator.logout(request, { redirectTo: '/' })
	if (!session) return null
	return session.userId
}

export async function requireAnonymous(request: Request) {
	await authenticator.isAuthenticated(request, {
		successRedirect: '/',
	})
}

export async function resetUserPassword({
	username,
	password,
}: {
	username: User['username']
	password: string
}) {
	const hashedPassword = await bcrypt.hash(password, 10)
	const user = await getUserByUsername(username)
	return user ? await updateUser({ ...user, password: hashedPassword }) : null
}

export async function signup({
	email,
	username,
	password,
	name,
}: {
	email: User['email']
	username: User['username']
	name: User['name']
	password: string
}) {
	const hashedPassword = await getPasswordHash(password)

	const user = createUser({ email, username, name, password: hashedPassword })
	const session = await createSession({
		expirationDate: new Date(
			Date.now() + SESSION_EXPIRATION_TIME,
		).toISOString(),
		userId: (await user).userId,
	})
	return session
}

export async function getPasswordHash(password: string) {
	const hash = await bcrypt.hash(password, 10)
	return hash
}

export async function verifyLogin(
	username: User['username'],
	password: User['password'],
) {
	const userWithPassword = await getUserByUsername(username)
	console.log(userWithPassword)
	if (!userWithPassword || !userWithPassword.password) {
		return null
	}

	const isValid = await bcrypt.compare(password, userWithPassword.password)
	if (!isValid) {
		return null
	}
	return { id: userWithPassword.userId }
}
