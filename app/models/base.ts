import { marshall } from '@aws-sdk/util-dynamodb'
import {
	DynamoDBItem,
	GSIKeyAttributeValue,
	GSIKeys,
	PrimaryKeyAttributeValues,
	PrimaryKeys,
} from 'dynamodb/utils'

export interface Base {
	readonly createdAt: string
	readonly updatedAt: string
}
export abstract class Item {
	abstract get attributes(): Base
	abstract get PK(): string
	abstract get SK(): string
	abstract get GS1PK(): string | undefined
	abstract get GS1SK(): string | undefined
	abstract get GS2PK(): string | undefined
	abstract get GS2SK(): string | undefined
	abstract get GS3PK(): string | undefined
	abstract get GS3SK(): string | undefined
	abstract get entityType(): string

	abstract toItem(): Record<string, any>

	public keys(): Record<PrimaryKeys, string> {
		return {
			PK: this.PK,
			SK: this.SK,
		}
	}
	public marshalledKeys(): PrimaryKeyAttributeValues {
		return marshall(this.keys()) as PrimaryKeyAttributeValues
	}
	public gSIKeys(): Record<GSIKeys, string | undefined> {
		const gsiKeys = {
			GS1PK: this.GS1PK,
			GS1SK: this.GS1SK,
			GS2PK: this.GS2PK,
			GS2SK: this.GS2SK,
			GS3PK: this.GS3PK,
			GS3SK: this.GS3SK,
		}
		return gsiKeys
	}

	public marshalledGsiKeys(): GSIKeyAttributeValue {
		return marshall(this.gSIKeys()) as GSIKeyAttributeValue
	}

	public toDynamoDBItem(): DynamoDBItem {
		//We dont want to send undefined gsi entries to AWS
		const refinedGsiKeys = Object.fromEntries(
			Object.entries(this.gSIKeys()).filter(
				([_, value]) => value !== undefined,
			),
		)

		const marshalledKeys = marshall(this.keys()) as GSIKeyAttributeValue
		const marshalledGsiKeys = marshall(
			refinedGsiKeys,
		) as PrimaryKeyAttributeValues

		return {
			...marshalledKeys,
			...marshalledGsiKeys,
			EntityType: { S: this.entityType },
			Attributes: {
				M: marshall(this.attributes),
			},
		}
	}
}
