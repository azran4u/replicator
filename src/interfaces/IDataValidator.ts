export interface IDataValidatorOptions {
    schema: Object;
}

export abstract class IDataValidator {
    constructor(options: IDataValidatorOptions) { };
    abstract validate(data: any): Promise<boolean>;
    abstract getSchema(): Object;
}