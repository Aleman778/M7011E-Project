#!/bin/bash
set -e

POSTGRES="psql -d ${POSTGRES_DB} -a -U${POSTGRES_USER}"

$POSTGRES <<EOSQL
CREATE TABLE ${PG_TABLE_WIND}(
   year INTEGER NOT NULL,
   day INTEGER NOT NULL,
   hour INTEGER NOT NULL,
   windSpeed REAL NOT NULL,
   unit VARCHAR NOT NULL,
   PRIMARY KEY (year, day, hour)
);
EOSQL
