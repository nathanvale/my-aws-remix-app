import { test as base, type Page } from '@playwright/test'
import { parse } from 'cookie'
import { authenticator, getPasswordHash } from '~/utils/auth.server.ts'
import { commitSession, getSession } from '~/utils/session.server.ts'
import { createMockUser } from './db-utils.ts'
import {
	createUser,
	deleteManyUsers,
	deleteUserByUsername,
	readUser,
} from '~/models/user/user.server.ts'
import { createSession } from '~/models/session/session.server.ts'
export const dataCleanup = {
	users: new Set<string>(),
}

export { deleteUserByUsername }

export async function insertNewUser({ password }: { password?: string } = {}) {
	const userData = createMockUser()
	const user = await createUser({
		...userData,
		password: await getPasswordHash(password || userData.username),
	})
	dataCleanup.users.add(user.userId)
	return user
}

export const test = base.extend<{
	login: (user?: { userId: string }) => ReturnType<typeof loginPage>
}>({
	login: [
		async ({ page, baseURL }, use) => {
			use(user => loginPage({ page, baseURL, user }))
		},
		{ auto: true },
	],
})

export const { expect } = test

export async function loginPage({
	page,
	baseURL = `http://localhost:${process.env.PORT}/`,
	user: givenUser,
}: {
	page: Page
	baseURL: string | undefined
	user?: { userId: string }
}) {
	const findUniqueUserOrThrow = async (userId: string) =>
		await readUser(userId).then(user => {
			if (!user) throw new Error("Can't find user!")
			else return user
		})
	const user = givenUser
		? await findUniqueUserOrThrow(givenUser.userId)
		: await insertNewUser()
	const session = await createSession({
		expirationDate: new Date(
			Date.now() + 1000 * 60 * 60 * 24 * 30,
		).toISOString(),
		userId: user.userId,
	})

	const cookieSession = await getSession()
	cookieSession.set(authenticator.sessionKey, session.sessionId)
	const cookieValue = await commitSession(cookieSession)
	const { _session } = parse(cookieValue)
	await page.context().addCookies([
		{
			name: '_session',
			sameSite: 'Lax',
			url: baseURL,
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			value: _session,
		},
	])
	return user
}

test.afterEach(async () => {
	async function deleteAll(items: Set<string>) {
		if (items.size > 0) {
			await deleteManyUsers([...items])
		}
	}
	await deleteAll(dataCleanup.users)
})
