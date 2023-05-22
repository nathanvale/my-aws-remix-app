import { type DynamoDBClient } from '@aws-sdk/client-dynamodb'
import arc from '@architect/functions'

let _arcDB: Awaited<ReturnType<typeof arc.tables>> | undefined

export const getClient = async (): Promise<{
	client: DynamoDBClient
	TableName: string
}> => {
	const arcDB = await getArcDB()

	return {
		client: arcDB._db as unknown as DynamoDBClient,
		TableName: arcDB.name('campiagn_processing' as never),
	}
}

export const setArcDB = (
	arcDB: Awaited<ReturnType<typeof arc.tables>>,
): void => {
	_arcDB = arcDB
}

export const getArcDB = async (): Promise<
	Awaited<ReturnType<typeof arc.tables>>
> => {
	if (_arcDB) return Promise.resolve(_arcDB)

	_arcDB = await arc.tables()
	return _arcDB
}
