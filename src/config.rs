use dotenv::dotenv;
use lazy_static::lazy_static;
use std::env;

lazy_static! {
    static ref CONFIGURATION: Configuration = Configuration::new();
}

pub fn _get_configurations() -> &'static Configuration {
    &CONFIGURATION
}

pub struct DatabaseConfiguration {
    pub uri: String,
}

pub struct ServerConfiguration {
    pub host: String,
    pub port: String,
    pub db_url: String,
}

pub struct Configuration {
    pub server: ServerConfiguration,
    pub is_production: bool,
}

impl Default for ServerConfiguration {
    fn default() -> Self {
        ServerConfiguration {
            host: env::var("HOST").expect("HOST must be set"),
            port: env::var("PORT").expect("PORT must be set"),
            db_url: env::var("DATABASE_URL").expect("DATABASE_URL must be set"),
        }
    }
}

impl ServerConfiguration {
    pub fn new() -> Self {
        ServerConfiguration::default()
    }
}

impl Default for Configuration {
    fn default() -> Self {
        Self::new()
    }
}

impl Configuration {
    pub fn new() -> Self {
        let _ = dotenv();

        let is_production = match env::var("APP_ENV") {
            Ok(value) => value == "production",
            Err(_) => panic!("APP_ENV must be set"),
        };

        let conf = Configuration {
            server: ServerConfiguration::new(),
            is_production,
        };

        if !is_production && dotenv().is_err() {
            panic!("Unable to find .env file. Create one based on the .env.example");
        }

        conf
    }
}
