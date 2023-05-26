import { getClient } from '../../../dynamodb/client.ts'
import arc from '@architect/functions'

beforeEach(() => {
	vi.restoreAllMocks()
})

describe('getClient', () => {
	test('should ', async () => {
		const client = 'client'
		const TableName = 'TableName'
		const nameMock = vi.fn().mockReturnValue(TableName)
		vi.spyOn<any, any>(arc, 'tables').mockReturnValue({
			_db: client,
			name: nameMock,
		})
		const result = await getClient()
		expect(result).toEqual({ client, TableName })
		expect(nameMock).toBeCalledWith('campiagn_processing')
	})
})
