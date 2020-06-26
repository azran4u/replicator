export interface IDataValidatorOptions {
    schema: Object;
}

export interface IDataValidator {
    getInstance(options: IDataValidatorOptions): IDataValidator;
    validate(data: any): Promise<boolean>; 
}