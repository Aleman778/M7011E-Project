#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" <<-EOSQL
    CREATE USER climate WITH PASSWORD '${CLIMATE_PASSWORD}';
	CREATE DATABASE climate;
    GRANT ALL PRIVILEGES ON DATABASE climate TO climate;
    
    \c climate;

    CREATE TABLE wind_data (
        time TIMESTAMP NOT NULL PRIMARY KEY,
        wind_speed REAL NOT NULL,
        unit VARCHAR NOT NULL
    );

    GRANT ALL PRIVILEGES ON TABLE wind_data TO climate;

    
    CREATE USER electricity_grid WITH PASSWORD '${ELECTRICITY_GRID_PASSWORD}';
    CREATE DATABASE electricity_grid;
    GRANT ALL PRIVILEGES ON DATABASE electricity_grid TO electricity_grid;

    \c electricity_grid;

    CREATE TABLE users (
        id UUID PRIMARY KEY,
        name VARCHAR(128) NOT NULL,
        email VARCHAR(128) UNIQUE NOT NULL,
        password VARCHAR(128) NOT NULL,
        role VARCHAR(20) NOT NULL,
        removed BOOL NOT NULL,
        created_at TIMESTAMP,
        updated_at TIMESTAMP
    );
    GRANT ALL PRIVILEGES ON TABLE users TO electricity_grid;

    CREATE TABLE prosumer_data (
        id UUID REFERENCES users(id),
        time TIMESTAMP NOT NULL,
        production DECIMAL NOT NULL,
        consumption DECIMAL NOT NULL,
        buffer DECIMAL NOT NULL,
        buffer_max DECIMAL NOT NULL,
        buffer_excessive_production_ratio DECIMAL NOT NULL,
        buffer_under_production_ratio DECIMAL NOT NULL,
        PRIMARY KEY(id, time)
    );
    GRANT ALL PRIVILEGES ON TABLE prosumer_data TO electricity_grid;
EOSQL
