#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" <<-EOSQL
    \c climate;

    DROP TABLE IF EXISTS wind_data;
    \i /usr/src/db/migrations/climate.sql;
    GRANT ALL PRIVILEGES ON DATABASE electricity_grid TO electricity_grid;

    \c electricity_grid;

    DROP TABLE IF EXISTS prosumer_data;
    DROP TABLE IF EXISTS users;
    \i /usr/src/db/migrations/electricity_grid.sql;
    GRANT ALL PRIVILEGES ON TABLE users TO electricity_grid;
    GRANT ALL PRIVILEGES ON TABLE prosumer_data TO electricity_grid;
EOSQL
