import * as dotenv from 'dotenv';

//DO NOT COMMIT YOUR .env FILE
dotenv.config();

export interface Config {
    general: {
        serviceName: string;
    }
    web_server: {
        port: number;
    }
    log: {
        level: string,
    }
    postgres: {
        host: string;
        database: string;
        user: string;
        password: string;
        port: number;
        max_clients: number;
        idleTimeoutMillis: number;
        connectionTimeoutMillis: number;
    },
    s3: {
        url: string;
        accessToken: string;
        bucket: string;
        key: string;
    }
}

export const config: Config = {
    general: {
        serviceName: 'node typescript postgres app',
    },
    web_server: {
        port: 3000,
    },
    log: {
        level: 'info',
    },
    postgres: {
        host: 'galileo-dbs.postgres.database.azure.com',
        database: 'pac_geo_poc_db',
        password: process.env.POSTGRES_PASS,
        user: 'pac_geo_poc_usr@galileo-dbs',
        port: 5432,
        max_clients: 20,
        idleTimeoutMillis: 10000,
        connectionTimeoutMillis: 2000
    },
    s3: {
        url: 'http://ofek-k3s-master.northeurope.cloudapp.azure.com:31745',
        bucket: 'performance',
        accessToken: 'geopocs3',        
        key: process.env.S3_KEY
    }
}