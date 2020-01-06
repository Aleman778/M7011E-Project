CREATE TABLE users (
    id UUID PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    email VARCHAR(128) UNIQUE NOT NULL,
    password VARCHAR(128) NOT NULL,
    role VARCHAR(20) NOT NULL,
    avatar_filename VARCHAR(100),
    removed BOOL NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
CREATE TABLE prosumers (
    id UUID PRIMARY KEY REFERENCES users(id),
    buffer REAL NOT NULL,
    buffer_max REAL NOT NULL,
    excessive_production_ratio REAL NOT NULL,
    under_production_ratio REAL NOT NULL,
    house_filename VARCHAR(100)
);
CREATE TABLE prosumer_data (
    id UUID REFERENCES users(id),
    time TIMESTAMP NOT NULL,
    production DECIMAL NOT NULL,
    consumption DECIMAL NOT NULL,
    net_consumption DECIMAL NOT NULL,
    PRIMARY KEY(id, time)
);
CREATE TABLE power_plant (
    id UUID NOT NULL PRIMARY KEY,
    owner UUID REFERENCES users(id),
    
    production_level DECIMAL NOT NULL,
    max_production DECIMAL NOT NULL,
    production_variant DECIMAL NOT NULL,
    production_ratio DECIMAL NOT NULL,
    
    time TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,

    battery_capacity DECIMAL NOT NULL
);
CREATE TABLE power_plant_data (
    id UUID REFERENCES power_plant,
    time TIMESTAMP NOT NULL,

    production DECIMAL NOT NULL,
    battery_value DECIMAL NOT NULL,
    unit VARCHAR(10) NOT NULL,

    PRIMARY KEY(id, time)
);
