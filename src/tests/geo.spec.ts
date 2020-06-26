import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { dbDal } from '../database';
import { geo } from '../geo';
import { logger } from '../logger';
import { bbox1, bbox2, polygon1, polygon2, PLACES } from '../data';
import * as fs from 'fs';
import * as turf from '@turf/turf';
import { s3Instance } from '../s3';
import { Bbox } from '../model';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('geo tests', async () => {

  beforeEach(async function () {
    await dbDal.deleteAllShapes();
  });

  afterEach(async function () {
    await dbDal.deleteAllShapes();
  });

  it('geo query - count number of entities in the db', async () => {
    const bbox1: Bbox = [100.0, 0.0, 105.0, 1.0];
    const points1 = geo.generateRandomPoints(5, bbox1);
    const res1 = await dbDal.insertShapes(points1);

    const shapes = await dbDal.getAllShapesCount();
    expect(shapes).to.equal(points1.length);
  });

  it('geo query - all points in a bbox - geometry', async () => {
    const bbox1: Bbox = [100.0, 0.0, 105.0, 1.0];
    const points1 = geo.generateRandomPoints(5, bbox1);
    const res1 = await dbDal.insertShapes(points1);

    const bbox2: Bbox = [200.0, 0.0, 205.0, 1.0];
    const points2 = geo.generateRandomPoints(10, bbox2);
    const res2 = await dbDal.insertShapes(points2);

    const shapes = await dbDal.getAllShapesContainedInBbox(bbox1);
    expect(shapes.length).to.equal(points1.length);
  });

  it('geo query - all points in a bbox - geography', async () => {
    const bbox1: Bbox = [100.0, 0.0, 105.0, 1.0];
    const points1 = geo.generateRandomPoints(5, bbox1);
    const res1 = await dbDal.insertShapes(points1);

    const bbox2: Bbox = [200.0, 0.0, 205.0, 1.0];
    const points2 = geo.generateRandomPoints(10, bbox2);
    const res2 = await dbDal.insertShapes(points2);

    const shapes = await dbDal.getAllShapesIntersectsWithBbox(bbox1);
    expect(shapes.length).to.equal(points1.length);
  });

  it('geo query - all circles in a bbox', async () => {
    const bbox1: Bbox = [100.0, 0.0, 105.0, 1.0];
    const points1 = geo.generateRandomCircles(5, bbox1);
    const res1 = await dbDal.insertShapes(points1);

    const bbox2: Bbox = [200.0, 0.0, 205.0, 1.0];
    const points2 = geo.generateRandomCircles(10, bbox2);
    const res2 = await dbDal.insertShapes(points2);

    const shapes = await dbDal.getAllShapesContainedInBbox(bbox1);
    expect(shapes.length).to.equal(points1.length);
  });

  it('fail to add circle with negative radius', async () => {
    const bbox1: Bbox = [100.0, 0.0, 105.0, 1.0];
    const points1 = geo.generateRandomCircles(1, bbox1);
    points1[0].properties.radius.value = -1;
    try {
      await dbDal.insertShapes(points1);
    }
    catch (e) {
      expect(e).to.be.string;
    }
  });

  it('turf.js distance', async () => {
    const places = PLACES;
    const from = places.features.find(feature => feature.properties.name === 'Tel Aviv');

    let to = places.features.find(feature => feature.properties.name === 'Jerusalem');
    let distance = turf.distance(from.geometry.coordinates, to.geometry.coordinates);
    console.log(`distance from ${from.properties.name} to ${to.properties.name} is ${distance} [km]`);

    to = places.features.find(feature => feature.properties.name === 'skaka');
    distance = turf.distance(from.geometry.coordinates, to.geometry.coordinates);
    console.log(`distance from ${from.properties.name} to ${to.properties.name} is ${distance} [km]`);
    expect(distance).to.greaterThan(0);
  });

  it('fail to add circle with units other than meters', async () => {
    const bbox1: Bbox = [100.0, 0.0, 105.0, 1.0];
    const points1 = geo.generateRandomCircles(1, bbox1);
    points1[0].properties.radius.units = 'miles';
    try {
      await dbDal.insertShapes(points1);
    }
    catch (e) {
      expect(e).to.be.string;
    }
  });

  it('geo performance test', async () => {

    // points test
    const noiseBbox = bbox2;
    const realbbox = bbox1;

    await dbDal.deleteAllShapes();
    // const numberOfShapesInNoiseBbox = 100000;
    const numberOfShapesInNoiseBbox = 10;
    const noisePoints = geo.generateRandomPoints(numberOfShapesInNoiseBbox, noiseBbox);
    await dbDal.insertShapes(noisePoints);

    // for (let numberOfShapesInRealBbox of [10,20,50,100,500,1000,5000]) {
    for (let numberOfShapesInRealBbox of [1,2,3]) {
      const countOfRealPointsInDb = (await dbDal.getAllShapesContainedInBbox(realbbox)).length;
      const realPoints = geo.generateRandomPoints(numberOfShapesInRealBbox - countOfRealPointsInDb, realbbox);
      const res1 = await dbDal.insertShapes(realPoints);

      const shapesGeometry = await dbDal.getAllShapesContainedInBbox(realbbox);
      const shapesGeography = await dbDal.getAllShapesIntersectsWithBbox(realbbox);

      expect(shapesGeometry.length).to.equal(numberOfShapesInRealBbox);
    }

    // polygons test

    const numberOfPolygon = 5;
    const shapePolygons = geo.generateRandomPolygons(numberOfPolygon, bbox1);
    const featurePolygons = shapePolygons.map(polygon => {
      return turf.feature(polygon.geo);
    });

    const featureCollectionPolygons = turf.featureCollection(featurePolygons);
    const featureCollectionPolygonsBbox = turf.bbox(featureCollectionPolygons);
    const featureCollectionPolygonsBboxPolygon = turf.bboxPolygon(featureCollectionPolygonsBbox);
    const featureCollectionPolygonsBboxPolygonFeature = turf.feature(featureCollectionPolygonsBboxPolygon.geometry);

    const geojson = {
      type: "FeatureCollection",
      features: [
        polygon1,
        polygon2,
        ...featurePolygons,
        featureCollectionPolygonsBboxPolygonFeature
      ]
    }    
    await dbDal.insertShapes(shapePolygons);
    const shapesGeometry = await dbDal.getAllShapesContainedInBbox(featureCollectionPolygonsBbox);
    const shapesGeography = await dbDal.getAllShapesIntersectsWithBbox(featureCollectionPolygonsBbox);

    const geoJsonFilename = 'geojson.geojson';
    await fs.writeFile(geoJsonFilename, JSON.stringify(geojson), (err) => {
      if (err) {
        logger.error(err.message);
      }
    });
    await s3Instance.upload(geoJsonFilename);
    expect(shapesGeometry.length).to.be.greaterThan(numberOfPolygon);

  });

  // it('polygons in bbox', async () => {
  //   // const numberOfPolygon = 500000;
  //   const numberOfPolygon = 1000;
  //   const shapePolygons = geo.generateRandomPolygons(numberOfPolygon, bbox1);
  //   const featurePolygons = shapePolygons.map(polygon => {
  //     return turf.feature(polygon.geo);
  //   });
  //   const featureCollectionPolygons = turf.featureCollection(featurePolygons);
  //   const featureCollectionPolygonsBbox = turf.bbox(featureCollectionPolygons);
  //   const featureCollectionPolygonsBboxPolygon = turf.bboxPolygon(featureCollectionPolygonsBbox);
  //   const featureCollectionPolygonsBboxPolygonFeature = turf.feature(featureCollectionPolygonsBboxPolygon.geometry);

  //   const geojson = {
  //     type: "FeatureCollection",
  //     features: [
  //       polygon1,
  //       polygon2,
  //       ...featurePolygons,
  //       featureCollectionPolygonsBboxPolygonFeature
  //     ]
  //   }
  //   await dbDal.deleteAllShapes();
  //   await dbDal.insertShapes(shapePolygons);
  //   const shapesGeometry = await dbDal.getAllShapesContainedInBbox(featureCollectionPolygonsBbox);
  //   const shapesGeography = await dbDal.getAllShapesIntersectsWithBbox(featureCollectionPolygonsBbox);

  //   const geoJsonFilename = 'geojson.geojson';
  //   await fs.writeFile(geoJsonFilename, JSON.stringify(geojson), (err) => {
  //     if (err) {
  //       logger.error(err.message);
  //     }
  //   });
  //   await s3Instance.upload(geoJsonFilename);
  //   expect(shapesGeometry.length).to.be.equal(numberOfPolygon);
  // });
});