import { IDataTransformer } from "./IDataTransformer";
import { IDataValidator } from "./IDataValidator";
import { IRepoAdapter } from "./IRepoAdapter";
import { sleep } from "../utils";
import { IDal } from "./IDal";
import { IDataParser } from "./IDataParser";
import { logger } from "../logger";

export interface IReplicationControllerOptions {
    dal: IDal;
    validator: IDataValidator;
    parser: IDataParser;
    transformer: IDataTransformer;
    repo: IRepoAdapter;
}

export const POLL_INTERVAL_IN_MS = 1000;

export class IReplicationController {
    dal: IDal;
    validator: IDataValidator;
    parser: IDataParser;
    transformer: IDataTransformer;
    repo: IRepoAdapter;

    constructor(options: IReplicationControllerOptions) {
        this.dal = options.dal;
        this.validator = options.validator;
        this.parser = options.parser;
        this.transformer = options.transformer;
        this.repo = options.repo;
    };

    // A is the Added entity
    // D is the deleted entity
    // sleep when there is no new data or an error occoured (don't stop, keep trying)
    async replicate<A, D>(): Promise<void> {
        while (true) {
            let currentSequence = await this.dal.getSequence();
            const bulk = await this.repo.getBulk(currentSequence);
            if (currentSequence === bulk.nextSequence) {
                await sleep(POLL_INTERVAL_IN_MS);
            }
            if (this.validator.validate(bulk.data)) {
                const { updated, deleted } = this.parser.parse(bulk.data);
                const updatedEntities = this.transformer.toUpdated<A>(updated);
                const deletedEntities = this.transformer.toUpdated<D>(deleted);
                try {
                    await this.dal.transaction<A, D>(updatedEntities, deletedEntities, bulk.nextSequence);
                } catch (err) {
                    logger.error(`error saving bulk. updated=${updatedEntities} deleted=${deletedEntities} seq=${bulk.nextSequence}`);
                    await sleep(POLL_INTERVAL_IN_MS);
                }

            } else {
                logger.error(`validation error. data=${bulk.data} schema=${this.validator.getSchema()}`);
                await sleep(POLL_INTERVAL_IN_MS);
            }
        }
    };
}