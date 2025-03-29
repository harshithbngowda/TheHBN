const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const path = require('path'); // For handling file paths

const app = express(); // Create the server

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware for sessions (to keep users logged in)
app.use(session({
  secret: 'epic_legend', // Replace with any random string
  resave: false,
  saveUninitialized: true
}));

// Serve static files (like CSS) from the 'public' folder
app.use(express.static('public'));

// Set the view engine to EJS (for rendering .ejs templates)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Optional, default is './views'

// Listen for incoming requests (use dynamic port for hosting compatibility)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

// Mock user database with hashed passwords
const users = [
  { username: 'admin', password: bcrypt.hashSync('password123', 10) } // Example credentials
];

// Middleware function to check authentication
function checkAuth(req, res, next) {
  if (req.session.user) { // If user session exists, proceed
    return next();
  }
  res.redirect('/'); // Redirect to the index page (login form) if not authenticated
}

// Routes

// Serve the static index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html')); // Serve index.html from the bn_web folder
});

// Render Home page (protected)
app.get('/home', checkAuth, (req, res) => res.render('home'));

// Render Music page (protected)
app.get('/music', checkAuth, (req, res) => res.render('music'));

// Render Programs page (protected)
app.get('/programs', checkAuth, (req, res) => res.render('programs'));

// Render Goals page (protected)
app.get('/goals', checkAuth, (req, res) => res.render('goals'));

// Handle Login form submission
app.post('/login', async (req, res) => {
  const { username, password } = req.body; // Get form data
  const user = users.find(u => u.username === username); // Look for user in the database

  // Validate credentials
  if (user && await bcrypt.compare(password, user.password)) {
    req.session.user = username; // Save user in session
    res.redirect('/home'); // Redirect to Home
  } else {
    res.sendFile(path.join(__dirname, 'index.html')); // Reload index.html if login fails
  }
});

// Handle Logout
app.post('/logout', (req, res) => {
  req.session.destroy(); // End user session
  res.redirect('/'); // Redirect to the index page
});