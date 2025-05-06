import mysql, { createPool } from "mysql2";

const pool3=createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE_NAME3,
    port: Number(process.env.DB_PORT) || 25060,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000,
})

export default pool3;