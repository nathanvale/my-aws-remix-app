import { logError } from '../log.ts'
import { ulid } from 'ulid'
import { Mock } from 'vitest'

vi.mock('ulid')

let mockedUlid = ulid as Mock

beforeEach(() => {
	vi.restoreAllMocks()
})

describe('logError', () => {
	test('should call and return ulid', () => {})
	const ulid = 'ulid'
	mockedUlid.mockReturnValue(ulid)
	const result = logError()
	expect(result).toBe(ulid)
})
