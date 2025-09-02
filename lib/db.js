import mysql from 'mysql2/promise';

// Global connection pool for serverless environment
let pool;
let isConnecting = false;

const dbConfig = {
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT || 3306,
  // Serverless-specific configuration
  connectionLimit: 2, // Reduced for serverless
  acquireTimeout: 30000,
  timeout: 30000,
  reconnect: true,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
};

async function connectDB() {
  // If pool already exists, return it
  if (pool) {
    return pool;
  }

  // If connection is in progress, wait for it
  if (isConnecting) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return connectDB(); // Retry
  }

  isConnecting = true;

  try {
    console.log('Creating new MySQL connection pool...');
    pool = mysql.createPool(dbConfig);
    
    // Test the connection
    const connection = await pool.getConnection();
    console.log('MySQL connected successfully');
    
    // Create schools table if it doesn't exist
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
    // Clean up failed connection
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

// Close pool when needed (for serverless environments)
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