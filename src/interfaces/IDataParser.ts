export interface RepoUpdate {
    updated: any[]; // added or updated entities
    deleted: any[]; // delted entities
}

export abstract class IDataParser {
    constructor() { };
    abstract parse(data: any): RepoUpdate;
}