import { unmarshall } from '@aws-sdk/util-dynamodb'
import {
	GSIKeyAttributeValue,
	GSIKeys,
	PrimaryKeyAttributeValues,
} from 'dynamodb/utils'

export interface Base {
	readonly createdAt: string
	readonly updatedAt: string
}
export abstract class Item {
	abstract get PK(): string
	abstract get SK(): string
	abstract get GS1PK(): string | undefined
	abstract get GS1SK(): string | undefined
	abstract get GS2PK(): string | undefined
	abstract get GS2SK(): string | undefined
	abstract get GS3PK(): string | undefined
	abstract get GS3SK(): string | undefined
	abstract get entityType(): string
	abstract toDynamoDBItem(): Record<string, unknown>
	abstract toItem(): Record<string, any>

	public keys(): PrimaryKeyAttributeValues {
		return {
			PK: { S: this.PK },
			SK: { S: this.SK },
		}
	}

	public gSIKeys(): GSIKeyAttributeValue {
		const gsiKeys: GSIKeyAttributeValue = {}

		if (this.GS1PK) {
			gsiKeys.GS1PK = { S: this.GS1PK }
		}
		if (this.GS1SK) {
			gsiKeys.GS1SK = { S: this.GS1SK }
		}
		if (this.GS2PK) {
			gsiKeys.GS2PK = { S: this.GS2PK }
		}
		if (this.GS2SK) {
			gsiKeys.GS2SK = { S: this.GS2SK }
		}
		if (this.GS3PK) {
			gsiKeys.GS3PK = { S: this.GS3PK }
		}
		if (this.GS3SK) {
			gsiKeys.GS3SK = { S: this.GS3SK }
		}

		return gsiKeys
	}

	public umarshalledGsiKeys(): Record<GSIKeys, string> {
		return unmarshall(this.gSIKeys())
	}
}
