const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const app = express();

// Set the view engine to EJS
app.set('view engine', 'ejs');

function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.redirect('/login');
}

// Use bodyParser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));

// Use express-session for managing user sessions
app.use(session({
  secret: 'your-secret-key', // Replace with a strong secret
  resave: false,
  saveUninitialized: true
}));

// Serve static files
app.use(express.static('public'));

// Sample user data (for demonstration purposes)
const users = [
  { username: 'admin', passwordHash: '$2b$10$...' } // Password is hashed
];

// Home route
app.get('/', (req, res) => {
  res.render('index');
});

// Route for the Mods page
app.get('/mods', isAuthenticated, (req, res) => {
  res.render('mods');
});

// Route for the Resources page
app.get('/resources', isAuthenticated, (req, res) => {
  res.render('resources');
});

// Route for the Tutorials page
app.get('/tutorials', isAuthenticated, (req, res) => {
  res.render('tutorials');
});

// Route for the Login page
app.get('/login', (req, res) => {
  res.render('login', { errorMessage: null }); // Pass null or an empty string when there’s no error
});

// Handle login form submissions
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  // Find user
  const user = users.find(u => u.username === username);
  if (user && await bcrypt.compare(password, user.passwordHash)) {
    req.session.user = { username: user.username };
    res.redirect('/');
  } else {
    // Pass error message to the login page
    res.render('login', { errorMessage: 'Invalid credentials' });
  }
});


// Route to handle logout
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.redirect('/');
    }
    res.redirect('/');
  });
});

// Route for the Register page
app.get('/register', (req, res) => {
  res.render('register');
});

// Handle registration form submissions
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  
  // Check if user already exists
  if (users.find(u => u.username === username)) {
    return res.redirect('/register?error=User already exists');
  }

  // Hash the password and store the user
  const passwordHash = await bcrypt.hash(password, 10);
  users.push({ username, passwordHash });

  res.redirect('/login');
});

// Start the server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
