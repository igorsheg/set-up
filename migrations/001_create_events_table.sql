CREATE TABLE events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type VARCHAR(50) NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    room_code VARCHAR(50),
    client_id VARCHAR(50),
    additional_data TEXT
);
