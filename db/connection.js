require('dotenv').config(); 
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

connection.connect(error => {
  if (error) {
    console.error('Error connecting: ' + error.stack);
    return;
  }
  console.log("Successfully connected to the database with ID: " + connection.threadId);
});

module.exports = connection;

