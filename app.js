const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

const app = express(); // Create the server

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware for sessions (to keep users logged in)
app.use(session({
  secret: 'epic_legend', // Replace with any random string
  resave: false,
  saveUninitialized: true
}));

// Serve static files (like CSS)
app.use(express.static('public'));

// Set the view engine to EJS (for HTML templates)
app.set('view engine', 'ejs');

// Listen for incoming requests
app.listen(3000, () => console.log('Server running on http://localhost:3000'));

// Mock user database with hashed passwords
const users = [
  { username: 'admin', password: bcrypt.hashSync('password123', 10) } // Example credentials
];

// Middleware function to check authentication
function checkAuth(req, res, next) {
  if (req.session.user) { // If user session exists, proceed
    return next();
  }
  res.redirect('/login'); // Redirect to login if not authenticated
}

// Routes

// Redirect '/' to '/login'
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Render Home page (protected)
app.get('/home', checkAuth, (req, res) => res.render('home'));

// Render Music page (protected)
app.get('/music', checkAuth, (req, res) => res.render('music'));

// Render Programs page (protected)
app.get('/programs', checkAuth, (req, res) => res.render('programs'));

// Render Goals page (protected)
app.get('/goals', checkAuth, (req, res) => res.render('goals'));

// Render Login page
app.get('/login', (req, res) => {
  res.render('login', { error: null }); // Pass an error message if needed
});

// Handle Login form submission
app.post('/login', async (req, res) => {
  const { username, password } = req.body; // Get form data
  const user = users.find(u => u.username === username); // Look for user in database

  // Validate credentials
  if (user && await bcrypt.compare(password, user.password)) {
    req.session.user = username; // Save user in session
    res.redirect('/home'); // Redirect to Home
  } else {
    res.render('login', { error: 'Invalid username or password' }); // Show error
  }
});

// Handle Logout
app.post('/logout', (req, res) => {
  req.session.destroy(); // End user session
  res.redirect('/login'); // Redirect to Login page
});