CREATE TABLE wind (
    id SERIAL NOT NULL PRIMARY KEY,
    max REAL NOT NULL,
    stdev REAL NOT NULL,
    unit VARCHAR(10) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
CREATE TABLE wind_data (
    time TIMESTAMP NOT NULL PRIMARY KEY,
    wind_speed REAL NOT NULL,
    unit VARCHAR(10) NOT NULL
);
