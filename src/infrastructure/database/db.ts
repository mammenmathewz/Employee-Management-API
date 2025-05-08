require('dotenv').config();
const sql = require('mssql');

console.log(process.env.DB_USER, process.env.DB_PASSWORD, process.env.DB_SERVER, process.env.DB_DATABASE);

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: true,
    trustServerCertificate: false, 
  },
};

module.exports = async function connect() {
  try {
    const pool = await sql.connect(config);
    console.log("Connected to SQL Server");
    return pool; 
  } catch (err) {
    console.error("Error connecting to the database:", err);
    throw err; 
  }
};
