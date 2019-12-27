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
CREATE TABLE prosumer_data (
    id UUID PRIMARY KEY REFERENCES users(id),
    time TIMESTAMP NOT NULL,
    production REAL NOT NULL,
    consumption REAL NOT NULL,
    buffer REAL NOT NULL,
    buffer_max REAL NOT NULL,
    buffer_storing_limit REAL NOT NULL
);
