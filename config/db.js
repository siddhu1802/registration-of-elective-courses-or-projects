// config/db.js
import oracledb from 'oracledb';
import dotenv from 'dotenv';
dotenv.config();

let pool;

export async function initialize() {
  try {
    pool = await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING,
    });
    console.log('✅ Oracle DB connected successfully.');
  } catch (err) {
    console.error('❌ Oracle DB connection failed:', err);
    process.exit(1);
  }
}

export function getConnection() {
  return pool.getConnection();
}

export async function closeConnection(conn) {
  if (conn) {
    try {
      await conn.close();
    } catch (err) {
      console.error("Error closing connection:", err);
    }
  }
}

export { oracledb };