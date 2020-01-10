#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" <<-EOSQL
    GRANT ALL PRIVILEGES ON DATABASE climate TO climate;
    GRANT ALL PRIVILEGES ON DATABASE electricity_grid TO electricity_grid;

    \c climate;
    DROP TABLE IF EXISTS wind;
    DROP TABLE IF EXISTS wind_data;
    \i /usr/src/db/migrations/climate.sql;
    GRANT ALL PRIVILEGES ON TABLE wind TO climate;
    GRANT ALL PRIVILEGES ON TABLE wind_data TO climate;


    \c electricity_grid;
    DROP TABLE IF EXISTS simulation_state CASCADE;
    DROP TABLE IF EXISTS power_plant_data CASCADE;
    DROP TABLE IF EXISTS power_plant CASCADE;
    DROP TABLE IF EXISTS wind_turbine CASCADE;
    DROP TABLE IF EXISTS house CASCADE;
    DROP TABLE IF EXISTS prosumers CASCADE;
    DROP TABLE IF EXISTS prosumer_data CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
    \i /usr/src/db/migrations/electricity_grid.sql;
    GRANT ALL PRIVILEGES ON TABLE users TO electricity_grid;
    GRANT ALL PRIVILEGES ON TABLE prosumers TO electricity_grid;
    GRANT ALL PRIVILEGES ON TABLE prosumer_data TO electricity_grid;
    GRANT ALL PRIVILEGES ON TABLE house TO electricity_grid;
    GRANT ALL PRIVILEGES ON TABLE wind_turbine TO electricity_grid;
    GRANT ALL PRIVILEGES ON TABLE power_plant TO electricity_grid;
    GRANT ALL PRIVILEGES ON TABLE power_plant_data TO electricity_grid;
    GRANT ALL PRIVILEGES ON TABLE simulation_state TO electricity_grid;
EOSQL
