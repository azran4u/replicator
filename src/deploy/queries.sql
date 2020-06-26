ALTER ROLE pac_geo_poc_usr SET search_path = geo, public;

DELETE FROM geo.shapes
RETURNING
	_id;

SHOW search_path;

SELECT
	*
FROM
	geo.shapes;

SELECT
	COUNT(*)
FROM
	geo.shapes;

-- insert ShapePoint
INSERT INTO geo.shapes (_type, _geometry, _properties, _style)
	VALUES ('point', ST_GeomFromGeoJSON ('
                          {
                              "type": "Point",
                              "coordinates": [125.6, 10.1]
                          }
                      '), '{}', '{}')
RETURNING
	_id;

-- insert ShapePolygon
INSERT INTO geo.shapes (_type, _geometry, _properties, _style)
	VALUES ('polygon', ST_GeomFromGeoJSON ('
                          {
                              "type": "Polygon",
                              "coordinates": [
                                  [
                                  [100.0, 0.0],
                                  [101.0, 0.0],
                                  [101.0, 1.0],
                                  [100.0, 1.0],
                                  [100.0, 0.0]
                                  ]
                              ]
                          }
                      '), '{}', '{}')
RETURNING
	_id;

-- insert ShapeCircle
INSERT INTO geo.shapes (_type, _geometry, _properties, _style)
	VALUES ('circle', ST_GeomFromGeoJSON ('
                          {
                              "type": "Point",
                              "coordinates": [125.6, 10.1]
                          }
                      '), '{
                         "radius": {
                             "value": 10,
                             "units": "meters"
                         }
                      }', '{}')
RETURNING
	_id;

-- insert ShapeCorridor
INSERT INTO geo.shapes (_type, _geometry, _properties, _style)
	VALUES ('corridor', ST_GeomFromGeoJSON ('
                          {
                              "type": "Polygon",
                              "coordinates": [
                                  [
                                  [100.0, 0.0],
                                  [101.0, 0.0],
                                  [101.0, 1.0],
                                  [100.0, 1.0],
                                  [100.0, 0.0]
                                  ]
                              ]
                          }
                      '), '{
                         "safetyDistance": {
                             "value": 10,
                             "units": "meters"
                         }
                      }', '{}')
RETURNING
	_id;


	
-- Returns TRUE if geometry B is completely inside geometry A
SELECT
	*
FROM
	geo.shapes
WHERE
	ST_Contains ( 
            ST_MakeEnvelope (100.0, 0.0, 105.0, 1.0, 4326),
            _geometry
    )
	
-- If a geometry or geography shares any portion of space then they intersect.
SELECT
	*
FROM
	geo.shapes
WHERE
	ST_Intersects ( 
            ST_MakeEnvelope (100.0, 0.0, 105.0, 1.0, 4326),
            _geometry
    )

-- for circle use a polygon with 8 segments
SELECT
	_id, _type
FROM
	geo.shapes
WHERE   (   _type = 'point'
        AND 
            ST_Contains ( 
                ST_MakeEnvelope (100.0, 0.0, 105.0, 1.0, 4326),
                _geometry
            )
        )
        OR 
        (   _type = 'circle'
            AND 
            ST_Contains (
                ST_MakeEnvelope (-180, -90, 180, 90, 4326),
                ST_Buffer (_geometry, (_properties -> 'radius' ->> 'value')::integer)
            )
        )


INSERT INTO geo.shapes (_type, _geometry, _properties, _style)
	VALUES ('point', ST_GeomFromGeoJSON ('
                          {
                            "type": "Point",
                            "coordinates": [34.781769, 32.0853] 
                          }
                      '), 
                        '{"name": "Tel Aviv"}', '{}')
RETURNING
	_id;

INSERT INTO geo.shapes (_type, _geometry, _properties, _style)
	VALUES ('point', ST_GeomFromGeoJSON ('
                          {
                              "type": "Point",
                              "coordinates": [35.213711, 31.768318]
                          }
                      '), '{"name": "Jerusalem"}', '{}')
RETURNING
	_id;

SELECT ST_Distance_Sphere  (
                                (SELECT _geometry from geo.shapes where _id = 6)::geometry,
                                (SELECT _geometry from geo.shapes where _id = 7)::geometry
                            );

= 53889.13249578
= 53888.5479558
-- ***** geography *****
-- insert ShapePoint
INSERT INTO geo.shapes (_type, _geometry, _geography, _properties, _style)
	VALUES ('point',     
                    ST_SetSRID(
                        ST_GeomFromGeoJSON ('
                          {
                            "type": "Point",
                            "coordinates": [34.781769, 32.0853] 
                          }
                        '), 4326
                    ),                     
                    ST_GeomFromGeoJSON ('
                        {
                            "type": "Point",
                            "coordinates": [34.781769, 32.0853] 
                        }
                    ')::geography, '{"name": "Tel Aviv"}', '{}')
RETURNING
	_id;

SELECT * from geo.shapes where (_properties ->> 'name') = 'Tel Aviv'

-- spherical 53888.5479558 planar 53889.13249578
SELECT  ST_Distance (
                        (SELECT _geography from geo.shapes where (_properties ->> 'name') = 'Tel Aviv')::geography,
                        (SELECT _geography from geo.shapes where (_properties ->> 'name') = 'Jerusalem')::geography,
                        true
                    )   as spherical_distance,
        ST_Distance_Sphere  (
                        (SELECT _geometry from geo.shapes where (_properties ->> 'name') = 'Tel Aviv')::geometry,
                        (SELECT _geometry from geo.shapes where (_properties ->> 'name') = 'Jerusalem')::geometry
                    )   as planar_distance;

-- spherical 568464.18179528 planar 567802.34126469
SELECT  ST_Distance (
                        (SELECT _geography from geo.shapes where (_properties ->> 'name') = 'Tel Aviv')::geography,
                        (SELECT _geography from geo.shapes where (_properties ->> 'name') = 'skaka')::geography,
                        true
                    )   as spherical_distance,
        ST_Distance_Sphere  (
                        (SELECT _geometry from geo.shapes where (_properties ->> 'name') = 'Tel Aviv')::geometry,
                        (SELECT _geometry from geo.shapes where (_properties ->> 'name') = 'skaka')::geometry
                    )   as planar_distance;

-- same result 567802.34126469
SELECT  ST_Distance (
                        (SELECT _geography from geo.shapes where (_properties ->> 'name') = 'Tel Aviv')::geography,
                        (SELECT _geography from geo.shapes where (_properties ->> 'name') = 'skaka')::geography,
                        false
                    )   as spherical_distance,
        ST_Distance_Sphere  (
                        (SELECT _geometry from geo.shapes where (_properties ->> 'name') = 'Tel Aviv')::geometry,
                        (SELECT _geometry from geo.shapes where (_properties ->> 'name') = 'skaka')::geometry
                    )   as planar_distance;





INSERT INTO geo.shapes (_type, _geometry, _geography, _properties, _style)
	VALUES ('point',     
                    ST_SetSRID(
                        ST_GeomFromGeoJSON ('
                          {
                            "type": "Point",
                            "coordinates": [20.830078125,25.799891182088334]
                          }
                        '), 4326
                    ),                     
                    ST_GeomFromGeoJSON ('
                        {
                            "type": "Point",
                            "coordinates": [20.830078125,25.799891182088334]
                        }
                    ')::geography, '{"name": "egypt_in_polygon"}', '{}')
RETURNING
	_id;

INSERT INTO geo.shapes (_type, _geometry, _geography, _properties, _style)
	VALUES ('point',     
                    ST_SetSRID(
                        ST_GeomFromGeoJSON ('
                          {
                            "type": "Point",
                            "coordinates": [21.181640624999996,30.826780904779774]
                          }
                        '), 4326
                    ),                     
                    ST_GeomFromGeoJSON ('
                        {
                            "type": "Point",
                            "coordinates": [21.181640624999996,30.826780904779774]
                        }
                    ')::geography, '{"name": "egypt_out_polygon"}', '{}')
RETURNING
	_id;

INSERT INTO geo.shapes (_type, _geometry, _geography, _properties, _style)
	VALUES ('polygon',     
                    ST_SetSRID(
                        ST_GeomFromGeoJSON ('
                          {
                            "type": "Polygon",
                            "coordinates": 
                            [
                                [
                                    [
                                    15.380859374999998,
                                    21.289374355860424
                                    ],
                                    [
                                    25.751953125,
                                    21.289374355860424
                                    ],
                                    [
                                    25.751953125,
                                    29.84064389983441
                                    ],
                                    [
                                    15.380859374999998,
                                    29.84064389983441
                                    ],
                                    [
                                    15.380859374999998,
                                    21.289374355860424
                                    ]
                                ]
                            ]
                          }
                        '), 4326
                    ),                     
                    ST_GeomFromGeoJSON ('
                        {
                           "type": "Polygon",
                            "coordinates": 
                            [
                                [
                                    [
                                    15.380859374999998,
                                    21.289374355860424
                                    ],
                                    [
                                    25.751953125,
                                    21.289374355860424
                                    ],
                                    [
                                    25.751953125,
                                    29.84064389983441
                                    ],
                                    [
                                    15.380859374999998,
                                    29.84064389983441
                                    ],
                                    [
                                    15.380859374999998,
                                    21.289374355860424
                                    ]
                                ]
                            ]
                        }
                    ')::geography, '{"name": "egypt_polygon"}', '{}')
RETURNING
	_id;

SELECT
	*
FROM
	geo.shapes
WHERE
	ST_Intersects ( 
            ST_GeomFromGeoJSON ('
                        {
                            "type": "Point",
                            "coordinates": [21.181640624999996,30.826780904779774]
                        }
                    ')::geography,
            _geography
    );


-- Complex entities

-- id=1
INSERT INTO geo.shapes (_type, _geometry, _geography, _properties, _style)
	VALUES ('line',     
                    ST_SetSRID(
                        ST_GeomFromGeoJSON ('
                            {
                                "type": "LineString",
                                "coordinates": [
                                    [
                                        8.0859375,
                                        45.336701909968134
                                    ],
                                    [
                                        22.148437499999996,
                                        50.736455137010665
                                    ],
                                    [
                                        35.15625,
                                        43.068887774169625
                                    ],
                                    [
                                        31.640625,
                                        36.59788913307022
                                    ],
                                    [
                                        47.8125,
                                        34.016241889667015
                                    ],
                                    [
                                        61.52343749999999,
                                        42.8115217450979
                                    ]
                                ]
                            }
                        '), 4326
                    ),                     
                    ST_GeomFromGeoJSON ('
                        {
                                "type": "LineString",
                                "coordinates": [
                                    [
                                        8.0859375,
                                        45.336701909968134
                                    ],
                                    [
                                        22.148437499999996,
                                        50.736455137010665
                                    ],
                                    [
                                        35.15625,
                                        43.068887774169625
                                    ],
                                    [
                                        31.640625,
                                        36.59788913307022
                                    ],
                                    [
                                        47.8125,
                                        34.016241889667015
                                    ],
                                    [
                                        61.52343749999999,
                                        42.8115217450979
                                    ]
                                ]
                            }
                    ')::geography, '{"name": "line1"}', '{}')
RETURNING
	_id;

-- id=2
INSERT INTO geo.shapes (_type, _geometry, _geography, _properties, _style)
	VALUES ('point',     
                    ST_SetSRID(
                        ST_GeomFromGeoJSON ('
                          {
                            "type": "Point",
                            "coordinates": [8.0859375,45.336701909968134]
                          }
                        '), 4326
                    ),                     
                    ST_GeomFromGeoJSON ('
                        {
                            "type": "Point",
                            "coordinates": [8.0859375,45.336701909968134]
                        }
                    ')::geography, '{"name": "point2"}', '{}')
RETURNING
	_id;

-- id=3
INSERT INTO geo.shapes (_type, _geometry, _geography, _properties, _style)
	VALUES ('point',     
                    ST_SetSRID(
                        ST_GeomFromGeoJSON ('
                          {
                            "type": "Point",
                            "coordinates":  [
                                                22.148437499999996,
                                                50.736455137010665
                                            ]
                          }
                        '), 4326
                    ),                     
                    ST_GeomFromGeoJSON ('
                        {
                            "type": "Point",
                            "coordinates": [
                                                22.148437499999996,
                                                50.736455137010665
                                            ]
                        }
                    ')::geography, '{"name": "point3"}', '{}')
RETURNING
	_id;

-- id=4
INSERT INTO geo.shapes (_type, _geometry, _geography, _properties, _style)
	VALUES ('point',     
                    ST_SetSRID(
                        ST_GeomFromGeoJSON ('
                          {
                            "type": "Point",
                            "coordinates":  [
                                                31.640625,
                                                36.59788913307022
                                            ]
                          }
                        '), 4326
                    ),                     
                    ST_GeomFromGeoJSON ('
                        {
                            "type": "Point",
                            "coordinates": [
                                                31.640625,
                                                36.59788913307022
                                            ]
                        }
                    ')::geography, '{"name": "point4"}', '{}')
RETURNING
	_id;

-- id=5
INSERT INTO geo.shapes (_type, _geometry, _geography, _properties, _style)
	VALUES ('point',     
                    ST_SetSRID(
                        ST_GeomFromGeoJSON ('
                          {
                            "type": "Point",
                            "coordinates":  [
                                                47.8125,
                                                34.016241889667015
                                            ]
                          }
                        '), 4326
                    ),                     
                    ST_GeomFromGeoJSON ('
                        {
                            "type": "Point",
                            "coordinates": [
                                                47.8125,
                                                34.016241889667015
                                            ]
                        }
                    ')::geography, '{"name": "point5"}', '{}')
RETURNING
	_id;

-- id=6
INSERT INTO geo.shapes (_type, _geometry, _geography, _properties, _style)
	VALUES ('point',     
                    ST_SetSRID(
                        ST_GeomFromGeoJSON ('
                          {
                            "type": "Point",
                            "coordinates":  [
                                                61.52343749999999,
                                                42.8115217450979
                                            ]
                          }
                        '), 4326
                    ),                     
                    ST_GeomFromGeoJSON ('
                        {
                            "type": "Point",
                            "coordinates": [
                                                61.52343749999999,
                                                42.8115217450979
                                            ]
                        }
                    ')::geography, '{"name": "point6"}', '{}')
RETURNING
	_id;

INSERT INTO geo.nativ (_name)
	VALUES ('nativ1')
RETURNING
	_id;

INSERT INTO geo.nativ_geo (_nativ_id, _shape_id, _category, _sub_category)
	VALUES (1,6,'line', 'main')
RETURNING
	_id;

INSERT INTO geo.nativ_geo (_nativ_id, _shape_id, _category, _sub_category)
	VALUES (1,7,'points', 'group1')
RETURNING
	_id;

INSERT INTO geo.nativ_geo (_nativ_id, _shape_id, _category, _sub_category)
	VALUES (1,8,'points', 'group1')
RETURNING
	_id;

INSERT INTO geo.nativ_geo (_nativ_id, _shape_id, _category, _sub_category)
	VALUES (1,9,'points', 'group2')
RETURNING
	_id;

INSERT INTO geo.nativ_geo (_nativ_id, _shape_id, _category, _sub_category)
	VALUES (1,10,'points', 'group2')
RETURNING
	_id;

lineMovePoint(lineId, pointId, newPointCoordinates){
    get currentPointGeoJson by id
    get currentLineGeoJson
    find currentPointGeoJson.coordinates in currentLineGeoJson.coodinates
    optional - validate constraints
    update (transaction) 
        point = newPointCoordinates
        line 
        line_geo
    finish
}