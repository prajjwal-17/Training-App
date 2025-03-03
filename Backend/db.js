// db.js
const { Pool } = require("pg");

const pool = new Pool({
  user: "/",      // Replace with your PostgreSQL username
  host: "/",
  database: "/",                   // Name of your database
  password: "/",    // Replace with your PostgreSQL password
  port: 5432,                           // Default PostgreSQL port
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};