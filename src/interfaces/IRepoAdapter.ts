export interface IRepoAdapterOptions {
    host: string;
    baseUrl: string;
    url: string;
    apiKey?: string;
    port: number;
    timeout: number;
}

export type Sequence = string;

export interface IRepoBulk {
    sequence: Sequence;
    nextSequence: Sequence;
    data: any;
}

export abstract class IRepoAdapter {
    constructor(options: IRepoAdapterOptions) { };
    abstract getBulk(sequence: Sequence): Promise<IRepoBulk>;
}