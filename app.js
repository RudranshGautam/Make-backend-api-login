const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Set up MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'rudransh@1',  // Replace with your MySQL password
  database: 'myapp_db'         // Replace with your database name
});

db.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Define route for root URL
app.get('/', (req, res) => {
  res.send('Welcome to the Home Page!');
});

// Route for signup page
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// Route for login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Handle POST request for signup
app.post('/signup', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.send('Please provide name, email, and password.');
  }

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) throw err;

    if (results.length > 0) {
      return res.send('Email already in use.');
    }

    db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, password], (err, results) => {
      if (err) throw err;
      res.redirect('/login');
    });
  });
});

// Handle POST request for login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal server error');
    }

    if (results.length === 0) {
      // User not found
      return res.status(404).send('User not found');
    }

    const user = results[0];

    if (user.password === password) {
      // Password matches
      return res.send('User login successful');
    } else {
      // Password does not match
      return res.status(401).send('User not authorized');
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
