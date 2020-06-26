import { QueryConfig, QueryResult } from 'pg';
import { IDatabaseAdapter } from './IDatabase';
import { Sequence } from './IRepoAdapter';

export interface IDalOptions {
    database: IDatabaseAdapter;
}

export interface IDal {
    getInstance(options: IDalOptions): IDal;
    saveEntity<T>(data: T): Promise<void>;    
    getSequence(): Promise<Sequence>;
    setSequence(sequence: Sequence): Promise<void>;
}