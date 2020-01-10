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
    buffer DECIMAL NOT NULL,
    buffer_max DECIMAL NOT NULL,
    excessive_production_ratio DECIMAL NOT NULL,
    under_production_ratio DECIMAL NOT NULL,
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
CREATE TABLE simulation_state (
    id UUID NOT NULL,
    resource_id UUID NOT NULL,
    resource_type VARCHAR(20) NOT NULL,
    PRIMARY KEY(id, resource_id)
);
CREATE TABLE power_plant (
    id UUID NOT NULL PRIMARY KEY,
    owner UUID REFERENCES users(id),

    start_delay DECIMAL NOT NULL,
    stop_delay DECIMAL NOT NULL,
    
    production_level DECIMAL NOT NULL,
    production_capacity DECIMAL NOT NULL,
    production_variant DECIMAL NOT NULL,
    production_ratio DECIMAL NOT NULL,

    battery_capacity DECIMAL NOT NULL,
    battery_value DECIMAL NOT NULL,

    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
CREATE TABLE power_plant_data (
    id UUID REFERENCES power_plant,
    time TIMESTAMP NOT NULL,

    production DECIMAL NOT NULL,
    battery_value DECIMAL NOT NULL,
    unit VARCHAR(10) NOT NULL,

    PRIMARY KEY(id, time)
);
CREATE TABLE wind_turbine (
    id UUID PRIMARY KEY,
    owner UUID REFERENCES users(id),
    current_power DECIMAL NOT NULL,
    max_power DECIMAL NOT NULL,
    production_ratio DECIMAL NOT NULL,
    break_down_freq DECIMAL NOT NULL,
    repair_time DECIMAL NOT NULL,
    broken BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
CREATE TABLE house (
    id UUID PRIMARY KEY,
    owner UUID REFERENCES users(id),
    wind_turbine UUID REFERENCES wind_turbine(id),
    battery_value DECIMAL NOT NULL,
    battery_capacity DECIMAL NOT NULL,
    consumption_max DECIMAL NOT NULL,
    consumption_stdev DECIMAL NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
