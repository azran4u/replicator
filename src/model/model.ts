import * as geoJson from 'geojson';
import * as mapbox from 'mapbox-gl';
import * as turf from '@turf/turf';
import { BBox } from '@turf/turf';

export type Bbox = geoJson.BBox;
export type Geometry = geoJson.Geometry;
export type ShapeType = 'point' | 'circle' | 'polygon' | 'corridor';
export type ShapeInput = ShapePointInput | ShapeCircleInput | ShapeCorridorInput | ShapePolygonInput;
export type ShapeAnyProperties = ShapePointProperties | ShapeCircleProperties | ShapeCorridorProperties | ShapePolygonInput;

export type PostgisGeo = 'geometry' | 'geography'; 

export interface Distance {
    value: number;
    units: turf.Units;
}

export interface Shape {
    id: string;
    type: ShapeType
    geo: geoJson.Geometry;
    properties: ShapeAnyProperties;
    style: mapbox.AnyPaint;
}

export interface ShapeProperties {
    name?: string;
}

export type ShapePointInput = Omit<ShapePoint, "id">;
export interface ShapePointProperties extends ShapeProperties {};
export interface ShapePoint extends Shape {
    type: 'point';
    geo: geoJson.Point;
    style: mapbox.SymbolPaint;
}

export type ShapeCircleInput = Omit<ShapeCircle, "id">;
export interface ShapeCircleProperties extends ShapeProperties { radius: Distance };
export interface ShapeCircle extends Shape {
    type: 'circle';
    geo: geoJson.Point;
    properties: ShapeCircleProperties;
    style: mapbox.CirclePaint;
}

export type ShapeCorridorInput = Omit<ShapeCorridor, "id">;
export interface ShapeCorridorProperties extends ShapeProperties { safetyDistance: Distance; };
export interface ShapeCorridor extends Shape {
    type: 'corridor';
    geo: geoJson.Polygon;
    properties: ShapeCorridorProperties;
    style: mapbox.FillPaint;
}

export type ShapePolygonInput = Omit<ShapePolygon, "id">;
export interface ShapePolygonProperties extends ShapeProperties {};
export interface ShapePolygon extends Shape {
    type: 'polygon';
    geo: geoJson.Polygon;
    properties: ShapePolygonProperties;
    style: mapbox.FillPaint;
}