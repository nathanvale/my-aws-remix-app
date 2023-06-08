import { authenticator } from '~/utils/auth.server'
import { commitSession, getSession } from '~/utils/session.server'

export const BASE_URL = 'https://myremixapp.dev'

export async function getSessionSetCookieHeader(
	session: { id: string },
	existingCookie?: string,
) {
	const cookieSession = await getSession(existingCookie)
	cookieSession.set(authenticator.sessionKey, session.id)
	const setCookieHeader = await commitSession(cookieSession)
	return setCookieHeader
}
