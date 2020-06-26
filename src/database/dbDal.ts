import { QueryResult } from 'pg';
import { dbInstance as db } from './databaseConnector';
import { logger } from '../logger';
import { Shape, ShapeInput, Bbox, PostgisGeo } from '../model';
import { perf } from '../performance';
import { duration } from '../utils';
import * as turf from '@turf/turf';

const DB_SCHEMA = 'geo';
const DB_TABLE = 'shapes';

export class dbDal {

    public static async init() {
        // read init.sql file and execute it
    }

    public static async insertShapes(shapes: ShapeInput[]): Promise<Shape[]> {
        const res: Shape[] = [];
        let sql = `
        INSERT INTO ${DB_SCHEMA}.${DB_TABLE}(_type, _geometry, _geography, _properties, _style)
        VALUES (
			$1, 
			ST_SetSRID(
				ST_GeomFromGeoJSON($2::text),
				4326
            ),
            ST_GeomFromGeoJSON($2::text)::geography,
            $3,
            $4            
        )
        RETURNING _id;
        `;
        for (let i = 0; i < shapes.length; i++) {
            let data = new Array<string>(4);
            const shape = shapes[i];

            data[0] = shape.type;
            data[1] = JSON.stringify(shape.geo);
            data[2] = JSON.stringify(shape.properties);
            data[3] = JSON.stringify(shape.style);
            
            try {
                const hrstart = process.hrtime();
                const shapeInserted: QueryResult = await db.query(sql, data);
                perf.add({
                    operation: 'insertShapes',
                    count: shapes.length,
                    duration: duration(hrstart)
                });
                const id = shapeInserted.rows[0]._id;
                res.push({
                    id: id,
                    ...shape
                });
                logger.debug(`[insertShapes]: inserted ${shape.type} id=${id} to the db`);
            } catch (error) {
                logger.error(`[insertShapes]: ${error.message}`);
                throw new Error(error.message);
            }
            if( (i > 0) && (i % 10000 === 0) ){
                logger.info(`[insertShapes]: inserted ${i} rows to the db`);
            }
        }
        logger.info(`[insertShapes]: inserted ${shapes.length} rows to the db`);
        return res;
    }

    public static async getAllShapes(): Promise<Shape[]> {
        // TODO
        const res: Shape[] = [];
        return res;
    }

    public static async getAllShapesCount(): Promise<number> {
        let sql = `
            SELECT COUNT(*) FROM geo.shapes;
        `;
        const data: string[] = [];
        try {
            const hrstart = process.hrtime();
            const res: QueryResult = await db.query(sql, data);
            const numberOfRows = +res.rows[0].count;
            perf.add({
                operation: 'getAllShapesCount',
                count: numberOfRows,
                duration: duration(hrstart)
            });
            logger.info(`[getAllShapesCount]: count is ${numberOfRows} rows`);            
            return numberOfRows;
        } catch (error) {
            logger.error(`[getAllShapesCount]: ${error.message}`);
            throw new Error(error.message);
        }
    }

    public static async deleteAllShapes(): Promise<number> {
        let numberOfRowsDeleted: number;
        let sql = `
            DELETE FROM geo.shapes RETURNING _id;
        `;

        const data: string[] = [];
        try {
            const hrstart = process.hrtime();
            const deleted: QueryResult = await db.query(sql, data);
            numberOfRowsDeleted = deleted.rows.length;
            perf.add({
                operation: 'deleteAllShapes',
                count: numberOfRowsDeleted,
                duration: duration(hrstart)
            });
            logger.info(`[deleteAllShapes]: deleted ${numberOfRowsDeleted} rows`);
            // logger.info(`[insertShapes]: inserted ${shape.type} id=${id} to the db`);
        } catch (error) {
            logger.error(`[deleteAllShapes]: ${error.message}`);
            throw new Error(error.message);
        }

        return numberOfRowsDeleted;

    }

