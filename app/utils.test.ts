import * as log from '../app/models/log'
import { useMatches } from '@remix-run/react'
import { renderHook } from '@testing-library/react'
import type { Mock } from 'vitest'
import { TEST_USER_EMAIL, TEST_USER_ID } from 'dynamodb/db-test-helpers'
import {
	validateEmail,
	isUser,
	safeRedirect,
	DEFAULT_REDIRECT,
	useMatchesData,
	useOptionalUser,
	useUser,
} from './utils'

vi.mock('@remix-run/react')

const useMatchesMock = useMatches as Mock
beforeEach(() => {
	vi.resetModules()
	vi.spyOn(log, 'logError').mockReturnValue('id')
})

describe('safeRedirect', () => {
	test('should default redirect if redirect to does not start with /', () => {
		const to = 'to'
		const result = safeRedirect(to)
		expect(result).toBe(DEFAULT_REDIRECT)
	})
	test('should default redirect if redirect starts with //', () => {
		const to = '//to'
		const result = safeRedirect(to)
		expect(result).toBe(DEFAULT_REDIRECT)
	})

	test('should default redirect if to is null or undefined', () => {
		const to = undefined
		const result = safeRedirect(to)
		expect(result).toBe(DEFAULT_REDIRECT)
	})

	test('should  redirect if redirect starts with /', () => {
		const to = '/to'
		const result = safeRedirect(to)
		expect(result).toBe(to)
	})
})

describe('useMatchesData', () => {
	test('should ', () => {
		const id = 'root'
		const data = 'data'
		useMatchesMock.mockReturnValue([{ id, data }])
		const { result } = renderHook(() => useMatchesData(id))
		expect(result.current).toBe(data)
	})
})

describe('isUser', () => {
	test('should return true if an object passed in is a user', () => {
		expect(
			isUser({
				campaignCount: 0,
				email: 'test@test.com',
				firstName: '',
				lastName: '',
				password: 'hashed-password',
				userId: '12345',
			}),
		).toBe(true)
	})
})

describe('useOptionalUser', () => {
	it('return a user', () => {
		const id = 'root'
		const user = {
			email: TEST_USER_EMAIL,
			password: 'password',
			userId: TEST_USER_ID,
		}
		const data = { user }
		useMatchesMock.mockReturnValue([{ id, data }])
		const { result } = renderHook(() => useOptionalUser())
		expect(result.current).toEqual(user)
	})
	it('return undefined', () => {
		const id = 'root'
		const data = undefined
		useMatchesMock.mockReturnValue([{ id, data }])
		const { result } = renderHook(() => useOptionalUser())
		expect(result.current).toBeUndefined()
	})
})

describe('useUser', () => {
	test('should throw an error is no user found', async () => {
		const id = 'root'
		const data = undefined
		useMatchesMock.mockReturnValue([{ id, data }])
		const result = await getError(async () => renderHook(() => useUser()))

		expect(result).toMatchInlineSnapshot(
			'[Error: No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead.]',
		)
	})
	test('should return a user', async () => {
		const id = 'root'
		const user = {
			email: TEST_USER_EMAIL,
			password: 'password',
			userId: TEST_USER_ID,
		}
		const data = { user }
		useMatchesMock.mockReturnValue([{ id, data }])
		const { result } = renderHook(() => useUser())
		expect(result.current).toMatchInlineSnapshot(
			`
      {
        "email": "test@test.com",
        "password": "password",
        "userId": "12345",
      }
    `,
		)
	})
})

describe('validateEmail', () => {
	test('should return false for non-emails', () => {
		expect(validateEmail(undefined)).toBe(false)
		expect(validateEmail(null)).toBe(false)
		expect(validateEmail('')).toBe(false)
		expect(validateEmail('not-an-email')).toBe(false)
		expect(validateEmail('n@')).toBe(false)
	})

	test('should return true for a correct email', () => {
		expect(validateEmail('kody@example.com')).toBe(true)
	})
})
