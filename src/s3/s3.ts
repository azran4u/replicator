import AWS from 'aws-sdk';
import { config } from '../config';
import { logger } from '../logger';
import * as fs from 'fs';

export interface S3ConnectorOptions {
    url: string;
    accessToken: string;
    bucket: string;
    key: string;
}

export class S3Connector {
    private static instance: S3Connector;
    private s3: AWS.S3;

    private constructor(options: S3ConnectorOptions) {

        logger.debug(`s3 Connection Settings: ${JSON.stringify(options)}`);

        this.s3 = new AWS.S3({
            accessKeyId: options.accessToken,
            secretAccessKey: options.key,
            endpoint: options.url,
            s3ForcePathStyle: true, // needed with minio?
            signatureVersion: 'v4'
        });
    }

    public static getInstance(options?: S3ConnectorOptions): S3Connector {
        if (!S3Connector.instance) {
            if (!options) {
                throw new Error(`couldn't create first s3 connector w/o options`);
            }
            else {
                S3Connector.instance = new S3Connector(options);
                logger.info('s3 instance created');
            }
        }
        return S3Connector.instance;
    }

    public async upload(filename: string) {
        const fsp = fs.promises;
        let buffer: Buffer;
        let params: AWS.S3.PutObjectRequest;

        try {
            buffer = await fsp.readFile(filename);
            params = { Bucket: config.s3.bucket, Key: `${filename}`, Body: buffer.toString() };            
            await this.s3.putObject(params).promise();
            logger.info(`[s3] uploaded ${filename} to bucket = ${params.Bucket} key = ${params.Key}`);
        } catch (err) {
            logger.error(`could not upload file ${filename} error = ${err.message}`);
        }
    }
}

export const s3Instance = S3Connector.getInstance(config.s3);

