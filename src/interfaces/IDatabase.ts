import { QueryConfig, QueryResult } from 'pg';

export interface IDatabaseAdapterOptions {
    host: string;
    database: string;
    user: string;
    password: string;
    port: number;
    idleTimeoutMillis: number;
    max_clients: number;
    connectionTimeoutMillis: number;
}

export abstract class IDatabaseAdapter {
    constructor(options: IDatabaseAdapterOptions) {};
    abstract query(query: QueryConfig): Promise<QueryResult>;
    abstract transaction(queries: QueryConfig[]): Promise<void>;
    abstract isTableExsits(tableName: string): Promise<boolean>;
    abstract setSchema(schema: QueryConfig): Promise<void>;
    abstract getTime(): Promise<Date>;
}