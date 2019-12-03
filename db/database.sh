#!/bin/bash
set -e

POSTGRES="psql -d ${POSTGRES_DB} -a -U${POSTGRES_USER}"

$POSTGRES <<EOSQL
CREATE TABLE ${PG_TABLE_WIND}(
   time TIMESTAMP NOT NULL PRIMARY KEY,
   windSpeed REAL NOT NULL,
   unit VARCHAR NOT NULL
);
CREATE TABLE ${process.env.PG_TABLE_USERS} (
            id UUID PRIMARY KEY,
            email VARCHAR(128) UNIQUE NOT NULL,
            password VARCHAR(128) NOT NULL,
            role VARCHAR(20) NOT NULL,
            created_at TIMESTAMP,
            updated_at TIMESTAMP
);
EOSQL
