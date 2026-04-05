import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  ssl: {
    rejectUnauthorized: false
  }
});

export const connectMySQL = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Kết nối MySQL thành công');
    connection.release();
  } catch (error) {
    console.error(' Lỗi kết nối MySQL:', error.message);
    process.exit(1);
  }
};

export default pool;
