CREATE TABLE users (
    id UUID PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    email VARCHAR(128) UNIQUE NOT NULL,
    password VARCHAR(128) NOT NULL,
    role VARCHAR(20) NOT NULL,
    avatar_filename VARCHAR(100),
    removed BOOL NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    online_at TIMESTAMP NOT NULL
);
CREATE TABLE prosumers (
    id UUID PRIMARY KEY REFERENCES users(id),
    house_filename VARCHAR(100)
);
CREATE TABLE prosumer_data (
    id UUID REFERENCES users(id),
    time TIMESTAMP NOT NULL,
    production DECIMAL NOT NULL,
    consumption DECIMAL NOT NULL,
    net_consumption DECIMAL NOT NULL,
    battery_capacity DECIMAL NOT NULL,
    battery_value DECIMAL NOT NULL,
    PRIMARY KEY(id, time)
);
CREATE TABLE power_plant (
    owner UUID PRIMARY KEY REFERENCES users(id),
    name VARCHAR(200) NOT NULL,
    
    state VARCHAR(10) NOT NULL,
    delay DECIMAL NOT NULL,
    
    production_level DECIMAL NOT NULL,
    production_capacity DECIMAL NOT NULL,
    production_variant DECIMAL NOT NULL,
    
    market_ratio DECIMAL NOT NULL,
    market_price NUMERIC(2) NOT NULL,

    battery_capacity DECIMAL NOT NULL,
    battery_value DECIMAL NOT NULL,

    unit VARCHAR(10) NOT NULL,

    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
CREATE TABLE power_plant_data (
    owner UUID REFERENCES users(id),
    time TIMESTAMP NOT NULL,

    production DECIMAL NOT NULL,
    battery_value DECIMAL NOT NULL,
    unit VARCHAR(10) NOT NULL,

    PRIMARY KEY(owner, time)
);
CREATE TABLE house (
    owner UUID PRIMARY KEY REFERENCES users(id),
    power_plant UUID REFERENCES power_plant(owner),
    block_timer DECIMAL NOT NULL,
    battery_value DECIMAL NOT NULL,
    battery_capacity DECIMAL NOT NULL,
    consumption_max DECIMAL NOT NULL,
    consumption_stdev DECIMAL NOT NULL,
    charge_ratio DECIMAL NOT NULL,
    consume_ratio DECIMAL NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
CREATE TABLE wind_turbine (
    owner UUID PRIMARY KEY REFERENCES users(id),
    current_power DECIMAL NOT NULL,
    max_power DECIMAL NOT NULL,
    production_ratio DECIMAL NOT NULL,
    break_down_freq DECIMAL NOT NULL,
    repair_time DECIMAL NOT NULL,
    broken BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
