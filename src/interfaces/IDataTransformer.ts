export interface IDataTransformer {
    getInstance(): IDataTransformer;
    transform<T>(data: any): Promise<T>; 
}