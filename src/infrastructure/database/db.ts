import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const pool = new sql.ConnectionPool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER as string,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: false, // true if using Azure
    trustServerCertificate: true // true for local dev/self-signed certs
  }
});

export const poolPromise = pool.connect();
export { sql };
