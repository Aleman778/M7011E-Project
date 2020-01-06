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
CREATE TABLE wind_turbine (
    id UUID PRIMARY KEY,
    current_power REAL NOT NULL,
    max_power REAL NOT NULL,
    production_ratio REAL NOT NULL,
    break_down_freq REAL NOT NULL,
    repair_time REAL NOT NULL,
    broken BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
CREATE TABLE house (
    id UUID PRIMARY KEY,
    owner UUID REFERENCES users(id),
    wind_turbine UUID REFERENCES wind_turbine(id),
    battery_value REAL NOT NULL,
    battery_capacity REAL NOT NULL,
    consumption_max REAL NOT NULL,
    consumption_stdev REAL NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
