\c windSim;

CREATE TABLE wind(
   year INTEGER NOT NULL,
   day INTEGER NOT NULL,
   hour INTEGER NOT NULL,
   windSpeed REAL NOT NULL,
   unit VARCHAR NOT NULL,
   PRIMARY KEY (year, day, hour)
);
