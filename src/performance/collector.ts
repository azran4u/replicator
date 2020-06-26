import { logger } from "../logger";
import { Parser } from 'json2csv';
import * as fs from 'fs';

export interface PerformanceSample {
    operation: string,
    count?: number,
    total?: number,
    sub?: string,
    duration: number,
    status?: string
}

export class PerformanceCollector {
    private static instance: PerformanceCollector;
    private store: PerformanceSample[];
    private parser: Parser<PerformanceSample>;

    private constructor() {
        this.store = [];
        this.parser = new Parser<PerformanceSample>();
    }

    public static getInstance(): PerformanceCollector {
        if (!PerformanceCollector.instance) {
            PerformanceCollector.instance = new PerformanceCollector();
            logger.info('PerformanceCollector created');
        }
        return PerformanceCollector.instance;
    }

    public add(sample: PerformanceSample) {
        this.store.push(sample);
    }

    public getAll(): PerformanceSample[] {
        return this.store;
    }

    public async export(filename: string) {
        if (this.store.length === 0) {
            logger.info(`no performance data`);
        } else {
            const csv = this.parser.parse(this.store);
            await fs.writeFile(filename, csv, (err) => {
                if (err) {
                    logger.error(err.message);
                }
            });
        }
    }
}

export const perf = PerformanceCollector.getInstance();