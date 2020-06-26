import { IDataTransformer } from "./IDataTransformer";
import { IDataValidator } from "./IDataValidator";
import { IRepoAdapter } from "./IRepoAdapter";
import { sleep } from "../utils";
import { IDal } from "./IDal";

export interface IReplicationControllerOptions {
    dal: IDal;
    transformer: IDataTransformer;
    validator: IDataValidator;
    repo: IRepoAdapter;
}

export const POLL_INTERVAL_IN_MS = 1000;

export abstract class IReplicationController {
    dal: IDal;
    transformer: IDataTransformer;
    validator: IDataValidator;
    repo: IRepoAdapter;

    abstract getInstance(options: IReplicationControllerOptions): IReplicationController;
    async replicate<T>(): Promise<void>{        
        while(true){
            let currentSequence = await this.dal.getSequence();
            const bulk = await this.repo.getBulk(currentSequence);
            if( currentSequence === bulk.nextSequence ){
                await sleep(POLL_INTERVAL_IN_MS);
            }
            if( this.validator.validate(bulk.data) ){
                const transformed = this.transformer.transform<T>(bulk.data);
                await this.dal.saveEntity(transformed);
                await this.dal.setSequence(bulk.nextSequence);
            }
        }    
    }; 
}