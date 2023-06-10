import { useMatches } from '@remix-run/react'
import { useMemo } from 'react'

import type { User } from '~/models/user/user.server.ts'
import { AppError, APP_ERROR_MESSAGES } from './errors.ts'

export const DEFAULT_REDIRECT = '/'

/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our login/signup pages). This avoids
 * open-redirect vulnerabilities.
 * @param {string} to The redirect destination
 * @param {string} defaultRedirect The redirect to use if the to is unsafe.
 */
export function safeRedirect(
	to: FormDataEntryValue | string | null | undefined,
	defaultRedirect: string = DEFAULT_REDIRECT,
) {
	if (!to || typeof to !== 'string') {
		return defaultRedirect
	}

	if (!to.startsWith('/') || to.startsWith('//')) {
		return defaultRedirect
	}

	return to
}

/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */
export function useMatchesData(
	id: string,
): Record<string, unknown> | undefined {
	const matchingRoutes = useMatches()
	const route = useMemo(
		() => matchingRoutes.find(route => route.id === id),
		[matchingRoutes, id],
	)
	return route?.data
}

export function isUser(user: any): user is User {
	return user && typeof user === 'object' && typeof user.email === 'string'
}

/**
 * Userful when you need to show user informaiton on a public page.
 * @returns
 */
export function useOptionalUser(): User | undefined {
	const data = useMatchesData('root')
	if (!data || !isUser(data.user)) {
		return undefined
	}
	return data.user
}

/**
 *
 * @returns Userful for when you need to show user information on a page for users only.
 */
export function useUser(): User {
	const maybeUser = useOptionalUser()

	if (!maybeUser) {
		const { code, message } = APP_ERROR_MESSAGES.APP_NO_USER_FOUND
		throw new AppError(code, message)
	}
	return maybeUser
}

export function validateEmail(email: unknown): email is string {
	return typeof email === 'string' && email.length > 3 && email.includes('@')
}
