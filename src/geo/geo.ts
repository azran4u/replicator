import * as turf from '@turf/turf';
import { ShapePointInput, ShapeCircleInput, Distance, Bbox, ShapePolygonInput } from '../model';
import * as faker from 'faker';
import { perf } from '../performance';
import { duration } from '../utils';
import * as geoJson from 'geojson';

export namespace geo {


    export function generateRandomPoints(count: number, bbox?: Bbox): ShapePointInput[] {

        const hrstart = process.hrtime();
        const box = bbox || [-180, -90, 180, 90];
        const points = turf.randomPoint(count, { bbox: box });
        const shapePoints: ShapePointInput[] = [];
        for (const feature of points.features) {
            shapePoints.push({
                type: 'point',
                geo: feature.geometry,
                properties: {},
                style: {}
            })
        }
        perf.add({
            operation: 'generateRandomPoints',
            count: count,
            duration: duration(hrstart)
        });
        return shapePoints;
    }

    export function generateRandomCircles(count: number, bbox?: Bbox): ShapeCircleInput[] {

        const hrstart = process.hrtime();
        const box = bbox || [-180, -90, 180, 90];
        const points = turf.randomPoint(count, { bbox: box });
        const shapeCircles: ShapeCircleInput[] = [];
        for (const feature of points.features) {
            const radius: Distance = {
                value: faker.random.number({min:1, max:10}),
                units: 'meters'
            }
            shapeCircles.push({
                type: 'circle',
                geo: feature.geometry,
                properties: {
                    radius: radius
                },
                style: {}
            })
        }
        perf.add({
            operation: 'generateRandomCircles',
            count: count,
            duration: duration(hrstart)
        });
        return shapeCircles;
    }

    export function generateRandomPolygons(count: number, bbox?: Bbox): ShapePolygonInput[] {

        const hrstart = process.hrtime();
        const box = bbox || [-180, -90, 180, 90];
        const polygons = turf.randomPolygon(count, { bbox: box });
        const shapePolygons: ShapePolygonInput[] = [];
        for (const feature of polygons.features) {            
            shapePolygons.push({
                type: 'polygon',
                geo: feature.geometry as any as geoJson.Polygon,
                properties: {},
                style: {}
            })
        }
        perf.add({
            operation: 'generateRandomPolygons',
            count: count,
            duration: duration(hrstart)
        });
        return shapePolygons;
    }
}
