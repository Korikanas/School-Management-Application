import mysql from 'mysql2/promise';


let pool;
let isConnecting = false;

const dbConfig = {
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT || 3306,

  connectionLimit: 2, 
  acquireTimeout: 30000,
  timeout: 30000,
  reconnect: true,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
};

async function connectDB() {

  if (pool) {
    return pool;
  }

 
  if (isConnecting) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return connectDB(); 
  }

  isConnecting = true;

  try {
    console.log('Creating new MySQL connection pool...');
    pool = mysql.createPool(dbConfig);
    
    
    const connection = await pool.getConnection();
    console.log('MySQL connected successfully');
    
   
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS schools (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        contact_number VARCHAR(20),
        email VARCHAR(255),
        image VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    connection.release();
    return pool;
  } catch (error) {
    console.error('Database connection failed:', error);
   
    if (pool) {
      try {
        await pool.end();
      } catch (e) {
        console.error('Error closing pool:', e);
      }
      pool = null;
    }
    throw error;
  } finally {
    isConnecting = false;
  }
}


export async function closePool() {
  if (pool) {
    try {
      await pool.end();
      console.log('MySQL connection pool closed');
    } catch (error) {
      console.error('Error closing connection pool:', error);
    }
    pool = null;
  }
}

export default connectDB;
