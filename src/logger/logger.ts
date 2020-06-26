import { config } from '../config';
import * as winston from 'winston';

const printf = winston.format.printf;
const createLogger = winston.createLogger;
const combine = winston.format.combine;
const format = winston.format;
const timestamp = winston.format.timestamp;

const loggerFormat = printf((info: any) => {
    return `${info.timestamp} | ${info.level}: ${info.message}`;
});

export const logger = createLogger({
    level: config.log.level,
    format: combine(
        format.colorize(),
        timestamp(),
        loggerFormat
    ),
    transports: [
        new winston.transports.Console(),
        new (winston.transports.File)({ filename: 'logs.log' })
    ]
});
