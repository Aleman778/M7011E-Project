#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" <<-EOSQL
    CREATE USER climate WITH PASSWORD '${CLIMATE_PASSWORD}';
	CREATE DATABASE climate;
    GRANT ALL PRIVILEGES ON DATABASE climate TO climate;
    
    \c climate;
    \i /usr/src/db/migrations/climate.sql;

    GRANT ALL PRIVILEGES ON TABLE wind_data TO climate;
    GRANT ALL PRIVILEGES ON TABLE wind TO climate;
    
    CREATE USER electricity_grid WITH PASSWORD '${ELECTRICITY_GRID_PASSWORD}';
    CREATE DATABASE electricity_grid;
    GRANT ALL PRIVILEGES ON DATABASE electricity_grid TO electricity_grid;

    \c electricity_grid;
    \i /usr/src/db/migrations/electricity_grid.sql;

    GRANT ALL PRIVILEGES ON TABLE users TO electricity_grid;
    GRANT ALL PRIVILEGES ON TABLE prosumers TO electricity_grid;
    GRANT ALL PRIVILEGES ON TABLE prosumer_data TO electricity_grid;
    GRANT ALL PRIVILEGES ON TABLE house TO electricity_grid;
    GRANT ALL PRIVILEGES ON TABLE wind_turbine TO electricity_grid;
    GRANT ALL PRIVILEGES ON TABLE power_plant TO electricity_grid;
    GRANT ALL PRIVILEGES ON TABLE power_plant_data TO electricity_grid;
EOSQL
