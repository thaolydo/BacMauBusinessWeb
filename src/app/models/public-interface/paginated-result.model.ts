import { DynamoDB } from "aws-sdk";

export interface PaginatedResult<T> {
    items: T[];
    LastEvaluatedKey?: DynamoDB.Key;
    count?: number;
}
