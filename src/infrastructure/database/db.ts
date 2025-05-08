// src/infrastructure/database/db.ts
import sql, { ConnectionPool } from 'mssql';
import dotenv from 'dotenv';

dotenv.config(); // Ensure environment variables are loaded

const config: sql.config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_DATABASE,
    options: {
        // Required for Azure SQL or other SSL-enabled databases
        encrypt: true,
        // Set to true if you are not using a trusted certificate (e.g., development)
        // **WARNING:** In production, use a trusted certificate and set this to false.
        trustServerCertificate: true
    }
};


let pool: ConnectionPool | null = null;

/**
 * Establishes and returns a single, shared database connection pool.
 * If a pool already exists and is connected, it returns the existing pool.
 * @returns {Promise<ConnectionPool>} The connected SQL Server connection pool.
 * @throws {Error} If the database connection fails.
 */
export const connectDB = async (): Promise<ConnectionPool> => {
    try {
        // If pool exists and is connected, return it
        if (pool && pool.connected) {
            console.log('Using existing database connection pool.');
            return pool;
        }

        // Otherwise, create a new pool
        console.log('Creating new database connection pool...');
        pool = await sql.connect(config);
        console.log('Database connected successfully!');
        return pool;
    } catch (err: any) {
        console.error('Database connection failed!', err);
        // It's often better to throw the error and let the caller decide how to handle it,
        // but exiting here can prevent the server from starting if the DB is crucial.
        // process.exit(1); // Uncomment if you want to exit on connection failure
        throw err; // Re-throw the error
    }
};

/**
 * Closes the database connection pool if it exists and is connected.
 */
export const closeDB = async (): Promise<void> => {
    if (pool && pool.connected) {
        try {
            await pool.close();
            pool = null;
            console.log('Database connection pool closed.');
        } catch (err) {
            console.error('Error closing database connection pool:', err);
        }
    }
};