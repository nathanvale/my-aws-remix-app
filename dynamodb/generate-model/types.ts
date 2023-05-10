import type { DynamoDBItem } from "dynamodb/utils";

export interface DataModel {
  ModelName: string;
  ModelMetadata: {
    Author: string;
    DateCreated: string;
    DateLastModified: string;
    Description: string;
    AWSService: string;
    Version: string;
  };
  DataModel: DataModelEntry[];
}

interface DataAccess {
  MySql: {};
}

interface ProvisionedThroughput {
  ReadCapacityUnits: number;
  WriteCapacityUnits: number;
}

interface ScalableTargetRequest {
  MinCapacity: number;
  MaxCapacity: number;
  ServiceRole: string;
}

interface ScalingPolicyConfiguration {
  TargetValue: number;
}

interface AutoScalingRead {
  ScalableTargetRequest: ScalableTargetRequest;
  ScalingPolicyConfiguration: ScalingPolicyConfiguration;
}

interface AutoScalingWrite {
  ScalableTargetRequest: ScalableTargetRequest;
  ScalingPolicyConfiguration: ScalingPolicyConfiguration;
}

interface ProvisionedCapacitySettings {
  ProvisionedThroughput: ProvisionedThroughput;
  AutoScalingRead: AutoScalingRead;
  AutoScalingWrite: AutoScalingWrite;
}

export interface DataModelEntry {
  TableName: string;
  KeyAttributes: {
    PartitionKey: {
      AttributeName: string;
      AttributeType: string;
    };
    SortKey: {
      AttributeName: string;
      AttributeType: string;
    };
  };
  NonKeyAttributes: {
    AttributeName: string;
    AttributeType: "S" | "M";
  }[];
  GlobalSecondaryIndexes: {
    IndexName: string;
    KeyAttributes: {
      PartitionKey: {
        AttributeName: string;
        AttributeType: "S";
      };
      SortKey: {
        AttributeName: string;
        AttributeType: "S";
      };
    };
    Projection: {
      ProjectionType: "ALL" | "KEYS_ONLY";
    };
  }[];
  TableData: TableData;
  DataAccess: DataAccess;
  BillingMode: string;
  ProvisionedCapacitySettings: ProvisionedCapacitySettings;
}

export type TableData = DynamoDBItem[];
