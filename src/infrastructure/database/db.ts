import sql, { ConnectionPool } from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config: sql.config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true,
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
        if (pool && pool.connected) {
            console.log('Using existing database connection pool.');
            return pool;
        }
        console.log('Creating new database connection pool...');
        pool = await sql.connect(config);
        console.log('Database connected successfully!');
        return pool;
    } catch (err: any) {
        console.error('Database connection failed!', err);
        throw err;
    }
};


