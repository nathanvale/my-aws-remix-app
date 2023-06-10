import type { DataModel, TableData } from './types.ts'

export function getEmptyDataModel(tableData: TableData) {
	// Get current date and time
	var currentDate = new Date()

	// Format the current date and time
	var DateLastModified = currentDate.toLocaleString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
		hour12: true,
	})

	const dataModel: DataModel = {
		ModelName: 'campaign processing',
		ModelMetadata: {
			Author: 'Nathan Vale',
			DateCreated: 'Oct 16, 2022, 05:12 PM',
			DateLastModified,
			Description: '',
			AWSService: 'Amazon DynamoDB',
			Version: '3.0',
		},
		DataModel: [],
	}

	dataModel.DataModel.push({
		TableName: 'campaign_processing',
		KeyAttributes: {
			PartitionKey: {
				AttributeName: 'PK',
				AttributeType: 'S',
			},
			SortKey: {
				AttributeName: 'SK',
				AttributeType: 'S',
			},
		},
		NonKeyAttributes: [
			{
				AttributeName: 'EntityType',
				AttributeType: 'S',
			},
			{
				AttributeName: 'GS1PK',
				AttributeType: 'S',
			},
			{
				AttributeName: 'GS1SK',
				AttributeType: 'S',
			},
			{
				AttributeName: 'GS2PK',
				AttributeType: 'S',
			},
			{
				AttributeName: 'GS2SK',
				AttributeType: 'S',
			},
			{
				AttributeName: 'GS3PK',
				AttributeType: 'S',
			},
			{
				AttributeName: 'GS3SK',
				AttributeType: 'S',
			},
			{
				AttributeName: 'Attributes',
				AttributeType: 'M',
			},
		],
		GlobalSecondaryIndexes: [
			{
				IndexName: 'GSI1',
				KeyAttributes: {
					PartitionKey: {
						AttributeName: 'GS1PK',
						AttributeType: 'S',
					},
					SortKey: {
						AttributeName: 'GS1SK',
						AttributeType: 'S',
					},
				},
				Projection: {
					ProjectionType: 'ALL',
				},
			},
			{
				IndexName: 'GSI2',
				KeyAttributes: {
					PartitionKey: {
						AttributeName: 'GS2PK',
						AttributeType: 'S',
					},
					SortKey: {
						AttributeName: 'GS2SK',
						AttributeType: 'S',
					},
				},
				Projection: {
					ProjectionType: 'ALL',
				},
			},
			{
				IndexName: 'GS3',
				KeyAttributes: {
					PartitionKey: {
						AttributeName: 'GS3PK',
						AttributeType: 'S',
					},
					SortKey: {
						AttributeName: 'GS3SK',
						AttributeType: 'S',
					},
				},
				Projection: {
					ProjectionType: 'KEYS_ONLY',
				},
			},
		],
		TableData: tableData,
		DataAccess: {
			MySql: {},
		},
		BillingMode: 'PROVISIONED',
		ProvisionedCapacitySettings: {
			ProvisionedThroughput: {
				ReadCapacityUnits: 5,
				WriteCapacityUnits: 5,
			},
			AutoScalingRead: {
				ScalableTargetRequest: {
					MinCapacity: 1,
					MaxCapacity: 10,
					ServiceRole: 'AWSServiceRoleForApplicationAutoScaling_DynamoDBTable',
				},
				ScalingPolicyConfiguration: {
					TargetValue: 70,
				},
			},
			AutoScalingWrite: {
				ScalableTargetRequest: {
					MinCapacity: 1,
					MaxCapacity: 10,
					ServiceRole: 'AWSServiceRoleForApplicationAutoScaling_DynamoDBTable',
				},
				ScalingPolicyConfiguration: {
					TargetValue: 70,
				},
			},
		},
	})
	return dataModel
}
