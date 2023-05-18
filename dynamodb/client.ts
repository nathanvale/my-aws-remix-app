import type { DynamoDB } from 'aws-sdk'
import arc from '@architect/functions'

export const getClient = async (): Promise<{
	client: DynamoDB
	TableName: string
}> => {
	const arcDB = await arc.tables()
	return {
		client: arcDB._db,
		TableName: arcDB.name('campiagn_processing'),
	}
}
