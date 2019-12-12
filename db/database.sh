#!/bin/bash
set -e

POSTGRES="psql -d ${POSTGRES_DB} -a -U${POSTGRES_USER}"

$POSTGRES <<EOSQL
CREATE TABLE windData (
   time TIMESTAMP NOT NULL PRIMARY KEY,
   windSpeed REAL NOT NULL,
   unit VARCHAR NOT NULL
);
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
EOSQL
