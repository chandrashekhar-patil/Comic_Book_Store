// app.js
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const mysql = require('mysql2');
const comicRoutes = require('./routes/comics');  // Import comic routes

const app = express();
app.use(bodyParser.json());

// Create connection to MySQL
const con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Connect to the database
con.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected');
});

// Use comic routes
app.use('/comics', comicRoutes(con));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});
