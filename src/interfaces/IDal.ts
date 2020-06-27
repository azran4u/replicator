import { IDatabaseAdapter } from './IDatabase';
import { Sequence } from './IRepoAdapter';
import { QueryConfig, QueryResult } from 'pg';

export interface IDalOptions {
    database: IDatabaseAdapter;
}

export abstract class IDal {
    db: IDatabaseAdapter;
    constructor(options: IDalOptions) {
        this.db = options.database;
    };
    async transaction<A, D>(updated: A[], deleted: D[], sequence: Sequence) {
        const updatedQueryConfig = this.updatedQueryConfig(updated);
        const deletedQueryConfig = this.deletedQueryConfig(deleted);
        const setSequenceQueryConfig = this.setSequenceQueryConfig(sequence);
        try {
            await this.db.transaction([...updatedQueryConfig, ...deletedQueryConfig, setSequenceQueryConfig]);
        } catch (error) {
            throw new Error(`couldn't save bulk. error=${error}`);
        }
    };
    async getSequence(): Promise<Sequence> {
        let res: QueryResult;
        try {
            res = await this.db.query(this.getSequenceQueryConfig());
        } catch (error) {
            throw new Error(`couldn't get sequence. error=${error}`);
        }
        return this.getSequenceFromQueryResult(res);
    };
    abstract updatedQueryConfig<A>(updated: A[]): QueryConfig[];
    abstract deletedQueryConfig<D>(deleted: D[]): QueryConfig[];
    abstract setSequenceQueryConfig(sequence: Sequence): QueryConfig;
    abstract getSequenceQueryConfig(): QueryConfig;
    abstract getSequenceFromQueryResult(result: QueryResult): Sequence;
}
