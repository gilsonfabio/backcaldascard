require('dotenv').config();

module.exports = {
    development: {
        client: 'mysql',
        connection: {
            host: process.env.DATABASE_HOST || '127.0.0.1',
            port: Number(process.env.DATABASE_PORT || 3306),
            database: process.env.DATABASE_NAME,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD
        },
        pool: {
            min: 0,
            max: 5,
            idleTimeoutMillis: 30000,
            reapIntervalMillis: 1000,
            createTimeoutMillis: 10000
        },
        acquireConnectionTimeout: 10000,
        useNullAsDefault: true
    },

    staging: {
        client: 'mysql',
        connection: {
            host: process.env.DATABASE_HOST,
            port: Number(process.env.DATABASE_PORT || 3306),
            database: process.env.DATABASE_NAME,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD
        },
        pool: {
            min: 0,
            max: 5,
            idleTimeoutMillis: 30000,
            reapIntervalMillis: 1000,
            createTimeoutMillis: 10000
        },
        acquireConnectionTimeout: 10000,
        useNullAsDefault: true
    },

    production: {
        client: 'mysql',
        connection: {
          host: process.env.DATABASE_HOST,
          port: Number(process.env.DATABASE_PORT || 3306),
          database: process.env.DATABASE_NAME,
          user: process.env.DATABASE_USER,
          password: process.env.DATABASE_PASSWORD
        },
        pool: {
          min: 0,
          max: 5,
          idleTimeoutMillis: 5000,
          reapIntervalMillis: 1000,
          createTimeoutMillis: 10000
        },
        acquireConnectionTimeout: 10000,
        migrations: {
          directory: './src/database/migrations'
        },
        useNullAsDefault: true
    }
};