    public static async getAllShapesContainedInBbox(bbox: Bbox): Promise<Shape[]> {
        const res: Shape[] = [];
        let sql = `
        SELECT *
        FROM    ${DB_SCHEMA}.${DB_TABLE}
        WHERE 
        ST_Contains ( 
            ST_MakeEnvelope ($1,$2,$3,$4,4326),
            _geometry
        )        
        `;
        let data = new Array<string>(4);
        data[0] = bbox[0].toString();
        data[1] = bbox[1].toString();
        data[2] = bbox[2].toString();
        data[3] = bbox[3].toString();

        try {
            const hrstart = process.hrtime();
            const shapes: QueryResult = await db.query(sql, data);
            const durationTime = duration(hrstart);
            const total = await this.getAllShapesCount();
            perf.add({
                operation: 'getAllShapesContainedInBbox',
                count: shapes.rows.length,
                total: total,
                duration: durationTime
            });
            shapes.rows.forEach(row => {
                res.push({
                    id: row._id,
                    type: row._type,
                    geo: row._geometry,
                    properties: row._properties,
                    style: row._style
                })
            });
            logger.info(`[getAllShapesContainedInBbox]: found ${res.length} rows`);     
        } catch (error) {
            logger.error(`[getAllShapesInBbox]: ${error.message}`);
            throw new Error(error.message);
        }

        return res;
    }

    public static async getAllShapesIntersectsWithBbox(bbox: Bbox): Promise<Shape[]> {
        const res: Shape[] = [];
        const polygon = turf.bboxPolygon(bbox);
        let sql = `
        SELECT
	    *
        FROM
            ${DB_SCHEMA}.${DB_TABLE}
        WHERE        
            ST_Intersects ( 
                ST_GeomFromGeoJSON ($1)::geography,
                _geography
            );
        `;
        let data = new Array<string>(1);
        data[0] = JSON.stringify(polygon.geometry);

        try {
            const hrstart = process.hrtime();
            const shapes: QueryResult = await db.query(sql, data);
            const durationTime = duration(hrstart);
            const total = await this.getAllShapesCount();
            perf.add({
                operation: 'getAllShapesIntersectsWithBbox',
                count: shapes.rows.length,
                total: total,
                duration: durationTime
            });
            shapes.rows.forEach(row => {
                res.push({
                    id: row._id,
                    type: row._type,
                    geo: row._geometry,
                    properties: row._properties,
                    style: row._style
                })
            });
            logger.info(`[getAllShapesIntersectsWithBbox]: found ${res.length} rows`);     
        } catch (error) {
            logger.error(`[getAllShapesIntersectsWithBbox]: ${error.message}`);
            throw new Error(error.message);
        }

        return res;
    }

    public static async deleteAllShapesContainedInBbox(bbox: Bbox): Promise<number> {
        const res: Shape[] = [];
        let sql = `
        DELETE
        FROM    ${DB_SCHEMA}.${DB_TABLE}
        WHERE 
        ST_Contains ( 
            ST_MakeEnvelope ($1,$2,$3,$4,4326),
            _geometry
        ) RETURNING _id;        
        `;
        let data = new Array<string>(4);
        data[0] = bbox[0].toString();
        data[1] = bbox[1].toString();
        data[2] = bbox[2].toString();
        data[3] = bbox[3].toString();

        try {
            const hrstart = process.hrtime();
            const shapes: QueryResult = await db.query(sql, data);
            const durationTime = duration(hrstart);
            const total = await this.getAllShapesCount();
            perf.add({
                operation: 'deleteAllShapesContainedInBbox',
                count: shapes.rows.length,
                total: total,
                duration: durationTime
            });
            logger.info(`[getAllShapesContainedInBbox]: deleted ${shapes.rows.length} rows`);
            return shapes.rows.length;
        } catch (error) {
            logger.error(`[getAllShapesInBbox]: ${error.message}`);
            throw new Error(error.message);
        }
    }
    
    public static async getTime(): Promise<Date> {
        let sql = "SELECT NOW();";
        let data: string[] = [];
        let result: QueryResult;
        try {
            const hrstart = process.hrtime();
            result = await db.query(sql, data);
            perf.add({
                operation: 'getTime',                
                duration: duration(hrstart)
            });
            const time = new Date(result.rows[0].now);
            logger.info(`[getTime]: time is ${time.toDateString()}`);     
            return time;
        } catch (error) {
            logger.error(`[getDatabaseTime]: ${error.message}`);
            throw new Error(error.message);
        }
    }
}
