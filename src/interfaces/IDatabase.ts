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

export interface IDatabaseAdapter {
    getInstance(options: IDatabaseAdapterOptions): IDatabaseAdapter;
    query(query: QueryConfig): Promise<QueryResult>;
    transaction(queries: QueryConfig[]): Promise<void>;
    isTableExsits(tableName: string): Promise<boolean>;
    setSchema(schema: QueryConfig): Promise<void>;
    getTime(): Promise<Date>;
}