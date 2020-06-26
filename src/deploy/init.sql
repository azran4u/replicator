SET client_encoding = 'UTF8';

CREATE SCHEMA IF NOT EXISTS geo;

ALTER ROLE pac_geo_poc_usr SET search_path = geo, public;

DROP TYPE SHAPE_TYPE;
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT
			1
		FROM
			pg_type
		WHERE
			LOWER(typname) = LOWER('SHAPE_TYPE')) THEN
	CREATE TYPE SHAPE_TYPE AS ENUM (
		'point',
		'circle',
		'polygon',
		'corridor',
		'line'
    );
    END IF;
END
$$;

DROP TABLE IF EXISTS shapes;
CREATE TABLE IF NOT EXISTS shapes (
	_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	_type SHAPE_TYPE NOT NULL,
	_geometry GEOMETRY,
	_geography GEOGRAPHY,
	_properties jsonb NOT NULL DEFAULT '{}' ::jsonb,
	_style jsonb NOT NULL DEFAULT '{}' ::jsonb,

	constraint shape_properties
       check	( 
		   			( (_type = 'circle') and ((_properties -> 'radius' ->> 'value')::integer >= 0) and ((_properties -> 'radius' ->> 'units') = 'meters')) or 
					( (_type = 'point') ) or 
					( (_type = 'polygon') ) or 
					( (_type = 'corridor') ) or
					( (_type = 'line') ) 
	   			) 
);

CREATE INDEX global_geometry_gix ON geo.shapes USING GIST ( _geometry );
CREATE INDEX global_geography_gix ON geo.shapes USING GIST ( _geography );


DROP TABLE IF EXISTS nativ;
CREATE TABLE IF NOT EXISTS nativ (
	_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	_name VARCHAR(255) NOT NULL
);

CREATE INDEX nativ_name_gix ON geo.nativ( _name );

DROP TABLE IF EXISTS nativ_geo;
CREATE TABLE if not exists nativ_geo (
  _id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  _nativ_id INTEGER REFERENCES nativ(_id) NOT NULL,
  _shape_id INTEGER REFERENCES shapes(_id) NOT NULL,
  _category VARCHAR(255) NOT NULL,
  _sub_category VARCHAR(255) NOT NULL,
  unique (_nativ_id, _shape_id, _category, _sub_category)
);

CREATE INDEX nativ_geo_category_gix ON geo.nativ_geo( _category );
CREATE INDEX nativ_geo_sub_category_gix ON geo.nativ_geo( _sub_category );