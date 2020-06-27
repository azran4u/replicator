export interface UpdatedEntity { };
export interface DeletedEntity { };

export abstract class IDataTransformer {
    constructor() { };
    abstract toUpdated<T>(data: any): T[];
    abstract toDeleted<T>(data: any): T[];
}